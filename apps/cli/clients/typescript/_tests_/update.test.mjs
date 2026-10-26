import assert from "node:assert/strict";
import test from "node:test";
import { getUpdateCommand } from "../bin/helpers/network.mjs";

test("update commands pin and force the requested version", () => {
  const originalPnpmHome = process.env.PNPM_HOME;
  process.env.PNPM_HOME = "/tmp/test-pnpm-home";

  try {
    const command = getUpdateCommand("15.0.0");
    assert.equal(command.executable, "pnpm");
    assert.deepEqual(command.args, ["add", "-g", "dokugen@15.0.0"]);
    assert.deepEqual(command.forceArgs, ["add", "-g", "--force", "dokugen@15.0.0"]);
  } finally {
    if (originalPnpmHome === undefined) Reflect.deleteProperty(process.env, "PNPM_HOME");
    else process.env.PNPM_HOME = originalPnpmHome;
  }
});
