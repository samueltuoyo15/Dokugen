"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pino_1 = __importDefault(require("pino"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const logger = (0, pino_1.default)(Object.assign({ level: process.env.NODE_ENV === 'production' ? 'info' : 'debug' }, (process.env.NODE_ENV !== 'production' && {
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true
        }
    }
})));
exports.default = logger;
