
export class ClientPlayerMovement {
    constructor(player, camera, inputManager, SPEED=4, JUMP_FORCE=5) {
        this.player = player;
        this.camera = camera;
        this.inputManager = inputManager;
        this.SPEED = SPEED;
        this.JUMP_FORCE = JUMP_FORCE;
    }

    checkGrounded() {
        if(this.player.getVelocityY() < 0.05 && this.player.getVelocityY() >= 0) { this.player.setGrounded(true); }
        else { this.player.setGrounded(false); }
    }

    updateMovement() {
        const move = this.inputManager.getMoveState();
        const currentY = this.player.getVelocityY();

        const { vert, hori } = this.camera.getDirection();
    
        let movement = new THREE.Vector3();
        if(move.forward) { movement.add(vert); }
        if(move.backward) { movement.sub(vert); }
        if(move.right) { movement.add(hori); }
        if(move.left) { movement.sub(hori); }
    
        if (movement.length() > 0) {
            movement.normalize().multiplyScalar(this.SPEED);
        }
    
        this.player.setVelocityX(movement.x);
        this.player.setVelocityZ(movement.z);
    
        if(move.jump && this.player.getGrounded()) {
            this.player.setVelocityY(this.JUMP_FORCE);
            this.player.setGrounded(false);  
        } 
        else {
            this.player.setVelocityY(currentY);
        }
    }
}