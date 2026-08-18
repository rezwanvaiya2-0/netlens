/* NetLens site — mobile nav toggle + docs scroll-spy */
(function () {
  "use strict";

  /* Mobile hamburger nav */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
    });
    /* Close the menu when a link is tapped (mobile) */
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && links.classList.contains("open")) {
        links.classList.remove("open");
        toggle.classList.remove("open");
      }
    });
  }

  /* Docs page: scroll-spy for the table of contents */
  var tocLinks = document.querySelectorAll(".docs-toc a[href^='#']");
  if (tocLinks.length) {
    var headings = [];
    tocLinks.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var el = document.getElementById(id);
      if (el) headings.push({ link: a, el: el });
    });

    function onScroll() {
      var pos = window.scrollY + 120;
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
})();
