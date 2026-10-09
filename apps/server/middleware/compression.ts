import { gunzip } from "node:zlib";

export const gunzipAsync = (input: Buffer, maxOutputLength: number): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    gunzip(input, { maxOutputLength }, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
