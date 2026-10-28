import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { mountThemeRuntime, registerThemeRuntime } from "../src/core/themes/runtime.mjs";

const page = (theme) => ({ documentElement: { dataset: { theme } } });

test("only the rendered theme's runtime mounts, and it cleans up", () => {
  const calls = [];
  registerThemeRuntime("test-a", (doc) => {
    calls.push(`mount ${doc.documentElement.dataset.theme}`);
    return () => calls.push("cleanup a");
  });
  registerThemeRuntime("test-b", () => { calls.push("mount b"); });
  const cleanup = mountThemeRuntime(page("test-a"), {});
  assert.deepEqual(calls, ["mount test-a"]);
  cleanup();
  cleanup();
  assert.deepEqual(calls, ["mount test-a", "cleanup a"]);
});

test("a runtime registered after the page mounted attaches to that page once", () => {
  const calls = [];
  const cleanup = mountThemeRuntime(page("test-late"), {});
  assert.deepEqual(calls, []);
  registerThemeRuntime("test-late", () => { calls.push("mount"); return () => calls.push("cleanup"); });
  // An inlined layout script can run again after a later swap.
  registerThemeRuntime("test-late", () => { calls.push("duplicate"); });
  assert.deepEqual(calls, ["mount"]);
  cleanup();
  registerThemeRuntime("test-late-other", () => {});
  assert.deepEqual(calls, ["mount", "cleanup"]);
});

test("a page that was cleaned up ignores later registrations", () => {
  const calls = [];
  const cleanup = mountThemeRuntime(page("test-gone"), {});
  cleanup();
  registerThemeRuntime("test-gone", () => { calls.push("mount"); });
  assert.deepEqual(calls, []);
});

test("shared client code in core never imports theme code", () => {
  const root = fileURLToPath(new URL("../src/", import.meta.url));
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (/\.(astro|mjs|ts)$/.test(entry.name)) files.push(path);
    }
  };
  walk(join(root, "core"));
  // PageLayout only chooses a theme's layout during the static build.
  const layoutDispatcher = join(root, "core/themes/PageLayout.astro");
  const offenders = [];
  for (const file of files.filter((file) => file !== layoutDispatcher)) {
    for (const [, specifier] of readFileSync(file, "utf8").matchAll(/(?:from|import)\s*["']([^"']+)["']/g)) {
      const target = specifier.startsWith("@/") ? join(root, specifier.slice(2))
        : specifier.startsWith(".") ? resolve(dirname(file), specifier) : "";
      if (target.startsWith(join(root, "themes/"))) offenders.push(`${relative(root, file)} -> ${specifier}`);
    }
  }
  assert.deepEqual(offenders, []);
});
