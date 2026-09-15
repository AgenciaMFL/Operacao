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
    ".protection-card",
    ".protection__closing",
    ".how__aside",
    ".how-step",
    ".governance__grid > *",
    ".cost-band__art",
    ".cost-band__content",
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
