//import * as THREE from 'three';

import * as CANNON from "https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/+esm";
import { SceneWorld } from "./SceneWorld.js";
import { Camera } from "./Camera.js";
import { CameraManager } from "./CameraManager.js";
import { ClientPlayer } from "./ClientPlayer.js";
import { ClientPlayerMovement } from "./ClientPlayerMovement.js";
import { InputManager } from "./InputManager.js";
import { NetworkManager } from "./NetworkManager.js";
import { Chunk } from "./Chunk.js";

console.log("Working in public");

const JUMP_FORCE = 5; // Velocity applied on jump
const SPEED = 4; // Velocity applied on WASD movement

const DNC = {
	CHUNK_SIZE: 16,
	NAMESPACE: 255,
	BLOCK: {
		AIR: 0, // Air is kind of special in that we can use it's state and reserved bits for maybe adding extra information. We could encode air pressure, our fluid dynamics
		// into the block itself. TODO: Consider adding metadata to air with the extra bits.
		STONE: 1,
	},
    FRAMERATE: 10,
    RENDER_DISTANCE: 8
}; // We should be reading this, not hardcoding it. Will fix later

DNC.FRAME_DURATION = 1000 / DNC.FRAMERATE;

class Game
{

    #lastFrameTime = Date.now();
    constructor(player, network_manager=new NetworkManager("ws://localhost:5173")) { // Don't think we should be passing player here, think it should be generated by a method of the class
        this.player = player;
        this.network_manager = network_manager;
        this.tick_counter = 0;
        this.setup()
    }

    async start() {

        await this.network_manager.send("player_connect", {username: player.username});
        this.loop();
    }

    setup() {
        this.network_manager.on("new_chunk", (data) => {
            let chunk = Chunk.from(data.chunk);
            //console.log(chunk.location);
            //console.log(chunk._chunk);
            //let i = 0;
            //chunk._chunk.forEach((index) => {
            //    if (index > 0) {
            //        i++;
            //    }
            //}); 
            //console.log(i); // Just to check that the array isn't just 0's.
        });
    }

    loop() {
        const now = Date.now();

        const deltaTime = now - this.#lastFrameTime;

        if (deltaTime >= DNC.FRAME_DURATION) {

            this.#lastFrameTime = now;
            this.sendPositionUpdate();
        }

        this.tick_counter++; // For client syncing. We need a global tick counter so that clients only send us updates every tick, instead of wasting calls to the server.
        setTimeout(() => this.loop(), Math.max(0, DNC.FRAME_DURATION - deltaTime));
    };

    sendPositionUpdate() {
        this.network_manager.send("player_update", {
            username: this.player.username, // Placeholder
            position: this.player.getPosition()
        });
    }
};

// Class variables.

const sceneWorld = new SceneWorld(); // Sets up scene and world
const scene = sceneWorld.getScene(); // Grabs scene, world and renderer from SceneWorld class
const world = sceneWorld.getWorld();
const renderer = sceneWorld.getRender();

// Gets username from client
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');

const player = new ClientPlayer(sceneWorld, username); // Sets up player from client.
const offset = new THREE.Vector3(20,20,20);
const camera = new Camera(scene, 10, (window.innerWidth / window.innerHeight)); // Sets up game camera.

const cameraControl = new CameraManager(camera, player, offset); // Manager for game camera.
const inputManager = new InputManager(cameraControl); // Manages client input.
const playerMovement = new ClientPlayerMovement(player, camera, inputManager, SPEED, JUMP_FORCE); // Manages player movement.

document.body.addEventListener('click', () => document.body.requestPointerLock());

// Animate function, renders environment and physics world and calls functions each frame

function animate() {
    requestAnimationFrame(animate);
    playerMovement.checkGrounded();
    playerMovement.updateMovement();
    world.fixedStep();
    player.updatePos();
    cameraControl.update();
    renderer.render(scene, camera.camera);
}

function websocketConnect() {
    let ws = new WebSocket("ws://localhost:24011");
}

// Running

animate();
websocketConnect();
console.log(player.username);
let game = new Game(player);
game.start();


