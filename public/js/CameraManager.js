
// Camera manager class.
// Manages camera updates & rotation.

export class CameraManager {
    constructor(camera, player, offset) {
        this.camera = camera;
        this.player = player;
        this.offset = offset;

        this.targetOffset = this.offset.clone();
        this.isRotating = false;
        this.rotationSpeed = 0.1;
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
        // Smoothly interpolate offset towards targetOffset
        this.offset.lerp(this.targetOffset, this.rotationSpeed);

        // Stop rotating when close enough to the target offset
        if (this.offset.distanceTo(this.targetOffset) < 0.1) {
            this.offset.copy(this.targetOffset);
            this.isRotating = false; 
        }

        const newPos = this.player.playercube.position.clone().add(this.offset);
        this.camera.setPosition(newPos);
        this.camera.setLookAt(this.player.playercube.position);
    }
}