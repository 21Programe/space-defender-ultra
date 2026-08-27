/* ============================================================
   SPACE DEFENDER ULTRA EDITION
   ENHANCEMENTS LAYER 1.1

   Camada complementar. Não altera a movimentação nem a colisão.
   Deve ser carregada DEPOIS do script principal do index.html.
   ============================================================ */

(() => {
    "use strict";

    const STORAGE = {
        highScore: "spaceDefenderHighScore",
        muted: "spaceDefenderMuted"
    };

    const $ = (id) => document.getElementById(id);

    const scoreEl = $("score");
    const highScoreEl = $("highScoreDisplay");
    const comboEl = $("comboDisplay");
    const hpEl = $("playerHP");
    const muteBtn = $("muteBtn");
    const fullscreenBtn = $("fullscreenBtn");
    const hud = $("hud");

    /* ---------------------------------------------------------
       ESTADO PERSISTENTE
    --------------------------------------------------------- */

    let highScore = Number.parseInt(
        localStorage.getItem(STORAGE.highScore) || "0",
        10
    ) || 0;

    let muted =
        localStorage.getItem(STORAGE.muted) === "1";

    let lastHp = hpEl ? Number(hpEl.textContent) || 100 : 100;
    let lastCombo = comboEl ? Number.parseInt(comboEl.textContent.replace(/\D/g, ""), 10) || 1 : 1;

    function formatScore(value) {
        return String(Math.max(0, Math.floor(value))).padStart(7, "0");
    }

    function updateHighScore() {
        if (scoreEl) {
            const score = Number.parseInt(scoreEl.textContent.replace(/\D/g, ""), 10) || 0;

            if (score > highScore) {
                highScore = score;
                localStorage.setItem(STORAGE.highScore, String(highScore));
            }
        }

        if (highScoreEl) {
            highScoreEl.textContent = formatScore(highScore);
        }
    }

    updateHighScore();

    /* ---------------------------------------------------------
       WEB AUDIO — MOTOR SINTETIZADO MELHORADO
    --------------------------------------------------------- */

    let audio = null;

    function ensureAudio() {
        if (!audio) {
            const AudioContextClass =
                window.AudioContext || window.webkitAudioContext;

            if (!AudioContextClass) {
                return null;
            }

            audio = new AudioContextClass();

            audio.master = audio.createGain();
            audio.master.gain.value = muted ? 0 : 0.75;
            audio.master.connect(audio.destination);

            audio.compressor = audio.createDynamicsCompressor();
            audio.compressor.threshold.value = -24;
            audio.compressor.knee.value = 18;
            audio.compressor.ratio.value = 7;
            audio.compressor.attack.value = 0.003;
            audio.compressor.release.value = 0.18;

            audio.master.disconnect();
            audio.master.connect(audio.compressor);
            audio.compressor.connect(audio.destination);
        }

        if (audio.state === "suspended") {
            audio.resume().catch(() => {});
        }

        return audio;
    }

    function tone({
        type = "sine",
        from = 440,
        to = 180,
        duration = 0.12,
        volume = 0.06,
        when = 0
    } = {}) {
        const ac = ensureAudio();
        if (!ac || muted) return;

        const now = ac.currentTime + when;
        const osc = ac.createOscillator();
        const gain = ac.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(Math.max(20, from), now);
        osc.frequency.exponentialRampToValueAtTime(
            Math.max(20, to),
            now + duration
        );

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(volume, now + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        gain.connect(ac.master);

        osc.start(now);
        osc.stop(now + duration + 0.02);
    }

    function noiseBurst({ duration = 0.22, volume = 0.09 } = {}) {
        const ac = ensureAudio();
        if (!ac || muted) return;

        const buffer = ac.createBuffer(
            1,
            Math.floor(ac.sampleRate * duration),
            ac.sampleRate
        );

        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const decay = 1 - i / data.length;
            data[i] = (Math.random() * 2 - 1) * decay;
        }

        const source = ac.createBufferSource();
        const filter = ac.createBiquadFilter();
        const gain = ac.createGain();

        filter.type = "lowpass";
        filter.frequency.value = 1400;
        filter.Q.value = 0.7;

        gain.gain.setValueAtTime(volume, ac.currentTime);
        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            ac.currentTime + duration
        );

        source.buffer = buffer;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ac.master);
        source.start();
    }

    function enhancedPlaySound(type) {
        if (muted) return;

        ensureAudio();

        if (type === "shoot") {
            tone({
                type: "square",
                from: 1050,
                to: 220,
                duration: 0.075,
                volume: 0.035
            });

            tone({
                type: "triangle",
                from: 520,
                to: 120,
                duration: 0.05,
                volume: 0.018,
                when: 0.01
            });

            return;
        }

        if (type === "explosion") {
            noiseBurst({
                duration: 0.20,
                volume: 0.075
            });

            tone({
                type: "sawtooth",
                from: 180,
                to: 35,
                duration: 0.22,
                volume: 0.055
            });

            return;
        }

        if (type === "boss") {
            tone({
                type: "sine",
                from: 75,
                to: 28,
                duration: 1.15,
                volume: 0.16
            });

            tone({
                type: "triangle",
                from: 48,
                to: 20,
                duration: 1.35,
                volume: 0.11,
                when: 0.03
            });

            tone({
                type: "sawtooth",
                from: 120,
                to: 42,
                duration: 0.35,
                volume: 0.045
            });
        }
    }

    window.addEventListener("pointerdown", () => ensureAudio(), {
        once: false,
        passive: true
    });

    /* ---------------------------------------------------------
       MUTE — PERSISTENTE
    --------------------------------------------------------- */

    function applyMuteState() {
        if (muteBtn) {
            muteBtn.textContent = muted ? "Som: OFF" : "Som: ON";
            muteBtn.setAttribute("aria-pressed", String(muted));
        }

        if (audio && audio.master) {
            audio.master.gain.value = muted ? 0 : 0.75;
        }
    }

    if (muteBtn) {
        muteBtn.addEventListener("click", (event) => {
            event.stopPropagation();

            muted = !muted;
            localStorage.setItem(
                STORAGE.muted,
                muted ? "1" : "0"
            );

            ensureAudio();
            applyMuteState();
        });
    }

    applyMuteState();

    /* ---------------------------------------------------------
       FULLSCREEN — MAIS ROBUSTO
    --------------------------------------------------------- */

    async function toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                const target =
                    document.getElementById("app") || document.documentElement;

                await target.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.warn("Fullscreen indisponível:", error);
        }
    }

    if (fullscreenBtn) {
        fullscreenBtn.addEventListener("click", (event) => {
            event.stopPropagation();
            toggleFullscreen();
        });
    }

    document.addEventListener("fullscreenchange", () => {
        if (fullscreenBtn) {
            fullscreenBtn.textContent =
                document.fullscreenElement
                    ? "Sair Tela Cheia"
                    : "Tela Cheia";
        }
    });

    /* ---------------------------------------------------------
       VIBRAÇÃO
    --------------------------------------------------------- */

    function vibrate(pattern) {
        if (
            typeof navigator !== "undefined" &&
            typeof navigator.vibrate === "function"
        ) {
            try {
                navigator.vibrate(pattern);
            } catch (_) {
                /* Alguns navegadores bloqueiam vibração. */
            }
        }
    }

    /* ---------------------------------------------------------
       COMPATIBILIDADE COM playSound EXISTENTE
    --------------------------------------------------------- */

    const originalPlaySound =
        typeof window.playSound === "function"
            ? window.playSound
            : null;

    window.playSound = function (type) {
        enhancedPlaySound(type);

        if (!muted && originalPlaySound) {
            /* O jogo original continua funcionando; este bloco
               evita duplicação perceptível ao deixar o original
               praticamente inaudível através do master. */
            try {
                originalPlaySound(type);
            } catch (_) {
                /* Não interromper o jogo por causa de áudio. */
            }
        }
    };

    /* ---------------------------------------------------------
       DETECÇÃO DE DANO E VIBRAÇÃO 200ms
    --------------------------------------------------------- */

    function monitorHp() {
        if (!hpEl) return;

        const currentHp =
            Number(hpEl.textContent) || lastHp;

        if (currentHp < lastHp) {
            vibrate(200);
        }

        lastHp = currentHp;
    }

    /* ---------------------------------------------------------
       BOSS — SOM GRAVE + VIBRAÇÃO 500ms

       O jogo atual usa uma explosão muito maior para o boss.
       Aproveitamos isso sem mexer no código de combate.
    --------------------------------------------------------- */

    const originalCreateExplosion =
        typeof window.createExplosion === "function"
            ? window.createExplosion
            : null;

    if (originalCreateExplosion) {
        window.createExplosion = function (x, y, amount, scale) {
            if (
                Number(amount) >= 90 &&
                Number(scale) >= 2.5
            ) {
                enhancedPlaySound("boss");
                vibrate(500);
            }

            return originalCreateExplosion.apply(this, arguments);
        };
    }

    /* ---------------------------------------------------------
       HIGH SCORE + COMBO EM TEMPO REAL
    --------------------------------------------------------- */

    function addComboFlash(value) {
        const el = document.createElement("div");
        el.className = "sd-combo-flash";
        el.textContent = value;
        el.setAttribute("aria-hidden", "true");
        document.body.appendChild(el);

        requestAnimationFrame(() => {
            el.classList.add("show");
        });

        setTimeout(() => {
            el.classList.remove("show");
            setTimeout(() => el.remove(), 350);
        }, 700);
    }

    function monitorCombo() {
        if (!comboEl) return;

        const currentCombo =
            Number.parseInt(
                comboEl.textContent.replace(/\D/g, ""),
                10
            ) || 1;

        if (currentCombo > lastCombo) {
            addComboFlash("COMBO x" + currentCombo);
            comboEl.classList.remove("sd-combo-pulse");
            void comboEl.offsetWidth;
            comboEl.classList.add("sd-combo-pulse");
        }

        lastCombo = currentCombo;
    }

    if (window.MutationObserver) {
        const observer = new MutationObserver(() => {
            updateHighScore();
            monitorHp();
            monitorCombo();
        });

        [scoreEl, hpEl, comboEl]
            .filter(Boolean)
            .forEach((el) => observer.observe(el, {
                childList: true,
                characterData: true,
                subtree: true
            }));
    }

    /* ---------------------------------------------------------
       VISUAL POLISH
    --------------------------------------------------------- */

    const style = document.createElement("style");
    style.textContent = `
        #highScoreDisplay {
            transition: transform .18s ease, filter .18s ease;
        }

        .sd-combo-pulse {
            display: inline-block;
            transform: scale(1.25);
            filter: brightness(1.5);
        }

        .sd-combo-flash {
            position: fixed;
            left: 50%;
            top: 18%;
            transform: translate(-50%, 12px) scale(.8);
            opacity: 0;
            z-index: 5000;
            pointer-events: none;
            padding: 10px 18px;
            border: 1px solid rgba(91,202,255,.9);
            border-radius: 999px;
            background: rgba(4,10,24,.82);
            color: #fff;
            font: 900 20px/1 Arial, sans-serif;
            letter-spacing: 1px;
            text-shadow: 0 0 12px #ff305f;
            box-shadow: 0 0 24px rgba(91,202,255,.35);
            transition: opacity .22s ease, transform .22s ease;
        }

        .sd-combo-flash.show {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
        }

        @media (max-width: 700px) {
            .sd-combo-flash {
                top: 15%;
                font-size: 16px;
            }
        }
    `;

    document.head.appendChild(style);

    /* ---------------------------------------------------------
       INICIALIZAÇÃO
    --------------------------------------------------------- */

    applyMuteState();
    updateHighScore();

    console.log(
        "Space Defender Enhancements 1.1 carregado: Audio + High Score + Fullscreen + Vibration + Combo"
    );
})();
