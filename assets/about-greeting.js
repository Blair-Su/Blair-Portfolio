(() => {
  const button = document.querySelector('.intro-wave-button');
  if (!button) return;
  const icon = button.querySelector('.intro-wave-icon');
  const status = document.querySelector('.intro-wave-status');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const tooltip = document.createElement('span');
  tooltip.className = 'intro-wave-tooltip';
  tooltip.id = 'intro-wave-tooltip';
  tooltip.setAttribute('role', 'tooltip');
  tooltip.textContent = button.getAttribute('title') || 'Say hi!';
  button.removeAttribute('title');
  button.setAttribute('aria-describedby', tooltip.id);
  button.append(tooltip);
  const clap = document.createElement('span');
  clap.className = 'intro-clap';
  clap.setAttribute('aria-hidden', 'true');
  const clapIcon = document.createElement('span');
  clapIcon.className = 'intro-clap-hand';
  clapIcon.textContent = '\u{1f44f}';
  clap.append(clapIcon);
  button.append(clap);
  let waveAnimation;
  let clapAnimation;
  let impactTimer;
  let releaseTimer;
  let pressedAt = 0;
  let pressed = false;
  let pointerId = null;
  let heldKey = null;
  let ignoreClickUntil = 0;
  let idleTimer;
  let inView = false;

  function scheduleWave() {
    clearTimeout(idleTimer);
    if (!inView || document.hidden || reducedMotion.matches) return;
    idleTimer = setTimeout(() => {
      if (!button.matches(':hover, :focus-visible')) wave();
      scheduleWave();
    }, 6000);
  }

  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    scheduleWave();
  }, { threshold: .5 }).observe(button);

  function reset() {
    clearTimeout(impactTimer);
    clearTimeout(releaseTimer);
    waveAnimation?.cancel();
    clapAnimation?.cancel();
    pressed = false;
    button.classList.remove('is-clapping');
  }

  function celebrate() {
    status.textContent = 'Thanks for stopping by!';
    if (reducedMotion.matches || typeof window.confetti !== 'function') return;
    const rect = button.getBoundingClientRect();
    window.confetti({
      particleCount: innerWidth < 768 ? 90 : 130,
      spread: 85,
      startVelocity: 32,
      gravity: .85,
      ticks: 180,
      scalar: .95,
      origin: { x: (rect.left + rect.width / 2) / innerWidth, y: (rect.top + rect.height / 2) / innerHeight },
      colors: ['#62c9f8', '#ffcd42', '#ff7d9c', '#66c5a4', '#b19af3'],
      disableForReducedMotion: true,
      zIndex: 10000
    });
  }

  function press() {
    reset();
    pressed = true;
    pressedAt = performance.now();
    button.classList.add('is-clapping');
    if (reducedMotion.matches) {
      celebrate();
      return;
    }
    clapAnimation = clapIcon.animate([
      { transform: 'scale(1) rotate(0deg)', offset: 0 },
      { transform: 'scale(1.12) rotate(-8deg)', offset: .35 },
      { transform: 'scale(.95) rotate(3deg)', offset: .72 },
      { transform: 'scale(1) rotate(0deg)', offset: 1 }
    ], { duration: 240, easing: 'ease-out', fill: 'forwards' });
    impactTimer = setTimeout(celebrate, 175);
  }

  function release() {
    if (!pressed) return;
    pressed = false;
    ignoreClickUntil = performance.now() + 400;
    // Let quick taps reach contact before restoring the single hand.
    const delay = reducedMotion.matches ? 0 : Math.max(0, 260 - (performance.now() - pressedAt));
    releaseTimer = setTimeout(reset, delay);
  }

  function wave() {
    if (reducedMotion.matches || button.classList.contains('is-clapping')) return;
    waveAnimation?.cancel();
    waveAnimation = icon.animate([
      { transform: 'rotate(0deg)', offset: 0 },
      { transform: 'rotate(24deg)', offset: .42 },
      { transform: 'rotate(-4deg)', offset: .76 },
      { transform: 'rotate(0deg)', offset: 1 }
    ], { duration: 900, easing: 'ease-in-out' });
  }

  button.addEventListener('pointerenter', event => {
    button.classList.remove('is-tooltip-dismissed');
    if (event.pointerType === 'touch') return;
    wave();
    scheduleWave();
  });
  button.addEventListener('focus', () => button.classList.remove('is-tooltip-dismissed'));
  button.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || heldKey !== null || pointerId !== null) return;
    pointerId = event.pointerId;
    button.setPointerCapture(pointerId);
    press();
  });
  button.addEventListener('pointerup', event => {
    if (event.pointerId !== pointerId) return;
    pointerId = null;
    release();
  });
  function cancel() {
    pointerId = null;
    heldKey = null;
    ignoreClickUntil = performance.now() + 400;
    reset();
  }
  button.addEventListener('pointercancel', cancel);
  button.addEventListener('lostpointercapture', () => {
    if (pointerId !== null) cancel();
  });
  button.addEventListener('keydown', event => {
    if (event.key === 'Escape') button.classList.add('is-tooltip-dismissed');
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (event.repeat || heldKey !== null || pointerId !== null) return;
    heldKey = event.key;
    press();
  });
  button.addEventListener('keyup', event => {
    if (event.key !== heldKey) return;
    event.preventDefault();
    heldKey = null;
    release();
  });
  button.addEventListener('click', event => {
    // Pointer and keyboard events already handled the gesture; support AT activation too.
    if (event.detail !== 0 || performance.now() < ignoreClickUntil || pressed) return;
    press();
    release();
  });
  button.addEventListener('blur', cancel);
  window.addEventListener('blur', cancel);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancel();
    scheduleWave();
  });
  reducedMotion.addEventListener('change', event => {
    scheduleWave();
    if (!event.matches) return;
    cancel();
    window.confetti?.reset();
  });
})();
