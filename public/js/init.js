//import * as THREE from 'three';

import * as CANNON from "https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/+esm";
import { Camera } from "./Camera.js";
import { CameraManager } from "./CameraManager.js";

console.log("Working in public");

const JUMP_FORCE = 5; // Velocity applied on jump
const SPEED = 4; // Velocity applied on WASD movement

// Player class
// TO-DO: Edit to fit more in line with OOP principles

export class PlayerEntity
{
    constructor(scene, world){ // scene and world of threejs render
        this.scene = scene;
        this.world = world;
        this.onGround = false;

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        this.playercube = new THREE.Mesh(geometry, material);
        this.playercube.position.set(2, 3, 0);
        this.scene.add(this.playercube);

        const size = new CANNON.Vec3(0.5, 0.5, 0.5);
        this.playerbody = new CANNON.Body({
            mass: 5,
            shape: new CANNON.Box(size),
        });
        this.playerbody.position.set(2, 3, 0);
        this.world.addBody(this.playerbody);
    }

    getPosition() {
        return this.playercube.position;
    }
}

// Three scene and isometric camera

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Test ground cube

const geometry = new THREE.BoxGeometry(16, 1, 16);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;
cube.receiveShadow = true;
cube.position.set(0, 0.5, 0);
scene.add(cube);

// Test ground plane

const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Lighting

const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(10, 20, 10);
sun.castShadow = true;
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 50;
scene.add(sun);

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// Cannon-es.js

const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.5, 0),
});

world.broadphase = new CANNON.SAPBroadphase(world); 
world.allowSleep = false;

const radius = 0.5;
const halfExtents2 = new CANNON.Vec3(8, radius, 8);

// Test cube ground body

const cubeBody2 = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(halfExtents2),
})
cubeBody2.position.set(0, 0.5, 0);
cubeBody2.type = CANNON.Body.STATIC;
world.addBody(cubeBody2);

// Test ground body

const groundBody = new CANNON.Body({
    mass: 0,
    type: CANNON.Body.STATIC,
    shape: new CANNON.Plane(),
})
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

// Contact material for player (playerMaterial) and terrain (voxelMaterial)

const playerMaterial = new CANNON.Material("playerMaterial");
const voxelMaterial = new CANNON.Material("voxelMaterial");

const contactMaterial = new CANNON.ContactMaterial(playerMaterial, voxelMaterial , {
    friction: 0.0,
    restitution: 0.0,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 4,
});
world.addContactMaterial(contactMaterial);

const player = new PlayerEntity(scene, world);
const offset = new THREE.Vector3(20,20,20);
const camera = new Camera(scene, 10, (window.innerWidth / window.innerHeight));
const cameraControl = new CameraManager(camera, player, offset);

player.playerbody.material = playerMaterial;
groundBody.material = voxelMaterial;
cubeBody2.material = voxelMaterial;
player.playerbody.fixedRotation = true;
player.playerbody.updateMassProperties();

// Functions and event listeners

document.body.addEventListener('click', () => document.body.requestPointerLock());

const move = { forward: false, backward: false, left: false, right: false, jump: false };
const speed = 0.2;
let rotation = { x: 0, y: 0 };
let sensitivity = 0.002;

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w': move.forward = true; break;
        case 's': move.backward = true; break;
        case 'a': move.left = true; break;
        case 'd': move.right = true; break; 
        case ' ': move.jump = true; break;
        case 'ArrowLeft': 
            if (cameraControl.getRotating()) { break; }
            cameraControl.setTargetOffset(new THREE.Vector3(0, 1, 0), Math.PI / 2); // rotates camera left by 90 degrees
            cameraControl.setIsRotating(true);
            break;
        case 'ArrowRight': 
            if (cameraControl.getRotating()) { break; } 
            cameraControl.setTargetOffset(new THREE.Vector3(0, 1, 0), -Math.PI / 2); // rotates camera right by 90 degrees
            cameraControl.setIsRotating(true);
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'w': move.forward = false; break;
        case 's': move.backward = false; break;
        case 'a': move.left = false; break;
        case 'd': move.right = false; break;
        case ' ': move.jump = false; break;
    }
});

document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === document.body) {
        rotation.x -= e.movementY * sensitivity;
        rotation.y -= e.movementX * sensitivity;
        rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotation.x));
    }
});

// Checks the player's velocity to determine if they are on the ground, console log for debug

function checkGrounded(player) {
    if(player.playerbody.velocity.y < 0.05 && player.playerbody.velocity.y >= 0) { console.log("On ground"); player.onGround = true; }
    else { player.onGround = false; }
}

// Updates the player's velocity based on input

function updatePlayer(player) {
    const currentY = player.playerbody.velocity.y;

    const { vert, hori } = camera.getDirection();

    // let velx = 0;
    // let velz = 0;
    let movement = new THREE.Vector3();
    if(move.forward) { movement.add(vert); }
    if(move.backward) { movement.sub(vert); }
    if(move.right) { movement.add(hori); }
    if(move.left) { movement.sub(hori); }

    // const mag = Math.sqrt(velx * velx + velz * velz);
    // if(mag > SPEED) {
    //     velx = (velx / mag) * SPEED;
    //     velz = (velz / mag) * SPEED;
    // }

    if (movement.length() > 0) {
        movement.normalize().multiplyScalar(SPEED);
    }

    player.playerbody.velocity.x = movement.x;
    player.playerbody.velocity.z = movement.z;

    if(move.jump && player.onGround) {
        player.playerbody.velocity.y = JUMP_FORCE;
        player.onGround = false;  
    } 
    else {
        player.playerbody.velocity.y = currentY;
    }
}

// Animate function, renders environment and physics world and calls functions each frame

function animate() {
    requestAnimationFrame(animate);
    checkGrounded(player, world);
    updatePlayer(player);
    world.fixedStep();
    player.playercube.position.copy(player.playerbody.position);
    cube.position.copy(cubeBody2.position);
    cameraControl.update();
    renderer.render(scene, camera.camera);
}

function websocketConnect() {
    WebSocket = new WebSocket("ws://localhost:24011");
}

// Running

animate();
websocketConnect();
