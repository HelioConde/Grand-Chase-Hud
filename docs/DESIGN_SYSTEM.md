# Grand Chase HUD — Design System 2026

## Objetivo e identidade
Preservar a nostalgia Grand Chase com visual de RPG, retratos originais, modelos OBJ/MTL e três experiências: portal, seleção 3D e missão jogável.

## Taste Skill
Espaçamentos uniformes 4/8/12/16/24/32px; painéis de jogo com profundidade e fundos escuros; tipografia hierárquica; botões acessíveis com foco evidente.

## Web Design Guidelines
- Links e botões semânticos, skip links, estados aria-pressed para o personagem selecionado.
- Controles 3D operáveis pelo teclado; mensagens de estado quando WebGL ou OBJ falhar.
- Layout sem rolagem horizontal, imagens com alt adequado, suporte a movimento reduzido em efeitos.
- Não esconder botões importantes em alturas pequenas nem exigir toque preciso.

## Awesome Design e Image to Code
Use screenshots reais do portal, da seleção e da missão em 390, 1366 e 1600px. Melhore alinhamento, proporções e contraste, **sem trocar sprites e modelos históricos por artes genéricas**.

## GitHub Pages
Site estático HTML/CSS/JS + ativos Three.js locais, sem banco de dados. Usar sempre caminhos relativos no carregamento de modelos e assets.

## Playwright CLI
`tests/visual-qa.cjs` captura home, seleção, quatro personagens em ângulos diferentes e missão por resolução. Trocar o evento inicial de navegação de `networkidle` para `domcontentloaded` evita travamento por recursos 3D; manter checagens explícitas de carregamento OBJ, overflow, WebGL, screenshots e erros.

## Critérios de aceite
Passagem de QA + deploy Actions, nenhum recurso ausente, ângulo frontal consistente, controles reset/zoom funcionais, missão responsiva, sem regressões de sprites.
## Controle manual do vídeo decorativo — 27/10/2026

- O portal agora permite **pausar ou retomar o vídeo de fundo** sem modificar a missão ou a seleção de personagens.
- O botão semântico tem foco de teclado, altura mínima de 44px, `aria-pressed` e texto que comunica a ação.
- Em `prefers-reduced-motion: reduce`, o vídeo é pausado e o controle informa o estado desabilitado; ao alterar essa preferência em execução, a interface sincroniza o estado.
- O Playwright verifica pausa, retomada e mudança de preferência nas resoluções desktop/mobile, incluindo screenshot do estado pausado em 390×844.
