// Mantém a animação decorativa em conformidade com a preferência do sistema.
(() => {
  const video = document.querySelector('.background video');
  if (!video || !window.matchMedia) return;
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  function sync() {
    if (media.matches) {
      video.pause();
    } else {
      video.play().catch(() => { /* autoplay pode ser bloqueado pelo navegador */ });
    }
  }
  sync();
  media.addEventListener?.('change', sync);
})();
