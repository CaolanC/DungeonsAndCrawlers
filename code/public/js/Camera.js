
// Camera class
// Camera is in isometric style. Follows the player entity.

export class Camera {
    constructor(scene, zoom, width, height) {
        this.scene = scene;
        this.zoom = zoom;
        //this.aspect = aspect;
        this.camera = new THREE.PerspectiveCamera(
            45, 
            width / height, 
            1, 
            1000 
        );
        this.camera.position.set(20, 20, 20);
        this.camera.lookAt(new THREE.Vector3(0,0,0));
        this.scene.add(this.camera);
    }

    getCamera() {
        return this.camera;
    }

    setPosition(newPos) {
        this.camera.position.copy(newPos);
    }

    getPosition() {
        return this.camera.position;
    }

    setLookAt(lookNew) {
        this.camera.lookAt(lookNew);
    }

    // Returns the current direction relative to the camera's perspective.
    getDirection() {
        const vert = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion).setY(0).normalize();
        const hori = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion).setY(0).normalize();

        return { vert, hori };
    }

}
