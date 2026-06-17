import { gunzip } from "zlib";
import { promisify } from "util";

export const gunzipAsync = promisify(gunzip);
