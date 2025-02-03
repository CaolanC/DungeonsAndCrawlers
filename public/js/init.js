//import * as THREE from 'three';

import * as CANNON from "https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/+esm";

console.log("Working in public");

export class Player
{
    constructor(scene, world){ // scene and world of threejs render
        this.scene = scene;
        this.world = world;

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

const move = { forward: 0, backward: 0, left: 0, right: 0, up: 0, down: 0 };
const speed = 0.2;
let rotation = { x: 0, y: 0 };
let sensitivity = 0.002;

// Cannon-es.js

// const testGeometry = new THREE.BoxGeometry(1, 1, 1);
// const testMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
// const testCube = new THREE.Mesh(testGeometry, testMaterial);
// testCube.position.set(0, 10, 0);
// scene.add(testCube);

const testCubeGeom = new THREE.BoxGeometry(1, 1, 1);
const testCubeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
const testCube = new THREE.Mesh(testCubeGeom, testCubeMat);
testCube.position.set(0, 10, 0);
scene.add(testCube);

// const wallGeom = new THREE.BoxGeometry(5, 5, 1);
// const wallMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
// const wall = new THREE.Mesh(wallGeom, wallMat);
// wall.position.set(0, 2.5, -2);
// scene.add(wall);

const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.81, 0),
});

world.broadphase = new CANNON.SAPBroadphase(world); // More efficient than NaïveBroadphase
world.allowSleep = true; // Allows sleeping to prevent unnecessary calculations

const radius = 0.5;
const halfExtents = new CANNON.Vec3(radius, radius, radius);

const cubeBody = new CANNON.Body({
    mass: 5,
    shape: new CANNON.Box(halfExtents),
})
cubeBody.position.set(0, 10, 0);
world.addBody(cubeBody);

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

document.body.addEventListener('click', () => document.body.requestPointerLock());

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w': move.forward = 1; break;
        case 's': move.backward = 1; break;
        case 'a': move.left = 1; break;
        case 'd': move.right = 1; break;
        case ' ': move.up = 1; break;
        case 'Shift': move.down = 1; break;
    }
});

document.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'w': move.forward = 0; break;
        case 's': move.backward = 0; break;
        case 'a': move.left = 0; break;
        case 'd': move.right = 0; break;
        case ' ': move.up = 0; break;
        case 'Shift': move.down = 0; break;
    }
});

document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === document.body) {
        rotation.x -= e.movementY * sensitivity;
        rotation.y -= e.movementX * sensitivity;
        rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotation.x));
    }
});

function updateCamera() {
    const direction = new THREE.Vector3();
    const right = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);

    camera.getWorldDirection(direction);
    direction.cross(up).normalize();

    const moveVector = new THREE.Vector3();
    if (move.forward) moveVector.add(camera.getWorldDirection(new THREE.Vector3()).normalize());
    if (move.backward) moveVector.add(camera.getWorldDirection(new THREE.Vector3()).normalize().negate());
    if (move.left) moveVector.add(direction.negate());
    if (move.right) moveVector.add(direction.negate().negate());
    if (move.up) moveVector.y += 1;
    if (move.down) moveVector.y -= 1;

    moveVector.normalize().multiplyScalar(speed);
    camera.position.add(moveVector);

    camera.rotation.x = rotation.x;
    camera.rotation.y = rotation.y;
}


// TODO: Update the physics to any new potential errors in future. May have to code in gravity manually.

// cubeBody.addEventListener('collide', (event) => {
//     console.log("Collision detected with:", event.body);
//     cubeBody.velocity.set(0, 0, 0);
//     cubeBody.angularVelocity.set(0, 0, 0);
//     cubeBody.sleep();
//     // Wake up the sphere after 1 second
//     setTimeout(() => {
//         cubeBody.wakeUp();
//         console.log("Sphere body woke up after 1 second");
//     }, 1000); // 1000 milliseconds = 1 second
// });

// Fix to to-do above. Needs more testing.
// TODO: Add a position checker to make sure object is not inside another object to prevent slight bouncing.



function checkcollide() {
    let isColliding = false;

    world.contacts.forEach((contact) => {
        if (contact.bi === cubeBody || contact.bj === cubeBody) {
            isColliding = true;
        }
    });

    console.log(isColliding);

    if (isColliding) {
        // cubeBody.position.set(cubeBody.position.x, Math.ceil(cubeBody.position.y), cubeBody.position.z);
        cubeBody.velocity.set(0, 0, 0);
        cubeBody.angularVelocity.set(0, 0, 0);
        cubeBody.sleep();
    } else {
        if (cubeBody.sleepState === CANNON.Body.SLEEPING) {
            cubeBody.wakeUp();
        }
    }
}

const player = new Player(scene, world);

function animate() {
    requestAnimationFrame(animate);
    updateCamera();
    world.fixedStep();
    checkcollide();
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
