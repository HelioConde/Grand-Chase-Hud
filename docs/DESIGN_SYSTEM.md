# Design System — Grand Chase HUD

## Essência preservada
Fan project inspirado em Grand Chase: portal visual com logo, vídeo de fundo, tons noturnos e detalhes dourados; seleção de heróis e missão 2D com modelos OBJ/MTL opcionais. Não substituir retratos, recursos do jogo nem gameplay por imagens genéricas.

## Tokens existentes
- `style.css`: `--gold: #f4cd7e`, `--muted: #b6c3d9`, `--outline: #ffffff35`.
- Fundo do portal `#070b17`, cards azul-marinho e ouro para ações primárias.
- Fontes do sistema para evitar dependência externa.
- Uso responsivo de `clamp`, `max-width`, `grid` e `flex`.

## Componentes
- Portal: cabeçalho, hero, ações primária/secundária, painel de recursos e rodapé.
- Seleção: cards de heróis com estados selecionado/desativado e viewer opcional.
- Missão: HUD de HP/MP, score, canvas 960×540, instruções, mensagens e pausa.
- Status: informar quando um modelo não está disponível; manter fallback 2D.

## Acessibilidade
- Ações por `button` ou `a`; `skip-link`; foco visível.
- Movimento reduzido: ocultar e pausar o vídeo decorativo do portal.
- Manter alvos de toque legíveis, mas a missão atual é concebida para teclado/desktop.
- Nunca depender somente de cor para identificar saúde, recursos ou estado.

## QA
A Action `visual-qa.yml` usa Playwright para capturar home, seleção e jogo em múltiplas resoluções, registrar erros e avaliar visualização de personagens. Os artefatos `visual-qa/` permitem inspecionar regressões.

## GitHub Pages
A Action `pages.yml` publica exclusivamente `index.html`, cenas, JS, CSS, vídeos e recursos públicos, sem servidor ou banco. A opção Settings → Pages → Source precisa estar como GitHub Actions.

## Pendências
Testes reais em navegador, equilíbrio de combate, controles móveis, refinamento de rig/animações 3D e autorização para redistribuição de material de terceiros.
