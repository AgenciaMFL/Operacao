// Seamless marquee: duplicate the badge set enough times to cover any
// screen width (a fixed single duplication left a visible gap on wide
// screens), then animate by exactly one set's width so the loop has no
// seam regardless of viewport size.
(function initMarquee() {
  const track = document.getElementById("marqueeTrack");
  if (!track) return;

  const setHTML = track.innerHTML;
  const PX_PER_SECOND = 40;

  function rebuild() {
    track.style.animation = "none";
    track.innerHTML = setHTML;
    const setWidth = track.scrollWidth + 14; // + gap between repeated sets
    const minTotalWidth = window.innerWidth * 3;
    const copies = Math.max(2, Math.ceil(minTotalWidth / setWidth) + 1);
    for (let i = 1; i < copies; i++) {
      track.innerHTML += setHTML;
    }
    track.style.setProperty("--marquee-distance", `-${setWidth}px`);
    track.style.setProperty("--marquee-duration", `${setWidth / PX_PER_SECOND}s`);
    track.style.animation = "";
  }

  rebuild();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(rebuild, 200);
  });
})();

// Fallback for assets that could not be downloaded automatically from
// Figma (see ASSETS.md). Shows the wrapping .img-placeholder's
// data-label instead of a broken image icon.
(function initImageFallbacks() {
  document.querySelectorAll("img[data-fallback]").forEach((img) => {
    img.addEventListener("error", () => {
      img.style.display = "none";
      const wrapper = img.closest(".img-placeholder");
      if (wrapper) wrapper.classList.add("is-empty");
    });
  });
})();

// "Como funciona" mobile carousel: the arrow buttons above .how__steps
// scroll by one card's width, and disable themselves at either end.
(function initHowCarousel() {
  const track = document.querySelector(".how__steps");
  const prevBtn = document.querySelector("[data-carousel-prev]");
  const nextBtn = document.querySelector("[data-carousel-next]");
  if (!track || !prevBtn || !nextBtn) return;

  function step() {
    const card = track.querySelector(".how-step");
    return card ? card.getBoundingClientRect().width + 16 /* gap */ : track.clientWidth;
  }

  function updateButtons() {
    const maxScroll = track.scrollWidth - track.clientWidth - 1;
    prevBtn.disabled = track.scrollLeft <= 0;
    nextBtn.disabled = track.scrollLeft >= maxScroll;
  }

  prevBtn.addEventListener("click", () => {
    track.scrollBy({ left: -step(), behavior: "smooth" });
  });
  nextBtn.addEventListener("click", () => {
    track.scrollBy({ left: step(), behavior: "smooth" });
  });

  track.addEventListener("scroll", updateButtons, { passive: true });
  window.addEventListener("resize", updateButtons);
  updateButtons();
})();

// Diagnóstico accordion: single item open at a time. Height is animated
// via CSS grid-template-rows (0fr -> 1fr), so this only needs to toggle
// the .is-open class and the button's aria-expanded state.
(function initAccordion() {
  const items = document.querySelectorAll(".accordion__item");
  if (!items.length) return;

  items.forEach((item) => {
    const trigger = item.querySelector(".accordion__trigger");
    if (!trigger) return;

    trigger.addEventListener("click", () => {
      const wasOpen = item.classList.contains("is-open");
      items.forEach((other) => {
        other.classList.remove("is-open");
        other.querySelector(".accordion__trigger").setAttribute("aria-expanded", "false");
      });
      if (!wasOpen) {
        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });
})();

// Scroll-reveal: fade + slide each section's content into place the
// first time it enters the viewport. Cards within the same group
// (protection cards, how-steps, governance cards) stagger one after
// another via --reveal-index. Skips the hero, which is visible on
// load and shouldn't start hidden.
(function initScrollReveal() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  const groups = [
    ".split > div",
    ".protection__intro",
    ".accordion__item",
    ".protection__closing",
    ".how__aside",
    ".how-step",
    ".governance__grid > *",
    ".trust-band__inner > *",
    ".why-sis > *",
    ".final-cta__content > *",
  ];

  groups.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add("reveal");
      el.style.setProperty("--reveal-index", i % 5);
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
})();

// Sticky bottom CTA bar: hidden while a section that already has its
// own CTA button is on screen (hero, "como funciona", final CTA), so
// the two buttons never compete for attention at the same time. The
// page only reserves bottom space (body padding) while the bar is
// actually shown — otherwise a section with no CTA marker right
// before the end of the page (e.g. the footer) would leave a dead
// blank gap where the bar never gets a chance to appear.
(function initStickyCtaVisibility() {
  const bar = document.getElementById("stickyCta");
  const markers = document.querySelectorAll(".cta-marker");
  if (!bar || !markers.length) return;

  const visibleMarkers = new Set();

  function syncBodyPadding() {
    document.body.style.paddingBottom = bar.classList.contains("is-hidden")
      ? "0px"
      : `${bar.offsetHeight}px`;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibleMarkers.add(entry.target);
        } else {
          visibleMarkers.delete(entry.target);
        }
      });
      bar.classList.toggle("is-hidden", visibleMarkers.size > 0);
      syncBodyPadding();
    },
    { threshold: 0, rootMargin: "0px 0px -10% 0px" }
  );

  // Watch each marker's whole enclosing section rather than just the
  // button itself — "como funciona" in particular scrolls the marker
  // button (in the aside) out of view long before the carousel of step
  // cards below it is done scrolling past, which re-armed the sticky
  // bar in the middle of that same section.
  const watched = new Set();
  markers.forEach((el) => {
    const target = el.closest("section, header") || el;
    if (!watched.has(target)) {
      watched.add(target);
      observer.observe(target);
    }
  });

  window.addEventListener("resize", syncBodyPadding);
})();

// Smooth wheel scroll: the browser's native `scroll-behavior: smooth`
// (base.css) only applies to programmatic jumps (anchor links). Plain
// mouse-wheel scrolling is still the default abrupt per-notch jump, so
// this intercepts wheel input and eases the page toward the target
// position every frame instead. Skipped for touch input (already
// smooth/inertial) and prefers-reduced-motion.
(function initSmoothWheelScroll() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;
  if (window.matchMedia("(pointer: coarse)").matches) return;

  const EASE = 0.2;
  let target = window.scrollY;
  let current = window.scrollY;
  let animating = false;

  function maxScroll() {
    return document.documentElement.scrollHeight - window.innerHeight;
  }

  // `behavior: "instant"` is required here: html has `scroll-behavior:
  // smooth` (base.css, for anchor-link jumps), and plain scrollTo(x, y)
  // uses the element's CSS scroll-behavior by default. Without this,
  // every frame's jump gets ALSO smoothed natively by the browser on
  // top of our own easing, compounding into a noticeable startup delay.
  function step() {
    current += (target - current) * EASE;
    if (Math.abs(target - current) < 0.5) {
      current = target;
      window.scrollTo({ top: current, left: 0, behavior: "instant" });
      animating = false;
      return;
    }
    window.scrollTo({ top: current, left: 0, behavior: "instant" });
    requestAnimationFrame(step);
  }

  window.addEventListener(
    "wheel",
    (e) => {
      if (e.ctrlKey) return; // let pinch-zoom / ctrl+wheel pass through
      e.preventDefault();
      const lineHeight = 16;
      const delta = e.deltaMode === 1 ? e.deltaY * lineHeight : e.deltaY;
      target = Math.max(0, Math.min(target + delta, maxScroll()));
      if (!animating) {
        animating = true;
        current = window.scrollY;
        requestAnimationFrame(step);
      }
    },
    { passive: false }
  );

  window.addEventListener("resize", () => {
    target = Math.min(target, maxScroll());
  });

  // Keep target in sync with scrolling that didn't originate from the
  // wheel handler above (anchor-link jumps, keyboard, scrollbar drag).
  window.addEventListener("scroll", () => {
    if (!animating) target = window.scrollY;
  });
})();
