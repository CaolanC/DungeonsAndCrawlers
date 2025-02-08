//import * as THREE from 'three';

import * as CANNON from "https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/+esm";

console.log("Working in public");

const JUMP_FORCE = 5; // Velocity applied on jump
const SPEED = 17; // Velocity applied on WASD movement

export class Player
{
    constructor(scene, world){ // scene and world of threejs render
        this.scene = scene;
        this.world = world;
        this.onGround = false;

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        this.playercube = new THREE.Mesh(geometry, material);
        this.playercube.position.set(2, 1, 0);
        this.scene.add(this.playercube);

        const size = new CANNON.Vec3(0.5, 0.5, 0.5);
        this.playerbody = new CANNON.Body({
            mass: 5,
            shape: new CANNON.Box(size),
        });
        this.playerbody.position.set(2, 1, 0);
        this.world.addBody(this.playerbody);
    }

    getPosition() {
        return this.playercube.position;
    }
}

// Three.js

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;
cube.receiveShadow = true;
cube.position.set(0, 0.5, 0);
scene.add(cube);

const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

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

const testCubeGeom = new THREE.BoxGeometry(1, 1, 1);
const testCubeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
const testCube = new THREE.Mesh(testCubeGeom, testCubeMat);
testCube.position.set(0, 3, 0);
scene.add(testCube);

const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.5, 0),
});

world.broadphase = new CANNON.SAPBroadphase(world); 
world.allowSleep = true; 

const radius = 0.5;
const halfExtents = new CANNON.Vec3(radius, radius, radius);

const cubeBody = new CANNON.Body({
    mass: 5,
    shape: new CANNON.Box(halfExtents),
})
cubeBody.position.set(0, 3, 0);
world.addBody(cubeBody);

cubeBody.fixedRotation = true;
cubeBody.updateMassProperties();

const cubeBody2 = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(halfExtents),
})
cubeBody2.position.set(0, 0.5, 0);
world.addBody(cubeBody2);

const groundBody = new CANNON.Body({
    mass: 0,
    type: CANNON.Body.STATIC,
    shape: new CANNON.Plane(),
})
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

const playerMaterial = new CANNON.Material("playerMaterial");
const voxelMaterial = new CANNON.Material("voxelMaterial");

const contactMaterial = new CANNON.ContactMaterial(playerMaterial, voxelMaterial , {
    friction: 0.55,
    restitution: 0.0,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 4,
});
world.addContactMaterial(contactMaterial);

cubeBody.material = playerMaterial;
cubeBody2.material = voxelMaterial;

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

// function updateCamera() {
//     const direction = new THREE.Vector3();
//     const right = new THREE.Vector3();
//     const up = new THREE.Vector3(0, 1, 0);

//     camera.getWorldDirection(direction);
//     direction.cross(up).normalize();

//     const moveVector = new THREE.Vector3();
//     if (move.forward) moveVector.add(camera.getWorldDirection(new THREE.Vector3()).normalize());
//     if (move.backward) moveVector.add(camera.getWorldDirection(new THREE.Vector3()).normalize().negate());
//     if (move.left) moveVector.add(direction.negate());
//     if (move.right) moveVector.add(direction.negate().negate());
//     if (move.up) moveVector.y += 1;
//     if (move.down) moveVector.y -= 1;

//     moveVector.normalize().multiplyScalar(speed);
//     camera.position.add(moveVector);

//     camera.rotation.x = rotation.x;
//     camera.rotation.y = rotation.y;
// }

const player = new Player(scene, world);
player.playerbody.material = playerMaterial;
groundBody.material = voxelMaterial;
player.playerbody.fixedRotation = true;
player.playerbody.updateMassProperties();

player.playerbody.addEventListener("collide", (e) => {
    if(e.body == groundBody) {
        console.log("player is on ground");
        player.onGround = true;
    }
});

function updatePlayer(player) {
    const currentY = player.playerbody.velocity.y;

    if (move.forward) {
        player.playerbody.velocity.z = -SPEED;
    } else if (move.backward) {
        player.playerbody.velocity.z = SPEED;
    } else {
        player.playerbody.velocity.z = 0;
    }
    
    if (move.right) {
        player.playerbody.velocity.x = SPEED;
    } else if (move.left) {
        player.playerbody.velocity.x = -SPEED;
    } else {
        player.playerbody.velocity.x = 0;
    }

    if (move.jump && player.onGround) {
        player.playerbody.velocity.y = JUMP_FORCE;
        player.onGround = false;  
    } else {
        player.playerbody.velocity.y = currentY;
    }
}

function animate() {
    requestAnimationFrame(animate);
    // updateCamera();
    updatePlayer(player);
    world.fixedStep();
    player.playercube.position.copy(player.playerbody.position);
    testCube.position.copy(cubeBody.position);
    cube.position.copy(cubeBody2.position);
    renderer.render(scene, camera);
}

function websocketConnect() {
    WebSocket = new WebSocket("ws://localhost:24011");
}

// Running

animate();
websocketConnect();
