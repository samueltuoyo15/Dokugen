import assert from "node:assert/strict";
import test from "node:test";
import { detectPackageManager, getUpdateCommand } from "../bin/helpers/network.mjs";

test("uses npm for an npm installation even when PNPM_HOME is configured", () => {
  const entrypoint = "/home/user/.nvm/versions/node/v24/lib/node_modules/dokugen/dist/bin/dokugen.mjs";
  const environment = { PNPM_HOME: "/home/user/.local/share/pnpm" };

  assert.equal(detectPackageManager(entrypoint, environment), "npm");
  const command = getUpdateCommand("15.0.0", entrypoint, environment);
  assert.equal(command.executable, "npm");
  assert.deepEqual(command.args, ["install", "-g", "dokugen@15.0.0", "--ignore-scripts"]);
});

test("uses pnpm when the running entrypoint belongs to PNPM_HOME", () => {
  const entrypoint = "/home/user/.local/share/pnpm/bin/dokugen";
  const environment = { PNPM_HOME: "/home/user/.local/share/pnpm" };

  assert.equal(detectPackageManager(entrypoint, environment), "pnpm");
  const command = getUpdateCommand("15.0.0", entrypoint, environment);
  assert.equal(command.executable, "pnpm");
  assert.deepEqual(command.args, ["add", "-g", "dokugen@15.0.0"]);
  assert.deepEqual(command.forceArgs, ["add", "-g", "--force", "dokugen@15.0.0"]);
});
