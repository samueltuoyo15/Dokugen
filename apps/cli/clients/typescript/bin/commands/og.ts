import { Command } from "commander";
import * as path from "path";
import fs from "fs-extra";
import axios from "axios";
import chalk from "chalk";
import { createSpinner } from "nanospinner";
import { checkAndUpdate, checkInternetConnection, getBackendDomain } from "../helpers/network.js";
import { isGitRepository } from "../helpers/git.js";
import { DOKUGEN_BANNER } from "../helpers/constants.js";
//@ts-ignore
import { detectProjectType } from "../projectDetect.mjs";

interface OgButton {
  label: string;
  variant?: "primary" | "secondary";
}

interface OgMetadata {
  title: string;
  tagline?: string;
  techStack?: string[];
  theme: string;
  url?: string;
  author?: string;
  version?: string;
  logo?: string;
  buttons?: OgButton[];
}

export function registerOgCommand(program: Command) {
  const projectName = path.basename(process.cwd());

  program
    .command("og")
    .description(`Generate a beautiful 1200x630 OG social preview card for ${projectName}`)
    .option("--force-new", "Force recreate the .dokugen/card.json configuration file using AI")
    .action(async (options: any) => {
      if (!isGitRepository()) {
        console.log(
          chalk.red(
            "No Git repository found. Please navigate to a project directory that has a Git repository."
          )
        );
        process.exit(1);
      }

      await checkAndUpdate();
      console.log("\n" + chalk.hex("#000080")(DOKUGEN_BANNER) + "\n");
      const projectDir = process.cwd();
      const dokugenFolder = path.join(projectDir, ".dokugen");
      await fs.ensureDir(dokugenFolder);

      const configPath = path.join(dokugenFolder, "card.json");
      const pngPath = path.join(dokugenFolder, "card.png");
      const seoPath = path.join(dokugenFolder, "seo-instructions.txt");

      const hasConfig = await fs.pathExists(configPath);

      const connectionSpinner = createSpinner("Checking internet...").start();
      const hasInternet = await checkInternetConnection();
      connectionSpinner.stop();

      if (!hasInternet) {
        return console.log(
          chalk.red("Please check your internet connection and try again.")
        );
      }

      let metadata: OgMetadata;

      if (!hasConfig || options.forceNew) {
        const startTime = Date.now();
        const metadataSpinner = createSpinner("Analyzing project to generate card profile...").start();
        const timerInterval = setInterval(() => {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          metadataSpinner.update({ text: `Analyzing project to generate card profile... (${elapsed}s)` });
        }, 100);

        try {
          const projectType = await detectProjectType(projectDir);
          
          let codebaseSummary = `Project Name: ${projectName}\nDetected Tech Stack: ${projectType}\n`;

          const readmePath = path.join(projectDir, "README.md");
          if (await fs.pathExists(readmePath)) {
            const readmeContent = await fs.readFile(readmePath, "utf-8");
            codebaseSummary += `\nExisting README Summary:\n${readmeContent.slice(0, 3000)}`;
          } else {
            const files = await fs.readdir(projectDir).catch(() => []);
            const srcFiles = files.filter(f => f.match(/\.(ts|js|py|go|rs|cpp|h|java)$/i));
            if (srcFiles.length > 0) {
              codebaseSummary += `\nCore source files found: ${srcFiles.join(", ")}`;
            }
          }

          const cssCandidates = [
            "index.css", "globals.css", "src/index.css", "src/globals.css",
            "app/globals.css", "tailwind.config.js", "tailwind.config.ts"
          ];
          for (const cssFile of cssCandidates) {
            const fullCssPath = path.join(projectDir, cssFile);
            if (await fs.pathExists(fullCssPath)) {
              const cssContent = await fs.readFile(fullCssPath, "utf-8");
              codebaseSummary += `\nBrand CSS Styling (${cssFile}):\n${cssContent.slice(0, 1500)}`;
              break;
            }
          }

          const backendUrl = await getBackendDomain();
          const response = await axios.post<OgMetadata>(`${backendUrl}/api/og-metadata`, {
            summary: codebaseSummary
          }, { timeout: 30000 });

          clearInterval(timerInterval);
          metadataSpinner.stop();

          metadata = response.data;
          await fs.writeJson(configPath, metadata, { spaces: 2 });

          console.log(chalk.green("✔ Created configuration: .dokugen/card.json"));
        } catch (err: any) {
          clearInterval(timerInterval);
          metadataSpinner.error({ text: "Failed to generate card profile." });
          console.error(chalk.red(err.message));
          return;
        }
      } else {
        metadata = await fs.readJson(configPath) as OgMetadata;
      }

      // Automatically render the PNG card image right after
      const renderStartTime = Date.now();
      const renderSpinner = createSpinner("Rendering card PNG...").start();
      const renderTimerInterval = setInterval(() => {
        const elapsed = ((Date.now() - renderStartTime) / 1000).toFixed(1);
        renderSpinner.update({ text: `Rendering card PNG... (${elapsed}s)` });
      }, 100);

      try {
        let logoData = metadata.logo || "";
        if (logoData && !logoData.startsWith("http") && !logoData.startsWith("data:")) {
          const localLogoPath = path.resolve(projectDir, logoData);
          if (await fs.pathExists(localLogoPath)) {
            const logoBuffer = await fs.readFile(localLogoPath);
            const ext = path.extname(localLogoPath).toLowerCase();
            const mimeType = ext === ".svg" ? "image/svg+xml" : "image/png";
            logoData = `data:${mimeType};base64,${logoBuffer.toString("base64")}`;
          }
        }

        const renderPayload = { ...metadata, logo: logoData };

        const backendUrl = await getBackendDomain();
        const response = await axios.post(`${backendUrl}/api/render-og`, renderPayload, {
          responseType: "arraybuffer",
          timeout: 20000
        });

        clearInterval(renderTimerInterval);
        renderSpinner.stop();

        await fs.writeFile(pngPath, Buffer.from(response.data as any));

        const seoText = `
<!-- Open Graph Meta Tags (Copy & Paste into your HTML <head> or Next.js metadata) -->
<meta property="og:title" content="${metadata.title}" />
${metadata.tagline ? `<meta property="og:description" content="${metadata.tagline}" />\n` : ""}<meta property="og:image" content="https://yourdomain.com/.dokugen/card.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<!-- Twitter Card Meta Tags -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${metadata.title}" />
${metadata.tagline ? `<meta name="twitter:description" content="${metadata.tagline}" />\n` : ""}<meta name="twitter:image" content="https://yourdomain.com/.dokugen/card.png" />
`.trim();

        await fs.writeFile(seoPath, seoText);

        console.log(chalk.green(`\n✔ Created card image: ./.dokugen/card.png`));
        console.log(chalk.green(`✔ Created SEO meta tags: ./.dokugen/seo-instructions.txt`));
      } catch (err: any) {
        clearInterval(renderTimerInterval);
        renderSpinner.error({ text: "Failed to render social card PNG." });
        console.error(chalk.red(err.message));
      }
    });
}
