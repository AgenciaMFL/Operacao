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
