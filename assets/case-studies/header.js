(() => {
  const header = document.querySelector('.portfolio-header');
  const toggle = header?.querySelector('.portfolio-header-menu-toggle');
  const panel = header?.querySelector('.portfolio-header-mobile-panel');
  if (!toggle || !panel) return;

  const mobile = matchMedia('(max-width: 767px)');
  const content = [...document.querySelectorAll('.case-breakpoint')];
  function setOpen(open, restoreFocus = false) {
    header.classList.toggle('is-menu-open', open);
    document.body.classList.toggle('is-project-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    panel.setAttribute('aria-hidden', String(!open));
    panel.inert = !open;
    content.forEach(el => { el.inert = open; });
    if (restoreFocus) toggle.focus();
  }

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });
  panel.addEventListener('click', event => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (toggle.getAttribute('aria-expanded') !== 'true') return;
    if (event.key === 'Escape') setOpen(false, true);
    if (event.key !== 'Tab') return;
    const focusable = [...header.querySelectorAll('a[href],button')].filter(el => el.getClientRects().length);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  mobile.addEventListener('change', () => { if (!mobile.matches) setOpen(false); });
  setOpen(false);
})();
