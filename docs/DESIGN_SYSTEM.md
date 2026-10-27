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