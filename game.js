"use strict";

/*
============================================================
SPACE DEFENDER ULTRA EDITION
WORLD ENGINE 1.0
============================================================

FASES / MUNDOS

1 - FRONTEIRA AZUL
2 - NEBULOSA VIOLETA
3 - CIDADE ORBITAL
4 - PLANETA VERMELHO
5 - SETOR DESTRUIDO
6 - PORTAL PROFUNDO
7 - NÚCLEO ESTELAR
8 - FIM DA FRONTEIRA

============================================================
*/


/* ============================================================
   CANVAS
============================================================ */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;

let DPR = Math.min(
    window.devicePixelRatio || 1,
    2
);

function resizeCanvas() {

    WIDTH = Math.max(
        320,
        window.innerWidth
    );

    HEIGHT = Math.max(
        300,
        window.innerHeight
    );

    DPR = Math.min(
        window.devicePixelRatio || 1,
        2
    );

    canvas.width =
        Math.floor(WIDTH * DPR);

    canvas.height =
        Math.floor(HEIGHT * DPR);

    canvas.style.width =
        WIDTH + "px";

    canvas.style.height =
        HEIGHT + "px";

    ctx.setTransform(
        DPR,
        0,
        0,
        DPR,
        0,
        0
    );

    createStars();
}

window.addEventListener(
    "resize",
    resizeCanvas
);


/* ============================================================
   ELEMENTOS DA INTERFACE
============================================================ */

const startScreen =
    document.getElementById("startScreen");

const gameOverScreen =
    document.getElementById("gameOverScreen");

const victoryScreen =
    document.getElementById("victoryScreen");

const startButton =
    document.getElementById("startButton");

const restartButton =
    document.getElementById("restartButton");

const victoryRestart =
    document.getElementById("victoryRestart");

const scoreElement =
    document.getElementById("score");

const waveElement =
    document.getElementById("wave");

const weaponElement =
    document.getElementById("weaponLevel");

const hpElement =
    document.getElementById("playerHP");

const healthBar =
    document.getElementById("healthBar");

const finalScoreElement =
    document.getElementById("finalScore");

const victoryScoreElement =
    document.getElementById("victoryScore");

const weaponPopup =
    document.getElementById("weaponPopup");

const upgradeText =
    document.getElementById("upgradeText");


/* ============================================================
   ESTADO
============================================================ */

let gameRunning = false;

let paused = false;

let score = 0;

let stage = 1;

let gameTime = 0;

let lastTime = 0;

let stageState = "enemies";

let stageTransitionTimer = 0;

let specialEnemy = null;

let specialTimer = 0;

let boss = null;

let shake = 0;

let victoryReached = false;


/* ============================================================
   MUNDO ATUAL
============================================================ */

const WORLDS = {

    1: {
        name: "FRONTEIRA AZUL",
        background: "blue",
        enemyStyle: "formation",
        bossType: 0,
        enemyMultiplier: 1,
        fireMultiplier: 1,
        special: true
    },

    2: {
        name: "NEBULOSA VIOLETA",
        background: "purple",
        enemyStyle: "zigzag",
        bossType: 1,
        enemyMultiplier: 1.12,
        fireMultiplier: 1.05,
        special: true
    },

    3: {
        name: "CIDADE ORBITAL",
        background: "city",
        enemyStyle: "orbital",
        bossType: 2,
        enemyMultiplier: 1.22,
        fireMultiplier: 1.08,
        special: true
    },

    4: {
        name: "PLANETA VERMELHO",
        background: "red",
        enemyStyle: "aggressive",
        bossType: 3,
        enemyMultiplier: 1.35,
        fireMultiplier: 1.12,
        special: true
    },

    5: {
        name: "SETOR DESTRUIDO",
        background: "destroyed",
        enemyStyle: "chaos",
        bossType: 4,
        enemyMultiplier: 1.48,
        fireMultiplier: 1.18,
        special: true
    },

    6: {
        name: "PORTAL PROFUNDO",
        background: "portal",
        enemyStyle: "spiral",
        bossType: 5,
        enemyMultiplier: 1.62,
        fireMultiplier: 1.23,
        special: true
    },

    7: {
        name: "NÚCLEO ESTELAR",
        background: "starcore",
        enemyStyle: "storm",
        bossType: 6,
        enemyMultiplier: 1.78,
        fireMultiplier: 1.30,
        special: true
    },

    8: {
        name: "FIM DA FRONTEIRA",
        background: "final",
        enemyStyle: "final",
        bossType: 7,
        enemyMultiplier: 1.95,
        fireMultiplier: 1.38,
        special: true
    }

};


/* ============================================================
   INPUT
============================================================ */

const keys = {};

window.addEventListener(
    "keydown",
    function (event) {

        keys[event.code] = true;

        if (
            event.code === "Space" ||
            event.code === "ArrowUp" ||
            event.code === "ArrowDown" ||
            event.code === "ArrowLeft" ||
            event.code === "ArrowRight"
        ) {
            event.preventDefault();
        }

        if (
            event.code === "KeyP" &&
            gameRunning
        ) {
            paused = !paused;
        }

    }
);


window.addEventListener(
    "keyup",
    function (event) {

        keys[event.code] = false;

    }
);


/* ============================================================
   MOUSE
============================================================ */

const mouse = {

    x: WIDTH / 2,

    y: HEIGHT - 100,

    active: false,

    down: false

};


canvas.addEventListener(
    "mousemove",
    function (event) {

        const rect =
            canvas.getBoundingClientRect();

        mouse.x =
            event.clientX -
            rect.left;

        mouse.y =
            event.clientY -
            rect.top;

        mouse.active = true;

    }
);


canvas.addEventListener(
    "mousedown",
    function () {

        mouse.down = true;

    }
);


window.addEventListener(
    "mouseup",
    function () {

        mouse.down = false;

    }
);


/* ============================================================
   ESTRELAS
============================================================ */

let stars = [];

function createStars() {

    stars = [];

    const count =
        Math.floor(
            Math.max(
                100,
                Math.min(
                    260,
                    WIDTH *
                    HEIGHT /
                    5500
                )
            )
        );


    for (
        let i = 0;
        i < count;
        i++
    ) {

        stars.push({

            x:
                Math.random() *
                WIDTH,

            y:
                Math.random() *
                HEIGHT,

            size:
                Math.random() *
                2 +
                .4,

            speed:
                Math.random() *
                100 +
                20,

            alpha:
                Math.random() *
                .8 +
                .15,

            phase:
                Math.random() *
                Math.PI *
                2

        });

    }

}


/* ============================================================
   BACKGROUND
============================================================ */

function updateBackground(dt) {

    for (
        const star of stars
    ) {

        star.y +=
            star.speed *
            dt;

        star.phase +=
            dt * 2;

        if (
            star.y >
            HEIGHT +
            10
        ) {

            star.y = -10;

            star.x =
                Math.random() *
                WIDTH;

        }

    }

}


function drawBackground() {

    const world =
        WORLDS[
            stage
        ] ||
        WORLDS[8];


    /*
    ------------------------------------------
    CORES DOS MUNDOS
    ------------------------------------------
    */

    let top = "#01040b";

    let middle = "#06152b";

    let bottom = "#02050d";


    if (
        world.background ===
        "purple"
    ) {

        top = "#090314";

        middle = "#23083e";

        bottom = "#07020f";

    }


    else if (
        world.background ===
        "city"
    ) {

        top = "#02050e";

        middle = "#07182d";

        bottom = "#020810";

    }


    else if (
        world.background ===
        "red"
    ) {

        top = "#120304";

        middle = "#3a0b10";

        bottom = "#0a0204";

    }


    else if (
        world.background ===
        "destroyed"
    ) {

        top = "#090909";

        middle = "#20140e";

        bottom = "#070606";

    }


    else if (
        world.background ===
        "portal"
    ) {

        top = "#050113";

        middle = "#19063b";

        bottom = "#03010b";

    }


    else if (
        world.background ===
        "starcore"
    ) {

        top = "#160804";

        middle = "#47200b";

        bottom = "#0d0301";

    }


    else if (
        world.background ===
        "final"
    ) {

        top = "#020206";

        middle = "#12052b";

        bottom = "#010102";

    }


    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            HEIGHT
        );


    gradient.addColorStop(
        0,
        top
    );


    gradient.addColorStop(
        .5,
        middle
    );


    gradient.addColorStop(
        1,
        bottom
    );


    ctx.fillStyle =
        gradient;


    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );


    /*
    ------------------------------------------
    NEBULOSA
    ------------------------------------------
    */

    let nebulaColor =
        "rgba(30,110,255,.10)";


    if (
        world.background ===
        "purple"
    ) {

        nebulaColor =
            "rgba(190,50,255,.13)";

    }


    if (
        world.background ===
        "city"
    ) {

        nebulaColor =
            "rgba(40,150,255,.09)";

    }


    if (
        world.background ===
        "red"
    ) {

        nebulaColor =
            "rgba(255,50,65,.11)";

    }


    if (
        world.background ===
        "starcore"
    ) {

        nebulaColor =
            "rgba(255,100,30,.15)";

    }


    const nebula =
        ctx.createRadialGradient(
            WIDTH *
            .25,
            HEIGHT *
            .30,
            0,
            WIDTH *
            .25,
            HEIGHT *
            .30,
            WIDTH *
            .65
        );


    nebula.addColorStop(
        0,
        nebulaColor
    );


    nebula.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );


    ctx.fillStyle =
        nebula;


    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );


    /*
    ------------------------------------------
    ESTRELAS
    ------------------------------------------
    */

    for (
        const star of stars
    ) {

        ctx.globalAlpha =
            Math.max(
                .06,
                star.alpha +
                Math.sin(
                    star.phase
                ) *
                .15
            );


        ctx.fillStyle =
            "#e8f9ff";


        ctx.beginPath();


        ctx.arc(
            star.x,
            star.y,
            star.size,
            0,
            Math.PI *
            2
        );


        ctx.fill();

    }


    ctx.globalAlpha =
        1;


    /*
    ------------------------------------------
    AMBIENTE ESPECIAL
    ------------------------------------------
    */

    if (
        world.background ===
        "city"
    ) {

        drawCityBackground();

    }


    if (
        world.background ===
        "red"
    ) {

        drawRedPlanet();

    }


    if (
        world.background ===
        "destroyed"
    ) {

        drawDestroyedSector();

    }


    if (
        world.background ===
        "portal"
    ) {

        drawPortal();

    }


    if (
        world.background ===
        "starcore"
    ) {

        drawStarCore();

    }


    if (
        world.background ===
        "final"
    ) {

        drawFinalWorld();

    }


    /*
    ------------------------------------------
    GRADE DE PROFUNDIDADE
    ------------------------------------------
    */

    ctx.save();

    ctx.globalAlpha =
        .045;

    ctx.strokeStyle =
        world.background ===
        "city"
            ? "#4fdcff"
            : "#72cfff";

    ctx.lineWidth = 1;


    const horizon =
        HEIGHT *
        .60;


    for (
        let i = -8;
        i <= 8;
        i++
    ) {

        ctx.beginPath();

        ctx.moveTo(
            WIDTH /
            2,
            horizon
        );

        ctx.lineTo(
            WIDTH /
            2 +
            i *
            WIDTH *
            .18,

            HEIGHT
        );

        ctx.stroke();

    }


    ctx.restore();

}


/* ============================================================
   CIDADE
============================================================ */

function drawCityBackground() {

    const horizon =
        HEIGHT *
        .68;


    /*
    prédios
    */

    for (
        let i = 0;
        i < 32;
        i++
    ) {

        const width =
            20 +
            (
                i %
                5
            ) *
            8;


        const height =
            40 +
            (
                i *
                37
            ) %
            150;


        const x =
            i *
            52 -
            25;


        const y =
            horizon -
            height;


        ctx.fillStyle =
            i % 3 === 0
                ? "#071c33"
                : "#091525";


        ctx.fillRect(
            x,
            y,
            width,
            height
        );


        /*
        janelas
        */

        ctx.fillStyle =
            "rgba(75,200,255,.4)";


        for (
            let wy =
                y + 12;
            wy <
                horizon - 8;
            wy += 16
        ) {

            if (
                Math.random()
                <
                .65
            ) {

                ctx.fillRect(
                    x + 5,
                    wy,
                    3,
                    5
                );

            }

        }

    }


    /*
    vias luminosas
    */

    ctx.strokeStyle =
        "rgba(30,200,255,.22)";


    ctx.lineWidth =
        3;


    for (
        let i = 0;
        i < 7;
        i++
    ) {

        ctx.beginPath();

        ctx.moveTo(
            WIDTH *
            .5 +
            i *
            25,
            HEIGHT
        );

        ctx.lineTo(
            WIDTH *
            .5 +
            i *
            8,
            horizon
        );

        ctx.stroke();

    }


    /*
    linhas horizontais
    */

    ctx.strokeStyle =
        "rgba(80,180,255,.15)";


    ctx.lineWidth = 1;


    for (
        let i = 0;
        i < 6;
        i++
    ) {

        const y =
            horizon +
            i *
            38;


        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            WIDTH,
            y
        );

        ctx.stroke();

    }

}


/* ============================================================
   PLANETA VERMELHO
============================================================ */

function drawRedPlanet() {

    const x =
        WIDTH *
        .82;


    const y =
        HEIGHT *
        .72;


    const radius =
        Math.min(
            WIDTH,
            HEIGHT
        ) *
        .28;


    const gradient =
        ctx.createRadialGradient(
            x -
            radius *
            .3,
            y -
            radius *
            .3,
            2,
            x,
            y,
            radius
        );


    gradient.addColorStop(
        0,
        "#a64b32"
    );


    gradient.addColorStop(
        .5,
        "#5f1f18"
    );


    gradient.addColorStop(
        1,
        "#150405"
    );


    ctx.fillStyle =
        gradient;


    ctx.beginPath();


    ctx.arc(
        x,
        y,
        radius,
        0,
        Math.PI *
        2
    );


    ctx.fill();


    /*
    crateras
    */

    ctx.globalAlpha =
        .25;


    for (
        let i = 0;
        i < 12;
        i++
    ) {

        const a =
            random(
                0,
                Math.PI *
                2
            );


        const r =
            random(
                0,
                radius *
                .7
            );


        const cx =
            x +
            Math.cos(a) *
            r;


        const cy =
            y +
            Math.sin(a) *
            r;


        ctx.fillStyle =
            "#260807";


        ctx.beginPath();


        ctx.arc(
            cx,
            cy,
            random(
                5,
                18
            ),
            0,
            Math.PI *
            2
        );


        ctx.fill();

    }


    ctx.globalAlpha =
        1;

}


/* ============================================================
   SETOR DESTRUIDO
============================================================ */

function drawDestroyedSector() {

    /*
    destroços flutuantes
    */

    for (
        let i = 0;
        i < 16;
        i++
    ) {

        const x =
            (
                i *
                173
                +
                gameTime *
                (
                    20 +
                    i
                )
            ) %
            (
                WIDTH +
                200
            ) -
            100;


        const y =
            (
                i *
                97
                +
                Math.sin(
                    gameTime +
                    i
                ) *
                40
            ) %
            HEIGHT;


        ctx.fillStyle =
            "rgba(120,80,60,.55)";


        ctx.save();


        ctx.translate(
            x,
            y
        );


        ctx.rotate(
            gameTime *
            .2 +
            i
        );


        ctx.fillRect(
            -8,
            -8,
            16,
            16
        );


        ctx.restore();

    }

}


/* ============================================================
   PORTAL
============================================================ */

function drawPortal() {

    const cx =
        WIDTH *
        .5;


    const cy =
        HEIGHT *
        .28;


    for (
        let i = 0;
        i < 7;
        i++
    ) {

        const radius =
            70 +
            i *
            27 +
            Math.sin(
                gameTime *
                2 +
                i
            ) *
            5;


        ctx.strokeStyle =
            `rgba(${
                100 +
                i * 20
            },80,255,${
                .18 -
                i *
                .015
            })`;


        ctx.lineWidth =
            2;


        ctx.beginPath();


        ctx.arc(
            cx,
            cy,
            radius,
            gameTime +
            i,
            gameTime +
            Math.PI *
            1.5 +
            i
        );


        ctx.stroke();

    }

}


/* ============================================================
   NÚCLEO ESTELAR
============================================================ */

function drawStarCore() {

    const x =
        WIDTH *
        .5;


    const y =
        HEIGHT *
        .27;


    const radius =
        100 +
        Math.sin(
            gameTime *
            3
        ) *
        8;


    const glow =
        ctx.createRadialGradient(
            x,
            y,
            10,
            x,
            y,
            radius *
            2
        );


    glow.addColorStop(
        0,
        "rgba(255,230,120,.35)"
    );


    glow.addColorStop(
        1,
        "rgba(255,80,20,0)"
    );


    ctx.fillStyle =
        glow;


    ctx.beginPath();


    ctx.arc(
        x,
        y,
        radius *
        2,
        0,
        Math.PI *
        2
    );


    ctx.fill();


    ctx.fillStyle =
        "#ffbf52";


    ctx.beginPath();


    ctx.arc(
        x,
        y,
        radius *
        .45,
        0,
        Math.PI *
        2
    );


    ctx.fill();

}


/* ============================================================
   FINAL WORLD
============================================================ */

function drawFinalWorld() {

    const cx =
        WIDTH *
        .5;


    const cy =
        HEIGHT *
        .28;


    /*
    portal central
    */

    for (
        let i = 0;
        i < 12;
        i++
    ) {

        const radius =
            50 +
            i *
            20;


        ctx.strokeStyle =
            `rgba(175,70,255,${
                .20 -
                i *
                .012
            })`;


        ctx.lineWidth =
            2;


        ctx.beginPath();


        ctx.arc(
            cx,
            cy,
            radius,
            0,
            Math.PI *
            2
        );


        ctx.stroke();

    }


    /*
    estrelas rápidas
    */

    ctx.globalAlpha =
        .25;


    ctx.strokeStyle =
        "#c777ff";


    for (
        let i = 0;
        i < 20;
        i++
    ) {

        const x =
            (
                i *
                137 +
                gameTime *
                120
            ) %
            WIDTH;


        ctx.beginPath();


        ctx.moveTo(
            x,
            HEIGHT *
            .65
        );


        ctx.lineTo(
            x -
            20,
            HEIGHT *
            .65 +
            35
        );


        ctx.stroke();

    }


    ctx.globalAlpha =
        1;

}


/* ============================================================
   PLAYER
============================================================ */

function resetPlayer() {

    player.x =
        WIDTH *
        .5;

    player.y =
        HEIGHT *
        .78;

    player.hp =
        100;

    player.maxHp =
        100;

    player.weapon =
        1;

    player.cooldown =
        0;

    player.invulnerable =
        0;

    player.engine =
        0;

}


const player = {

    x:
        WIDTH /
        2,

    y:
        HEIGHT *
        .78,

    maxHp:
        100,

    hp:
        100,

    weapon:
        1,

    speed:
        460,

    cooldown:
        0,

    invulnerable:
        0,

    engine:
        0

};


/* ============================================================
   UPDATE PLAYER
============================================================ */

function updatePlayer(
    dt
) {

    let dx = 0;

    let dy = 0;


    if (
        keys["ArrowLeft"] ||
        keys["KeyA"]
    ) {

        dx--;

    }


    if (
        keys["ArrowRight"] ||
        keys["KeyD"]
    ) {

        dx++;

    }


    if (
        keys["ArrowUp"] ||
        keys["KeyW"]
    ) {

        dy--;

    }


    if (
        keys["ArrowDown"] ||
        keys["KeyS"]
    ) {

        dy++;

    }


    if (
        dx ||
        dy
    ) {

        const len =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        dx /=
            len;


        dy /=
            len;


        player.x +=
            dx *
            player.speed *
            dt;


        player.y +=
            dy *
            player.speed *
            dt;

    }


    player.x =
        clamp(
            player.x,
            42,
            WIDTH -
            42
        );


    player.y =
        clamp(
            player.y,
            HEIGHT *
            .54,
            HEIGHT -
            45
        );


    player.engine +=
        dt *
        10;


    player.cooldown -=
        dt;


    player.invulnerable -=
        dt;


    if (
        keys["Space"] ||
        mouse.down
    ) {

        if (
            player.cooldown <=
            0
        ) {

            shootPlayer();


            player.cooldown =
                weaponCooldown();

        }

    }

}


function weaponCooldown() {

    const values = [

        .29,
        .27,
        .25,
        .23,
        .22,
        .21,
        .20,
        .18,
        .16,
        .14

    ];


    return values[
        player.weapon -
        1
    ];

}


/* ============================================================
   TIROS DO PLAYER
============================================================ */

const playerBullets = [];


function createPlayerBullet(
    x,
    y,
    vx,
    vy,
    damage,
    radius,
    type
) {

    playerBullets.push({

        x,

        y,

        vx,

        vy,

        damage,

        radius,

        type,

        life:
            3

    });

}


function shootPlayer() {

    const x =
        player.x;

    const y =
        player.y -
        34;


    const speed =
        820;


    const level =
        player.weapon;


    /*
    LV1
    */

    if (
        level === 1
    ) {

        createPlayerBullet(
            x,
            y,
            0,
            -speed,
            12,
            4,
            "normal"
        );

    }


    /*
    LV2
    */

    else if (
        level === 2
    ) {

        createPlayerBullet(
            x -
            9,
            y,
            -15,
            -speed,
            12,
            4,
            "normal"
        );


        createPlayerBullet(
            x +
            9,
            y,
            15,
            -speed,
            12,
            4,
            "normal"
        );

    }


    /*
    LV3
    */

    else if (
        level === 3
    ) {

        createPlayerBullet(
            x,
            y,
            0,
            -850,
            18,
            5,
            "energy"
        );


        createPlayerBullet(
            x -
            14,
            y,
            -85,
            -760,
            12,
            4,
            "normal"
        );


        createPlayerBullet(
            x +
            14,
            y,
            85,
            -760,
            12,
            4,
            "normal"
        );

    }


    /*
    LV4
    */

    else if (
        level === 4
    ) {

        for (
            let i = -1;
            i <= 1;
            i++
        ) {

            createPlayerBullet(
                x,
                y,
                i *
                110,
                -790,
                14,
                4,
                "energy"
            );

        }

    }


    /*
    LV5
    */

    else if (
        level === 5
    ) {

        createPlayerBullet(
            x,
            y,
            0,
            -1050,
            26,
            6,
            "laser"
        );


        createPlayerBullet(
            x -
            17,
            y,
            -70,
            -800,
            13,
            4,
            "energy"
        );


        createPlayerBullet(
            x +
            17,
            y,
            70,
            -800,
            13,
            4,
            "energy"
        );

    }


    /*
    LV6
    */

    else if (
        level === 6
    ) {

        for (
            let i = -2;
            i <= 2;
            i++
        ) {

            createPlayerBullet(
                x,
                y,
                i *
                100,
                -800,
                14,
                4,
                "plasma"
            );

        }

    }


    /*
    LV7
    */

    else if (
        level === 7
    ) {

        createPlayerBullet(
            x,
            y,
            0,
            -1000,
            32,
            7,
            "laser"
        );


        createPlayerBullet(
            x -
            20,
            y,
            -130,
            -820,
            15,
            4,
            "plasma"
        );


        createPlayerBullet(
            x +
            20,
            y,
            130,
            -820,
            15,
            4,
            "plasma"
        );

    }


    /*
    LV8
    */

    else if (
        level === 8
    ) {

        for (
            let i = -3;
            i <= 3;
            i++
        ) {

            createPlayerBullet(
                x,
                y,
                i *
                110,
                -800,
                16,
                4,
                "plasma"
            );

        }

    }


    /*
    LV9
    */

    else if (
        level === 9
    ) {

        createPlayerBullet(
            x,
            y,
            0,
            -1050,
            42,
            8,
            "fusion"
        );


        createPlayerBullet(
            x -
            17,
            y,
            -150,
            -820,
            18,
            5,
            "plasma"
        );


        createPlayerBullet(
            x +
            17,
            y,
            150,
            -820,
            18,
            5,
            "plasma"
        );


        createPlayerBullet(
            x -
            32,
            y,
            -240,
            -760,
            13,
            4,
            "energy"
        );


        createPlayerBullet(
            x +
            32,
            y,
            240,
            -760,
            13,
            4,
            "energy"
        );

    }


    /*
    LV10
    */

    else {

        createPlayerBullet(
            x,
            y,
            0,
            -1160,
            55,
            9,
            "omega"
        );


        for (
            let i = -3;
            i <= 3;
            i++
        ) {

            createPlayerBullet(
                x,
                y,
                i *
                110,
                -850,
                20,
                5,
                "omegaSpread"
            );

        }

    }

}


function updatePlayerBullets(
    dt
) {

    for (
        let i =
            playerBullets.length -
            1;
        i >= 0;
        i--
    ) {

        const bullet =
            playerBullets[i];


        bullet.x +=
            bullet.vx *
            dt;


        bullet.y +=
            bullet.vy *
            dt;


        bullet.life -=
            dt;


        if (
            bullet.life <=
            0 ||
            bullet.y <
                -100 ||
            bullet.x <
                -150 ||
            bullet.x >
                WIDTH +
                150
        ) {

            playerBullets.splice(
                i,
                1
            );

        }

    }

}


function drawPlayerBullets() {

    for (
        const bullet
        of playerBullets
    ) {

        let color =
            "#6eeaff";


        if (
            bullet.type ===
            "energy"
        ) {

            color =
                "#6dffcf";

        }


        if (
            bullet.type ===
            "plasma"
        ) {

            color =
                "#c681ff";

        }


        if (
            bullet.type ===
            "laser"
        ) {

            color =
                "#e4ffff";

        }


        if (
            bullet.type ===
            "fusion"
        ) {

            color =
                "#ffb94e";

        }


        if (
            bullet.type ===
            "omega" ||
            bullet.type ===
            "omegaSpread"
        ) {

            color =
                "#fff16a";

        }


        ctx.save();


        ctx.shadowColor =
            color;


        ctx.shadowBlur =
            18;


        ctx.fillStyle =
            color;


        if (
            bullet.type ===
                "laser" ||
            bullet.type ===
                "fusion" ||
            bullet.type ===
                "omega"
        ) {

            const length =
                bullet.type ===
                    "omega"
                    ? 62
                    : 40;


            ctx.fillRect(
                bullet.x -
                bullet.radius /
                2,

                bullet.y -
                length,

                bullet.radius,

                length *
                2
            );

        }

        else {

            ctx.beginPath();


            ctx.arc(
                bullet.x,
                bullet.y,
                bullet.radius,
                0,
                Math.PI *
                2
            );


            ctx.fill();

        }


        ctx.restore();

    }

}


/* ============================================================
   INIMIGOS
============================================================ */

const enemies = [];


function createEnemiesForStage() {

    enemies.length =
        0;


    const world =
        WORLDS[
            stage
        ] ||
        WORLDS[8];


    const rows =
        clamp(
            3 +
            Math.floor(
                stage /
                2
            ),
            3,
            5
        );


    const cols =
        clamp(
            5 +
            Math.floor(
                stage /
                1
            ),
            6,
            10
        );


    const spacing =
        Math.min(
            88,
            WIDTH /
            (
                cols +
                1
            )
        );


    const startX =
        WIDTH /
        2 -
        (
            cols -
            1
        ) *
        spacing /
        2;


    for (
        let row = 0;
        row < rows;
        row++
    ) {

        for (
            let col = 0;
            col < cols;
            col++
        ) {

            let type =
                "fighter";


            if (
                stage >=
                2 &&
                (
                    row +
                    col
                ) %
                5 ===
                0
            ) {

                type =
                    "shooter";

            }


            if (
                stage >=
                3 &&
                (
                    row *
                    2 +
                    col
                ) %
                7 ===
                0
            ) {

                type =
                    "hunter";

            }


            if (
                stage >=
                4 &&
                (
                    row +
                    col
                ) %
                8 ===
                0
            ) {

                type =
                    "tank";

            }


            const hp =
                getEnemyHealth(
                    type,
                    world
                );


            enemies.push({

                x:
                    startX +
                    col *
                    spacing,

                y:
                    95 +
                    row *
                    62,

                baseX:
                    startX +
                    col *
                    spacing,

                type,

                hp,

                maxHp:
                    hp,

                width:
                    type ===
                    "tank"
                        ? 64
                        : 46,

                height:
                    type ===
                    "tank"
                        ? 46
                        : 38,

                phase:
                    random(
                        0,
                        Math.PI *
                        2
                    ),

                time:
                    random(
                        0,
                        10
                    ),

                fire:
                    random(
                        1,
                        3
                    ),

                dead:
                    false

            });

        }

    }


    specialEnemy =
        null;


    specialTimer =
        stage >=
        2
            ? random(
                4,
                7
            )
            : 999;


    showMessage(
        world.name
    );

}


function getEnemyHealth(
    type,
    world
) {

    let base =
        35;


    if (
        type ===
        "shooter"
    ) {

        base =
            55;

    }


    if (
        type ===
        "hunter"
    ) {

        base =
            75;

    }


    if (
        type ===
        "tank"
    ) {

        base =
            180;

    }


    return (
        base *
        world.enemyMultiplier
    );

}


/* ============================================================
   UPDATE INIMIGOS
============================================================ */

function updateEnemies(
    dt
) {

    const world =
        WORLDS[
            stage
        ] ||
        WORLDS[8];


    for (
        const enemy
        of enemies
    ) {

        if (
            enemy.dead
        ) {

            continue;

        }


        enemy.time +=
            dt;


        /*
        FORMATION
        */

        if (
            world.enemyStyle ===
            "formation"
        ) {

            enemy.x =
                enemy.baseX +
                Math.sin(
                    enemy.time *
                    1.2 +
                    enemy.phase
                ) *
                25;

        }


        /*
        ZIGZAG
        */

        else if (
            world.enemyStyle ===
            "zigzag"
        ) {

            enemy.x =
                enemy.baseX +
                Math.sin(
                    enemy.time *
                    2 +
                    enemy.phase
                ) *
                75;


            enemy.y =
                160 +
                Math.sin(
                    enemy.time *
                    1.4 +
                    enemy.phase
                ) *
                38;

        }


        /*
        ORBITAL
        */

        else if (
            world.enemyStyle ===
            "orbital"
        ) {

            const radius =
                45 +
                (
                    enemy.phase %
                    60
                );


            enemy.x =
                enemy.baseX +
                Math.cos(
                    enemy.time *
                    1.5 +
                    enemy.phase
                ) *
                radius;


            enemy.y =
                150 +
                Math.sin(
                    enemy.time *
                    1.5 +
                    enemy.phase
                ) *
                radius *
                .45;

        }


        /*
        AGRESSIVE
        */

        else if (
            world.enemyStyle ===
            "aggressive"
        ) {

            enemy.x =
                enemy.baseX +
                Math.sin(
                    enemy.time *
                    2.5 +
                    enemy.phase
                ) *
                110;


            enemy.y =
                125 +
                Math.sin(
                    enemy.time *
                    2 +
                    enemy.phase
                ) *
                45;

        }


        /*
        CAOS
        */

        else if (
            world.enemyStyle ===
            "chaos"
        ) {

            enemy.x =
                enemy.baseX +
                Math.sin(
                    enemy.time *
                    3 +
                    enemy.phase
                ) *
                130;


            enemy.y =
                120 +
                Math.cos(
                    enemy.time *
                    2.7 +
                    enemy.phase
                ) *
                60;

        }


        /*
        ESPIRAL
        */

        else if (
            world.enemyStyle ===
            "spiral"
        ) {

            const radius =
                50 +
                enemy.phase *
                3;


            enemy.x =
                WIDTH /
                2 +
                Math.cos(
                    enemy.time *
                    .9 +
                    enemy.phase
                ) *
                (
                    130 +
                    radius
                );


            enemy.y =
                170 +
                Math.sin(
                    enemy.time *
                    .9 +
                    enemy.phase
                ) *
                60;

        }


        /*
        STORM
        */

        else if (
            world.enemyStyle ===
            "storm"
        ) {

            enemy.x =
                enemy.baseX +
                Math.sin(
                    enemy.time *
                    4 +
                    enemy.phase
                ) *
                150;


            enemy.y =
                110 +
                Math.sin(
                    enemy.time *
                    3 +
                    enemy.phase
                ) *
                70;

        }


        /*
        FINAL
        */

        else {

            enemy.x =
                WIDTH /
                2 +
                Math.sin(
                    enemy.time *
                    3 +
                    enemy.phase
                ) *
                250;


            enemy.y =
                130 +
                Math.cos(
                    enemy.time *
                    2 +
                    enemy.phase
                ) *
                80;

        }


        enemy.fire -=
            dt;


        if (
            enemy.fire <=
            0
        ) {

            fireEnemy(
                enemy
            );


            enemy.fire =
                getEnemyFireDelay(
                    enemy.type,
                    world
                );

        }

    }

}


function getEnemyFireDelay(
    type,
    world
) {

    let min =
        2.2;


    let max =
        4.0;


    if (
        type ===
        "shooter"
    ) {

        min =
            1.4;

        max =
            2.6;

    }


    if (
        type ===
        "hunter"
    ) {

        min =
            1.8;

        max =
            3.0;

    }


    if (
        type ===
        "tank"
    ) {

        min =
            3.0;

        max =
            5.0;

    }


    return random(
        min,
        max
    ) /
    world.fireMultiplier;

}


function fireEnemy(
    enemy
) {

    const dx =
        player.x -
        enemy.x;


    const dy =
        player.y -
        enemy.y;


    const angle =
        Math.atan2(
            dy,
            dx
        );


    /*
    Pequena variação.
    */

    const finalAngle =
        angle +
        random(
            -.3,
            .3
        );


    let speed =
        270;


    if (
        enemy.type ===
        "tank"
    ) {

        speed =
            205;

    }


    if (
        enemy.type ===
        "hunter"
    ) {

        speed =
            310;

    }


    enemyBullets.push({

        x:
            enemy.x,

        y:
            enemy.y,

        vx:
            Math.cos(
                finalAngle
            ) *
            speed,

        vy:
            Math.sin(
                finalAngle
            ) *
            speed,

        radius:
            enemy.type ===
                "tank"
                ? 7
                : 5,

        damage:
            enemy.type ===
                "tank"
                ? 14 +
                  stage
                : 7 +
                  stage,

        type:
            enemy.type

    });


    /*
    Shooter pode criar
    um segundo disparo
    com direção diferente.
    */

    if (
        enemy.type ===
        "shooter" &&
        Math.random() <
        .25
    ) {

        const second =
            finalAngle +
            random(
                -.55,
                .55
            );


        enemyBullets.push({

            x:
                enemy.x,

            y:
                enemy.y,

            vx:
                Math.cos(
                    second
                ) *
                230,

            vy:
                Math.sin(
                    second
                ) *
                230,

            radius:
                4,

            damage:
                6 +
                stage,

            type:
                "side"

        });

    }

}


/* ============================================================
   DRAW INIMIGOS
============================================================ */

function drawEnemies() {

    for (
        const enemy
        of enemies
    ) {

        if (
            enemy.dead
        ) {

            continue;

        }


        const x =
            enemy.x;


        const y =
            enemy.y;


        let main =
            "#a93252";


        let glow =
            "#ff5476";


        if (
            enemy.type ===
            "shooter"
        ) {

            main =
                "#6a36a0";

            glow =
                "#bd6aff";

        }


        if (
            enemy.type ===
            "hunter"
        ) {

            main =
                "#126f82";

            glow =
                "#50eaff";

        }


        if (
            enemy.type ===
            "tank"
        ) {

            main =
                "#87471c";

            glow =
                "#ffaf4d";

        }


        ctx.save();


        ctx.translate(
            x,
            y
        );


        ctx.shadowColor =
            glow;


        ctx.shadowBlur =
            17;


        ctx.fillStyle =
            main;


        ctx.strokeStyle =
            glow;


        ctx.lineWidth =
            2;


        if (
            enemy.type ===
            "tank"
        ) {

            ctx.beginPath();


            ctx.moveTo(
                0,
                -28
            );


            ctx.lineTo(
                31,
                -8
            );


            ctx.lineTo(
                25,
                23
            );


            ctx.lineTo(
                0,
                30
            );


            ctx.lineTo(
                -25,
                23
            );


            ctx.lineTo(
                -31,
                -8
            );


            ctx.closePath();


            ctx.fill();


            ctx.stroke();

        }


        else if (
            enemy.type ===
            "shooter"
        ) {

            ctx.beginPath();


            ctx.moveTo(
                0,
                -25
            );


            ctx.lineTo(
                26,
                0
            );


            ctx.lineTo(
                0,
                25
            );


            ctx.lineTo(
                -26,
                0
            );


            ctx.closePath();


            ctx.fill();


            ctx.stroke();

        }


        else if (
            enemy.type ===
            "hunter"
        ) {

            ctx.beginPath();


            ctx.moveTo(
                0,
                -27
            );


            ctx.lineTo(
                28,
                20
            );


            ctx.lineTo(
                0,
                8
            );


            ctx.lineTo(
                -28,
                20
            );


            ctx.closePath();


            ctx.fill();


            ctx.stroke();

        }


        else {

            ctx.beginPath();


            ctx.moveTo(
                0,
                -23
            );


            ctx.lineTo(
                22,
                17
            );


            ctx.lineTo(
                0,
                8
            );


            ctx.lineTo(
                -22,
                17
            );


            ctx.closePath();


            ctx.fill();


            ctx.stroke();

        }


        ctx.fillStyle =
            "#ffffff";


        ctx.beginPath();


        ctx.arc(
            0,
            -3,
            4,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.restore();


        /*
        barra
        */

        if (
            enemy.hp <
            enemy.maxHp
        ) {

            const width =
                enemy.width;


            ctx.fillStyle =
                "rgba(0,0,0,.6)";


            ctx.fillRect(
                enemy.x -
                width /
                2,

                enemy.y -
                enemy.height /
                2 -
                8,

                width,

                4
            );


            ctx.fillStyle =
                glow;


            ctx.fillRect(
                enemy.x -
                width /
                2,

                enemy.y -
                enemy.height /
                2 -
                8,

                width *
                clamp(
                    enemy.hp /
                    enemy.maxHp,

                    0,
                    1
                ),

                4
            );

        }

    }

}


/* ============================================================
   INIMIGO ESPECIAL
============================================================ */

function updateSpecialEnemy(
    dt
) {

    if (
        stage <
        2 ||
        stageState !==
        "enemies"
    ) {

        return;

    }


    specialTimer -=
        dt;


    if (
        !specialEnemy &&
        specialTimer <=
        0
    ) {

        createSpecialEnemy();

    }


    if (
        !specialEnemy
    ) {

        return;

    }


    const e =
        specialEnemy;


    e.time +=
        dt;


    e.x +=
        e.vx *
        dt;


    e.y +=
        Math.sin(
            e.time *
            5
        ) *
        80 *
        dt;


    e.fire -=
        dt;


    if (
        e.fire <=
        0
    ) {

        specialFire(
            e
        );


        e.fire =
            random(
                .45,
                .85
            );

    }


    /*
    Depois de atravessar:
    sobe e desaparece.
    */

    if (
        e.time >
        2.7
    ) {

        e.y -=
            480 *
            dt;

    }


    if (
        e.x <
            -180 ||
        e.x >
            WIDTH +
            180 ||
        e.y <
            -180
    ) {

        specialEnemy =
            null;


        specialTimer =
            random(
                6,
                11
            );

    }

}


function createSpecialEnemy() {

    const left =
        Math.random() <
        .5;


    specialEnemy = {

        x:
            left
                ? -110
                : WIDTH +
                  110,

        y:
            random(
                HEIGHT *
                .25,

                HEIGHT *
                .52
            ),

        vx:
            left
                ? 350
                : -350,

        time:
            0,

        fire:
            .5,

        radius:
            24,

        hp:
            100 +
            stage *
            20

    };

}


function specialFire(
    enemy
) {

    const angle =
        Math.atan2(
            player.y -
            enemy.y,

            player.x -
            enemy.x
        ) +
        random(
            -.3,
            .3
        );


    enemyBullets.push({

        x:
            enemy.x,

        y:
            enemy.y,

        vx:
            Math.cos(angle) *
            330,

        vy:
            Math.sin(angle) *
            330,

        radius:
            6,

        damage:
            10 +
            stage,

        type:
            "special"

    });

}


function drawSpecialEnemy() {

    if (
        !specialEnemy
    ) {

        return;

    }


    const e =
        specialEnemy;


    ctx.save();


    ctx.translate(
        e.x,
        e.y
    );


    ctx.shadowColor =
        "#ffd15b";


    ctx.shadowBlur =
        25;


    ctx.fillStyle =
        "#8a4a12";


    ctx.strokeStyle =
        "#ffd65e";


    ctx.lineWidth =
        2;


    /*
    asa esquerda
    */

    ctx.beginPath();


    ctx.moveTo(
        0,
        0
    );


    ctx.lineTo(
        -44,
        -24
    );


    ctx.lineTo(
        -26,
        0
    );


    ctx.lineTo(
        -44,
        24
    );


    ctx.lineTo(
        0,
        8
    );


    ctx.closePath();


    ctx.fill();


    ctx.stroke();


    /*
    asa direita
    */

    ctx.beginPath();


    ctx.moveTo(
        0,
        0
    );


    ctx.lineTo(
        44,
        -24
    );


    ctx.lineTo(
        26,
        0
    );


    ctx.lineTo(
        44,
        24
    );


    ctx.lineTo(
        0,
        8
    );


    ctx.closePath();


    ctx.fill();


    ctx.stroke();


    /*
    corpo
    */

    ctx.fillStyle =
        "#f08a2c";


    ctx.beginPath();


    ctx.moveTo(
        e.vx > 0
            ? 40
            : -40,
        0
    );


    ctx.lineTo(
        5,
        -15
    );


    ctx.lineTo(
        -28,
        -8
    );


    ctx.lineTo(
        -28,
        8
    );


    ctx.lineTo(
        5,
        15
    );


    ctx.closePath();


    ctx.fill();


    ctx.stroke();


    /*
    núcleo
    */

    ctx.fillStyle =
        "#fff2a8";


    ctx.beginPath();


    ctx.arc(
        e.vx > 0
            ? 6
            : -6,
        0,
        6,
        0,
        Math.PI *
        2
    );


    ctx.fill();


    ctx.restore();

}


/* ============================================================
   TIROS DOS INIMIGOS
============================================================ */

const enemyBullets = [];


function updateEnemyBullets(
    dt
) {

    for (
        let i =
            enemyBullets.length -
            1;
        i >= 0;
        i--
    ) {

        const bullet =
            enemyBullets[i];


        bullet.x +=
            bullet.vx *
            dt;


        bullet.y +=
            bullet.vy *
            dt;


        if (
            bullet.x <
                -100 ||
            bullet.x >
                WIDTH +
                100 ||
            bullet.y <
                -100 ||
            bullet.y >
                HEIGHT +
                100
        ) {

            enemyBullets.splice(
                i,
                1
            );

            continue;

        }


        if (
            player.invulnerable <=
            0
        ) {

            if (
                dist(
                    bullet.x,
                    bullet.y,
                    player.x,
                    player.y
                )
                <
                28 +
                bullet.radius
            ) {

                enemyBullets.splice(
                    i,
                    1
                );


                damagePlayer(
                    bullet.damage
                );

            }

        }

    }

}


function drawEnemyBullets() {

    for (
        const bullet
        of enemyBullets
    ) {

        let color =
            "#ff526f";


        if (
            bullet.type ===
            "shooter"
        ) {

            color =
                "#c070ff";

        }


        if (
            bullet.type ===
            "hunter"
        ) {

            color =
                "#52eaff";

        }


        if (
            bullet.type ===
            "tank"
        ) {

            color =
                "#ffad4f";

        }


        if (
            bullet.type ===
            "boss"
        ) {

            color =
                "#ff50d8";

        }


        if (
            bullet.type ===
            "bossHeavy"
        ) {

            color =
                "#ff9843";

        }


        if (
            bullet.type ===
            "special"
        ) {

            color =
                "#ffe46d";

        }


        ctx.save();


        ctx.shadowColor =
            color;


        ctx.shadowBlur =
            18;


        ctx.fillStyle =
            color;


        ctx.beginPath();


        ctx.arc(
            bullet.x,
            bullet.y,
            bullet.radius,
            0,
            Math.PI *
            2
        );


        ctx.fill();


        ctx.restore();

    }

}


/* ============================================================
   POWER UPS
============================================================ */

const powerUps = [];


function createPowerUp(
    x,
    y
) {

    powerUps.push({

        x,

        y,

        speed:
            95,

        pulse:
            random(
                0,
                Math.PI *
                2
            ),

        rotation:
            0,

        life:
            15,

        radius:
            16

    });

}


function updatePowerUps(
    dt
) {

    for (
        let i =
            powerUps.length -
            1;
        i >= 0;
        i--
    ) {

        const power =
            powerUps[i];


        power.y +=
            power.speed *
            dt;


        power.rotation +=
            dt *
            3;


        power.pulse +=
            dt *
            5;


        power.life -=
            dt;


        if (
            power.life <=
            0 ||
            power.y >
                HEIGHT +
                60
        ) {

            powerUps.splice(
                i,
                1
            );

            continue;

        }


        if (
            dist(
                power.x,
                power.y,
                player.x,
                player.y
            )
            <
            43
        ) {

            upgradeWeapon();


            powerUps.splice(
                i,
                1
            );

        }

    }

}


function drawPowerUps() {

    for (
        const p
        of powerUps
    ) {

        const pulse =
            1 +
            Math.sin(
                p.pulse
            ) *
            .1;


        ctx.save();


        ctx.translate(
            p.x,
            p.y
        );


        ctx.rotate(
            p.rotation
        );


        ctx.scale(
            pulse,
            pulse
        );


        ctx.shadowColor =
            "#5cecff";


        ctx.shadowBlur =
            25;


        ctx.strokeStyle =
            "#a8f9ff";


        ctx.lineWidth =
            3;


        ctx.beginPath();


        ctx.moveTo(
            0,
            -16
        );


        ctx.lineTo(
            16,
            0
        );


        ctx.lineTo(
            0,
            16
        );


        ctx.lineTo(
            -16,
            0
        );


        ctx.closePath();


        ctx.stroke();


        ctx.fillStyle =
            "#ffffff";


        ctx.font =
            "bold 17px Arial";


        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "middle";


        ctx.fillText(
            "↑",
            0,
            0
        );


        ctx.restore();

    }

}


/* ============================================================
   UPGRADE
============================================================ */

function upgradeWeapon() {

    if (
        player.weapon <
        10
    ) {

        player.weapon++;

        score +=
            200;


        showMessage(
            "ARMA LV " +
            player.weapon +
            " — " +
            getWeaponName()
        );

    }

    else {

        player.hp =
            Math.min(
                player.maxHp,
                player.hp +
                20
            );

        score +=
            500;

    }


    updateHUD();

}


function getWeaponName() {

    const names = [

        "PULSO",

        "DUPLO",

        "TRIPLO",

        "QUÁDRUPLO",

        "LASER",

        "LASER DUPLO",

        "PLASMA",

        "PLASMA SPREAD",

        "FUSÃO",

        "OMEGA"

    ];


    return names[
        player.weapon -
        1
    ];

}


/* ============================================================
   DANO PLAYER
============================================================ */

function damagePlayer(
    amount
) {

    if (
        player.invulnerable >
        0
    ) {

        return;

    }


    player.hp -=
        amount;


    player.hp =
        Math.max(
            0,
            player.hp
        );


    /*
    REGRA:
    Qualquer dano reseta
    TODA a arma.
    */

    if (
        player.weapon >
        1
    ) {

        player.weapon =
            1;


        showMessage(
            "ARMA PERDIDA — LV 1"
        );

    }


    player.invulnerable =
        1;


    shake =
        13;


    createExplosion(
        player.x,
        player.y,
        18
    );


    updateHUD();


    if (
        player.hp <=
        0
    ) {

        endGame();

    }

}


/* ============================================================
   BOSS
============================================================ */

function createBoss() {

    const type =
        (
            stage -
            1
        ) % 8;


    const hp =
        3000 +
        stage *
        900;


    boss = {

        x:
            WIDTH /
            2,

        y:
            -180,

        targetY:
            HEIGHT *
            .25,

        hp:
            hp,

        maxHp:
            hp,

        radius:
            125,

        phase:
            0,

        fire:
            1,

        special:
            3.5,

        type,

        entering:
            true,

        dead:
            false

    };


    showMessage(
        "CHEFÃO — " +
        stage
    );

}


/* ============================================================
   UPDATE BOSS
============================================================ */

function updateBoss(
    dt
) {

    if (
        !boss ||
        boss.dead
    ) {

        return;

    }


    boss.phase +=
        dt;


    if (
        boss.entering
    ) {

        boss.y +=
            110 *
            dt;


        if (
            boss.y >=
            boss.targetY
        ) {

            boss.y =
                boss.targetY;


            boss.entering =
                false;

        }


        return;

    }


    /*
    tipos de movimento
    */

    if (
        boss.type % 4 ===
        0
    ) {

        boss.x =
            WIDTH /
            2 +
            Math.sin(
                boss.phase *
                .7
            ) *
            WIDTH *
            .27;

    }


    else if (
        boss.type % 4 ===
        1
    ) {

        boss.x =
            WIDTH /
            2 +
            Math.sin(
                boss.phase
            ) *
            WIDTH *
            .30;


        boss.y =
            boss.targetY +
            Math.sin(
                boss.phase *
                1.2
            ) *
            35;

    }


    else if (
        boss.type % 4 ===
        2
    ) {

        boss.x =
            WIDTH /
            2 +
            Math.cos(
                boss.phase *
                .8
            ) *
            WIDTH *
            .32;


        boss.y =
            boss.targetY +
            Math.sin(
                boss.phase *
                1.4
            ) *
            50;

    }


    else {

        boss.x =
            WIDTH /
            2 +
            Math.sin(
                boss.phase *
                1.2
            ) *
            WIDTH *
            .34;


        boss.y =
            boss.targetY +
            Math.cos(
                boss.phase *
                1.5
            ) *
            60;

    }


    /*
    ataque normal
    */

    boss.fire -=
        dt;


    if (
        boss.fire <=
        0
    ) {

        bossAttack();


        boss.fire =
            Math.max(
                .65,
                1.45 -
                stage *
                .045
            );

    }


    /*
    especial
    */

    boss.special -=
        dt;


    if (
        boss.special <=
        0
    ) {

        bossSpecial();


        boss.special =
            Math.max(
                2.8,
                5 -
                stage *
                .12
            );

    }


    if (
        boss.hp <=
        0
    ) {

        killBoss();

    }

}


/* ============================================================
   ATAQUE NORMAL BOSS
============================================================ */

function bossAttack() {

    if (!boss) {
        return;
    }


    const x =
        boss.x;


    const y =
        boss.y +
        65;


    /*
    Padrão diferente por chefe.
    */

    const pattern =
        boss.type %
        4;


    if (
        pattern ===
        0
    ) {

        for (
            let i = -2;
            i <= 2;
            i++
        ) {

            const angle =
                Math.PI /
                2 +
                i *
                .16;


            enemyBullets.push({

                x,

                y,

                vx:
                    Math.cos(angle) *
                    250,

                vy:
                    Math.sin(angle) *
                    250,

                radius:
                    6,

                damage:
                    11 +
                    stage,

                type:
                    "boss"

            });

        }

    }


    else if (
        pattern ===
        1
    ) {

        const angle =
            Math.atan2(
                player.y -
                y,
                player.x -
                x
            );


        for (
            let i = -1;
            i <= 1;
            i++
        ) {

            const a =
                angle +
                i *
                .17;


            enemyBullets.push({

                x,

                y,

                vx:
                    Math.cos(a) *
                    320,

                vy:
                    Math.sin(a) *
                    320,

                radius:
                    7,

                damage:
                    13 +
                    stage,

                type:
                    "boss"

            });

        }

    }


    else if (
        pattern ===
        2
    ) {

        for (
            let i = 0;
            i < 8;
            i++
        ) {

            const angle =
                Math.PI /
                2 +
                (
                    i -
                    4
                ) *
                .17;


            enemyBullets.push({

                x,

                y,

                vx:
                    Math.cos(
                        angle
                    ) *
                    290,

                vy:
                    Math.sin(
                        angle
                    ) *
                    290,

                radius:
                    5,

                damage:
                    11,

                type:
                    "boss"

            });

        }

    }


    else {

        const angle =
            Math.atan2(
                player.y -
                y,
                player.x -
                x
            );


        for (
            let i = -2;
            i <= 2;
            i++
        ) {

            const a =
                angle +
                i *
                .14;


            enemyBullets.push({

                x,

                y,

                vx:
                    Math.cos(a) *
                    350,

                vy:
                    Math.sin(a) *
                    350,

                radius:
                    6,

                damage:
                    14,

                type:
                    "boss"

            });

        }

    }

}


/* ============================================================
   ATAQUE ESPECIAL
============================================================ */

function bossSpecial() {

    if (!boss) {
        return;
    }


    const count =
        boss.type %
        2 ===
        0
            ? 12
            : 16;


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const angle =
            gameTime *
            .7 +
            (
                Math.PI *
                2 *
                i /
                count
            );


        const speed =
            180 +
            stage *
            5;


        enemyBullets.push({

            x:
                boss.x,

            y:
                boss.y,

            vx:
                Math.cos(
                    angle
                ) *
                speed,

            vy:
                Math.sin(
                    angle
                ) *
                speed,

            radius:
                boss.type >=
                    4
                    ? 6
                    : 5,

            damage:
                8 +
                stage,

            type:
                "boss"

        });

    }

}


/* ============================================================
   DESENHO DO BOSS
============================================================ */

function drawBoss() {

    if (
        !boss ||
        boss.dead
    ) {

        return;

    }


    ctx.save();


    ctx.translate(
        boss.x,
        boss.y
    );


    const type =
        boss.type % 4;


    if (
        type ===
        0
    ) {

        drawBossGuardian();

    }


    else if (
        type ===
        1
    ) {

        drawBossPredator();

    }


    else if (
        type ===
        2
    ) {

        drawBossMachine();

    }


    else {

        drawBossTitan();

    }


    ctx.restore();


    drawBossHealth();

}


/* ============================================================
   BOSS GUARDIAN
============================================================ */

function drawBossGuardian() {

    ctx.shadowColor =
        "#c654ff";


    ctx.shadowBlur =
        32;


    ctx.fillStyle =
        "#451860";


    ctx.strokeStyle =
        "#d681ff";


    ctx.lineWidth =
        3;


    /*
    asas
    */

    for (
        const side
        of [-1, 1]
    ) {

        ctx.beginPath();


        ctx.moveTo(
            side * 25,
            -30
        );


        ctx.bezierCurveTo(
            side * 85,
            -80,
            side * 125,
            -40,
            side * 115,
            20
        );


        ctx.bezierCurveTo(
            side * 90,
            55,
            side * 55,
            42,
            side * 30,
            22
        );


        ctx.closePath();


        ctx.fill();


        ctx.stroke();

    }


    drawBossBody(
        "#df80ff",
        "#1a0625"
    );

}


/* ============================================================
   BOSS PREDATOR
============================================================ */

function drawBossPredator() {

    ctx.shadowColor =
        "#ff3f70";


    ctx.shadowBlur =
        34;


    ctx.fillStyle =
        "#4a1229";


    ctx.strokeStyle =
        "#ff6f8d";


    ctx.lineWidth =
        3;


    ctx.beginPath();


    ctx.moveTo(
        0,
        -90
    );


    ctx.bezierCurveTo(
        -70,
        -50,
        -85,
        35,
        0,
        88
    );


    ctx.bezierCurveTo(
        85,
        35,
        70,
        -50,
        0,
        -90
    );


    ctx.closePath();


    ctx.fill();


    ctx.stroke();


    /*
    espinhos
    */

    for (
        const side
        of [-1, 1]
    ) {

        ctx.beginPath();


        ctx.moveTo(
            side * 45,
            -30
        );


        ctx.lineTo(
            side * 135,
            -60
        );


        ctx.lineTo(
            side * 105,
            5
        );


        ctx.lineTo(
            side * 145,
            40
        );


        ctx.lineTo(
            side * 50,
            30
        );


        ctx.closePath();


        ctx.fill();


        ctx.stroke();

    }


    drawBossCore(
        "#ff486d"
    );

}


/* ============================================================
   BOSS MACHINE
============================================================ */

function drawBossMachine() {

    ctx.shadowColor =
        "#48eaff";


    ctx.shadowBlur =
        35;


    ctx.fillStyle =
        "#123f52";


    ctx.strokeStyle =
        "#68ecff";


    ctx.lineWidth =
        3;


    ctx.beginPath();


    ctx.ellipse(
        0,
        0,
        105,
        72,
        0,
        0,
        Math.PI *
        2
    );


    ctx.fill();


    ctx.stroke();


    /*
    anéis
    */

    ctx.globalAlpha =
        .55;


    ctx.beginPath();


    ctx.ellipse(
        0,
        0,
        140,
        32,
        .15,
        0,
        Math.PI *
        2
    );


    ctx.stroke();


    ctx.beginPath();


    ctx.ellipse(
        0,
        0,
        70,
        110,
        -.2,
        0,
        Math.PI *
        2
    );


    ctx.stroke();


    ctx.globalAlpha =
        1;


    drawBossCore(
        "#48eaff"
    );

}


/* ============================================================
   BOSS TITAN
============================================================ */

function drawBossTitan() {

    ctx.shadowColor =
        "#ffad4a";


    ctx.shadowBlur =
        42;


    ctx.fillStyle =
        "#48210c";


    ctx.strokeStyle =
        "#ffc05e";


    ctx.lineWidth =
        4;


    ctx.beginPath();


    ctx.moveTo(
        0,
        -92
    );


    ctx.bezierCurveTo(
        -65,
        -65,
        -80,
        20,
        -52,
        60
    );


    ctx.bezierCurveTo(
        -20,
        95,
        20,
        95,
        52,
        60
    );


    ctx.bezierCurveTo(
        80,
        20,
        65,
        -65,
        0,
        -92
    );


    ctx.closePath();


    ctx.fill();


    ctx.stroke();


    /*
    braços
    */

    for (
        const side
        of [-1, 1]
    ) {

        ctx.beginPath();


        ctx.moveTo(
            side * 40,
            -15
        );


        ctx.lineTo(
            side * 140,
            -70
        );


        ctx.lineTo(
            side * 110,
            0
        );


        ctx.lineTo(
            side * 150,
            35
        );


        ctx.lineTo(
            side * 50,
            30
        );


        ctx.closePath();


        ctx.fill();


        ctx.stroke();

    }


    drawBossCore(
        "#ffb64d"
    );

}


/* ============================================================
   CORPO / CORE
============================================================ */

function drawBossBody(
    main,
    dark
) {

    const gradient =
        ctx.createRadialGradient(
            -20,
            -25,
            2,
            0,
            0,
            100
        );


    gradient.addColorStop(
        0,
        main
    );


    gradient.addColorStop(
        .5,
        main
    );


    gradient.addColorStop(
        1,
        dark
    );


    ctx.fillStyle =
        gradient;


    ctx.beginPath();


    ctx.moveTo(
        0,
        -80
    );


    ctx.bezierCurveTo(
        -55,
        -60,
        -72,
        -10,
        -55,
        35
    );


    ctx.bezierCurveTo(
        -35,
        75,
        -10,
        82,
        0,
        87
    );


    ctx.bezierCurveTo(
        10,
        82,
        35,
        75,
        55,
        35
    );


    ctx.bezierCurveTo(
        72,
        -10,
        55,
        -60,
        0,
        -80
    );


    ctx.closePath();


    ctx.fill();


    ctx.stroke();


    drawBossCore(
        main
    );

}


function drawBossCore(
    color
) {

    const core =
        ctx.createRadialGradient(
            -5,
            -5,
            2,
            0,
            0,
            38
        );


    core.addColorStop(
        0,
        "#ffffff"
    );


    core.addColorStop(
        .18,
        color
    );


    core.addColorStop(
        .55,
        color
    );


    core.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );


    ctx.shadowColor =
        color;


    ctx.shadowBlur =
        45;


    ctx.fillStyle =
        core;


    ctx.beginPath();


    ctx.arc(
        0,
        0,
        35 +
        Math.sin(
            gameTime *
            6
        ) *
        3,
        0,
        Math.PI *
        2
    );


    ctx.fill();


    ctx.fillStyle =
        "#ffffff";


    ctx.beginPath();


    ctx.arc(
        0,
        0,
        8,
        0,
        Math.PI *
        2
    );


    ctx.fill();

}


/* ============================================================
   BOSS HP
============================================================ */

function drawBossHealth() {

    if (!boss) {
        return;
    }


    const width =
        Math.min(
            620,
            WIDTH *
            .55
        );


    const height =
        14;


    const x =
        WIDTH /
        2 -
        width /
        2;


    const y =
        70;


    const percent =
        clamp(
            boss.hp /
            boss.maxHp,
            0,
            1
        );


    ctx.save();


    ctx.fillStyle =
        "rgba(0,0,0,.75)";


    ctx.fillRect(
        x,
        y,
        width,
        height
    );


    const gradient =
        ctx.createLinearGradient(
            x,
            y,
            x +
            width,
            y
        );


    gradient.addColorStop(
        0,
        "#ff315b"
    );


    gradient.addColorStop(
        .5,
        "#bf3dff"
    );


    gradient.addColorStop(
        1,
        "#ffa144"
    );


    ctx.fillStyle =
        gradient;


    ctx.fillRect(
        x,
        y,
        width *
        percent,
        height
    );


    ctx.strokeStyle =
        "rgba(255,255,255,.35)";


    ctx.strokeRect(
        x,
        y,
        width,
        height
    );


    ctx.fillStyle =
        "#ffffff";


    ctx.font =
        "bold 10px Arial";


    ctx.textAlign =
        "center";


    ctx.fillText(
        WORLDS[
            stage
        ]?.name ||
        "CHEFÃO",
        WIDTH /
        2,
        y -
        7
    );


    ctx.restore();

}


/* ============================================================
   COLISÕES
============================================================ */

function handleCollisions() {

    /*
    player bullets -> enemy
    */

    for (
        let i =
            playerBullets.length -
            1;
        i >= 0;
        i--
    ) {

        const bullet =
            playerBullets[i];


        let consumed =
            false;


        for (
            const enemy
            of enemies
        ) {

            if (
                enemy.dead
            ) {

                continue;

            }


            if (
                dist(
                    bullet.x,
                    bullet.y,
                    enemy.x,
                    enemy.y
                )
                <
                28 +
                bullet.radius
            ) {

                enemy.hp -=
                    bullet.damage;


                createExplosion(
                    bullet.x,
                    bullet.y,
                    3,
                    .35
                );


                playerBullets.splice(
                    i,
                    1
                );


                consumed =
                    true;


                if (
                    enemy.hp <=
                    0
                ) {

                    killEnemy(
                        enemy
                    );

                }


                break;

            }

        }


        if (
            consumed
        ) {

            continue;

        }


        /*
        special
        */

        if (
            specialEnemy
        ) {

            if (
                dist(
                    bullet.x,
                    bullet.y,
                    specialEnemy.x,
                    specialEnemy.y
                )
                <
                30
            ) {

                specialEnemy.hp -=
                    bullet.damage;


                playerBullets.splice(
                    i,
                    1
                );


                createExplosion(
                    specialEnemy.x,
                    specialEnemy.y,
                    5
                );


                if (
                    specialEnemy.hp <=
                    0
                ) {

                    score +=
                        700;


                    createExplosion(
                        specialEnemy.x,
                        specialEnemy.y,
                        30,
                        1.4
                    );


                    specialEnemy =
                        null;

                }


                continue;

            }

        }


        /*
        boss
        */

        if (
            boss &&
            !boss.dead &&
            !boss.entering
        ) {

            if (
                dist(
                    bullet.x,
                    bullet.y,
                    boss.x,
                    boss.y
                )
                <
                105 +
                bullet.radius
            ) {

                boss.hp -=
                    bullet.damage;


                playerBullets.splice(
                    i,
                    1
                );


                createHit(
                    bullet.x,
                    bullet.y
                );


                if (
                    boss.hp <=
                    0
                ) {

                    killBoss();

                }

            }

        }

    }


    /*
    player -> enemies
    */

    for (
        const enemy
        of enemies
    ) {

        if (
            enemy.dead
        ) {

            continue;

        }


        if (
            dist(
                player.x,
                player.y,
                enemy.x,
                enemy.y
            )
            <
            47
        ) {

            killEnemy(
                enemy
            );


            damagePlayer(
                25
            );

        }

    }

}


/* ============================================================
   KILL ENEMY
============================================================ */

function killEnemy(
    enemy
) {

    if (
        enemy.dead
    ) {

        return;

    }


    enemy.dead =
        true;


    let value =
        100;


    if (
        enemy.type ===
        "shooter"
    ) {

        value =
            170;

    }


    if (
        enemy.type ===
        "hunter"
    ) {

        value =
            230;

    }


    if (
        enemy.type ===
        "tank"
    ) {

        value =
            350;

    }


    score +=
        value;


    createExplosion(
        enemy.x,
        enemy.y,
        enemy.type ===
            "tank"
            ? 26
            : 15
    );


    /*
    Drop.
    */

    let chance =
        .14;


    if (
        enemy.type ===
        "tank"
    ) {

        chance =
            .28;

    }


    if (
        Math.random() <
        chance &&
        player.weapon <
        10
    ) {

        createPowerUp(
            enemy.x,
            enemy.y
        );

    }

}


/* ============================================================
   HIT
============================================================ */

function createHit(
    x,
    y
) {

    createExplosion(
        x,
        y,
        4,
        .35
    );

}


/* ============================================================
   EXPLOSÕES
============================================================ */

const explosions = [];


function createExplosion(
    x,
    y,
    amount = 15,
    scale = 1
) {

    const particles =
        [];


    for (
        let i = 0;
        i < amount;
        i++
    ) {

        const angle =
            random(
                0,
                Math.PI *
                2
            );


        const speed =
            random(
                50,
                270
            ) *
            scale;


        particles.push({

            x:
                0,

            y:
                0,

            vx:
                Math.cos(
                    angle
                ) *
                speed,

            vy:
                Math.sin(
                    angle
                ) *
                speed,

            size:
                random(
                    1,
                    5
                )

        });

    }


    explosions.push({

        x,

        y,

        life:
            .75,

        maxLife:
            .75,

        radius:
            8,

        maxRadius:
            random(
                45,
                80
            ) *
            scale,

        particles

    });

}


function updateExplosions(
    dt
) {

    for (
        let i =
            explosions.length -
            1;
        i >= 0;
        i--
    ) {

        const e =
            explosions[i];


        e.life -=
            dt;


        for (
            const p
            of e.particles
        ) {

            p.x +=
                p.vx *
                dt;


            p.y +=
                p.vy *
                dt;


            p.vx *=
                .96;


            p.vy *=
                .96;

        }


        if (
            e.life <=
            0
        ) {

            explosions.splice(
                i,
                1
            );

        }

    }

}


function drawExplosions() {

    for (
        const e
        of explosions
    ) {

        const alpha =
            e.life /
            e.maxLife;


        const progress =
            1 -
            alpha;


        ctx.save();


        ctx.globalAlpha =
            alpha;


        ctx.strokeStyle =
            "#71eaff";


        ctx.shadowColor =
            "#3bdcff";


        ctx.shadowBlur =
            18;


        ctx.lineWidth =
            3;


        ctx.beginPath();


        ctx.arc(
            e.x,
            e.y,
            e.radius +
            (
                e.maxRadius -
                e.radius
            ) *
            progress,
            0,
            Math.PI *
            2
        );


        ctx.stroke();


        for (
            const p
            of e.particles
        ) {

            ctx.fillStyle =
                "#edffff";


            ctx.beginPath();


            ctx.arc(
                e.x +
                p.x,

                e.y +
                p.y,

                p.size,

                0,
                Math.PI *
                2
            );


            ctx.fill();

        }


        ctx.restore();

    }

}


/* ============================================================
   FASE
============================================================ */

function startStage() {

    stageState =
        "enemies";


    stageTransitionTimer =
        0;


    boss =
        null;


    specialEnemy =
        null;


    playerBullets.length =
        0;


    enemyBullets.length =
        0;


    powerUps.length =
        0;


    createEnemiesForStage();


    updateHUD();

}


function updateStage(
    dt
) {

    /*
    batalha
    */

    if (
        stageState ===
        "enemies"
    ) {

        for (
            let i =
                enemies.length -
                1;
            i >= 0;
            i--
        ) {

            if (
                enemies[i].dead
            ) {

                enemies.splice(
                    i,
                    1
                );

            }

        }


        /*
        todos mortos
        */

        if (
            enemies.length ===
            0
        ) {

            stageState =
                "boss";


            setTimeout(
                function () {

                    if (
                        gameRunning &&
                        stageState ===
                        "boss" &&
                        !boss
                    ) {

                        createBoss();

                    }

                },
                900
            );

        }

    }


    /*
    boss
    */

    else if (
        stageState ===
        "boss"
    ) {

        if (
            boss &&
            boss.dead
        ) {

            stageState =
                "transition";


            stageTransitionTimer =
                3;

        }

    }


    /*
    transição
    */

    else if (
        stageState ===
        "transition"
    ) {

        stageTransitionTimer -=
            dt;


        if (
            stageTransitionTimer <=
            0
        ) {

            if (
                stage >=
                8
            ) {

                victoryGame();

                return;

            }


            stage++;


            startStage();

        }

    }

}


/* ============================================================
   HUD
============================================================ */

function updateHUD() {

    if (
        scoreElement
    ) {

        scoreElement.textContent =
            formatScore(
                score
            );

    }


    if (
        waveElement
    ) {

        waveElement.textContent =
            stage;

    }


    if (
        weaponElement
    ) {

        weaponElement.textContent =
            "LV " +
            player.weapon;

    }


    if (
        hpElement
    ) {

        hpElement.textContent =
            Math.ceil(
                player.hp
            );

    }


    if (
        healthBar
    ) {

        healthBar.style.width =
            (
                player.hp /
                player.maxHp *
                100
            ) +
            "%";

    }

}


function formatScore(
    value
) {

    return String(
        Math.floor(
            Math.max(
                0,
                value
            )
        )
    ).padStart(
        7,
        "0"
    );

}


/* ============================================================
   MENSAGEM
============================================================ */

function showMessage(
    text
) {

    if (
        weaponPopup &&
        upgradeText
    ) {

        upgradeText.textContent =
            text;


        weaponPopup.classList.remove(
            "hidden"
        );


        setTimeout(
            function () {

                if (
                    weaponPopup
                ) {

                    weaponPopup.classList.add(
                        "hidden"
                    );

                }

            },
            1500
        );

    }

}


/* ============================================================
   GAME OVER
============================================================ */

function endGame() {

    gameRunning =
        false;


    if (
        finalScoreElement
    ) {

        finalScoreElement.textContent =
            formatScore(
                score
            );

    }


    if (
        gameOverScreen
    ) {

        gameOverScreen.classList.remove(
            "hidden"
        );

    }

}


/* ============================================================
   VITÓRIA
============================================================ */

function victoryGame() {

    gameRunning =
        false;


    victoryReached =
        true;


    if (
        victoryScoreElement
    ) {

        victoryScoreElement.textContent =
            formatScore(
                score
            );

    }


    if (
        victoryScreen
    ) {

        victoryScreen.classList.remove(
            "hidden"
        );

    }

}


/* ============================================================
   START GAME
============================================================ */

function startGame() {

    score =
        0;


    stage =
        1;


    gameTime =
        0;


    stageState =
        "enemies";


    stageTransitionTimer =
        0;


    specialEnemy =
        null;


    specialTimer =
        0;


    boss =
        null;


    paused =
        false;


    victoryReached =
        false;


    playerBullets.length =
        0;


    enemyBullets.length =
        0;


    enemies.length =
        0;


    powerUps.length =
        0;


    explosions.length =
        0;


    resetPlayer();


    createStars();


    if (
        startScreen
    ) {

        startScreen.classList.add(
            "hidden"
        );

    }


    if (
        gameOverScreen
    ) {

        gameOverScreen.classList.add(
            "hidden"
        );

    }


    if (
        victoryScreen
    ) {

        victoryScreen.classList.add(
            "hidden"
        );

    }


    gameRunning =
        true;


    startStage();


    updateHUD();


    lastTime =
        performance.now();

}


/* ============================================================
   DRAW
============================================================ */

function draw() {

    ctx.clearRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );


    ctx.save();


    if (
        shake >
        0
    ) {

        ctx.translate(
            random(
                -shake,
                shake
            ),

            random(
                -shake,
                shake
            )
        );

    }


    drawBackground();


    drawPowerUps();


    drawEnemies();


    drawSpecialEnemy();


    drawEnemyBullets();


    drawPlayerBullets();


    drawBoss();


    drawPlayer();


    drawExplosions();


    ctx.restore();


    if (
        shake >
        0
    ) {

        shake *=
            .88;


        if (
            shake <
            .1
        ) {

            shake =
                0;

        }

    }

}


/* ============================================================
   UPDATE
============================================================ */

function update(
    dt
) {

    if (
        !gameRunning ||
        paused
    ) {

        return;

    }


    gameTime +=
        dt;


    updateBackground(
        dt
    );


    updatePlayer(
        dt
    );


    updatePlayerBullets(
        dt
    );


    updateEnemies(
        dt
    );


    updateSpecialEnemy(
        dt
    );


    updateEnemyBullets(
        dt
    );


    updatePowerUps(
        dt
    );


    updateBoss(
        dt
    );


    handleCollisions();


    updateExplosions(
        dt
    );


    updateStage(
        dt
    );


    updateHUD();

}


/* ============================================================
   LOOP
============================================================ */

function gameLoop(
    timestamp
) {

    let dt =
        (
            timestamp -
            lastTime
        ) /
        1000;


    lastTime =
        timestamp;


    if (
        !Number.isFinite(
            dt
        )
    ) {

        dt =
            .016;

    }


    dt =
        Math.min(
            dt,
            .033
        );


    update(
        dt
    );


    draw();


    requestAnimationFrame(
        gameLoop
    );

}


/* ============================================================
   BOTÕES
============================================================ */

if (
    startButton
) {

    startButton.addEventListener(
        "click",
        startGame
    );

}


if (
    restartButton
) {

    restartButton.addEventListener(
        "click",
        startGame
    );

}


if (
    victoryRestart
) {

    victoryRestart.addEventListener(
        "click",
        startGame
    );

}


/* ============================================================
   INICIALIZAÇÃO
============================================================ */

resizeCanvas();

createStars();

resetPlayer();

updateHUD();

lastTime =
    performance.now();


/*
O loop começa imediatamente.
O menu fica por cima até INICIAR.
*/

requestAnimationFrame(
    gameLoop
);


console.log(
    "===================================="
);

console.log(
    "SPACE DEFENDER ULTRA EDITION"
);

console.log(
    "WORLD ENGINE ATIVO"
);

console.log(
    "8 MUNDOS"
);

console.log(
    "10 ARMAS"
);

console.log(
    "INIMIGO ESPECIAL"
);

console.log(
    "CHEFÕES DIFERENTES"
);

console.log(
    "===================================="
);