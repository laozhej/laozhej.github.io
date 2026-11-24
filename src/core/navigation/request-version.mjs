const cacheKey = "__site_build";

// The URL the router fetches for a page of this build. Prefetching uses it too, so
// the download a hover starts is the one the click reuses.
export function versionedUrl(url, version) {
  const request = new URL(url);
  request.hash = "";
  if (version) request.searchParams.set(cacheKey, version);
  return request;
}

// GitHub Pages caches HTML for ten minutes. Give each deployed build its own
// navigation cache entry so a freshly loaded page cannot reopen an older tab's
// cached HTML. Astro still owns parsing, assets, cancellation and redirects.
export function versionNavigationRequest(event, version) {
  if (!version || event.formData || event.to.origin !== event.from.origin) return;
  const load = event.loader;
  event.loader = async () => {
    const destination = event.to;
    const request = versionedUrl(destination.href, version);
    request.hash = destination.hash;
    event.to = request;
    try {
      return await load();
    } finally {
      // Only the fetch URL carries the build key. History, the address bar and
      // anchor restoration use the original destination or Astro's redirect.
      if (event.to === request) {
        event.to = destination;
      } else if (event.to.searchParams.get(cacheKey) === version) {
        event.to.searchParams.delete(cacheKey);
      }
    }
  };
}
