import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("the static page is present with the expected title and controls", async () => {
  const html = await readFile(new URL("../src/index.html", import.meta.url), "utf8");
  assert.match(html, /<title>Dice Roller<\/title>/);
  assert.match(html, /<main class="felt">/);
  assert.match(html, /id="roll-form"/);
  assert.match(html, /id="clear-btn"/);
});
