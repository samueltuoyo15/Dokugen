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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchGitHubReadme = void 0;
const axios_1 = __importDefault(require("axios"));
const fetchGitHubReadme = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rawUrl = url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
        const response = yield axios_1.default.get(rawUrl, { responseType: "text" });
        return response.data;
    }
    catch (error) {
        console.error("Failed to fetch GitHub README:", error);
        throw new Error("Invalid GitHub URL or README not found");
    }
});
exports.fetchGitHubReadme = fetchGitHubReadme;
