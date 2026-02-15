#!/usr/bin/env node
import { chmod } from "fs/promises"
import { platform } from "os"
const filePath = "./bin/dokugen.ts"
if (platform() !== "win32") {
    chmod(filePath, 0o755)
        .then(() => console.log(`✅ Set executable permission for ${filePath}`))
        .catch((err) => console.error(`Failed to set permissions:`, err))
}
else {
    console.log("⚠️ Skipping chmod on Windows.")
}
