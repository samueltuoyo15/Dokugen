#!/usr/bin/env node
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk"


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

const CONFIG_FILE = ".dokugenrc.json";
const DEFAULT_CONFIG = path.join(
  __dirname,
  "../../config/default-dokugenrc.json"
);
 

async function createConfigFile() {
  const targetPath = path.join(process.cwd(), CONFIG_FILE);


  if (await fs.pathExists(targetPath)) {
    console.log(chalk.orange(`${CONFIG_FILE} already exists. Skipping creation.`));
    return;
  }

try {
    console.log(chalk.blue(`Creating default configuration file at ${targetPath}...`));      
    await fs.copy(DEFAULT_CONFIG, targetPath);
    console.log(chalk.green(`Default configuration file created at ${targetPath}`));
  } catch (err) {
    console.error(chalk.red("Error creating default configuration file:", err));
  }
}

createConfigFile();
