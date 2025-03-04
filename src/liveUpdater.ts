import chokidar from "chokidar";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import { exec as execCallback } from "child_process";
import debounce from 'lodash.debounce';
import { simpleGit, SimpleGit } from 'simple-git'; 
import chalk from "chalk";
import inquirer from "inquirer";


const exec = promisify(execCallback);

class LiveDocumentationUpdater {
  options: {
    watchPaths: string[];
    ignore: string[];
    debounceTime: number;
    showNotifications?: boolean;
    generateOnStart?: boolean;
  };
  watcher: any;
  isGenerating: boolean;
  debouncedGenerate: Function;
  startTime: number | null;

  constructor(options = {}) {
    this.options = {
      watchPaths: ["."], 
      ignore: ["node_modules/**", ".git/**", "README.md"], 
      debounceTime: 2000, 
      ...options,
    };

    this.watcher = null;
    this.isGenerating = false;
    this.debouncedGenerate = debounce(
      this.generateDocumentation.bind(this),
      this.options.debounceTime
    );
    this.startTime = null;
  }

  start() {
    console.log(`📝 Dokugen live documentation initialized`);
    console.log(
      `👀 Watching for changes in: ${this.options.watchPaths.join(", ")}`
    );

    this.watcher = chokidar.watch(this.options.watchPaths, {
      ignored: this.options.ignore,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100,
      },
    });

    this.watcher
      .on("add", (filePath: string) => this.handleFileChange("add", filePath))
      .on("change", (filePath: string) =>
        this.handleFileChange("change", filePath)
      )
      .on("unlink", (filePath: string) =>
        this.handleFileChange("unlink", filePath)
      )
      .on("addDir", (filePath: string) =>
        this.handleFileChange("addDir", filePath)
      )
      .on("unlinkDir", (filePath: string) =>
        this.handleFileChange("unlinkDir", filePath)
      );

    this.startTime = Date.now();

    if (this.options.generateOnStart) {
      this.generateDocumentation();
    }

    return this;
  }

  handleFileChange(event: string, changedPath: string) {
    if (Date.now() - (this.startTime || 0) < 1000) return;
    console.log(`🔄 Detected ${event}: ${changedPath}`);
    this.debouncedGenerate();
  }

  async generateDocumentation() {
    if (this.isGenerating) return;

    try {
      this.isGenerating = true;
      console.log("📊 Analyzing project structure...");

      // Prompt before updating the README
      const { confirmUpdate } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirmUpdate",
          message:
            "Detected changes in your project. Do you want to update your README?",
          default: true,
        },
      ]);

      if (!confirmUpdate) {
        console.log(chalk.blue("Update cancelled by user."));
        return;
      }

      // Check if README.md exists and prompt for overwrite
      const readmePath = path.join(process.cwd(), "README.md");
      let overwrite = true;
      if (fs.existsSync(readmePath)) {
        const { confirmOverwrite } = await inquirer.prompt([
          {
            type: "confirm",
            name: "confirmOverwrite",
            message: "A README.md already exists. Do you want to overwrite it?",
            default: false,
          },
        ]);
        overwrite = confirmOverwrite;
      }

      if (!overwrite) {
        console.log(chalk.blue("Overwrite cancelled by user."));
        return;
      }

      
      const { stdout, stderr } = await exec("node dist/bin/dokugen.js generate --auto");

      if (stderr) {
        console.error(`⚠️ Error generating documentation: ${stderr}`);
      } else {
        console.log("✅ Documentation updated successfully!");

        // Check for Git repository and offer commit prompt
          const git: SimpleGit = simpleGit();
        if (await git.checkIsRepo()) {
          const { confirmCommit } = await inquirer.prompt([
            {
              type: "confirm",
              name: "confirmCommit",
              message:
                "Do you want to commit the updated README to version control?",
              default: true,
            },
          ]);

          if (confirmCommit) {
            await git.add("README.md");
            await git.commit("Update README.md based on live changes");
            console.log(chalk.green("Changes committed successfully!"));
          }
        }

       
        if (this.options.showNotifications) {
          this.showNotification(
            "Documentation Updated",
            "Your README.md has been updated."
          );
        }
      }
    } catch (error: any) {
      console.error(`❌ Failed to generate documentation: ${error.message}`);
    } finally {
      this.isGenerating = false;
    }
  }

  showNotification(title: string, message: string) {
    console.log(`📢 ${title}: ${message}`);
    try {
      const notifier = require("node-notifier");
      notifier.notify({
        title,
        message,
      });
    } catch (error) {
      console.error("⚠️ Desktop notifications are not available");
    }
  }

  stop() {
    if (this.watcher) {
      this.watcher.close();
      console.log("🛑 Live documentation updates stopped");
    }
  }
}

// CLI Command handler registration
function addLiveCommand(program: any) {
  program
    .command("live")
    .description(
      "Watch project for changes and update documentation automatically"
    )
    .option(
      "-p, --paths <paths>",
      "Comma-separated paths to watch",
      (val: string) => val.split(","),
      ["."]
    )
    .option(
      "-i, --ignore <patterns>",
      "Comma-separated patterns to ignore",
      (val: string) => val.split(","),
      ["node_modules/**", ".git/**", "README.md"]
    )
    .option(
      "-d, --debounce <ms>",
      "Debounce time in milliseconds",
      parseInt,
      2000
    )
    .option(
      "-n, --notifications",
      "Show desktop notifications on updates",
      false
    )
    .option("-g, --generate", "Generate documentation on start", false)
    .action((options: any) => {
      const updaterOptions = {
        watchPaths: options.paths,
        debounceTime: options.debounce,
        showNotifications: options.notifications,
        generateOnStart: options.generate,
        ignore: options.ignore,
      };

      const updater = new LiveDocumentationUpdater(updaterOptions).start();

      process.on("SIGINT", () => {
        updater.stop();
        process.exit(0);
      });
    });
}

export { LiveDocumentationUpdater, addLiveCommand };
