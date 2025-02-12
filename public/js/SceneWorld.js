import * as CANNON from "https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/+esm";

export class SceneWorld {
    constructor() {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        this.sun = new THREE.DirectionalLight(0xffffff, 1);
        this.sun.position.set(10, 20, 10);
        this.sun.castShadow = true;
        this.sun.shadow.mapSize.width = 2048;
        this.sun.shadow.mapSize.height = 2048;
        this.sun.shadow.camera.near = 0.5;
        this.sun.shadow.camera.far = 50;
        this.scene.add(this.sun);

        this.ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(this.ambientLight);

        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.51, 0),
        });
        
        this.world.broadphase = new CANNON.SAPBroadphase(this.world); 
        this.world.allowSleep = false;

        this.groundGeometry = new THREE.PlaneGeometry(50, 50);
        this.groundMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
        this.ground = new THREE.Mesh(this.groundGeometry, this.groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);

        this.groundBody = new CANNON.Body({
            mass: 0,
            type: CANNON.Body.STATIC,
            shape: new CANNON.Plane(),
        })
        this.groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        this.world.addBody(this.groundBody);

        // Test cube

        this.geometry = new THREE.BoxGeometry(16, 1, 16);
        this.material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        this.cube = new THREE.Mesh(this.geometry, this.material);
        this.cube.castShadow = true;
        this.cube.receiveShadow = true;
        this.cube.position.set(0, 0.5, 0);
        this.scene.add(this.cube);

        this.halfExtents2 = new CANNON.Vec3(8, 0.5, 8);
        this.cubeBody2 = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Box(this.halfExtents2),
        })
        this.cubeBody2.position.set(0, 0.5, 0);
        this.cubeBody2.type = CANNON.Body.STATIC;
        this.world.addBody(this.cubeBody2);

        //

        // Contact material

        this.playerMaterial = new CANNON.Material("playerMaterial");
        this.voxelMaterial = new CANNON.Material("voxelMaterial");

        this.contactMaterial = new CANNON.ContactMaterial(this.playerMaterial, this.voxelMaterial, {
            friction: 0.0,
            restitution: 0.0,
            contactEquationStiffness: 1e8,
            contactEquationRelaxation: 4,
        });
        this.world.addContactMaterial(this.contactMaterial);

        this.groundBody.material = this.voxelMaterial;
        this.cubeBody2.material = this.voxelMaterial;
    }

    getPlayerMat() {
        return this.playerMaterial;
    }

    getVoxelMat() {
        return this.voxelMaterial;
    }

    getScene() {
        return this.scene;
    }

    getWorld() {
        return this.world;
    }

    getRender() {
        return this.renderer;
    }
}