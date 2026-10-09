import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { matchesIgnorePattern, scanFiles } from "../bin/helpers/fileOps.mjs";

test("secret filename matching is case-insensitive", () => {
  assert.equal(matchesIgnorePattern(".ENV.PRODUCTION", ".env*"), true);
  assert.equal(matchesIgnorePattern("SERVICE-ACCOUNT-PROD.JSON", "service-account*.json"), true);
});

test("scanner skips secrets and symlinks", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "dokugen-scan-"));
  const outside = await mkdtemp(path.join(os.tmpdir(), "dokugen-outside-"));

  try {
    await mkdir(path.join(root, "src"));
    await writeFile(path.join(root, "src", "safe.ts"), "export const safe = true;\n");
    await writeFile(path.join(root, ".env.staging"), "SECRET=value\n");
    await writeFile(path.join(outside, "secret.txt"), "outside\n");
    await symlink(path.join(outside, "secret.txt"), path.join(root, "linked-secret.txt"));

    const files = await scanFiles(root);
    assert.deepEqual(files, [path.join("src", "safe.ts")]);
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(outside, { recursive: true, force: true });
  }
});
