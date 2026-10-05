# 🚀 Space Defender — Ultra Edition

**Space Defender Ultra Edition** é um shooter arcade 2D desenvolvido com **HTML5 Canvas, CSS3 e JavaScript puro**.

O projeto foi criado para praticar desenvolvimento de jogos no navegador, com foco em loop de jogo, movimentação, colisões, projéteis, inimigos, chefes, progressão, power-ups, efeitos visuais e APIs nativas da Web.

## 🎮 Destaques

- combate arcade em tempo real;
- nave do jogador com movimentação livre;
- sistema de vida e dano;
- **10 níveis de arma**;
- power-ups;
- combo e pontuação;
- ondas de inimigos;
- inimigos especiais;
- chefes com diferentes padrões;
- 8 mundos com ambientações distintas;
- transição de fases;
- partículas, explosões e screen shake;
- backgrounds procedurais;
- Web Audio API;
- High Score persistente com Local Storage;
- Fullscreen API;
- suporte a dispositivos móveis;
- vibração quando suportada pelo navegador.

## 🕹️ Controles

| Ação | Controle |
|---|---|
| Mover | WASD / Setas |
| Atirar | Espaço / clique |
| Pausar | P |
| Tela cheia | botão da interface |

Em telas sensíveis ao toque, a interface móvel fornece controles apropriados.

## ▶️ Executar

Não há backend nem dependências externas obrigatórias.

### Windows / PowerShell

```powershell
cd C:\caminho\para\space-defender-ultra
python -m http.server 8000
```

Abra:

```text
http://127.0.0.1:8000
```

Também é possível utilizar qualquer servidor HTTP estático.

> Recomenda-se servidor local em vez de abrir o arquivo diretamente com `file://`.

## 🧠 Arquitetura atual

O protótipo atual concentra a engine jogável no `index.html`. Isso é intencionalmente documentado aqui para deixar claro o estado real do projeto.

```text
space-defender-ultra/
├── index.html    # jogo, engine, entidades, loop e renderização
├── style.css     # HUD, menus e responsividade
├── README.md     # documentação
└── .gitignore
```

### Loop principal

```text
requestAnimationFrame
        │
        ▼
   gameLoop(dt)
        │
        ├── update()
        │    ├── player
        │    ├── projéteis
        │    ├── inimigos
        │    ├── power-ups
        │    ├── chefe
        │    ├── colisões
        │    └── progressão
        │
        └── draw()
             ├── background
             ├── objetos
             ├── inimigos
             ├── projéteis
             ├── nave
             ├── chefe
             └── efeitos
```

## ⚙️ Sistemas implementados

### Combate

O jogo possui projéteis do jogador e dos inimigos, detecção de colisão, dano, explosões e progressão da arma.

### Progressão

A dificuldade aumenta conforme o estágio. Cada mundo altera características como comportamento dos inimigos, frequência de disparos e ambientação.

### Chefes

Os chefes possuem vida própria, entrada na arena, estados de combate, ataques e transição para o próximo estágio.

### Renderização

A cena é desenhada diretamente no Canvas 2D, incluindo:

- estrelas;
- nebulosas;
- cenários;
- inimigos;
- nave;
- projéteis;
- explosões;
- partículas;
- HUD e efeitos de impacto.

## 📱 Web APIs utilizadas

- Canvas 2D
- Web Audio API
- Local Storage API
- Fullscreen API
- Vibration API, quando disponível
- Pointer/Mouse Events
- Keyboard Events
- requestAnimationFrame

## 🔧 Próxima evolução técnica

O próximo passo recomendado é transformar o protótipo monolítico em uma engine modular:

```text
src/
├── core/
│   ├── GameLoop.js
│   └── GameState.js
├── entities/
│   ├── Player.js
│   ├── Enemy.js
│   ├── Boss.js
│   └── Projectile.js
├── systems/
│   ├── CollisionSystem.js
│   ├── WaveSystem.js
│   ├── WeaponSystem.js
│   └── AudioSystem.js
├── rendering/
│   ├── Renderer.js
│   └── Background.js
└── input/
    └── InputManager.js
```

Essa separação permitirá testar física e colisões isoladamente, adicionar novos tipos de inimigos e evoluir o jogo sem aumentar o acoplamento do arquivo principal.

## 🧹 Limpeza de portfólio

Foram removidos módulos JavaScript que não participavam do fluxo executado pelo `index.html`. Isso evita apresentar ao recrutador arquivos aparentemente ativos que, na prática, não fazem parte da aplicação atual.

**Importante:** o design e a lógica visual da nave existente foram preservados.

## 📌 Status

**Protótipo avançado / projeto de portfólio.**

O jogo é funcional como aplicação web estática, mas ainda está em evolução arquitetural. A próxima etapa é modularizar a engine e adicionar testes para os sistemas determinísticos.

## 👨‍💻 Autor

**Diego Alves de Souza — 21Programe**

GitHub: https://github.com/21Programe
