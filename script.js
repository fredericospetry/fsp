(function () {
  "use strict";

  const canvas = document.getElementById("iso-canvas");
  const ctx = canvas.getContext("2d");
  let t = 0;
  const TILE = 44, ROWS = 20, COLS = 32;

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }

  function getH(r, c, time) {
    return Math.max(0,
      Math.sin((r * 0.4 + c * 0.5 + time) * 0.8) * 20 +
      Math.sin((r * 0.3 - c * 0.4 + time * 0.7)) * 12 + 8
    );
  }

  function toIso(r, c, h) {
    return {
      x: canvas.width * 0.5 + (c - r) * (TILE * 0.5),
      y: canvas.height * 0.22 + (c + r) * (TILE * 0.25) - h,
    };
  }

  function colorTop(h)   { const v = Math.min(255, 120 + h * 3); return `rgb(${v*.3|0},${v*.6|0},${v|0})`; }
  function colorLeft(h)  { const v = Math.min(255,  80 + h * 2); return `rgb(${v*.2|0},${v*.4|0},${v*.7|0})`; }
  function colorRight(h) { const v = Math.min(255,  60 + h * 2); return `rgb(${v*.15|0},${v*.3|0},${v*.6|0})`; }

  function drawFrame() {
    t += 0.018;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#060a14";
    ctx.fillRect(0, 0, W, H);

    const tw = TILE * 0.5, th = TILE * 0.25, fh = TILE * 0.15;

    for (let r = ROWS - 1; r >= 0; r--) {
      for (let c = 0; c < COLS; c++) {
        const h = getH(r, c, t);
        const p = toIso(r, c, h);

        // Top
        ctx.beginPath();
        ctx.moveTo(p.x, p.y); ctx.lineTo(p.x+tw, p.y+th);
        ctx.lineTo(p.x, p.y+th*2); ctx.lineTo(p.x-tw, p.y+th);
        ctx.closePath();
        ctx.fillStyle = colorTop(h); ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 0.5; ctx.stroke();

        // Left
        ctx.beginPath();
        ctx.moveTo(p.x-tw, p.y+th); ctx.lineTo(p.x, p.y+th*2);
        ctx.lineTo(p.x, p.y+th*2+fh); ctx.lineTo(p.x-tw, p.y+th+fh);
        ctx.closePath();
        ctx.fillStyle = colorLeft(h); ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.stroke();

        // Right
        ctx.beginPath();
        ctx.moveTo(p.x+tw, p.y+th); ctx.lineTo(p.x, p.y+th*2);
        ctx.lineTo(p.x, p.y+th*2+fh); ctx.lineTo(p.x+tw, p.y+th+fh);
        ctx.closePath();
        ctx.fillStyle = colorRight(h); ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.stroke();
      }
    }
    requestAnimationFrame(drawFrame);
  }

  // Navbar scroll
  const navbar = document.getElementById("navbar");
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  function onScroll() {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
    let current = "";
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 100) current = s.id; });
    navLinks.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + current));
  }

  // Mobile menu
  const toggle = document.getElementById("nav-toggle");
  const navList = document.getElementById("nav-links");
  toggle.addEventListener("click", () => navList.classList.toggle("open"));
  navList.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navList.classList.remove("open")));

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const t = document.querySelector(a.getAttribute("href"));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: "smooth" }); }
    });
  });

  // Scroll reveal
  function initReveal() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = "1";
          e.target.style.transform = "translateY(0)";
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });

    document.querySelectorAll(".project-card, .service-card, .contact-card, .stat-card, .about-text p")
      .forEach((el, i) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(24px)";
        el.style.transition = `opacity 0.5s ease ${i * 0.05}s, transform 0.5s ease ${i * 0.05}s`;
        obs.observe(el);
      });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", resize);

  document.addEventListener("DOMContentLoaded", () => {
    resize();
    drawFrame();
    initReveal();
    onScroll();
  });
})();
