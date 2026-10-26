export function readingProgress(top, height, viewportHeight, headerHeight) {
  const travel = Math.max(0, height - viewportHeight + headerHeight);
  if (!travel) return Math.max(0, Math.min(1, (viewportHeight - top) / Math.max(1, height)));
  return Math.max(0, Math.min(1, (headerHeight - top) / travel));
}

export function mountReading(doc, win) {
  const prose = doc.querySelector("[data-site-prose]");
  const progress = doc.querySelector("[data-site-progress]");
  if (!prose || !progress) return () => {};
  const header = doc.querySelector("[data-site-header]");
  const links = [...doc.querySelectorAll("[data-site-toc] a")];
  const sections = links.map((link) => {
    try { return doc.getElementById(decodeURIComponent(link.hash.slice(1))); }
    catch { return null; }
  });
  let frame = 0;
  let active = -1;
  let disposed = false;
  const update = () => {
    frame = 0;
    if (doc.hidden || disposed) return;
    const headerHeight = header?.getBoundingClientRect().height ?? 80;
    const rect = prose.getBoundingClientRect();
    progress.style.transform = `scaleX(${readingProgress(rect.top, rect.height, win.innerHeight, headerHeight)})`;
    let next = -1;
    for (let index = 0; index < sections.length; index++) {
      if (sections[index] && sections[index].getBoundingClientRect().top <= headerHeight + 48) next = index;
    }
    if (next !== active) {
      if (active >= 0) links[active].removeAttribute("aria-current");
      if (next >= 0) links[next].setAttribute("aria-current", "location");
      active = next;
    }
  };
  const schedule = () => { if (!frame && !disposed && !doc.hidden) frame = win.requestAnimationFrame(update); };
  const visibility = () => {
    if (doc.hidden) { win.cancelAnimationFrame(frame); frame = 0; }
    else schedule();
  };
  win.addEventListener("scroll", schedule, { passive: true });
  win.addEventListener("resize", schedule);
  win.addEventListener("pageshow", schedule);
  doc.addEventListener("visibilitychange", visibility);
  prose.addEventListener("load", schedule, true);
  prose.addEventListener("toggle", schedule, true);
  const observer = win.ResizeObserver ? new win.ResizeObserver(schedule) : null;
  observer?.observe(prose);
  schedule();
  return () => {
    disposed = true;
    if (active >= 0) links[active].removeAttribute("aria-current");
    win.cancelAnimationFrame(frame);
    observer?.disconnect();
    win.removeEventListener("scroll", schedule);
    win.removeEventListener("resize", schedule);
    win.removeEventListener("pageshow", schedule);
    doc.removeEventListener("visibilitychange", visibility);
    prose.removeEventListener("load", schedule, true);
    prose.removeEventListener("toggle", schedule, true);
  };
}
