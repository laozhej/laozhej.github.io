<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes" />
  <xsl:template match="/">
    <html lang="{/rss/channel/language}">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title><xsl:value-of select="/rss/channel/title" /> — RSS</title>
        <style>
          :root {
            color-scheme: light dark;
            --bg: #eceae4; --panel: #f7f6f2; --ink: #121416; --muted: #4e5358;
            --rule: #cbc9c2; --accent: #0b7b92;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #0d0f11; --panel: #15181b; --ink: #e9eae6; --muted: #a0a6ab;
              --rule: #2a2e32; --accent: #19cff2;
            }
          }
          * { box-sizing: border-box; }
          body {
            margin: 0; padding: 40px 20px 72px;
            background: var(--bg); color: var(--ink);
            font: 15px/1.75 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }
          .wrap { max-width: 780px; margin: 0 auto; }
          .banner {
            padding: 14px 18px; margin-bottom: 32px;
            border: 1px solid var(--rule); border-left: 3px solid var(--accent);
            background: var(--panel); font-size: 13px; color: var(--muted);
          }
          .banner code {
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            color: var(--ink); word-break: break-all;
          }
          header { padding-bottom: 24px; border-bottom: 1px solid var(--ink); margin-bottom: 28px; }
          .kicker {
            margin: 0 0 8px; font: 600 12px/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            letter-spacing: .12em; text-transform: uppercase; color: var(--accent);
          }
          h1 { margin: 0 0 10px; font-size: clamp(1.6rem, 4vw, 2.2rem); line-height: 1.3; }
          header p { margin: 0 0 14px; color: var(--muted); }
          a { color: var(--ink); text-underline-offset: 4px; }
          a:hover { color: var(--accent); }
          ol { list-style: none; margin: 0; padding: 0; }
          li { padding: 20px 0; border-bottom: 1px solid var(--rule); }
          .meta {
            display: flex; flex-wrap: wrap; gap: 6px 14px; margin-bottom: 6px;
            font: 12px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: var(--muted);
          }
          h2 { margin: 0 0 8px; font-size: 1.15rem; line-height: 1.45; }
          h2 a { text-decoration: none; }
          h2 a:hover { text-decoration: underline; }
          li p { margin: 0; color: var(--muted); font-size: 14px; }
          .tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
          .tags span {
            padding: 2px 8px; border: 1px solid var(--rule);
            font: 12px/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: var(--muted);
          }
        </style>
      </head>
      <body>
        <div class="wrap">
          <p class="banner">
            RSS 2.0 Feed · Copy this URL into your RSS reader:
            <xsl:text> </xsl:text>
            <code><xsl:value-of select="/rss/channel/atom:link/@href" /></code>
          </p>
          <header>
            <p class="kicker">// RSS FEED</p>
            <h1><xsl:value-of select="/rss/channel/title" /></h1>
            <p><xsl:value-of select="/rss/channel/description" /></p>
            <a href="{/rss/channel/link}">Visit journal →</a>
          </header>
          <main>
            <ol>
              <xsl:for-each select="/rss/channel/item">
                <li>
                  <div class="meta">
                    <time><xsl:value-of select="pubDate" /></time>
                  </div>
                  <h2><a href="{link}"><xsl:value-of select="title" /></a></h2>
                  <p><xsl:value-of select="description" /></p>
                  <xsl:if test="category">
                    <div class="tags">
                      <xsl:for-each select="category">
                        <span>#<xsl:value-of select="." /></span>
                      </xsl:for-each>
                    </div>
                  </xsl:if>
                </li>
              </xsl:for-each>
            </ol>
          </main>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
