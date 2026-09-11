document.querySelectorAll('.framer-project-card').forEach(card => {
  const fade = card.querySelector('.project-hhi-desktop .f-Puwd_rgV4');
  if (fade && !fade.parentElement.classList.contains('project-mask-space')) {
    const maskSpace = document.createElement('div');
    maskSpace.className = 'project-mask-space';
    fade.before(maskSpace);
    maskSpace.append(fade);
  }
  new ResizeObserver(([entry]) => {
    const width = entry.contentRect.width;
    card.style.setProperty('--project-card-width', `${width}px`);
  }).observe(card);
  const videos = card.querySelectorAll('video');
  const start = () => videos.forEach(video => {
    if (video.closest('.project-breakpoint').getBoundingClientRect().width) {
      video.play().catch(() => {});
    }
  });
  const stop = () => videos.forEach(video => video.pause());
  card.addEventListener('pointerenter', start);
  card.addEventListener('pointerleave', stop);
  card.addEventListener('focus', start);
  card.addEventListener('blur', stop);
});
