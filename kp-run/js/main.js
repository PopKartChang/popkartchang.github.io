import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import { World } from './world.js';
import { buildPlayerModel } from './models.js';
import { UI } from './ui.js';
import { AudioSystem } from './audio.js';

let scene, camera, renderer, composer, world, ui, audio;
let player, gameState = 'MENU';
let score = 0, distance = 0, speedZ = 0.8;
let currentLane = 0, laneOffset = 0;
let lives = 3;

async function init() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.006);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 6, 12);
    camera.lookAt(0, 2, -5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    document.getElementById('game-container').appendChild(renderer.domElement);

    // --- 後期處理：輝光 ---
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    composer = new EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    // 燈光
    const ambient = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambient);
    const spot = new THREE.SpotLight(0x00f2fe, 5);
    spot.position.set(0, 15, 10);
    scene.add(spot);

    ui = new UI();
    audio = new AudioSystem();
    world = new World(scene);
    
    player = await buildPlayerModel();
    scene.add(player);

    setupEvents();
    animate();
}

function setupEvents() {
    window.addEventListener('keydown', (e) => {
        if (gameState === 'PLAYING') {
            if (e.key === 'ArrowLeft' || e.key === 'a') currentLane = Math.max(-1, currentLane - 1);
            if (e.key === 'ArrowRight' || e.key === 'd') currentLane = Math.min(1, currentLane + 1);
        }
    });
    document.getElementById('action-btn').onclick = () => {
        audio.init();
        startGame();
    };
}

function startGame() {
    score = 0; distance = 0; lives = 3;
    gameState = 'PLAYING';
    ui.reset();
    audio.playBGM();
}

function animate() {
    requestAnimationFrame(animate);
    if (gameState === 'PLAYING') {
        distance += speedZ;
        score = Math.floor(distance * 0.1);
        speedZ = 0.8 + (distance * 0.00005);
        
        ui.update(score, lives);

        // 玩家移動
        laneOffset += (currentLane * 4.5 - laneOffset) * 0.12;
        player.position.x = laneOffset;
        player.rotation.z = (laneOffset - currentLane * 4.5) * -0.05;

        world.update(distance, speedZ);
        checkCollisions();
    }
    composer.render();
}

function checkCollisions() {
    const pBox = new THREE.Box3().setFromObject(player);
    pBox.expandByScalar(-0.4);

    world.obstacles.forEach((obs, i) => {
        const oBox = new THREE.Box3().setFromObject(obs);
        if (pBox.intersectsBox(oBox)) {
            handleHit();
            world.removeObstacle(i);
        }
    });
}

function handleHit() {
    lives--;
    ui.flash();
    audio.playHit();
    if (lives <= 0) {
        gameState = 'GAMEOVER';
        ui.showGameOver(score);
        audio.stopBGM();
    }
}

window.onload = init;