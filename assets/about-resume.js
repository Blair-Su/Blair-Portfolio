(() => {
  const rows = document.querySelectorAll('.experience-section .resume-row, .education-section .resume-row');
  rows.forEach((row, index) => {
    const description = row.querySelector('.experience-description, .education-description');
    const heading = row.querySelector('h3');
    if (!description || !heading) return;

    const name = heading.textContent.replace(/\s+/g, ' ').trim();
    description.classList.add('resume-description');
    const panel = document.createElement('div');
    panel.id = `resume-description-${index + 1}`;
    panel.className = 'resume-description-panel';
    const inner = document.createElement('div');
    inner.className = 'resume-description-inner';
    description.replaceWith(panel);
    inner.append(description);
    panel.append(inner);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'resume-description-toggle';
    button.setAttribute('aria-controls', panel.id);
    // Inline the existing Lucide Plus so its vertical stroke can animate independently.
    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>';

    const setExpanded = expanded => {
      button.setAttribute('aria-expanded', String(expanded));
      button.setAttribute('aria-label', `${expanded ? 'Hide' : 'Show'} description for ${name}`);
      button.title = expanded ? 'Hide description' : 'Show description';
      panel.classList.toggle('is-expanded', expanded);
      panel.setAttribute('aria-hidden', String(!expanded));
      panel.inert = !expanded;
    };
    button.addEventListener('click', () => setExpanded(button.getAttribute('aria-expanded') !== 'true'));
    setExpanded(false);
    row.classList.add('is-collapsible');
    row.insertBefore(button, panel);
  });
})();
