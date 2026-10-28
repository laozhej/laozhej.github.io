const ease = "cubic-bezier(0.23, 1, 0.32, 1)";
const direction = {
  old: { name: "site-page-out", duration: "200ms", easing: ease, fillMode: "both" },
  new: { name: "site-page-in", duration: "280ms", easing: ease, fillMode: "both" },
};

export const pageTransition = { forwards: direction, backwards: direction };
