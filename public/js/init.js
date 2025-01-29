//import * as THREE from 'three';
console.log("Working in public");

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

function animate() {
    requestAnimationFrame(animate);
    updateCamera();
    renderer.render(scene, camera);
}

function websocketConnect() {
    WebSocket = new WebSocket("ws://localhost:24011");
}

animate();
websocketConnect();
