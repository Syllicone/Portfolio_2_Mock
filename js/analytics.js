document.addEventListener('click', event => {
  const el = event.target.closest('[data-track]');

  if (el) {
    umami.track(el.dataset.track);
  }
});