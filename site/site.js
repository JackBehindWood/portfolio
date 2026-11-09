/* Progressive enhancement only: the site reads fully with JavaScript off. No network requests. */
(function () {
  var root = document.documentElement;
  root.classList.add("js");

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  var saved = store("theme");
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);

  var tb = document.querySelector(".theme");
  if (tb) tb.addEventListener("click", function () {
    var dark = root.getAttribute("data-theme") === "dark" ||
      (!root.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
    var next = dark ? "light" : "dark";
    root.setAttribute("data-theme", next);
    store("theme", next);
  });

  var cb = document.querySelector(".copy");
  if (cb && navigator.clipboard) cb.addEventListener("click", function () {
    navigator.clipboard.writeText(cb.getAttribute("data-copy")).then(function () {
      var old = cb.textContent; cb.textContent = "Copied"; setTimeout(function () { cb.textContent = old; }, 1600);
    });
  });
  else if (cb) cb.hidden = true;

  var els = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" });
  els.forEach(function (e) { io.observe(e); });
})();

/* extras: card spotlight, scroll progress, skill filter, open course details from a link */
(function () {
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".card").forEach(function (c) {
    c.addEventListener("pointermove", function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty("--mx", (e.clientX - r.left) + "px");
      c.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });
  var bar = document.querySelector(".progress");
  if (bar && !reduce) {
    var tick = false;
    addEventListener("scroll", function () {
      if (tick) return; tick = true;
      requestAnimationFrame(function () {
        var h = document.documentElement;
        bar.style.transform = "scaleX(" + (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)) + ")";
        tick = false;
      });
    }, { passive: true });
  }
  var q = document.querySelector(".search");
  if (q) {
    q.hidden = false;
    q.addEventListener("input", function () {
      var v = q.value.trim().toLowerCase();
      document.querySelectorAll(".filterable li").forEach(function (li) {
        li.classList.toggle("hide", v && li.textContent.toLowerCase().indexOf(v) < 0);
      });
      if (v) document.querySelectorAll(".area details").forEach(function (d) { d.open = true; });
    });
  }
  function openTarget() {
    var t = location.hash && document.querySelector(location.hash);
    for (var d = t && t.parentElement; d; d = d.parentElement) if (d.tagName === "DETAILS") d.open = true;
    if (t) t.scrollIntoView();
  }
  addEventListener("hashchange", openTarget);
  if (location.hash) openTarget();
})();

/* splash skip and page-leave fade for browsers without cross-document view transitions */
(function () {
  var s = document.querySelector(".splash");
  if (s) addEventListener("click", function () { s.classList.add("skip"); });
  var vt = window.CSS && CSS.supports && CSS.supports("view-transition-name", "x") && "onpagereveal" in window;
  if (vt || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target || a.origin !== location.origin) return;
    if (a.pathname === location.pathname || /\.pdf$/.test(a.pathname)) return;
    e.preventDefault();
    document.documentElement.classList.add("leaving");
    setTimeout(function () { location.href = a.href; }, 180);
  });
  addEventListener("pageshow", function (e) { if (e.persisted) document.documentElement.classList.remove("leaving"); });
})();
