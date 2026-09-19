(() => {
  const heroes = {
    'project-1-lighthouse': 'footer-lighthouse-preview.jpg',
    'project-2-southerncrafted': 'footer-southern-preview.jpg',
    'project-3-hhi': 'footer-hhi-preview.jpg',
    'project-4-nalu': 'footer-nalu-preview.jpg'
  };
  const links = [...document.querySelectorAll('.portfolio-footer-column a')]
    .filter(link => heroes[new URL(link.href).pathname.split('/').filter(Boolean).pop()]);
  if (!links.length) return;

  const hover = matchMedia('(min-width: 768px) and (any-hover: hover) and (any-pointer: fine)');
  const desktop = matchMedia('(min-width: 768px)');
  const preview = document.createElement('div');
  preview.className = 'footer-project-preview';
  preview.setAttribute('aria-hidden', 'true');
  document.body.append(preview);
  const images = new Map();
  let activeLink = null;
  let request = 0;

  function getImage(link) {
    if (!images.has(link)) {
      const key = new URL(link.href).pathname.split('/').filter(Boolean).pop();
      const image = new Image();
      image.alt = '';
      image.decoding = 'async';
      image.src = new URL(`./assets/${heroes[key]}`, document.baseURI).href;
      images.set(link, image);
    }
    return images.get(link);
  }

  function position(link) {
    const row = link.getBoundingClientRect();
    const width = Math.min(320, innerWidth - 32);
    const height = width * 9 / 16;
    const left = row.right - 36;
    const top = row.top - height - 4;
    preview.style.width = `${width}px`;
    preview.style.left = `${Math.max(16, Math.min(left, innerWidth - width - 16))}px`;
    preview.style.top = `${Math.max(16, Math.min(top, innerHeight - height - 16))}px`;
  }

  function hide() {
    request += 1;
    activeLink = null;
    preview.classList.remove('is-visible');
  }

  async function show(link) {
    if (!desktop.matches) return;
    const id = ++request;
    activeLink = link;
    const image = getImage(link);
    try {
      await image.decode();
      if (id !== request) return;
      preview.replaceChildren(image);
      position(link);
      preview.classList.add('is-visible');
    } catch {
      if (id === request) hide();
    }
  }

  links.forEach(link => {
    link.addEventListener('pointerenter', event => {
      if (hover.matches && event.pointerType !== 'touch') show(link);
    });
    link.addEventListener('pointerleave', hide);
    link.addEventListener('focus', () => {
      if (link.matches(':focus-visible')) show(link);
    });
    link.addEventListener('blur', hide);
    link.addEventListener('click', hide);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') hide();
  });
  window.addEventListener('scroll', () => {
    if (activeLink) position(activeLink);
  }, { passive: true });
  window.addEventListener('resize', hide, { passive: true });
  window.addEventListener('pagehide', hide);
  hover.addEventListener('change', hide);

  const preload = new IntersectionObserver(entries => {
    if (!desktop.matches || !entries.some(entry => entry.isIntersecting)) return;
    links.forEach(getImage);
    preload.disconnect();
  }, { rootMargin: '240px' });
  preload.observe(links[0].closest('.portfolio-footer-column'));
})();
