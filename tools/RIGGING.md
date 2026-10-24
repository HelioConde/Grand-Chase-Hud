# Rig 3D experimental
O projeto possui apenas arquivos OBJ estáticos. Não existe esqueleto nas malhas atuais.

Execute com Blender 4.x/5.x:
```powershell
blender -b --python tools/rig_character.py -- --character elesis
```
Resultado: `models/elesis/elesis_rigged.glb` e `elesis_rig_review.blend`.

**Limitações:** os ossos são posicionados por estimativas da bounding box, não por reconhecimento anatômico; a associação automática de pesos pode falhar com roupas, acessórios, membros próximos ou modelo não vertical. Abra o BLEND e ajuste orientação, ossos, pesos, texturas e animações antes de distribuir. As ações Idle, Walk e Attack são bases editáveis, não equivalem a animações finalizadas. O runtime atual (Three.js r78 + OBJLoader) não carrega os ossos do GLB: a próxima integração requer GLTFLoader compatível/Three.js atualizado e AnimationMixer. O jogo original permanece intacto até a validação.
