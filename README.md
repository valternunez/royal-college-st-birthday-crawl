# The Royal College St. Crawl

A one-page site for Valter's birthday pub crawl in Camden, Saturday 24 October 2026: the route, a street map, snack prices, notes and a downloadable PDF guide.

Live at: https://valternunez.github.io/royal-college-st-birthday-crawl/ *(update if the username differs)*

## Files

| Path | What it is |
|---|---|
| `index.html` | The page |
| `assets/styles.css` | Styles (Canal colour scheme) |
| `assets/app.js` | Countdown, "right now" status, calendar download |
| `assets/map.svg` | Street map, built once from OpenStreetMap data |
| `assets/favicon.svg` | Tab icon |
| `valters-pub-crawl.pdf` | The 2-page printable guide linked from the page |
| `_tools/build-pdf.mjs` | Script that rebuilds the PDF (not published) |

## Updating

Edit `index.html`, then commit and push. GitHub Pages republishes in about a minute.

The PDF does not update by itself. After changing times, prices or text, also update the `STOPS` data in `_tools/build-pdf.mjs` and rebuild:

```sh
node _tools/build-pdf.mjs "$(pwd)" _tools/guide.html
chrome --headless=new --allow-file-access-from-files --no-pdf-header-footer \
  --print-to-pdf=valters-pub-crawl.pdf "file://$(pwd)/_tools/guide.html"
```

Map data © OpenStreetMap contributors.
