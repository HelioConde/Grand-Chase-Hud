// Preserva a preferência de movimento reduzido e a escolha explícita do usuário.
// A mídia é puramente decorativa e nunca exige áudio ou backend.
(() => {
  const video = document.querySelector('.background video');
  const toggle = document.getElementById('motion-toggle');
  if (!video || !toggle) return;

  const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let userPaused = false;

  function sync() {
    const reduced = preference?.matches ?? false;
    const paused = reduced || userPaused;
    toggle.disabled = reduced;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = reduced ? '■ Movimento reduzido ativado' :
      userPaused ? '▶ Retomar animação' : 'Ⅱ Pausar animação';

    if (paused) {
      video.pause();
    } else {
      video.play().catch(() => {
        // Alguns navegadores bloqueiam autoplay; imagem estática permanece visível.
      });
    }
  }

  toggle.addEventListener('click', () => {
    userPaused = !userPaused;
    sync();
  });
  preference?.addEventListener?.('change', sync);
  sync();
})();
