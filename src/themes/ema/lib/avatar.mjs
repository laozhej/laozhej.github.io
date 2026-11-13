// The owner's avatar in the Ema theme (the homepage identity card, the Profile leaf of the chapter rail
// and the About page) is one fixed character, the same in every locale. It is set here rather than taken
// from the localized display name, whose last character differs by locale ("Arataki Asahi" ends in "i").
// The owner chose it as the avatar on 2026-11-13, so it carries no placeholder note.
export const AVATAR_MONOGRAM = '旭';

// The avatar is exposed as an image named after the owner, in each locale's own spelling.
export const avatarAttributes = (displayName) => ({ role: 'img', 'aria-label': displayName });
