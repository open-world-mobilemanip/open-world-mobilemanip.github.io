// Keep offscreen demos idle so they do not compete for bandwidth or decoding.
const videos = document.querySelectorAll('.demo-video');
const visibleVideos = new Set();
const userPaused = new WeakSet();
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function playVisibleVideo(video) {
  if (document.hidden || reducedMotion.matches ||
      (navigator.connection && navigator.connection.saveData) || userPaused.has(video)) {
    return;
  }

  // Autoplay can be denied by browser settings; the controls remain available.
  video.play().catch(() => {});
}

videos.forEach(video => {
  video.addEventListener('pause', () => {
    if (visibleVideos.has(video) && !document.hidden) {
      userPaused.add(video);
    }
  });
  video.addEventListener('play', () => userPaused.delete(video));
  video.addEventListener('error', () => {
    video.nextElementSibling.hidden = false;
  });
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({ target: video, isIntersecting, intersectionRatio }) => {
      if (isIntersecting && intersectionRatio >= 0.15) {
        visibleVideos.add(video);
        playVisibleVideo(video);
      } else {
        visibleVideos.delete(video);
        video.pause();
      }
    });
  }, { threshold: [0, 0.15] });

  videos.forEach(video => observer.observe(video));
}

document.addEventListener('visibilitychange', () => {
  visibleVideos.forEach(video => {
    if (document.hidden) {
      video.pause();
    } else {
      playVisibleVideo(video);
    }
  });
});
