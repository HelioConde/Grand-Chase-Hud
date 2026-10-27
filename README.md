<div align="center">
  <h1>⚔️ Grand Chase HUD — Protótipo jogável</h1>
  <p><strong>Um experimento de interface, seleção de personagens e missão 2D para navegador, com visualização opcional de modelos 3D.</strong></p>
  <p>
    <img alt="HTML5 e JavaScript" src="https://img.shields.io/badge/HTML5%20%2B%20JavaScript-Jogo%20web-E34F26?logo=html5&logoColor=white">
    <img alt="Three.js" src="https://img.shields.io/badge/Three.js-OBJ%2FMTL-111827">
    <img alt="Status" src="https://img.shields.io/badge/Status-Prot%C3%B3tipo-64748b">
  </p>
</div>

## O que é?

O projeto começou como uma recriação experimental de interfaces inspiradas em **Grand Chase**. Além do menu inicial, o código agora contém uma **missão jogável**: personagem controlável, inimigos, barra de HP/MP, pontuação, ataque, habilidade especial e reinício.

**Não é um remake completo do jogo.** A experiência usa cenas e lógica próprias de demonstração; algumas telas do menu ainda são legadas.

## Como jogar

```bash
git clone https://github.com/HelioConde/Grand-Chase-Hud.git
cd Grand-Chase-Hud
python -m http.server 8000
```

Abra `http://localhost:8000/` e navegue para a seleção de personagens. Para testar diretamente a missão, abra [`game.html`](game.html) no servidor local.

| Tecla | Ação |
| --- | --- |
| `A` / `D` | Mover |
| `W` / `Espaço` | Pular |
| `J` | Atacar |
| `K` | Especial |
| `Shift` | Dash |
| `Esc` | Pausar |

**Missão demonstrativa:** derrote inimigos e alcance o portal. O jogo exibe HUD com HP, MP e pontuação. A arena usa um `canvas` 2D de referência `960 × 540`.

## Personagens e modelos

A seleção apresenta o elenco visual disponível no menu. O código da missão define lógica para **Elesis, Lire, Arme e Lass**. Essas escolhas têm parâmetros diferentes de movimentação/ataque.

Em `models/`, existem recursos **OBJ/MTL** para esses quatro personagens. O renderer em `game.js` usa Three.js e, quando o carregamento é possível, compõe o modelo 3D sobre a cena 2D.

> **Limitação importante:** a animação do modelo é **procedural** — inclinação, oscilação e pequenas transformações do objeto. Os modelos OBJ não têm rig/esqueleto animado nem animação óssea de caminhada. Se um modelo/material falhar, o jogo usa a representação 2D.

## Arquivos importantes

| Arquivo | Função |
| --- | --- |
| `index.html` / `style.css` | Tela inicial |
| `iniciar.html` / `iniciar.css` | Seleção visual de personagens |
| `game.html` / `game.css` | Tela da missão e HUD |
| `game.js` | Combate, movimentação, inimigos e integração visual 3D |
| `models/` | Modelos OBJ/MTL |
| `js/three.min.js` | Motor 3D legado incluído |
| `img/` | Retratos e recursos da interface |

**Não há processo npm obrigatório:** os arquivos são estáticos e podem ser servidos por qualquer servidor HTTP local.

## Estado e próximos marcos

- [x] Menus e seleção de personagens.
- [x] Missão web básica com movimentação e combate.
- [x] Carregamento e normalização visual de modelos OBJ (com fallback).
- [ ] Validar comportamento em navegadores/dispositivos atuais.
- [x] Primeira rodada de controles: aceleração, frenagem, buffer de pulo e tolerância ao sair de plataformas.
- [x] Primeira rodada de combate: combo de 3 golpes, fila curta de ataque, reação a acertos, antecipação do golpe inimigo e câmera suavizada.
- [ ] Testar manualmente as mudanças de combate e ajustar equilíbrio, colisões, IA e feedback.
- [ ] Substituir transformações procedurais por modelos **rigados** caso essa direção seja retomada.
- [ ] Criar mais conteúdo e testes automatizados antes de tratar como jogo completo.

## Aviso de direitos autorais

Projeto **independente, não oficial e de estudo**. Grand Chase, nomes de personagens, imagens e materiais de terceiros pertencem aos respectivos titulares. Verifique permissões de uso e redistribuição antes de lançar um produto público ou comercial.

Desenvolvido por [Hélio Conde](https://github.com/HelioConde).

## Roteiro de evolução contínua (outubro de 2026)

1. **Controles e estabilidade:** ajustes de movimentação, pausa, reinício e acessibilidade aplicados; validação em navegador pendente.
2. **Combate:** combo de três ataques e golpes fortes no terceiro acerto; fila de comandos curta; inimigos mostram alerta antes de atacar.
3. **IA e variedade:** três colorações de inimigos adicionadas, reação aos impactos e atordoamento breve; novos comportamentos e chefes pendentes.
4. **Câmera e apresentação:** acompanhamento suavizado, tremor de impacto e indicador de combo; medir conforto de câmera em testes.
5. **Modelos 3D:** carregamento OBJ/MTL preservado; rig e animação óssea ainda não implementados.
6. **Expansão:** missões, checkpoints, novos cenários, controles móveis e testes Playwright são etapas futuras.

**Nota de validação:** commits foram enviados ao GitHub, mas ainda não foram executados testes de navegador ou benchmark após esta rodada. O GitHub Pages pode levar alguns minutos para refletir as alterações.
