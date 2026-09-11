async function initializeDivingGallery() {
  const gallery = document.querySelector('.diving-gallery');
  if (!gallery || gallery.dataset.loopInitialized) return;
  gallery.dataset.loopInitialized = 'true';

  const originals = [...gallery.querySelectorAll('.diving-image')];
  if (!originals.length) return;
  originals.forEach(image => { image.loading = 'eager'; });
  await Promise.all(originals.map(image => image.decode().catch(() => {})));

  const shell = document.createElement('div');
  shell.className = 'diving-gallery-shell';
  gallery.before(shell);
  shell.append(gallery);

  const copies = originals.map(image => {
    const copy = image.cloneNode(true);
    copy.alt = '';
    copy.setAttribute('aria-hidden', 'true');
    copy.dataset.loopCopy = 'true';
    return copy;
  });
  gallery.append(...copies);
  gallery.classList.add('is-looping');

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'diving-gallery-toggle';
  const toggleIcon = document.createElement('span');
  toggleIcon.className = 'diving-gallery-toggle-icon';
  toggleIcon.setAttribute('aria-hidden', 'true');
  toggle.append(toggleIcon);
  shell.append(toggle);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reducedMotion.matches;
  let visible = false;
  let touching = false;
  let focused = false;
  let frame = 0;
  let resumeTimer = 0;
  let lastTime = 0;
  let position = gallery.scrollLeft;
  let lastApplied = position;
  let cycleWidth = 0;
  const speed = 60;

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
  }

  function canMove() {
    return visible && !paused && !touching && !focused && !document.hidden && cycleWidth > 0;
  }

  function tick(time) {
    frame = 0;
    if (!canMove()) return;
    if (Math.abs(gallery.scrollLeft - lastApplied) > 1) position = gallery.scrollLeft;
    // Keep fractional movement so low speeds remain smooth on integer scroll positions.
    if (lastTime) position += speed * Math.min(time - lastTime, 50) / 1000;
    position %= cycleWidth;
    gallery.scrollLeft = position;
    lastApplied = gallery.scrollLeft;
    lastTime = time;
    frame = requestAnimationFrame(tick);
  }

  function sync() {
    toggleIcon.dataset.icon = paused ? 'play' : 'pause';
    toggle.title = paused ? 'Play' : 'Pause';
    toggle.setAttribute('aria-label', paused ? 'Play photo scrolling' : 'Pause photo scrolling');
    if (!canMove()) return stop();
    if (!frame) {
      position = gallery.scrollLeft % cycleWidth;
      lastApplied = gallery.scrollLeft;
      frame = requestAnimationFrame(tick);
    }
  }

  function measure() {
    cycleWidth = copies[0].getBoundingClientRect().left - originals[0].getBoundingClientRect().left;
    sync();
  }

  function hold() {
    clearTimeout(resumeTimer);
    touching = true;
    sync();
  }

  function release() {
    if (!touching) return;
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      touching = false;
      sync();
    }, 1600);
  }

  toggle.addEventListener('click', () => { paused = !paused; sync(); });
  gallery.addEventListener('focus', () => {
    focused = gallery.matches(':focus-visible');
    sync();
  });
  gallery.addEventListener('blur', () => { focused = false; sync(); });
  gallery.addEventListener('keydown', () => { focused = true; sync(); });
  gallery.addEventListener('pointerdown', () => { focused = false; hold(); }, { passive: true });
  window.addEventListener('pointerup', release, { passive: true });
  window.addEventListener('pointercancel', release, { passive: true });
  gallery.addEventListener('wheel', () => { hold(); release(); }, { passive: true });
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', event => {
    if (event.matches) paused = true;
    sync();
  });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync();
  }).observe(gallery);
  new ResizeObserver(measure).observe(gallery);
  measure();
}

initializeDivingGallery();
