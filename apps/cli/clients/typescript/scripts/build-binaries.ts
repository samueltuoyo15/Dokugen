import { execSync } from "child_process";
import fs from "fs";

const targets = [
    { name: "dokugen-windows-x64.exe", target: "bun-windows-x64" },
    { name: "dokugen-linux-x64", target: "bun-linux-x64" },
    { name: "dokugen-macos-arm64", target: "bun-darwin-arm64" },
    { name: "dokugen-macos-x64", target: "bun-darwin-x64" },
];

if (!fs.existsSync("dist/binaries")) {
    fs.mkdirSync("dist/binaries", { recursive: true });
}

console.log("Building binaries...");

try {
    const initial = fs.readFileSync("bin/dokugen.ts", "utf-8");
    let content = initial.replace('from "./projectDetect.mjs"', 'from "./projectDetect.ts"');
    content = content.replace('from "./projectDetect.mjs";', 'from "./projectDetect.ts";');

    fs.writeFileSync("bin/dokugen-bun.ts", content);

    for (const { name, target } of targets) {
        console.log(`Compiling ${target}...`);
        try {
            execSync(`bun build --compile --minify --target=${target} ./bin/dokugen-bun.ts --outfile ./dist/binaries/${name}`, { stdio: "inherit" });
            console.log(`Built ${name}`);
        } catch (e) {
            console.error(`Failed ${name}`);
        }
    }
} catch (e) {
    console.error(e);
} finally {
    if (fs.existsSync("bin/dokugen-bun.ts")) fs.unlinkSync("bin/dokugen-bun.ts");
}
