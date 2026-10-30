const cacheKey = "__site_build";

// GitHub Pages caches HTML for ten minutes. Give each deployed build its own
// navigation cache entry so a freshly loaded page cannot reopen an older tab's
// cached HTML. Astro still owns parsing, assets, cancellation and redirects.
export function versionNavigationRequest(event, version) {
  if (!version || event.formData || event.to.origin !== event.from.origin) return;
  const load = event.loader;
  event.loader = async () => {
    const destination = event.to;
    const request = new URL(destination.href);
    request.searchParams.set(cacheKey, version);
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
