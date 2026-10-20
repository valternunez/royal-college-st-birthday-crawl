// Rebuilds valters-pub-crawl.pdf. Not needed on GitHub.
// 1) node _tools/build-pdf.mjs "<project dir>" _tools/guide.html
// 2) chrome --headless=new --allow-file-access-from-files --no-pdf-header-footer --print-to-pdf=valters-pub-crawl.pdf file:///<project dir>/_tools/guide.html
// Stop text, food and prices live in STOPS below: keep them in sync with index.html.
// Builds the printable guide HTML for the PDF, reusing the map overlay from the site.
// Usage: node build-pdf.mjs <projectDir> <outHtml>
import { readFileSync, writeFileSync } from "node:fs";

const [, , PROJ, OUT] = process.argv;
const site = readFileSync(`${PROJ}/index.html`, "utf8");
const a = site.indexOf('<div class="map-view v-real">');
const b = site.indexOf("</svg>", a) + "</svg>".length;
const projUrl = "file:///" + PROJ.replace(/\\/g, "/").replace(/ /g, "%20");
const mapBlock = site.slice(a, b).replace('src="assets/map.svg"', `src="${projUrl}/assets/map.svg"`) + "\n</div>";

const dir = (q) => `https://www.google.com/maps/dir/?api=1&destination=${q}&travelmode=walking`;
const pin = (q) => `https://www.google.com/maps/search/?api=1&query=${q}`;
const ROUTE = "https://www.google.com/maps/dir/?api=1&origin=The+Constitution+42+St+Pancras+Way+London+NW1+0QT&destination=The+Prince+Albert+163+Royal+College+St+London+NW1+0SG&waypoints=Golden+Lion+88+Royal+College+St+London+NW1+0TH%7CColonel+Fawcett+1+Randolph+St+London+NW1+0SS&travelmode=walking";

const STOPS = [
  {
    n: 1, time: "5:00 – 6:30pm", name: "The Constitution", addr: "42 St Pancras Way, NW1 0QT",
    q: "The+Constitution+42+St+Pancras+Way+London+NW1+0QT", walk: "3 min walk to stop 2",
    text: "Built in 1858, the last building left of old Agar Town. The deck hangs over the Regent's Canal. Sunset is at 5:47pm, so be there by 5:15 to catch it. It's tucked away on St Pancras Way, so follow the map.",
    tags: ["Sunset 5:47pm"],
    open: "Bar 11am – midnight",
    food: { ok: true, when: "Kitchen until 10pm · open while we're here", items: [["Olives / padron peppers", "£5.00"], ["Sourdough & bone marrow butter", "£5.00"], ["Whitebait & tartare", "£5.50"], ["Fries / chips", "£5.50"], ["Bone marrow mac & cheese", "£6.50"], ["Scotch egg", "£7.50"]], menu: "https://www.theconstitutioncamden.co.uk/food-drink" },
  },
  {
    n: 2, time: "6:45 – 8:15pm", name: "Golden Lion", addr: "88 Royal College St, NW1 0TH",
    q: "Golden+Lion+88+Royal+College+St+London+NW1+0TH", walk: "5 min walk to stop 3",
    text: "A proper old London boozer. Wooden floors, a Victorian bar-back on CAMRA's heritage list, and a pub the locals saved from being turned into flats in 2013.",
    tags: ["Proper boozer"],
    open: "Bar noon – 11pm",
    food: { ok: true, when: "Rack City Ribs kitchen · hours not listed, ask at the bar", items: [["Coleslaw", "~£2.50"], ["Sweet potato fries", "~£4.50"], ["Loaded brisket fries", "~£9.50"], ["Wings", "~£10–12"]], note: "Prices from Deliveroo, may be lower in the pub.", menu: "https://deliveroo.co.uk/menu/london/mornington-crescent-south/rack-city-ribs-golden-lion-camden", menuLabel: "Menu on Deliveroo" },
  },
  {
    n: 3, time: "8:30 – 10:45pm", name: "Colonel Fawcett", addr: "1 Randolph St, NW1 0SS",
    q: "Colonel+Fawcett+1+Randolph+St+London+NW1+0SS", walk: "4 min walk back down",
    text: "Used to be the Camden Arms. A hundred-odd gins, a heated back garden, and the Saturday DJs start at nine.",
    tags: ["DJs from 9", "Happy hour all day"],
    deal: "Happy hour all day: £5.90 pints of 40ft Sunrise or Amstel, two margaritas for £14.",
    open: "Bar noon – 1am",
    food: { ok: true, when: "Kitchen until 9pm · order soon after we arrive", items: [["Gordal olives", "£4"], ["Sourdough & butter", "£6"], ["Cheese & potato croquettes", "£7"], ["Breaded whitebait", "£7"], ["Scotch egg", "£8"]], menu: "https://thecolonelfawcett.co.uk/food/" },
  },
  {
    n: "•", pizza: true, time: "11:00pm – 12:00am", name: "Pizza at Valter & Mer's", addr: "Address in the group chat", walk: "Next door to stop 4",
    text: "Papa John's, ordered from the Colonel so it lands when we do. Large pizzas are about £14 each on their \"any large\" deal (£18–22 full price), so roughly £5–7 each. We split the bill: send your share to whoever pays.",
    tags: ["Split the bill"],
  },
  {
    n: 4, time: "12:00 – 1am", name: "The Prince Albert", addr: "163 Royal College St, NW1 0SG",
    q: "The+Prince+Albert+163+Royal+College+St+London+NW1+0SG", walk: null,
    text: "The finish. A heated, covered garden where you can actually hear each other, open until one. Still going after that? The Colonel is four minutes back up the road, also open till one.",
    tags: ["Till 1am"],
    open: "Bar noon – 1am",
  },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const stopRow = (s) => `
  <tr>
    <td class="n">${s.n}</td>
    <td><b>${esc(s.name)}</b><br><span class="mono sm">${esc(s.addr)}</span></td>
    <td class="mono t">${esc(s.time)}</td>
    <td class="links">${s.q ? `<a href="${dir(s.q)}">Directions</a><br><a href="${pin(s.q)}">Map</a>` : ""}</td>
  </tr>`;

const stopCard = (s) => `
  <article class="card${s.pizza ? " pizza" : ""}">
    <header><span class="cn">${s.n}</span><div><h3>${esc(s.name)}</h3><p class="mono sm">${esc(s.time)} · ${esc(s.addr)}</p></div></header>
    <p>${esc(s.text)}</p>
    ${s.deal ? `<p class="deal">${esc(s.deal)}</p>` : ""}
    <p class="tags">${s.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join(" ")}${s.open ? `<span class="mono sm open">${esc(s.open)}</span>` : ""}</p>
    ${s.food ? `<div class="food">
      <p class="when mono ${s.food.ok ? "ok" : "no"}">${esc(s.food.when)}</p>
      <ul class="prices mono">${s.food.items.map(([k, v]) => `<li><span>${esc(k)}</span><span>${esc(v)}</span></li>`).join("")}</ul>
      ${s.food.note ? `<p class="note">${esc(s.food.note)}</p>` : ""}
    </div>` : ""}
    <p class="cardlinks mono">${s.q ? `<a href="${dir(s.q)}">Walking directions</a> · <a href="${pin(s.q)}">Map</a>` : ""}${s.food ? ` · <a href="${s.food.menu}">${esc(s.food.menuLabel || "Food menu")}</a>` : ""}${s.walk ? ` <span class="walk">${s.q ? "· " : ""}${esc(s.walk)}</span>` : ""}</p>
  </article>`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>The Royal College St. Crawl – guide</title>
<link href="https://fonts.googleapis.com/css2?family=Gloock&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=Courier+Prime:wght@400;700&display=swap" rel="stylesheet">
<style>
@page { size: A4; margin: 13mm 13mm 14mm; }
:root { --paper:#e3e7e1; --paper-3:#f4f6f2; --ink:#16263a; --soft:#536273; --rule:#16263a2e; --red:#2c6e72; --gold:#c9a45c;
  --map-label:#4f5f6e; --map-halo:#f6f8f4; --map-water:#a9c3cc; --map-water-label:#3d6b78; }
* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { zoom: .84; }
html, body { margin: 0; background: #fff; color: var(--ink); font: 10.5pt/1.42 "Newsreader", Georgia, serif; }
a { color: var(--red); text-decoration: underline; text-underline-offset: 2px; }
.mono { font-family: "Courier Prime", monospace; letter-spacing: .02em; }
.sm { font-size: 8.3pt; color: var(--soft); }
h1, h2, h3 { font-family: "Gloock", Georgia, serif; font-weight: 400; margin: 0; }
.page { break-after: page; }
.page:last-child { break-after: auto; }
.top { display: flex; justify-content: space-between; border-bottom: 1.2pt solid var(--ink); padding-bottom: 5pt; font-size: 8pt; text-transform: uppercase; letter-spacing: .14em; }
h1 { font-size: 40pt; line-height: 1; margin: 14pt 0 4pt; }
h1 .accent { color: var(--red); }
.lede { font-size: 12pt; margin: 0 0 12pt; }
.meet { display: grid; grid-template-columns: repeat(4, 1fr); border: 1.2pt solid var(--ink); background: var(--paper-3); margin-bottom: 14pt; }
.meet div { padding: 7pt 9pt; border-right: .8pt solid var(--rule); }
.meet div:last-child { border-right: 0; }
.meet .k { display: block; font: 7pt "Courier Prime", monospace; letter-spacing: .14em; text-transform: uppercase; color: var(--soft); }
.meet b { font: 13pt "Gloock", serif; font-weight: 400; }
.two { display: grid; grid-template-columns: 1.1fr .9fr; gap: 14pt; align-items: start; }
h2 { font-size: 17pt; margin: 0 0 6pt; }
table { width: 100%; border-collapse: collapse; }
td { vertical-align: top; padding: 6pt 4pt; border-top: .8pt solid var(--rule); }
tr:first-child td { border-top: 1.2pt solid var(--ink); }
td.n { font: 20pt/1 "Gloock", serif; width: 22pt; }
td.t { font-size: 8.5pt; white-space: nowrap; }
td.links { font: 8.5pt "Courier Prime", monospace; text-align: right; white-space: nowrap; }
.walks { margin: 6pt 0 0; font-size: 8.5pt; color: var(--soft); }
.btnlink { display: block; margin-top: 8pt; padding: 6pt; text-align: center; background: var(--ink); color: var(--paper-3); text-decoration: none; font: 700 8.5pt "Courier Prime", monospace; letter-spacing: .1em; text-transform: uppercase; }
.mapbox { border: 1.2pt solid var(--ink); background: var(--paper-3); padding: 5pt; }
.v-real { position: relative; width: 100%; aspect-ratio: 400 / 480; overflow: hidden; }
.v-real .real-base, .v-real .real-over { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.st-labels text { font-family: "Newsreader", serif; font-style: italic; fill: var(--map-label); stroke: var(--map-halo); stroke-width: 2.6px; stroke-linejoin: round; paint-order: stroke; }
.st-labels .canal-label { fill: var(--map-water-label); stroke: var(--map-water); }
.route-line { fill: none; stroke: var(--red); stroke-width: 3.4; stroke-linecap: round; stroke-linejoin: round; }
.mk circle { fill: var(--paper-3); stroke: var(--ink); stroke-width: 2; }
.mk text { font-family: "Gloock", serif; font-size: 15px; text-anchor: middle; fill: var(--ink); }
.mk .mk-label { font-family: "Newsreader", serif; font-style: italic; font-size: 14px; text-anchor: start; }
.mk .halo { stroke: var(--map-halo); stroke-width: 3px; stroke-linejoin: round; paint-order: stroke; }
.scale path { fill: none; stroke: var(--ink); stroke-width: 1.5; }
.scale text { font-family: "Courier Prime", monospace; font-size: 10px; fill: var(--soft); }
.scale .scale-bg { fill: var(--paper-3); fill-opacity: .85; }
.compass path { fill: var(--ink); opacity: .8; }
.compass text { font-family: "Courier Prime", monospace; font-size: 11px; fill: var(--ink); }
.mapcap { font-size: 7.5pt; color: var(--soft); margin: 4pt 0 0; }
.cards { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 10pt; align-items: start; }
.cards .receipt { margin-top: 0; }
.nopress { font: 9.5pt/1.4 "Newsreader", serif; color: var(--red); margin: 8pt 0 0; text-align: left; }
.lostrow { display: flex; gap: 14pt; align-items: baseline; }
.lostrow .lost { margin: 10pt 0 0; }
.card { min-width: 0; border: 1.2pt solid var(--ink); background: var(--paper-3); padding: 9pt 10pt; break-inside: avoid; }
.card header { display: flex; gap: 8pt; align-items: baseline; margin-bottom: 4pt; }
.cn { font: 26pt/1 "Gloock", serif; color: var(--red); }
.card.pizza { background: #fff; border-style: dashed; }
.card h3 { font-size: 15pt; line-height: 1.05; }
.card header p { margin: 2pt 0 0; }
.card p { margin: 0 0 6pt; }
.deal { color: var(--red); font-weight: 500; }
.tags { display: flex; flex-wrap: wrap; gap: 4pt; align-items: center; }
.tag { font: 700 7pt "Courier Prime", monospace; letter-spacing: .1em; text-transform: uppercase; color: var(--red); border: 1pt solid var(--red); padding: 2pt 4pt; }
.open { margin-left: auto; }
.food { border-top: .8pt dashed var(--rule); padding-top: 5pt; margin-top: 2pt; }
.when { font-size: 7.6pt; letter-spacing: .05em; text-transform: uppercase; margin: 0 0 4pt; }
.when.ok { color: var(--red); } .when.no { color: var(--soft); }
.when::before { content: ""; display: inline-block; width: 6pt; height: 6pt; border-radius: 50%; margin-right: 5pt; vertical-align: 0; background: currentColor; }
.when.no::before { background: transparent; box-shadow: inset 0 0 0 1pt currentColor; }
.prices { list-style: none; margin: 0 0 4pt; padding: 0; font-size: 8.5pt; }
.prices li { display: flex; gap: 4pt; padding: 1pt 0; }
.prices li span:first-child { flex: 1; overflow: hidden; white-space: nowrap; }
.prices li span:first-child::after { content: " ........................................................................................................................"; color: var(--soft); }
.prices li span:last-child { white-space: nowrap; }
.note { font-size: 8.8pt; color: var(--soft); }
.cardlinks { font-size: 8pt; margin: 6pt 0 0 !important; }
.walk { color: var(--soft); }
.hint { font-size: 9pt; color: var(--red); margin: 0 0 8pt; }
.cols { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 14pt; margin-top: 12pt; }
.v-real a, .v-real text { text-decoration: none; }
.two > div { min-width: 0; }
.panel { margin-top: 12pt; }
.right-home { margin-top: 12pt; }
.panel { background: var(--ink); color: #e8ece6; padding: 10pt 12pt; }
.panel h2 { color: #e8ece6; }
.panel ol { margin: 0; padding: 0; list-style: none; }
.panel li { display: grid; grid-template-columns: 18pt 1fr; gap: 4pt; padding: 5pt 0; border-top: .6pt solid #e8ece62a; }
.panel .rn { font: 13pt "Gloock", serif; color: var(--gold); }
.panel b { font: 11.5pt "Gloock", serif; font-weight: 400; display: block; }
dl { margin: 0; }
dl div { padding: 5pt 0; border-top: .8pt solid var(--rule); }
dt { font: 11.5pt "Gloock", serif; }
dd { margin: 1pt 0 0; color: var(--soft); }
.receipt { background: var(--paper-3); border: .8pt dashed var(--rule); padding: 9pt 11pt; font: 8.8pt "Courier Prime", monospace; margin-top: 10pt; }
.receipt .r { display: flex; gap: 4pt; padding: 1.5pt 0; }
.receipt .r span:first-child { flex: 1; overflow: hidden; white-space: nowrap; }
.receipt .r span:first-child::after { content: " ........................................................................................................................"; color: var(--soft); }
.receipt .tot { border-top: 1pt dashed var(--ink); margin-top: 5pt; padding-top: 5pt; font-weight: 700; }
.receipt .tot span:first-child::after { content: ""; }
.lost { font: 20pt/1.1 "Gloock", serif; margin: 14pt 0 4pt; }
.lost .mono { font-size: 8pt; letter-spacing: .14em; text-transform: uppercase; color: var(--red); vertical-align: middle; margin-right: 6pt; }
.foot { font-size: 7.5pt; color: var(--soft); border-top: .8pt solid var(--rule); padding-top: 5pt; margin-top: 10pt; }
</style></head>
<body>

<section class="page">
  <div class="top mono"><span>Valter's birthday · Camden NW1</span><span>Sat 24 Oct 2026</span></div>
  <h1>The Royal College St. <span class="accent">Crawl</span></h1>
  <p class="lede"><em>Four pubs, one night.</em> Every link in this guide is clickable.</p>
  <div class="meet">
    <div><span class="k">Meet</span><b>5pm</b></div>
    <div><span class="k">At</span><b>The Constitution</b></div>
    <div><span class="k">Sunset</span><b>5:47pm</b></div>
    <div><span class="k">Ends</span><b>1am</b></div>
  </div>
  <div class="two">
    <div>
      <h2>The running order</h2>
      <table>${STOPS.map(stopRow).join("")}</table>
      <p class="walks mono">Walks: 3 min · 5 min · 4 min · next door.</p>
      <a class="btnlink" href="${ROUTE}">Whole route in Google Maps</a>
      <p class="hint" style="margin-top:10pt">Pizza at ours at 11pm. Until then, keep going on sides: snack prices for each pub are on page 2.</p>
    <div class="panel">
      <h2>Good to know</h2>
      <ol>
        <li><span class="rn">I</span><div><b>Water at every stop.</b>Tap water is free in any UK pub. Just ask.</div></li>
        <li><span class="rn">II</span><div><b>Leave whenever you like.</b>Just tell someone, so we're not waiting for you at the headcount before the next pub.</div></li>
        <li><span class="rn">III</span><div><b>Bring physical ID.</b>Challenge 25 is a thing. Passport for all non-UK residents. Photos on your phone won't count.</div></li>
      </ol>
    </div>
    </div>
    <div>
      <div class="mapbox">${mapBlock}</div>
      <p class="mapcap mono">Tap a number to open it. Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors.</p>
      <div class="right-home">
      <h2>Getting home</h2>
      <dl>
        <div><dt>Night Tube</dt><dd>Northern line from Camden Town, all night on Saturdays. Charing Cross branch only, not Bank. About every 8 minutes.</dd></div>
        <div><dt>Night buses</dt><dd>Night (N) and 24-hour routes run from Camden High St and Camden Town station. Check <a href="https://citymapper.com/london">Citymapper</a> or <a href="https://tfl.gov.uk/plan-a-journey/">TfL</a> for your route.</dd></div>
        <div><dt>Overground</dt><dd>No overnight service from Camden Road. Check the last train time before you head out.</dd></div>
        <div><dt>Clocks go back</dt><dd>At 2am on Sunday 25 October, clocks go back to 1am. Phones update automatically.</dd></div>
        <div><dt>Phones</dt><dd>Camden has one of the highest phone theft rates in the UK.</dd></div>
      </dl>
      </div>
    </div>
  </div>
</section>

<section class="page">
  <h2>The stops, with food</h2>
  <div class="cards">${STOPS.map(stopCard).join("")}
    <div class="receipt">
      <div style="text-align:center;margin-bottom:6pt">WHAT IT'LL COST, ROUGHLY</div>
      <div class="r"><span>5-7 x DRINK, ~6.00</span><span>30-42</span></div>
      <div class="r"><span>1 x SNACK OR SIDE</span><span>~5.00</span></div>
      <div class="r"><span>PIZZA, SPLIT</span><span>~6.00</span></div>
      <div class="r"><span>TAP WATER</span><span>0.00</span></div>
      <div class="r tot"><span>TOTAL ABOUT</span><span>£41-53</span></div>
      <div style="text-align:center;margin-top:6pt;color:var(--soft)">PRICES ARE GUESSES · CHECK AT THE BAR</div>
      <p class="nopress">A rough guess, not a target. There's no pressure to spend any amount: tap water or soft drinks all night is completely fine.</p>
    </div>
  </div>
  <div class="lostrow">
    <div>
      <p class="lost"><span class="mono">Lost?</span>Text Valter or Mer.</p>
      <p class="sm">Prices and hours were checked online in October 2026 and can change. Confirm at the bar.</p>
    </div>
  </div>
  <p class="foot mono">The Royal College St. Crawl · Camden NW1 · 2026 · Map data © OpenStreetMap contributors</p>
</section>

</body></html>`;

writeFileSync(OUT, html);
console.log("guide written");
