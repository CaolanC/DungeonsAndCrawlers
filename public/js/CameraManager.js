
// Camera manager class.
// Manages camera updates & rotation.

export class CameraManager {
    constructor(camera, player, offset, inputManager) {
        this.camera = camera;
        this.player = player;
        this.offset = offset;
        this.input = inputManager;

        this.targetOffset = this.offset.clone();
        this.isRotating = false;
        this.rotationSpeed = 0.02;
    }

    setTargetOffset(vec, x) {
        this.targetOffset.applyAxisAngle(vec, x);
    }

    setIsRotating(newState) {
        this.isRotating = newState;
    }

    getRotating() {
        return this.isRotating;
    }

    setRotationSpeed(newSpeed) {
        this.rotationSpeed = newSpeed;
    }

    update() {

        const rotate = this.input.getRotationState(); // get rotation map
        let rotateHori = 0;
        let rotateVert = 0;

        if(rotate.left) { rotateHori -= this.rotationSpeed; }
        if(rotate.right) { rotateHori += this.rotationSpeed; }
        if(rotate.up) { rotateVert += this.rotationSpeed; }
        if(rotate.down) { rotateVert -= this.rotationSpeed; }

        if(rotateHori !== 0 || rotateVert !== 0) {
            this.offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotateHori);
            this.offset.applyAxisAngle(new THREE.Vector3(1, 0, 0), rotateVert);
        }

        // Smoothly interpolate offset towards targetOffset
        // this.offset.lerp(this.targetOffset, this.rotationSpeed);

        // // Stop rotating when close enough to the target offset
        // if (this.offset.distanceTo(this.targetOffset) < 0.1) {
        //     this.offset.copy(this.targetOffset); 
        // }

        const newPos = this.player.playercube.position.clone().add(this.offset);
        this.camera.setPosition(newPos);
        this.camera.setLookAt(this.player.playercube.position);
    }
}