import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const targets = [
    { name: "dokugen-windows-x64.exe", target: "bun-windows-x64" },
    { name: "dokugen-linux-x64", target: "bun-linux-x64" },
    { name: "dokugen-macos-arm64", target: "bun-darwin-arm64" },
    { name: "dokugen-macos-x64", target: "bun-darwin-x64" },
];

if (!fs.existsSync("dist/binaries")) {
    fs.mkdirSync("dist/binaries", { recursive: true });
}

for (const { name, target } of targets) {
    console.log(`📦 Compiling for ${target}...`);
    try {
        const cmd = `bun build --compile --minify --target=${target} ./bin/dokugen.ts --outfile ./dist/binaries/${name}`;
        console.log(`> ${cmd}`);
        execSync(cmd, { stdio: "inherit" });
        console.log(`✅ Built ${name}`);
    } catch (error) {
        console.error(`❌ Failed to build ${name}`);
    }
}
