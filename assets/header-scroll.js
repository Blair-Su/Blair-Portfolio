(() => {
  const updateBlur = () => {
    document.body.classList.toggle('has-header-scroll', window.scrollY > 0);
  };
  updateBlur();
  window.addEventListener('scroll', updateBlur, { passive: true });
  window.addEventListener('pageshow', updateBlur);
})();
