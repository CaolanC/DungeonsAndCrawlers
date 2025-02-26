//import * as THREE from 'three';

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
import { Sky } from "./Sky.js";
//import { Stats } from "stats.js";

console.log("Working in public");

const JUMP_FORCE = 5; // Velocity applied on jump
const SPEED = 7; // Velocity applied on WASD movement

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

class Player
{
    constructor(scene, name, position) {
        this.name = name;
        this.position = position;
        this.block = this.createCube();
        this.scene = scene;
        this.scene.add(this.block);
    }

    updatePosition(position) {
        this.block.position.x = position.x;
        this.block.position.y = position.y;
        this.block.position.z = position.z;
        //console.log("acc working", position.x, position.y, position.z)
    }

    createCube() {
        const geometry = new THREE.BoxGeometry( 1, 1, 1 ); 
        const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
        const cube = new THREE.Mesh( geometry, material ); 

        return cube;
    }
};

class Game
{
    #lastFrameTime = Date.now();
    constructor(player, sceneWorld, scene, chunkManager, network_manager_path=`wss://${window.location.hostname}/ws/`) {
	console.log(network_manager_path);
        this.player = player;
        this.sceneWorld = sceneWorld;
        this.scene = sceneWorld.getScene();
        this.chunkManager = chunkManager
        this.tick_counter = 0;
	this.nm_path = network_manager_path;

    }

    async start() {
	    if (!this.network_manager) {
		    await this.setup(this.nm_path);
	    }
            await this.network_manager.send("player_connect", {username: this.player.username});
            this.loop();
        }

    async makeNetworkManager(path) {
	    return new NetworkManager(path);
    }

    async setup(path) {

	this.network_manager = await this.makeNetworkManager(path);
        this.network_manager.on("new_chunk", (data) => {
            let chunk = Chunk.from(data.chunk);
            //console.log("chunk", chunk);
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
        this.player_bodies = new Map();
        this.network_manager.on("other_player", (data) => {
            const name = data.player_name;
            const position = data.player_position;
            if (!this.player_bodies.has(name)) {
                this.player_bodies.set(name, new Player(this.scene, name, position));
            }
            //console.log(data);
            this.player_bodies.get(name).updatePosition(position);
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
            this.textureAtlas.wrapS = THREE.ClampToEdgeWrapping;
            this.textureAtlas.wrapT = THREE.ClampToEdgeWrapping;
            this.textureAtlas.magFilter = THREE.NearestFilter;
            this.textureAtlas.minFilter = THREE.NearestFilter;
        }
        
        const blockGeometry = new THREE.BoxGeometry(1, 1, 1);
    
        if(!this.blockMaterial){
            this.blockMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    textureAtlas: { value: this.textureAtlas },
                    playerPosition: { value: new THREE.Vector3() },
                },
                vertexShader: `
                    varying vec2 vUv;
                    varying vec3 vNormal;
                    attribute float blockId;
                    varying float vBlockId;
                    varying vec3 vWorldPosition;
                    void main() {
                        vUv = uv;
                        vNormal = normal;
                        vBlockId = blockId;
                        vec4 worldPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);
                        vWorldPosition = worldPosition.xyz;
                        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform sampler2D textureAtlas;
                    uniform vec3 playerPosition;
                    varying vec3 vNormal;
                    varying vec2 vUv;
                    varying float vBlockId;
                    varying vec3 vWorldPosition;

                    void main() {
                        float lowerLeftU, lowerLeftV, upperRightU, upperRightV;
                        float bWidth = 0.1;
                        float bHeight = 0.0625;
                        float col;
                        float row;
                        float side_darkening_mod = 1.0;

                        if(vBlockId == 1.0){
                            col = 5.0;
                            row = 4.0;
                        } else if(vBlockId == 2.0) {
                            if(abs(vNormal.y) > 0.5){
                                if(vNormal.y > 0.0){
                                    col = 2.0;
                                    row = 3.0;
                                } else {
                                    col = 1.0;
                                    row = 2.0;
                                }
                            } else if(abs(vNormal.x) > 0.5){
                                col = 1.0;
                                row = 3.0;
                            } else if(abs(vNormal.z) > 0.5){
                                col = 1.0;
                                row = 3.0;
                            }
                        } else if(vBlockId == 3.0) {
                            col = 1.0;
                            row = 2.0;
                        } else if(vBlockId == 4.0) {
                            col = 4.0;
                            row = 6.0;
                        } else if(vBlockId == 5.0) {
                            col = 9.0;
                            row = 6.0;
                        } else if(vBlockId == 6.0) {
                            col = 5.0;
                            row = 7.0;
                        } else if(vBlockId == 7.0) {
                            col = 7.0;
                            row = 3.0;
                        }

                        if(abs(vNormal.y) > 0.5){
                            side_darkening_mod = 0.8;
                        } else if(abs(vNormal.x) > 0.5){
                            side_darkening_mod = 0.65;
                        } else if(abs(vNormal.z) > 0.5){
                            side_darkening_mod = 0.5;
                        }

                        lowerLeftU = col * bWidth;
                        upperRightU = (col + 1.0) * bWidth;
                        lowerLeftV = 1.0 - (row * bHeight);
                        upperRightV = 1.0 - ((row + 1.0) * bHeight);

                        vec2 uv = vec2(
                            lowerLeftU + vUv.x * (upperRightU - lowerLeftU), 
                            lowerLeftV + (1.0 - vUv.y) * (upperRightV - lowerLeftV)  
                        );

                        vec4 worldtextures = texture2D(textureAtlas, uv);

                        float distance = length(vWorldPosition - playerPosition);

                        float maxDistance = 50.0; 
                        float darkness = clamp(distance / maxDistance, 0.0, 1.0); 
                        vec3 darkenedColor = worldtextures.rgb * (1.0 - darkness * 0.8) * side_darkening_mod;

                        gl_FragColor = vec4(darkenedColor, worldtextures.a);
                    }
                `,
            });
        }

        const numBlocks = size * size * size; // Maximum possible blocks
        const instancedMesh = new THREE.InstancedMesh(blockGeometry, this.blockMaterial, numBlocks);
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

                        //if (this.isExposed(worldX, worldY, worldZ)) {
                        //    continue; // TODO: Have it so they aren't added to the matrix of no sides are exposed
                        //}

                        matrix.setPosition(worldX, worldY, worldZ);
                        instancedMesh.setMatrixAt(index, matrix);
                        blockIds[index] = block_id;
                        index++;

                    }
                }
            }
        }
                    
        blockGeometry.setAttribute('blockId', new THREE.InstancedBufferAttribute(blockIds, 1));
        instancedMesh.count = index;
        instancedMesh.instanceMatrix.needsUpdate = true;
        instancedMesh.frustumCulled = true;


        if(instancedMesh.count !== 0 && !this.chunkManager.hasChunk(location)) {
            this.chunkManager.storeChunk(location, chunk, instancedMesh );
        } 


        this.scene.add(instancedMesh);
    }

    isExposed(x, y, z) {

    }

    loop() {
        const now = Date.now();

        const deltaTime = now - this.#lastFrameTime;

        if (deltaTime >= DNC.FRAME_DURATION) {

            this.#lastFrameTime = now;
            this.sendPositionUpdate();
            this.chunkManager.cullChunks(player, this.network_manager); // TODO: Make it check for chunks that it doesn't have and send them to the player
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

const sceneWorld = new SceneWorld(); // Sets up scene
const scene = sceneWorld.getScene(); // Grabs scene, world and renderer from SceneWorld class
const renderer = sceneWorld.getRender();

// Chunk map
const chunkManager = new ChunkRendererManager(scene);
const physics = new Physics(chunkManager, DNC.CHUNK_SIZE, scene);

// Gets username from client
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');

const player = new ClientPlayer(sceneWorld, username); // Sets up player from client.
const offset = new THREE.Vector3(20,20,20);
const camera = new Camera(scene, 10, innerWidth, window.innerHeight); // Sets up game camera.

const inputManager = new InputManager(); // Manages client input.
const cameraControl = new CameraManager(camera, player, offset, inputManager); // Manager for game camera.
const playerMovement = new ClientPlayerMovement(player, camera, inputManager, physics, SPEED, JUMP_FORCE); // Manages player movement.

document.body.addEventListener('click', () => document.body.requestPointerLock());

// Animate function, renders environment and physics world and calls functions each frame

let prevTime = Date.now();
function animate() {
    let currentTime = Date.now();
    let deltaTime = (currentTime - prevTime) / 1000;
    //stats.begin();

    //stats.end();

    requestAnimationFrame(animate);
    playerMovement.updateMovement(deltaTime);
    physics.update(deltaTime, player);
    if (game.blockMaterial) {
    	game.blockMaterial.uniforms.playerPosition.value.copy(player.getPosition());
    }
    cameraControl.update();
    renderer.render(scene, camera.camera);
    prevTime = currentTime;
}

//function websocketConnect() {
//    let ws = new WebSocket("ws://localhost:24011");
//}

// Running

let sky_color = "#87CEEB";
//let sky = new Sky(scene, sky_color, "NightSky.vert", "NightSky.frag");

const loader = new THREE.CubeTextureLoader();
loader.setPath('textures/');

const textureCube = loader.load([
  'bluecloud_bk.png', 'bluecloud_bk.png',
  'bluecloud_bk.png', 'bluecloud_bk.png',
  'bluecloud_bk.png', 'bluecloud_bk.png']);

scene.background = textureCube;

let game = new Game(player, sceneWorld, scene, chunkManager);

game.start();
animate();

//var stats = new Stats();
//stats.showPanel(1);
//document.body.appendChild( stats.dom );
