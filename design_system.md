# Dokugen Landing Page Design System

Welcome to the **Dokugen Landing Page Design System**. This document defines the design language, color palette, typography, page structure, and interactive components for upgrading the Dokugen landing page from a dark, generic style to a premium, light-themed developer showcase.

---

## 🎨 Palette (Color Tokens)

We transition to a clean, bright, and soft light-theme design system. We use curated, premium pastel colors for cards and subtle overlays, while maintaining a pure white base for background elements to maximize readability.

```css
:root {
  /* Core Base Colors */
  --bg-primary: #ffffff;
  --bg-secondary: #fafafa;
  --bg-tertiary: #f4f4f5;

  /* Typography */
  --text-primary: #09090b;   /* Deep Slate/Charcoal */
  --text-secondary: #71717a; /* Cool Grey */
  --text-muted: #a1a1aa;     /* Light Muted Grey */

  /* Playful Accents */
  --accent-purple: #7c3aed;  /* Indigo/Violet for highlights & core branding */
  --accent-yellow: #eab308;  /* Amber/Yellow for warnings/highlights */
  --accent-emerald: #10b981; /* Success, Go/Run tags */
  --accent-rose: #f43f5e;    /* Reverts, errors, deletes */

  /* Pastel Card Backgrounds (SendLiberty style) */
  --card-violet-bg: #f5f3ff;
  --card-violet-border: #ddd6fe;
  
  --card-emerald-bg: #ecfdf5;
  --card-emerald-border: #a7f3d0;
  
  --card-amber-bg: #fffbeb;
  --card-amber-border: #fde68a;
  
  --card-rose-bg: #fff1f2;
  --card-rose-border: #fecdd3;

  --card-sky-bg: #f0f9ff;
  --card-sky-border: #bae6fd;
}
```

---

## ✍️ Typography

The typography system is key to making the page feel high-end yet personal. We combine the clean geometry of **Plus Jakarta Sans** with the organic, custom feel of the cursive **Caveat** font for human-like highlights.

*   **Primary Font**: `Plus Jakarta Sans` (Sans-serif)
    *   *Usage*: Headings, paragraph body, navigation, labels.
    *   *Styling*: Large headlines use heavy font weights (`font-extrabold` / `font-black` - `800` or `900`) and tight tracking (`tracking-tight`) to command attention.
*   **Highlight Font**: `Caveat` (Cursive)
    *   *Usage*: Hand-drawn style highlight words or small notes next to titles.
    *   *Styling*: Colored text (`var(--accent-purple)` or `var(--accent-yellow)`), slightly larger relative font sizes, and subtle rotation (`rotate(-2deg)`) to give a sketched/doodled look.
*   **Monospace Font**: `JetBrains Mono` or `Geist Mono`
    *   *Usage*: Terminal elements, copy-to-clipboard code Snippets, and CLI commands.

---

## 🖼️ Hero Section Layout

The hero section draws direct inspiration from the modern light layout of **Travexa** and **WonderKids**:

1.  **Avatar/Floating Badges**: Playful, floating illustrations or small CLI badges to the left and right of the main heading (hidden on mobile, visible on desktop).
2.  **Double Highlight Header**:
    ```html
    <h1>The easiest way to generate <span class="highlight purple">beautiful</span> and <span class="highlight yellow">accurate</span> READMEs</h1>
    ```
    *   *Purple highlight*: Uses the Caveat font with purple text.
    *   *Yellow highlight*: Uses the Caveat font with yellow text.
3.  **Floating Widget / Supporting Action**:
    *   Includes a clean terminal snippet with a copy button for `npm install -g dokugen`.
    *   Includes the **Myhappr** widget in inline mode to support the creator, integrated naturally.
4.  **Hero Asset**:
    Below we display our new custom-generated illustration showing code transforming into documents, framed inside a premium clean glass border.

![Dokugen Hero Illustration](file:///C:/Users/PC/.gemini/antigravity/brain/dcd8b30e-300b-414e-990d-034a286884cb/dokugen_illustration_1783971012689.png)

---

## 🗂️ Features Grid (SendLiberty Bento Style)

Instead of the boring dark background grid, we will use a **Bento Box Grid** styled like the SendLiberty inspiration:
*   Cards are colored in very soft, light pastels.
*   Borders match the pastel tone but are slightly darker.
*   Each card features a specific feature:
    1.  **Instant AI READMEs** (Double-wide card, Soft Violet): Visual mockup of code mapping.
    2.  **Smart Updates** (Soft Emerald): Dynamic text or animation illustrating how manual blocks are preserved while auto blocks refresh.
    3.  **AI Commit Messages** (Soft Sky Blue): Interactive commit block demonstrating `dokugen aic` workflow.
    4.  **Safety Reverts** (Soft Rose): Showing before/after revert indicator.
    5.  **Interactive Prompt** (Soft Amber): Command-line prompt mockup.

---

## 🛠️ Step-by-Step Installation UI

We replace the simple bullet points with an interactive, modern **Step-by-Step Guide**:
*   A clean stepper component with vertical lines.
*   Interactive panels: Users can select whether they use **Node.js** or **Python**.
*   Clicking a step highlights it with smooth animations using `framer-motion`.

---

## 🎬 Video & Interactive Elements

*   **Video Demo**: Embedded inside a clean, light-mode Mac-style terminal wrapper with window control buttons (red, yellow, green dots) and a subtle shadow.
*   **FAQ section**: Clean, minimal accordion design utilizing light grey backgrounds that expand smoothly upon click.

---

## ⚡ Micro-animations (Framer Motion)

*   **Hover States**: Feature cards lift slightly (`y: -4`) and receive a soft glowing shadow.
*   **Cursive Highlights**: Draw-in underline effect or slight wobble to simulate a hand-drawn doodle.
*   **Terminal Input**: Copying code triggers a green "Copied!" checkmark animation.
