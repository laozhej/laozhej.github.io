import test from "node:test";
import assert from "node:assert/strict";
import { versionNavigationRequest } from "../src/core/navigation/request-version.mjs";

function navigation(to = "/themes/ema/projects/?tag=a&tag=b#details") {
  return {
    from: new URL("https://example.test/themes/ema/"),
    to: new URL(to, "https://example.test"),
    loader: async () => {},
  };
}

test("a new deployment bypasses cached old HTML while retaining the visible URL", async () => {
  const event = navigation();
  const canonical = event.to.href;
  const cache = new Map([[canonical, "old glass navigation"]]);
  let published = "restored navigation";
  let network = 0;
  event.loader = async () => {
    if (!cache.has(event.to.href)) { cache.set(event.to.href, published); network++; }
    event.newDocument = cache.get(event.to.href);
  };
  const original = event.loader;
  versionNavigationRequest(event, "rollback");
  await event.loader();
  assert.equal(event.newDocument, "restored navigation");
  assert.equal(event.to.href, canonical);
  assert.deepEqual(event.to.searchParams.getAll("tag"), ["a", "b"]);
  assert.equal(event.to.hash, "#details");
  await event.loader();
  assert.equal(network, 1, "same-build navigation keeps its cache");
  published = "next release";
  event.loader = original;
  versionNavigationRequest(event, "next-release");
  await event.loader();
  assert.equal(event.newDocument, "next release");
  assert.equal(network, 2);
  assert.equal(event.to.href, canonical);
});

test("redirected destinations keep their path, query and fragment without the internal key", async () => {
  const event = navigation();
  event.loader = async () => {
    event.to = new URL("/en/themes/ema/projects/?category=web&__site_build=release#details", event.to);
  };
  versionNavigationRequest(event, "release");
  await event.loader();
  assert.equal(event.to.href, "https://example.test/en/themes/ema/projects/?category=web#details");
});

test("failed or aborted loads restore the destination and preserve the original error", async () => {
  for (const error of [new Error("offline"), new DOMException("cancelled", "AbortError")]) {
    const event = navigation();
    const destination = event.to;
    event.loader = async () => { throw error; };
    versionNavigationRequest(event, "release");
    await assert.rejects(event.loader(), failure => failure === error);
    assert.equal(event.to, destination);
  }
});

test("forms, external destinations and documents without a build retain Astro's loader", () => {
  for (const [event, build] of [
    [{ ...navigation(), formData: new FormData() }, "release"],
    [navigation("https://other.test/page/"), "release"],
    [navigation(), undefined],
  ]) {
    const loader = event.loader;
    const destination = event.to;
    versionNavigationRequest(event, build);
    assert.equal(event.loader, loader);
    assert.equal(event.to, destination);
  }
});
