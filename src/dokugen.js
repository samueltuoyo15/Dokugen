"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var commander_1 = require("commander");
var chalk_1 = require("chalk");
var fs_extra_1 = require("fs-extra");
var path = require("path");
var inquirer_1 = require("inquirer");
var axios_1 = require("axios");
var extractFullCode = function (projectFiles, projectDir) { return __awaiter(void 0, void 0, void 0, function () {
    var snippets, importantFiles, readPromises;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                snippets = [];
                importantFiles = projectFiles.filter(function (file) {
                    return file.match(/\.(ts|js|json|jsx|tsx|html|go|ejs|mjs|py|rs|c|cs|cpp|h|hpp|java|kt|swift|php|rb)$/);
                });
                readPromises = importantFiles.map(function (file) { return __awaiter(void 0, void 0, void 0, function () {
                    var filePath, content, _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                filePath = path.resolve(projectDir, file);
                                if (!fs_extra_1.default.existsSync(filePath)) {
                                    return [2 /*return*/];
                                }
                                _b.label = 1;
                            case 1:
                                _b.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, fs_extra_1.default.promises.readFile(filePath, "utf-8")];
                            case 2:
                                content = _b.sent();
                                snippets.push("\n### ".concat(file, "\n```\n").concat(content, "\n```\n"));
                                return [3 /*break*/, 4];
                            case 3:
                                _a = _b.sent();
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); });
                return [4 /*yield*/, Promise.all(readPromises)];
            case 1:
                _a.sent();
                return [2 /*return*/, snippets.length > 0 ? snippets.join("") : "No code snippets available"];
        }
    });
}); };
var validateProjectLanguage = function (projectDir) {
    var files = fs_extra_1.default.readdirSync(projectDir);
    var languages = [];
    if (files.includes("go.mod"))
        languages.push("Golang");
    if (files.includes("requirements.txt") || files.includes("pyproject.toml"))
        languages.push("Python");
    if (files.includes("Cargo.toml"))
        languages.push("Rust");
    if (files.includes("package.json"))
        languages.push("JavaScript/TypeScript");
    if (files.includes("index.html") || files.includes("src/App.tsx") || files.includes("src/App.jsx"))
        languages.push("Frontend (React)");
    if (files.includes("pom.xml") || files.includes("build.gradle"))
        languages.push("Java");
    if (files.includes("next.config.ts") || files.includes("next.config.js") || files.includes("app/page.jsx") || files.includes("app/page.tsx"))
        languages.push("Frontend (Next Js)");
    if (files.includes("src/App.vue"))
        languages.push("Frontend (Vue Js)");
    if (languages.length === 0) {
        return ("Unknown please make sure u have a (e.g., package.json, go.mod, Cargo.toml, etc.)");
    }
    return languages.join(", ");
};
var scanFiles = function (dir, ignoreDir) {
    if (ignoreDir === void 0) { ignoreDir = ["node_modules", ".git", ".vscode", ".next", "package-lock.json", "dist"]; }
    var files = [];
    var scan = function (folder) {
        try {
            fs_extra_1.default.readdirSync(folder, { withFileTypes: true }).forEach(function (file) {
                var fullPath = path.join(folder, file.name);
                if (file.isDirectory()) {
                    if (!ignoreDir.includes(file.name))
                        scan(fullPath);
                }
                else {
                    files.push(fullPath.replace(dir + "/", ""));
                }
            });
        }
        catch (error) {
            console.error(error);
        }
    };
    scan(dir);
    if (files.length === 0) {
        console.log(chalk_1.default.yellow("No files found in your project"));
        process.exit(0);
    }
    return files;
};
var askYesNo = function (message) { return __awaiter(void 0, void 0, void 0, function () {
    var answer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, inquirer_1.default.prompt([
                    {
                        type: "list",
                        name: "response",
                        message: message,
                        choices: ["Yes", "No"],
                    },
                ])];
            case 1:
                answer = _a.sent();
                return [2 /*return*/, answer.response === "Yes"];
        }
    });
}); };
var generateReadme = function (projectType, projectFiles, projectDir) { return __awaiter(void 0, void 0, void 0, function () {
    var useDocker, hasAPI, hasDatabase, fullCode, response, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                console.log(chalk_1.default.blue("Analysing project files getting chunks....."));
                return [4 /*yield*/, askYesNo("Do you want to include Docker setup in the README?")];
            case 1:
                useDocker = _a.sent();
                return [4 /*yield*/, askYesNo("Does this project expose an API?")];
            case 2:
                hasAPI = _a.sent();
                return [4 /*yield*/, askYesNo("Does this project use a database?")];
            case 3:
                hasDatabase = _a.sent();
                return [4 /*yield*/, extractFullCode(projectFiles, projectDir)];
            case 4:
                fullCode = _a.sent();
                console.log(chalk_1.default.blue("😌 🔥 Generating README...."));
                return [4 /*yield*/, axios_1.default.post("https://dokugen-ochre.vercel.app/api/generate-readme", {
                        projectType: projectType,
                        projectFiles: projectFiles,
                        fullCode: fullCode,
                        options: { useDocker: useDocker, hasAPI: hasAPI, hasDatabase: hasDatabase },
                    })];
            case 5:
                response = _a.sent();
                if (!response.data.readme) {
                    console.log(chalk_1.default.red("❌ API did not return a README."));
                    return [2 /*return*/, "Operation Failed"];
                }
                console.log(chalk_1.default.blue("Proxy Responded with 200 OK"));
                console.log(chalk_1.default.green("✅ README Generated Successfully"));
                return [2 /*return*/, response.data.readme];
            case 6:
                error_1 = _a.sent();
                if (error_1 === null || error_1 === void 0 ? void 0 : error_1.message.includes("User force closed the prompt")) {
                    console.error(chalk_1.default.yellow("⚠️  User interrupted the process. README may be incomplete."));
                    return [2 /*return*/, "README Generation Interrupted"];
                }
                console.error(chalk_1.default.red("❌ Error Generating README: "), error_1);
                return [2 /*return*/, "Failed to Generate README"];
            case 7: return [2 /*return*/];
        }
    });
}); };
commander_1.program.name("dokugen").version("2.1.0").description("Automatically generate high-quality README for your application");
commander_1.program.command("generate").description("Scan project and generate a high-quality README.md").action(function () { return __awaiter(void 0, void 0, void 0, function () {
    var projectDir, projectType, projectFiles, existingReadme, overwrite, readmeContent, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log(chalk_1.default.green("🦸 Generating README.md....."));
                projectDir = process.cwd();
                projectType = validateProjectLanguage(projectDir);
                projectFiles = scanFiles(projectDir);
                existingReadme = path.join(projectDir, "README.md");
                console.log(chalk_1.default.blue("\uD83D\uDCC2 Detected project type: ".concat(projectType)));
                console.log(chalk_1.default.yellow("\uD83D\uDCC2 Found: ".concat(projectFiles.length, " files in the project")));
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 6]);
                if (!fs_extra_1.default.existsSync(existingReadme)) return [3 /*break*/, 3];
                return [4 /*yield*/, askYesNo(chalk_1.default.red("🤯 Looks like a README file already exists. Overwrite?"))];
            case 2:
                overwrite = _a.sent();
                if (!overwrite) {
                    console.log(chalk_1.default.yellow("👍 README was not modified."));
                    return [2 /*return*/];
                }
                fs_extra_1.default.unlinkSync(existingReadme);
                console.log(chalk_1.default.green("🗑️ Existing README has been deleted. Now generating..."));
                _a.label = 3;
            case 3: return [4 /*yield*/, generateReadme(projectType, projectFiles, projectDir)];
            case 4:
                readmeContent = _a.sent();
                fs_extra_1.default.writeFileSync(existingReadme, readmeContent);
                return [3 /*break*/, 6];
            case 5:
                error_2 = _a.sent();
                console.error(chalk_1.default.red("Error Writing File", error_2));
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
commander_1.program.parse(process.argv);
process.on("SIGINT", function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log(chalk_1.default.yellow("\n⚠️  Process interrupted. Any partial changes will be discarded"));
        process.exit(0);
        return [2 /*return*/];
    });
}); });
process.on("unhandledRejection", function (error) {
    console.error(chalk_1.default.red("\n❌ Unhandled Rejection: "), error);
    process.exit(1);
});
