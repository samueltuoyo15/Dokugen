package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"runtime"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/unrolled/secure"
	"golang.org/x/time/rate"
	"google.golang.org/genai"
)

var (
	SUPABASE_URL      = os.Getenv("SUPABASE_CLIENT_URL")
	SUPABASE_ANON_KEY = os.Getenv("SUPABASE_ANON_KEY")
	GEMINI_API_KEY    = os.Getenv("GOOGLE_GEMINI_API_KEY")
	MODEL_NAME        = os.Getenv("MODEL_NAME")
	PORT              = os.Getenv("PORT")
)

func globalErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("PANIC: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
				c.Abort()
			}
		}()
		c.Next()

		if len(c.Errors) > 0 {
			for _, e := range c.Errors {
				log.Printf("ERROR: %v", e.Error())
			}
		}
	}
}

func init() {
	if PORT == "" {
		PORT = "3000"
	}
	if MODEL_NAME == "" {
		MODEL_NAME = "gemini-2.5-flash"
	}
}

var limiter = rate.NewLimiter(rate.Every(10*time.Minute/10), 10)

func rateLimitMiddleware(c *gin.Context) {
	if strings.HasSuffix(c.Request.URL.Path, "/health") || strings.HasSuffix(c.Request.URL.Path, "/api/health") {
		c.Next()
		return
	}
	if !limiter.Allow() {
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "Too many requests, try again later."})
		c.Abort()
		return
	}
	c.Next()
}

func securityMiddleware() gin.HandlerFunc {
	secureMiddleware := secure.New(secure.Options{
		FrameDeny:             true,
		ContentTypeNosniff:    true,
		BrowserXssFilter:      true,
		ContentSecurityPolicy: "default-src 'self'; script-src 'self'; object-src 'none'",
	})
	return func(c *gin.Context) {
		err := secureMiddleware.Process(c.Writer, c.Request)
		if err != nil {
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		c.Next()
	}
}

func sizeLimitMiddleware(c *gin.Context) {
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, 500<<20)
	c.Next()
}

func fetchGitHubReadme(url string) (string, error) {
	rawURL := strings.ReplaceAll(url, "github.com", "raw.githubusercontent.com")
	rawURL = strings.ReplaceAll(rawURL, "/blob/", "/")
	resp, err := http.Get(rawURL)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to fetch README: %s", resp.Status)
	}
	body, _ := io.ReadAll(resp.Body)
	return string(body), nil
}

func updateSupabaseUser(email, username, osInfo string) {
	if email == "" || SUPABASE_URL == "" || SUPABASE_ANON_KEY == "" {
		log.Printf("Skipping Supabase update - missing credentials")
		return
	}
	getURL := fmt.Sprintf("%s/rest/v1/active_users?email=eq.%s&select=id,usage_count", SUPABASE_URL, email)
	req, _ := http.NewRequest("GET", getURL, nil)
	req.Header.Set("apikey", SUPABASE_ANON_KEY)
	req.Header.Set("Authorization", "Bearer "+SUPABASE_ANON_KEY)
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Supabase GET error: %v", err)
		return
	}
	defer resp.Body.Close()
	var users []map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&users)
	if len(users) > 0 {
		id := users[0]["id"].(string)
		count := int(users[0]["usage_count"].(float64))
		updateData := map[string]interface{}{"usage_count": count + 1}
		if osInfo != "" {
			updateData["osInfo"] = osInfo
		}
		body, _ := json.Marshal(updateData)
		patchReq, _ := http.NewRequest("PATCH", fmt.Sprintf("%s/rest/v1/active_users?id=eq.%s", SUPABASE_URL, id), bytes.NewBuffer(body))
		patchReq.Header.Set("apikey", SUPABASE_ANON_KEY)
		patchReq.Header.Set("Authorization", "Bearer "+SUPABASE_ANON_KEY)
		patchReq.Header.Set("Content-Type", "application/json")
		client.Do(patchReq)
	} else {
		id := uuid.New().String()
		body, _ := json.Marshal([]map[string]interface{}{
			{
				"id":          id,
				"username":    username,
				"email":       email,
				"osInfo":      osInfo,
				"usage_count": 1,
			},
		})
		postReq, _ := http.NewRequest("POST", fmt.Sprintf("%s/rest/v1/active_users", SUPABASE_URL), bytes.NewBuffer(body))
		postReq.Header.Set("apikey", SUPABASE_ANON_KEY)
		postReq.Header.Set("Authorization", "Bearer "+SUPABASE_ANON_KEY)
		postReq.Header.Set("Content-Type", "application/json")
		postReq.Header.Set("Prefer", "return=minimal")
		client.Do(postReq)
	}
	log.Printf("Updated user %s (%s)", username, email)
}

func streamGemini(systemPrompt, userPrompt string) (<-chan string, <-chan error) {
	ch := make(chan string)
	errCh := make(chan error, 1)

	go func() {
		defer close(ch)
		defer close(errCh)

		ctx := context.Background()
		client, err := genai.NewClient(ctx, &genai.ClientConfig{
			APIKey: GEMINI_API_KEY,
		})
		if err != nil {
			log.Printf("Failed to create Gemini client: %v", err)
			errCh <- err
			return
		}

		resp, err := client.Models.GenerateContent(ctx, MODEL_NAME, []*genai.Content{
			{Role: "user", Parts: []*genai.Part{{Text: systemPrompt}}},
			{Role: "model", Parts: []*genai.Part{{Text: "I understand and will follow the instructions."}}},
			{Role: "user", Parts: []*genai.Part{{Text: userPrompt}}},
		}, nil)
		if err != nil {
			log.Printf("Generate content error: %v", err)
			errCh <- err
			return
		}

		if len(resp.Candidates) > 0 && len(resp.Candidates[0].Content.Parts) > 0 {
			cleanText := strings.TrimSpace(strings.ReplaceAll(resp.Candidates[0].Content.Parts[0].Text, "\r\n", "\n"))
			if cleanText != "" {
				sseData, err := json.Marshal(map[string]string{"response": cleanText})
				if err != nil {
					errCh <- err
					return
				}
				ch <- fmt.Sprintf("data: %s\n\n", string(sseData))
			}
		}
	}()

	return ch, errCh
}

func healthHandler(c *gin.Context) {
	data := gin.H{
		"status": "Ok",
		"uptime": time.Since(startTime).Seconds(),
		"memoryUsage": func() gin.H {
			var m runtime.MemStats
			runtime.ReadMemStats(&m)
			return gin.H{"alloc": m.Alloc, "total": m.TotalAlloc, "sys": m.Sys, "numGC": m.NumGC, "pauseNS": m.PauseTotalNs}
		}(),
	}
	c.JSON(http.StatusOK, data)
}

var startTime = time.Now()

type UserInfo struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	OSInfo   struct {
		Platform string `json:"platform"`
		Arch     string `json:"arch"`
		Release  string `json:"release"`
	} `json:"osInfo"`
}

type ReqBody struct {
	ProjectType        string          `json:"projectType"`
	ProjectFiles       []string        `json:"projectFiles"`
	FullCode           string          `json:"fullCode"`
	UserInfo           UserInfo        `json:"userInfo"`
	Options            map[string]bool `json:"options"`
	ExistingReadme     string          `json:"existingReadme"`
	CustomReadmeFormat string          `json:"customReadmeFormat"`
	TemplateUrl        string          `json:"templateUrl"`
	RepoUrl            string          `json:"repoUrl"`
}

func generateReadmeHandler(c *gin.Context) {
	var body ReqBody
	if err := c.ShouldBindJSON(&body); err != nil {
		log.Printf("Json bind error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	if body.ProjectType == "" || len(body.ProjectFiles) == 0 || body.FullCode == "" {
		log.Printf("Bad request: missing fields projectType=%q files=%d fullCodeLen=%d", body.ProjectType, len(body.ProjectFiles), len(body.FullCode))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required fields"})
		return
	}
	if body.CustomReadmeFormat == "" && body.TemplateUrl != "" {
		body.CustomReadmeFormat = body.TemplateUrl
	}
	username := strings.TrimSpace(body.UserInfo.Username)
	if username == "" {
		username = "anonymous"
	}
	var formatTemplate string
	if body.CustomReadmeFormat != "" {
		tmp, err := fetchGitHubReadme(body.CustomReadmeFormat)
		if err == nil {
			formatTemplate = tmp
		}
	}
	if email := body.UserInfo.Email; email != "" {
		osInfo := fmt.Sprintf("%s %s %s", body.UserInfo.OSInfo.Platform, body.UserInfo.OSInfo.Arch, body.UserInfo.OSInfo.Release)
		go updateSupabaseUser(email, username, osInfo)
	}

	// Set SSE headers
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("Transfer-Encoding", "chunked")

	systemInstruction := `
# Dokugen Backend Documentation Specialist

## Core Principle
When you detect a backend project (API servers, databases, authentication systems), 
use THIS EXACT TEMPLATE STRUCTURE with technical precision:

"""
# [ProjectName] API

## Overview
[1-2 sentence technical description mentioning key frameworks/languages]

## Features
- [Technology]: [Purpose]
- [Technology]: [Purpose]

## Getting Started
### Installation
[Step-by-step commands]

### Environment Variables
[List ALL required variables with examples]

## API Documentation
### Base URL
[API root path]

### Endpoints
#### [HTTP METHOD] [ENDPOINT PATH]
**Request**:
[Payload structure with required fields]

**Response**:
[Success response example]

**Errors**:
- [HTTP Status]: [Error scenario]
"""

## Mandatory Rules
1. Detection:
   - Analyze code for API patterns (routes, controllers, models)
   - Identify database/auth systems

2. Documentation:
   ✓ All endpoints documented!!! Please obey this!!!!!!
   ✓ Do not wrap the entire documented part of the readme in a detail and summary tag!!!!!!
   ✓ Exact request/response schemas. Please always do this, do not forget to do this Please !!!
   ✓ Environment variables with examples
   ✓ Error codes and meanings
   ✓ Zero emojis or promotional language

   So Please this is just a sample of what am expecting you to do strictly please!!!
   '**User Registration:**
    POST /api/v1/auth/register
    _Body Example:_
    json
    {
      "full_name": "John Doe",
      "username": "johndoe",
      "email": "john.doe@example.com",
      "phone": "08012345678",
      "address": "123 Main St, City",
      "password": "StrongPassword123",
      "referral_username": "referrer_user"
    }'

3. For non-backend projects:
   - Use standard formatting (dont bloat the readme emojis please. If you want to add emojis just add one or two and make sure it matches the text that you are adding it next to, if there's any screenshots you can add then add if not skip it, etc.)
   - Include Dokugen badge always!!!

4. Universal:
   - Never wrap in markdown code blocks
   - Sound like a human writer
   - Use proper Markdown formatting
`

	var userPrompt string
	if formatTemplate != "" {
		userPrompt = fmt.Sprintf("Template structure:\n%s\n\nProject Details:\n- Repo URL: %s\n- Project Type: %s\n- Main Files: %s\n- Code Sample: %s\n\nRules:\n1. Preserve all template sections\n2. Replace content but keep styling\n3. Add this badge at bottom:\n   [![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%%20was%%20generated%%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)", formatTemplate, body.RepoUrl, body.ProjectType, strings.Join(body.ProjectFiles[:min(10, len(body.ProjectFiles))], ", "), body.FullCode[:min(1000, len(body.FullCode))])
	} else {
		includeSetup := "yes"
		if v, ok := body.Options["includeSetup"]; !ok || !v {
			includeSetup = "<!-- SKIP SECTION: User opted out of Installation Instructions -->"
		}
		includeContribution := "yes"
		if v, ok := body.Options["includeContributionGuideLine"]; !ok || !v {
			includeContribution = "<!-- SKIP SECTION: User Opted out of contributions guidelines -->"
		}
		userPrompt = fmt.Sprintf(`Generate a **high-quality, professional, and modern README.md that must impress recruiters and make them hire me** for a **%s** project.
## Project Overview:
The project includes the following files:
%s

## Full Code Context:
Below is the actual and complete source code. So I believe you have 100%% of the full code:
%s

## README Requirements:
1. **Title**:
   - Create a **bold and catchy title** for the project. You can find the project title from maybe the meta data file of the project files (e.g package.json go.mod e.t.c) if you dont find it, then come up with a human reasonable name Please avoid emojis please. If you want to add emojis to the title then add just one, and that one emoji should match what the title is all about. Dont just use stupid emoji if you dont have any emoji that matches the title then dont add.

2. **Description**:
   - Write a **short and engaging description** of the project.
   - Use **emojis** and **modern formatting** to make it stand out. But dont bloat the the description with too much emojis.

3. **Installation**:
  %s
  - **Clone the Repository**:
   `+"```bash"+`
   git clone %s
   `+"```"+`
  - Include **step-by-step instructions** for setting up the project locally.
  - Use **emoji bullet points** and **code blocks** for clarity.

4. **Usage**:
   - Include **examples**, **screenshots**, and if theres not screenshot dont add please, you can actually check if theres any file like screenshot png file or something realted iin the project files, u can add it.
   - Please add detailed instructions usage dont collapse them ooo please!!.

5. **Features**:
   - Create a **list of key features** with a **brief descriptions**.

6. **Technologies Used**:
   - Display a **table** or **grid** of technologies with **links** please dont bloat it with too much emojis or unnecessary emojis.

7. **Contributing**:
   %s
   - Include **guidelines** for contributing to the project.
   - Use **modern formatting** with **emoji bullet points**.

8. **License**:
   - Include a **license section** with a **link**, please if the user does not have a LISCENSE file in the project files dont add a liscense link in the readme.

9. **Author Info**:
   - Create a **modern author section** with **social media links expect github link. Please dont guess authors links if you dont know their username just leave placeholders for them to write theirselves**.

10. **Badges**:
    - Add **dynamic badges** for technologies, build status, and more at the bottom of the README.

11. **Dokugen Badge**:
    - Always include this badge at the **very bottom** of the README:
      [![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%%20was%%20generated%%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)

## Tone and Style:
- If the project is **modern**, use **eye-catching elements** like emojis, but not too much ooo! please let the readme be matured not packed with unnecessary emojis!!!, badges, and creative formatting.
- If the project is **professional**, keep the README **clean, concise, and formal**.

## Additional Requirements:
- The README must **sound like a human/graduate wrote it 100%%**. Avoid AI-generated phrasing please!!.
- Do **not wrap the README in markdown code blocks**.

## Final Output:
Generate the README.md content directly, without any additional explanations or wrapping.
`, body.ProjectType, strings.Join(body.ProjectFiles, "\n"), body.FullCode, includeSetup, body.RepoUrl, includeContribution)
	}
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("Transfer-Encoding", "chunked")

	msgChan := make(chan []byte)
	done := make(chan bool)

	go func() {
		defer close(msgChan)
		defer close(done)

		responseChan, errChan := streamGemini(systemInstruction, userPrompt)
		for {
			select {
			case text, ok := <-responseChan:
				if !ok {
					return
				}
				jsonData, _ := json.Marshal(map[string]string{"response": text})
				msgChan <- []byte(fmt.Sprintf("data: %s\n\n", string(jsonData)))
			case err := <-errChan:
				if err != nil {
					log.Printf("Gemini error: %v", err)
					errorBytes, _ := json.Marshal(map[string]string{"error": err.Error()})
					msgChan <- []byte(fmt.Sprintf("data: %s\n\n", string(errorBytes)))
				}
				return
			}
		}
	}()

	c.Stream(func(w io.Writer) bool {
		select {
		case msg, ok := <-msgChan:
			if !ok {
				return false
			}
			c.Writer.Write(msg)
			c.Writer.Flush()
			return true
		case <-c.Request.Context().Done():
			return false
		}
	})
}

func writeSSEData(c *gin.Context, text string) bool {
	data, _ := json.Marshal(map[string]string{"response": text})
	c.SSEvent("", string(data))
	return true
}

func handleGeminiError(err error) bool {
	log.Printf("Gemini error: %v", err)
	return false
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func main() {
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Logger())
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		AllowCredentials: true,
	}))
	r.Use(globalErrorHandler())
	r.Use(gin.Recovery())
	r.Use(sizeLimitMiddleware)
	r.Use(rateLimitMiddleware)
	r.Use(securityMiddleware())

	r.GET("/api/health", healthHandler)
	r.POST("/api/generate-readme", generateReadmeHandler)
	log.Printf("Dokugen running on port %s", PORT)
	if err := r.Run(":" + PORT); err != nil {
		log.Fatal("Server failed: ", err)
	}
}
