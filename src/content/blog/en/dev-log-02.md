---
title: "Personal Website Dev Log 02: From Prototype to Four Themes and a Custom Domain"
description: "How the site grew step by step from the first prototype into four themes and four languages, resolving the custom domain so it loads smoothly everywhere, and the art work still ahead for Sakura Archive."
pubDate: 2026-11-28
category: tech
tags: [Personal website, Dev log, Astro, Domain]
locale: en
translationKey: dev-log-02
---

The last dev log stopped at the first prototype, when all I could say was "this still isn't what I want." Over the past month I've kept chipping away at it, and yesterday I finally sorted out the domain, so this feels like a good moment to write down how the site came together piece by piece.

## Starting from a monochrome base

When I first got started, I set up a static site with Astro and followed Blank's black-and-white typography to put the basic frame in place. Once the home, journal, projects, games, and about sections were lined up, I hooked up light and dark mode.

Early on, I settled on one rule: keep profile info, posts, projects, and collection items in a single shared data layer. Later I added routes for Simplified Chinese, Traditional Chinese, Japanese, and English, so no matter which language or theme you switch to, you're reading the same underlying content without duplicating updates.

## Growing into four themes

At first I only wanted a light, slightly anime-inspired site, but the more I worked on it, the more ideas kept showing up. In the end I kept the different directions side by side as four themes you can switch between at any time:

- Blank: keeps the original monochrome typography for quiet reading.
- Sakura Archive (Ema): closest to the anime direction I had in mind from the start. It went through several full reworks before settling on the full-screen character stage and click-through five-pose theater, later joined by paper still-life sketches, falling sakura petals, and Sakura Radio.
- Endfield Industrial (Endfield): a paper-and-ink industrial interface with yellow accents, recently updated with a set of interactive motions.
- Arknights: a fourth theme added a few days ago, modeled after an archive terminal—a running console in dark mode, printed archive paper in light mode. After adding interactive motion to it, I liked the overall feel enough that today I made it the site's default home theme and moved Blank under the themes path.

## Filling in fonts, reading tools, and the collection

After publishing the first dev log on November 15, most of the work shifted toward day-to-day browsing and reading details.

Fonts were one of the biggest changes. Relying on system fonts made the site look wildly different across devices, so I switched all four themes to self-hosted font subsets for Chinese, Japanese, and Latin text—consistent across platforms, with no external font servers involved. On the reading side, I gradually added a table of contents, reading progress, word count and reading time, code-block copy and folding, and click-to-zoom images; pressing `⌘K` or `Ctrl+K` brings up site-wide quick search. Smaller details like mobile tap targets and letting the color-mode toggle return to following the system were cleaned up along the way.

The content structure also grew. What used to be the Games section is now Collection, split into five categories: manga, anime, movies, TV, and games. Alongside the original 23 games, I recently imported 56 watched anime and 145 movies with covers and posters from my Notion lists, and added a random-pick button for whenever I can't decide what to revisit.

## Finally sorting out a custom domain

Up until now, the site lived on GitHub Pages' default `laozhej.github.io` address. Yesterday I finally got the custom domain `neroarataki.com` working properly, and switched the canonical URLs, sitemap, RSS feeds, and social preview cards over to match (fixing a small hiccup along the way where Cloudflare had rewritten the public email link). Now the site loads smoothly from both inside and outside China—it finally feels like it has a proper nameplate.

## Still on the list: Sakura Archive's art

Even though the structure and features have come a long way since the first prototype, I'm still not fully happy with the artwork in Sakura Archive, and it needs more work.

For instance, the header illustrations and visual direction for several inner pages aren't settled yet, and the different visual pieces across the theme could still feel more cohesive. Because I don't want to cut corners with generative AI images, this isn't something I can rush through in one sitting—I'd rather take my time finding the right direction and materials and adjust it bit by bit.

Looking back at the first post, even the home page wasn't settled back then. Now it at least feels like a place I can settle into and keep tending. From here, I'll keep refining Sakura Archive's art while gradually adding more logs, notes, and whatever I'm working on next.
