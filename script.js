document.documentElement.classList.add("js");
// The reference site keeps its authored motion active on all system settings.
const reducedMotion = false;
// Reveal text blocks separately so headings do not inherit a second blur/translation.
document.querySelectorAll('[data-reveal]').forEach((element) => {
  if (!element.querySelector(':scope > [data-split]')) return;
  element.removeAttribute('data-reveal');
  [...element.children].forEach((child) => {
    if (!child.hasAttribute('data-split')) child.setAttribute('data-reveal', '');
  });
});
const revealItems = document.querySelectorAll("[data-reveal], [data-split]");
const mapDepth = document.querySelector(".tile-map");

if (!reducedMotion) {
  document.querySelectorAll("[data-split]").forEach((element) => {
    const words = element.textContent.trim().split(/\s+/);
    element.textContent = "";
    words.forEach((word, index) => {
      const span = document.createElement("span");
      span.className = "word";
      span.textContent = word;
      span.style.transitionDelay = `${index * 55}ms`;
      element.appendChild(span);
      if (index < words.length - 1) {
        element.appendChild(document.createTextNode(" "));
      }
    });
  });
}

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
          entry.target.classList.add("is-visible");
        } else if (!entry.isIntersecting && entry.boundingClientRect.top > 0) {
          entry.target.classList.remove("is-visible");
        }
      });
    },
    { rootMargin: "0px 0px -40px 0px", threshold: [0, 0.15] }
  );

  revealItems.forEach((element, index) => {
    if (!element.hasAttribute("data-split")) {
      element.style.transitionDelay = `${(index % 3) * 90}ms`;
    }
    revealObserver.observe(element);
  });
}

const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
const header = document.querySelector(".site-header");
const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
const navSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const parallaxImgs = [...document.querySelectorAll("[data-parallax]")];

function onScroll() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(4));
  header?.classList.toggle("is-scrolled", window.scrollY > 16);
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

if (!reducedMotion && parallaxImgs.length) {
  let ticking = false;

  function updateParallax() {
    ticking = false;
    const vh = window.innerHeight;

    parallaxImgs.forEach((img) => {
      const frame = img.parentElement;
      const rect = frame.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;

      const center = rect.top + rect.height / 2 - vh / 2;
      const offset = Math.max(-26, Math.min(26, -center * 0.06));
      img.style.transform = `scale(1.12) translateY(${offset.toFixed(1)}px)`;
    });

    if (mapDepth) {
      const rect = mapDepth.parentElement.getBoundingClientRect();
      if (rect.bottom >= 0 && rect.top <= vh) {
        const center = rect.top + rect.height / 2 - vh / 2;
        const offset = Math.max(-14, Math.min(14, -center * 0.04));
        mapDepth.style.transform = `scale(1.06) translateY(${offset.toFixed(1)}px)`;
      }
    }
  }

  function requestParallax() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateParallax);
    }
  }

  window.addEventListener("scroll", requestParallax, { passive: true });
  window.addEventListener("resize", requestParallax, { passive: true });
  updateParallax();
}

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-38% 0px -54% 0px", threshold: 0 }
);

navSections.forEach((section) => sectionObserver.observe(section));

toggle?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  toggle.classList.toggle("is-open", isOpen);
  toggle.setAttribute("aria-expanded", String(isOpen));
});

nav?.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    nav.classList.remove("is-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }
});

const carousel = document.querySelector(".reviews-carousel");
const reviewTrack = carousel?.querySelector(".reviews-grid");
const previousReview = carousel?.querySelector(".carousel-btn.prev");
const nextReview = carousel?.querySelector(".carousel-btn.next");

function updateReviewButtons() {
  if (!reviewTrack || !previousReview || !nextReview) return;
  const maxScroll = reviewTrack.scrollWidth - reviewTrack.clientWidth - 4;
  previousReview.disabled = reviewTrack.scrollLeft <= 4;
  nextReview.disabled = reviewTrack.scrollLeft >= maxScroll;
}

function moveReviews(direction) {
  if (!reviewTrack) return;
  const firstCard = reviewTrack.querySelector(".review-card");
  const gap = 18;
  const step = firstCard ? firstCard.getBoundingClientRect().width + gap : reviewTrack.clientWidth * 0.9;
  reviewTrack.scrollBy({ left: direction * step, behavior: "smooth" });
}

previousReview?.addEventListener("click", () => moveReviews(-1));
nextReview?.addEventListener("click", () => moveReviews(1));
reviewTrack?.addEventListener("scroll", updateReviewButtons, { passive: true });
window.addEventListener("resize", updateReviewButtons);
updateReviewButtons();

const form = document.querySelector(".booking-form");
const note = document.querySelector(".form-note");
const dateInput = form?.querySelector('input[name="date"]');
const storageKey = "vetlar-agendamento";

if (dateInput) {
  dateInput.min = new Date().toISOString().slice(0, 10);
}

const savedData = JSON.parse(localStorage.getItem(storageKey) || "{}");
Object.entries(savedData).forEach(([name, value]) => {
  const field = form?.elements.namedItem(name);
  if (field && typeof value === "string") {
    field.value = value;
  }
});

form?.addEventListener("input", () => {
  const data = Object.fromEntries(new FormData(form).entries());
  localStorage.setItem(storageKey, JSON.stringify(data));
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const lines = [
    "Olá, Vetlar! Gostaria de solicitar um agendamento.",
    "",
    `Tutor: ${data.tutor}`,
    `WhatsApp: ${data.phone}`,
    `Pet: ${data.pet}`,
    `Atendimento: ${data.service}`,
    `Data desejada: ${formatDate(data.date)}`,
    `Turno: ${data.period}`,
    data.notes ? `Observações: ${data.notes}` : "",
  ].filter(Boolean);

  const url = `https://wa.me/5588992189207?text=${encodeURIComponent(lines.join("\n"))}`;
  note.textContent = "Abrindo WhatsApp com a mensagem pronta para envio.";
  localStorage.removeItem(storageKey);
  window.open(url, "_blank", "noopener,noreferrer");
});

function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}
