import { importerText, locales, localePreferenceKey } from "/i18n.mjs";

const $ = (selector) => document.querySelector(selector);
const form = $("#import-form");
const queue = [];
let imported = [];
let library = [];
let busy = false;
let locale = "zh-CN";
try {
  const saved = localStorage.getItem(localePreferenceKey);
  if (locales.includes(saved)) locale = saved;
} catch { /* The tool also works without browser storage. */ }
let t = importerText(locale);
const bytes = (size) => size < 1024 ? `${size} B` : size < 1024 * 1024 ? `${(size / 1024).toFixed(1)} KiB` : `${(size / 1024 / 1024).toFixed(2)} MiB`;

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text != null) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function status(key, values = {}, error = false, detail = "") {
  const node = $("#status");
  node.textContent = `${t(key, values)}${detail ? ` (${detail})` : ""}`;
  node.dataset.error = String(error);
}

function showError(error) { status(error.code || "internal", {}, true, error.detail); }

function updateControls() {
  $("#submit").disabled = busy || !queue.length;
  $("#clear").disabled = busy || !queue.length;
  $("#queue-empty").hidden = Boolean(queue.length);
  $("#source-page").required = $("#source-type").value === "external";
}

function setBusy(value) {
  busy = value;
  form.setAttribute("aria-busy", String(value));
  for (const control of form.elements) control.disabled = value;
  $("#locale").disabled = value;
  $("#submit").textContent = t(value ? "importing" : "import");
  updateControls();
}

function renderQueue() {
  $("#queue").replaceChildren();
  for (const item of queue) {
    const row = element("li", null, "queue-item");
    const thumbnail = element("img", null, "thumbnail");
    thumbnail.src = item.preview;
    thumbnail.alt = "";
    const content = element("div");
    const heading = element("div", null, "queue-title");
    const fileInfo = element("div");
    fileInfo.append(element("p", item.file.name, "filename"), element("p", bytes(item.file.size), "file-info"));
    const remove = element("button", t("remove"), "text-button");
    remove.type = "button";
    remove.setAttribute("aria-label", `${t("remove")} ${item.file.name}`);
    remove.addEventListener("click", () => {
      URL.revokeObjectURL(item.preview);
      queue.splice(queue.indexOf(item), 1);
      renderQueue();
    });
    heading.append(fileInfo, remove);
    const fields = element("div", null, "queue-fields");
    for (const [key, label, hint, maxLength] of [["nameHint", "name", "nameHint", 300], ["alt", "alt", "altHint", 1000]]) {
      const wrapper = element("label");
      const input = element("input");
      input.value = item[key];
      input.placeholder = t(hint);
      input.maxLength = maxLength;
      input.addEventListener("input", () => { item[key] = input.value; });
      wrapper.append(element("span", t(label)), input);
      fields.append(wrapper);
    }
    content.append(heading, fields);
    row.append(thumbnail, content);
    $("#queue").append(row);
  }
  updateControls();
}

function addFiles(files) {
  if (busy) return;
  const additions = [...files];
  if (!additions.length) return;
  if (queue.length + additions.length > 20) return status("invalidBatch", {}, true);
  if (additions.some((file) => !file.size || file.size > 25 * 1024 * 1024)) return status("fileSize", {}, true);
  if ([...queue.map((item) => item.file), ...additions].reduce((sum, file) => sum + file.size, 0) > 50 * 1024 * 1024) return status("batchSize", {}, true);
  if (additions.some((file) => !/\.(jpe?g|png|webp|avif|gif)$/i.test(file.name))) return status("unsupportedFormat", {}, true);
  for (const file of additions) queue.push({ file, nameHint: "", alt: "", preview: URL.createObjectURL(file) });
  renderQueue();
  status("selected", { count: queue.length });
}

async function copy(text) {
  try { await navigator.clipboard.writeText(text); status("copied"); }
  catch { status("copyFailed", {}, true); }
}

function renderAssets(container, assets, recent = false) {
  container.replaceChildren();
  for (const asset of assets) {
    const row = element("article", null, "image-row");
    const thumbnail = element("img", null, "thumbnail");
    thumbnail.src = asset.path;
    thumbnail.alt = "";
    thumbnail.loading = "lazy";
    const content = element("div");
    const meta = element("div", null, "image-meta");
    const delta = Math.round((1 - asset.output.bytes / asset.original.bytes) * 100);
    meta.append(element("strong", recent ? t(asset.duplicate ? "reused" : "new") : asset.original.filename), element("span", `${asset.output.width} × ${asset.output.height}`), element("span", t("size", { before: bytes(asset.original.bytes), after: bytes(asset.output.bytes) })), element("span", t(delta > 0 ? "saved" : delta < 0 ? "larger" : "unchanged", { percent: Math.abs(delta) })));
    const reference = element("code", asset.references.markdown);
    reference.setAttribute("aria-label", t("reference"));
    const actions = element("div", null, "copy-actions");
    for (const [key, label] of [["path", "copyPath"], ["markdown", "copyMarkdown"], ["html", "copyHtml"]]) {
      const button = element("button", t(label), "text-button");
      button.type = "button";
      button.addEventListener("click", () => copy(asset.references[key]));
      actions.append(button);
    }
    content.append(meta, reference, actions);
    for (const source of asset.sources) {
      const line = element("p", null, "source-line");
      const label = source.type === "original" ? t("original") : source.page;
      if (source.page && /^https?:\/\//.test(source.page)) {
        const link = element("a", label);
        link.href = source.page;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        line.append(link);
      } else line.append(document.createTextNode(label));
      line.append(document.createTextNode(` · ${source.creator || t("authorship")} · ${source.license || t("unknownLicense")}`));
      content.append(line);
    }
    row.append(thumbnail, content);
    container.append(row);
  }
}

async function loadLibrary() {
  const response = await fetch("/api/images");
  const data = await response.json();
  if (!response.ok) throw Object.assign(new Error(), { code: data.error, detail: data.detail });
  library = data.assets.slice().reverse();
  renderAssets($("#library"), library);
  $("#library-empty").hidden = Boolean(library.length);
}

function applyLocale() {
  t = importerText(locale);
  document.documentElement.lang = locale;
  document.title = t("title");
  $("#locale").value = locale;
  for (const node of document.querySelectorAll("[data-i18n]")) node.textContent = t(node.dataset.i18n);
  for (const node of document.querySelectorAll("[data-placeholder]")) node.placeholder = t(node.dataset.placeholder);
  for (const node of document.querySelectorAll("[data-label]")) node.setAttribute("aria-label", t(node.dataset.label));
  renderQueue();
  renderAssets($("#results"), imported, true);
  renderAssets($("#library"), library);
  $("#status").textContent = "";
}

$("#locale").addEventListener("change", (event) => {
  locale = event.target.value;
  try { localStorage.setItem(localePreferenceKey, locale); } catch { /* Optional. */ }
  applyLocale();
});
$("#files").addEventListener("change", (event) => { addFiles(event.target.files); event.target.value = ""; });
$("#clear").addEventListener("click", () => {
  for (const item of queue) URL.revokeObjectURL(item.preview);
  queue.length = 0;
  renderQueue();
  $("#status").textContent = "";
});
$("#source-type").addEventListener("change", updateControls);
$("#reload").addEventListener("click", () => loadLibrary().catch(showError));
$("#copy-all").addEventListener("click", () => copy(imported.map((asset) => asset.references.markdown).join("\n")));
let dragDepth = 0;
$("#drop-zone").addEventListener("dragenter", (event) => { event.preventDefault(); dragDepth++; $("#drop-zone").dataset.dragging = "true"; });
$("#drop-zone").addEventListener("dragleave", () => { if (--dragDepth <= 0) $("#drop-zone").dataset.dragging = "false"; });
$("#drop-zone").addEventListener("dragover", (event) => event.preventDefault());
$("#drop-zone").addEventListener("drop", (event) => {
  event.preventDefault();
  dragDepth = 0;
  $("#drop-zone").dataset.dragging = "false";
  addFiles(event.dataTransfer.files);
});
window.addEventListener("dragover", (event) => event.preventDefault());
window.addEventListener("drop", (event) => event.preventDefault());
window.addEventListener("beforeunload", (event) => { if (busy) { event.preventDefault(); event.returnValue = ""; } });

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy || !queue.length) return;
  const source = Object.fromEntries(new FormData(form));
  const payload = new FormData();
  payload.set("metadata", JSON.stringify({ source, files: queue.map(({ nameHint, alt }) => ({ nameHint, alt })), maxSize: Number($("#max-size").value), quality: Number($("#quality").value) }));
  for (const item of queue) payload.append("images", item.file);
  setBusy(true);
  status("processing");
  try {
    const response = await fetch("/api/import", { method: "POST", headers: { "X-Image-Import-Token": $("meta[name='import-token']").content }, body: payload });
    const data = await response.json();
    if (!response.ok) throw Object.assign(new Error(), { code: data.error, detail: data.detail });
    imported = data.assets;
    renderAssets($("#results"), imported, true);
    $("#results-section").hidden = false;
    for (const item of queue) URL.revokeObjectURL(item.preview);
    queue.length = 0;
    renderQueue();
    status("imported", { count: imported.length });
    // Keep a successful import visible even if refreshing the history fails.
    try { await loadLibrary(); } catch (error) { showError(error); }
    $("#copy-all").focus();
  } catch (error) { showError(error); }
  finally { setBusy(false); }
});

applyLocale();
loadLibrary().catch(showError);
