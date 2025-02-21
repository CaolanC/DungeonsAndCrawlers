
export class SceneWorld {
    constructor() {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
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

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 10, 10).normalize();
        this.scene.add(directionalLight);

        // Enable shadows
        directionalLight.castShadow = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;

    }

    getScene() {
        return this.scene;
    }

    getRender() {
        return this.renderer;
    }
}
