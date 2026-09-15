// Seamless marquee: duplicate the badge set so the CSS animation
// (translateX(-50%)) loops without a visible seam.
(function initMarquee() {
  const track = document.getElementById("marqueeTrack");
  if (!track) return;
  track.innerHTML += track.innerHTML;
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
