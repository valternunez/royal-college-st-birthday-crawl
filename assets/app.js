(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  // ----- the plan (London wall-clock times, YYYYMMDDHHMM) -----
  var STOPS = [
    { n: 1, name: "The Constitution",  from: 202610241700, to: 202610241845, at: "5pm" },
    { n: 2, name: "Golden Lion",       from: 202610241845, to: 202610242030, at: "6:45pm" },
    { n: 3, name: "Colonel Fawcett",   from: 202610242030, to: 202610242300, at: "8:30pm" },
    { n: 5, name: "Pizza at Valter & Mer's", from: 202610242300, to: 202610250000, at: "11pm" },
    { n: 4, name: "The Prince Albert", from: 202610250000, to: 202610250200, at: "midnight" }
  ];
  var START = Date.parse("2026-10-24T17:00:00+01:00");

  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem(key));
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }

  function londonNow() {
    var f = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    });
    var p = {};
    f.formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    return Number(p.year + p.month + p.day + p.hour + p.minute);
  }

  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  // ----- status / countdown -----
  var label = document.getElementById("status-label");
  var main = document.getElementById("status-main");
  var sub = document.getElementById("status-sub");

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function tick() {
    var now = londonNow();
    var current = null;
    STOPS.forEach(function (s) { if (now >= s.from && now < s.to) current = s; });

    document.querySelectorAll(".stop, .mk").forEach(function (el) {
      var n = Number(el.getAttribute("data-stop"));
      var s = STOPS.filter(function (x) { return x.n === n; })[0];
      if (!s) return;
      el.classList.toggle("is-now", !!current && current.n === n);
      el.classList.toggle("is-done", el.classList.contains("stop") && !!current && now >= s.to);
    });

    if (current) {
      var next = STOPS[STOPS.indexOf(current) + 1];
      label.textContent = current.n === 5 ? "Right now, pizza break" : "Right now, stop " + current.n;
      main.textContent = current.name;
      sub.textContent = next ? "Next: " + next.name + " at " + next.at : "Last stop. Get home safe.";
      return;
    }

    var diff = START - Date.now();
    if (diff > 0) {
      var d = Math.floor(diff / 864e5);
      var h = Math.floor(diff / 36e5) % 24;
      var m = Math.floor(diff / 6e4) % 60;
      var sec = Math.floor(diff / 1e3) % 60;
      label.textContent = "First pint in";
      main.textContent = (d ? d + "d " : "") + pad(h) + "h " + pad(m) + "m " + pad(sec) + "s";
      sub.textContent = "Saturday, The Constitution, 42 St Pancras Way";
    } else {
      label.textContent = "That's a wrap";
      main.textContent = "Thanks for coming";
      sub.textContent = "Drink some water. Text the group you're home.";
    }
  }
  tick();
  setInterval(tick, 1000);

  // ----- reveal on scroll -----
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  // ----- calendar -----
  document.getElementById("cal").addEventListener("click", function () {
    var ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//royal-college-st-crawl//EN", "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      "UID:royal-college-st-crawl-2026@nw1",
      "DTSTAMP:20261020T120000Z",
      "DTSTART:20261024T160000Z",
      "DTEND:20261025T020000Z",
      "SUMMARY:Valter's birthday pub crawl",
      "LOCATION:The Constitution\\, 42 St Pancras Way\\, London NW1 0QT",
      "DESCRIPTION:5:00 The Constitution (sunset 5:47) / 6:45 Golden Lion / 8:30 Colonel Fawcett / 11:00 pizza at ours / 12:00 Prince Albert until 1am. Bring physical ID. " + location.href,
      "BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY", "DESCRIPTION:Pub crawl in 2 hours. Bring ID.", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    var blob = new Blob([ics], { type: "text/calendar" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "valters-pub-crawl.ics";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  });


})();
