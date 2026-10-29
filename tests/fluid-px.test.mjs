import test from "node:test";
import assert from "node:assert/strict";
import postcss from "postcss";
import { fluidPx, scalePx } from "../src/core/styles/fluid-px.mjs";

const unit = (amount) => `calc(${amount} * var(--site-px, 1px))`;

test("px lengths become multiples of the shared wide-screen unit", () => {
  assert.equal(scalePx("24px"), unit(24));
  assert.equal(scalePx("400 16px/1.75 var(--blank-sans)"), `400 ${unit(16)}/1.75 var(--blank-sans)`);
  assert.equal(scalePx("clamp(46px,5.8vw,80px)"), `clamp(${unit(46)},5.8vw,${unit(80)})`);
  assert.equal(scalePx("translate(-50%,-6.5px)"), `translate(-50%,${unit(-6.5)})`);
  assert.equal(scalePx("calc(100% - 96px)"), `calc(100% - ${unit(96)})`);
  assert.equal(scalePx("0 0/6px 6px"), `0 0/${unit(6)} ${unit(6)}`);
});

test("hairlines, other units, urls and strings stay as written", () => {
  for (const value of ["1px solid #dce3e9", "0 0 .5px", "-1px", "0px", "1.5rem", "50vw", "#ffffff1f", "url(/a-12px.svg)", "\"12px\"", "var(--size-12px)"]) {
    assert.equal(scalePx(value), value);
  }
  assert.equal(scalePx("12px url(\"x 12px\")"), `${unit(12)} url("x 12px")`);
});

test("rewriting is idempotent", () => {
  const once = scalePx("0 14px 34px #8599b41f");
  assert.equal(scalePx(once), once);
});

test("the plugin rewrites site stylesheets only and honours px:fixed", async () => {
  const css = ".a{padding:12px;/* px:fixed */--runway:560px;margin:8px}";
  const site = await postcss([fluidPx()]).process(css, { from: "/repo/src/themes/x.css" });
  assert.equal(site.css, `.a{padding:${unit(12)};/* px:fixed */--runway:560px;margin:${unit(8)}}`);
  const vendor = await postcss([fluidPx()]).process(css, { from: "/repo/node_modules/pkg/x.css" });
  assert.equal(vendor.css, css);
});
