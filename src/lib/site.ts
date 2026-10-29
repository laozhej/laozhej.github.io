// Site identity and route structure are shared by every language and theme.
// UI translations live in src/core/i18n/messages.ts.
export const site = {
  name: "Blank Space",
  wordmark: "blank",
  // The copyright holder shown in every theme's footer.
  owner: "Asahi Arataki",
  // This site's own source, linked from every theme's footer.
  repository: "https://github.com/laozhej/laozhej.github.io",
  nav: [
    { key: "home", href: "/" },
    { key: "blog", href: "/blog/" },
    { key: "projects", href: "/projects/" },
    { key: "games", href: "/games/" },
    { key: "about", href: "/about/" },
  ],
};
