/* NetLens site — dark mode system, copy-to-clipboard, nav, scroll-spy */
(function () {
  "use strict";

  /* ---------------------------------------------------------------
     Dark mode system
     - Default: follow the OS preference (prefers-color-scheme)
     - Manual toggle overrides and is remembered (localStorage)
     --------------------------------------------------------------- */
  var STORAGE_KEY = "netlens-theme";

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  function systemTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    applyTheme(saved || systemTheme());
  }

  function setupThemeToggle() {
    var btn = document.querySelector(".theme-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme");
      var next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* ignore */ }
    });
  }

  /* Keep following the OS when the user hasn't chosen manually */
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
      var saved = null;
      try { saved = localStorage.getItem(STORAGE_KEY); } catch (err) { /* ignore */ }
      if (!saved) applyTheme(e.matches ? "dark" : "light");
    });
  }

  /* ---------------------------------------------------------------
     Copy-to-clipboard on every code block
     --------------------------------------------------------------- */
  function addCopyButtons() {
    document.querySelectorAll(".code-block pre").forEach(function (pre) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-btn";
      btn.innerHTML =
        '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25v-7.5Z"/><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25v-7.5Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25h-7.5Z"/></svg><span>Copy</span>';
      btn.addEventListener("click", function () {
        copyText(pre.innerText, btn);
      });
      pre.parentNode.appendChild(btn);
    });
  }

  /* Hero terminal copy button (separate styling, always visible) */
  function setupTerminalCopy() {
    var btn = document.querySelector(".terminal-copy");
    var pre = document.querySelector(".terminal-body pre");
    if (!btn || !pre) return;
    btn.addEventListener("click", function () {
      copyText(pre.innerText, btn);
    });
  }

  function copyText(text, btn) {
    var done = function () {
      btn.classList.add("copied");
      var span = btn.querySelector("span");
      if (span) span.textContent = "Copied!";
      setTimeout(function () {
        btn.classList.remove("copied");
        if (span) span.textContent = btn.classList.contains("terminal-copy") ? "Copy" : "Copy";
      }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  /* ---------------------------------------------------------------
     Mobile hamburger nav
     --------------------------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && links.classList.contains("open")) {
        links.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------------------------------------------------------------
     Docs page: scroll-spy for the table of contents
     --------------------------------------------------------------- */
  var tocLinks = document.querySelectorAll(".docs-toc a[href^='#']");
  if (tocLinks.length) {
    var headings = [];
    tocLinks.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var el = document.getElementById(id);
      if (el) headings.push({ link: a, el: el });
    });

    function onScroll() {
      var pos = window.scrollY + 140;
      var current = null;
      headings.forEach(function (h) {
        if (h.el.offsetTop <= pos) current = h;
      });
      headings.forEach(function (h) {
        h.link.classList.toggle("active", h === current);
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  initTheme();
  setupThemeToggle();
  addCopyButtons();
  setupTerminalCopy();
})();
