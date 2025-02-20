//import * as THREE from 'three';

import * as BufferGeometryUtils from "https://cdn.jsdelivr.net/npm/three/examples/js/utils/BufferGeometryUtils.js";
import * as CANNON from "https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/+esm";
import { SceneWorld } from "./SceneWorld.js";
import { Camera } from "./Camera.js";
import { CameraManager } from "./CameraManager.js";
import { ClientPlayer } from "./ClientPlayer.js";
import { ClientPlayerMovement } from "./ClientPlayerMovement.js";
import { InputManager } from "./InputManager.js";
import { NetworkManager } from "./NetworkManager.js";
import { Chunk } from "./Chunk.js";
import { ChunkRendererManager } from "./ChunkRendererManager.js";
import { Physics } from "./Physics.js";

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
    constructor(player, sceneWorld, scene, chunkManager, network_manager=new NetworkManager("ws://localhost:5173")) { // Don't think we should be passing player here, think it should be generated by a method of the class
        this.player = player;
        this.sceneWorld = sceneWorld;
        this.scene = scene;
        // this.world = world;
        this.chunkManager = chunkManager
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
            this.renderChunks(chunk);
            //console.log(chunk.tuple_location);
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

    renderChunks(chunk) {
        const size = DNC.CHUNK_SIZE;
        const location = chunk.tuple_location;

        const xpos = location[0];
        const ypos = location[1];
        const zpos = location[2];

        const chunkX = xpos * size;
        const chunkY = ypos * size;
        const chunkZ = zpos * size;

        if(!this.textureLoader){
            this.textureLoader = new THREE.TextureLoader();

            this.textureAtlas = this.textureLoader.load('textures/tilemap.png');
            this.textureAtlas.wrapS = THREE.RepeatWrapping;
            this.textureAtlas.wrapT = THREE.RepeatWrapping;
            this.textureAtlas.magFilter = THREE.NearestFilter;
            this.textureAtlas.generateMipmaps = true;
            this.textureAtlas.minFilter = THREE.LinearMipMapLinearFilter;
        }
        
        const blockGeometry = new THREE.BoxGeometry(1, 1, 1);
    
        const blockMaterial = new THREE.ShaderMaterial({
            uniforms: {
                textureAtlas: { value: this.textureAtlas },
            },
            vertexShader: `
                varying vec2 vUv;
                attribute float blockId;
                varying float vBlockId;
                void main() {
                    vUv = uv;
                    vBlockId = blockId;
                    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D textureAtlas;

                varying vec2 vUv;
                varying float vBlockId;

                void main() {
                    float lowerLeftU;
                    float lowerLeftV;
                    float upperRightU;
                    float upperRightV;
                    if(vBlockId == 1.0){
                        lowerLeftU = 0.2;
                        lowerLeftV = 0.75;
                        upperRightU = 0.3;
                        upperRightV = 0.8125;
                    } else if(vBlockId == 2.0) {
                        lowerLeftU = 0.1;
                        lowerLeftV = 0.8125;
                        upperRightU = 0.2;
                        upperRightV = 0.875;
                    }

                    vec2 uv = vec2(
                        lowerLeftU + vUv.x * (upperRightU - lowerLeftU), 
                        lowerLeftV + vUv.y * (upperRightV - lowerLeftV)  
                    );
                    gl_FragColor = texture2D(textureAtlas, uv);
                }
            `,
        });
        

        const numBlocks = size * size * size; // Maximum possible blocks
        const instancedMesh = new THREE.InstancedMesh(blockGeometry, blockMaterial, numBlocks);
        // instancedMesh.castShadow = true;
        instancedMesh.receiveShadow = true;

        let index = 0;
        const matrix = new THREE.Matrix4();

        const blockIds = new Float32Array(numBlocks);

        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                for (let z = 0; z < size; z++) {
                    let worldX = chunkX + x;
                    let worldY = chunkY + y;
                    let worldZ = chunkZ + z;
                    const block_id = chunk.at(x, y, z);

                    if (block_id !== 0) {

                        matrix.setPosition(worldX, worldY, worldZ);
                        instancedMesh.setMatrixAt(index, matrix);
                        blockIds[index] = Math.random() < 0.5 ? 1.0 : 2.0;
                        index++

                    }
                }
            }
        }
                    
        blockGeometry.setAttribute('blockId', new THREE.InstancedBufferAttribute(blockIds, 1));
        instancedMesh.count = index;
        instancedMesh.instanceMatrix.needsUpdate = true;
        instancedMesh.frustumCulled = true;


        if(instancedMesh.count !== 0){
            this.chunkManager.storeChunk(location, chunk, instancedMesh );
        }

        this.scene.add(instancedMesh);
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
}

// Class variables.

const sceneWorld = new SceneWorld(); // Sets up scene and world
const scene = sceneWorld.getScene(); // Grabs scene, world and renderer from SceneWorld class
// const world = sceneWorld.getWorld();
const renderer = sceneWorld.getRender();

// Chunk map
const chunkManager = new ChunkRendererManager(scene);
const physics = new Physics(chunkManager, DNC.CHUNK_SIZE, scene);

// Gets username from client
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');

const player = new ClientPlayer(sceneWorld, username); // Sets up player from client.
const offset = new THREE.Vector3(20,20,20);
const camera = new Camera(scene, 10, (window.innerWidth / window.innerHeight)); // Sets up game camera.

const cameraControl = new CameraManager(camera, player, offset); // Manager for game camera.
const inputManager = new InputManager(cameraControl); // Manages client input.
const playerMovement = new ClientPlayerMovement(player, camera, inputManager, physics, 4, JUMP_FORCE); // Manages player movement.

document.body.addEventListener('click', () => document.body.requestPointerLock());

// Animate function, renders environment and physics world and calls functions each frame

let prevTime = Date.now();
function animate() {
    let currentTime = Date.now();
    let deltaTime = (currentTime - prevTime) / 1000;
    requestAnimationFrame(animate);
    // playerMovement.checkGrounded();
    playerMovement.updateMovement(deltaTime);
    physics.update(deltaTime, player);
    // world.fixedStep();
    // player.updatePos();
    cameraControl.update();
    renderer.render(scene, camera.camera);
    prevTime = currentTime;
}

function websocketConnect() {
    let ws = new WebSocket("ws://localhost:24011");
}

// Running

let game = new Game(player, sceneWorld, scene, chunkManager);
game.start();
animate();
websocketConnect();
console.log(player.username);


