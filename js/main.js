document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Language switching ---------- */
function applyLanguage(lang) {
  const dict = translations[lang];
  if (!dict) return;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });

  document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.langBtn === lang);
  });

  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute("data-lang", lang);
  localStorage.setItem("portfolio-lang", lang);
}

document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
  btn.addEventListener("click", () => applyLanguage(btn.dataset.langBtn));
});

const savedLang = localStorage.getItem("portfolio-lang");
const browserLang = navigator.language && navigator.language.startsWith("en") ? "en" : "es";
applyLanguage(savedLang || browserLang);

/* ---------- Mobile menu ---------- */
const menuToggle = document.getElementById("menuToggle");
const mobileNav = document.getElementById("mobileNav");

if (menuToggle && mobileNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---------- Active nav link on scroll ---------- */
const sections = document.querySelectorAll("main .section[id]");
const navLinks = document.querySelectorAll(".pill-link");

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      }
    });
  },
  { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
);

sections.forEach((section) => navObserver.observe(section));

/* ---------- Reveal on scroll ---------- */
const revealTargets = document.querySelectorAll(
  ".section, .project-card, .fact-card, .stack-item, .service-row, .timeline-item, .work-row, .detail-shot"
);

const staggerGroups = document.querySelectorAll(
  ".stack-grid, .services-list, .timeline, .about-facts, .projects-grid, .work-list, .detail-shots"
);

staggerGroups.forEach((group) => {
  [...group.children].forEach((child, i) => {
    child.style.setProperty("--stagger-delay", `${Math.min(i, 8) * 70}ms`);
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealTargets.forEach((el) => revealObserver.observe(el));

/* ---------- Stat count-up ---------- */
function animateCount(el) {
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix !== undefined ? el.dataset.suffix : "+";
  const duration = 1200;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);

document.querySelectorAll(".stat-num[data-count]").forEach((el) => statObserver.observe(el));

/* ---------- Interactive scroll progress bar ---------- */
const scrollbarTrack = document.getElementById("scrollbarTrack");
const scrollbarFill = document.getElementById("scrollbarFill");
const scrollbarHandle = document.getElementById("scrollbarHandle");
const scrollbarPct = document.getElementById("scrollbarPct");

let isDragging = false;

function scrollableHeight() {
  return document.documentElement.scrollHeight - window.innerHeight;
}

function setProgressUI(ratio) {
  const pct = Math.round(ratio * 100);
  scrollbarFill.style.width = pct + "%";
  scrollbarHandle.style.left = pct + "%";
  scrollbarPct.textContent = pct + "%";
}

function updateFromScroll() {
  if (isDragging) return;
  const max = scrollableHeight();
  const ratio = max > 0 ? window.scrollY / max : 0;
  setProgressUI(ratio);
}

function ratioFromClientX(clientX) {
  const rect = scrollbarTrack.getBoundingClientRect();
  return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
}

function scrollToRatio(ratio) {
  window.scrollTo(0, ratio * scrollableHeight());
}

function startDrag(clientX) {
  isDragging = true;
  document.documentElement.style.scrollBehavior = "auto";
  scrollbarHandle.classList.add("dragging");
  const ratio = ratioFromClientX(clientX);
  setProgressUI(ratio);
  scrollToRatio(ratio);
}

function moveDrag(clientX) {
  if (!isDragging) return;
  const ratio = ratioFromClientX(clientX);
  setProgressUI(ratio);
  scrollToRatio(ratio);
}

function endDrag() {
  if (!isDragging) return;
  isDragging = false;
  document.documentElement.style.scrollBehavior = "";
  scrollbarHandle.classList.remove("dragging");
}

scrollbarTrack.addEventListener("pointerdown", (e) => {
  startDrag(e.clientX);
});

window.addEventListener("pointermove", (e) => {
  moveDrag(e.clientX);
});

window.addEventListener("pointerup", endDrag);
window.addEventListener("pointercancel", endDrag);

window.addEventListener("scroll", updateFromScroll, { passive: true });
window.addEventListener("resize", updateFromScroll);

updateFromScroll();

/* ---------- Project gallery auto-carousel ---------- */
document.querySelectorAll(".gallery-preview").forEach((gallery) => {
  const slides = gallery.querySelectorAll(".gallery-slide");
  const dots = gallery.querySelectorAll(".gallery-dot");
  if (slides.length < 2) return;

  let index = 0;

  setInterval(() => {
    slides[index].classList.remove("is-active");
    dots[index].classList.remove("is-active");
    index = (index + 1) % slides.length;
    slides[index].classList.add("is-active");
    dots[index].classList.add("is-active");
  }, 2800);
});
