import { promisify } from "node:util";
import { gunzip } from "node:zlib";

export const gunzipAsync = promisify(gunzip);
