import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sanitizeCommitMessage } from "../lib/commitMessage";

describe("sanitizeCommitMessage", () => {
  it("returns a diagnostic error for empty model output", () => {
    assert.deepEqual(sanitizeCommitMessage(""), {
      repaired: false,
      reason: "The model returned an empty response",
    });
  });

  it("normalizes repairable conventional commit output", () => {
    assert.deepEqual(sanitizeCommitMessage('"Feat(UI): Refresh portfolio projects and presentation."'), {
      message: "feat(ui): refresh portfolio projects and presentation",
      repaired: true,
    });
  });

  it("shortens long messages to the 72-character limit", () => {
    const result = sanitizeCommitMessage(
      "feat(portfolio): add a very detailed portfolio redesign with refreshed projects tools metadata images and navigation",
    );

    assert.ok(result.message);
    assert.ok(result.message.length <= 72);
  });

  it("rejects output that cannot be repaired", () => {
    assert.deepEqual(sanitizeCommitMessage("Here is your message"), {
      repaired: false,
      reason: "The model response was not a valid Conventional Commit message",
    });
  });

  it("rejects the old generic fallback message", () => {
    assert.deepEqual(sanitizeCommitMessage("chore: update codebase"), {
      repaired: false,
      reason: "The model returned a generic, non-specific commit message",
    });
  });
});
