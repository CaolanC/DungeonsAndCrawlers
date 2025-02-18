
export class ClientPlayerMovement {
    constructor(player, camera, inputManager, physics, SPEED=4, JUMP_FORCE=5) {
        this.player = player;
        this.camera = camera;
        this.inputManager = inputManager;
        this.physics = physics;
        this.SPEED = SPEED;
        this.JUMP_FORCE = JUMP_FORCE;

        this.velocity = new THREE.Vector3(0, 0, 0);
    }

    checkGrounded() {
        // if(this.player.getVelocityY() < 0.05 && this.player.getVelocityY() >= 0) { this.player.setGrounded(true); }
        // else { this.player.setGrounded(false); }
    }

    updateMovement(deltaTime) {
        const move = this.inputManager.getMoveState();
        const currentY = this.velocity.y;

        const { vert, hori } = this.camera.getDirection();
    
        this.velocity.x = 0;
        this.velocity.z = 0;

        if(move.forward) { this.velocity.add(vert); }
        if(move.backward) { this.velocity.sub(vert); }
        if(move.right) { this.velocity.add(hori); }
        if(move.left) { this.velocity.sub(hori); }
    
        if (this.velocity.length() > 0) {
            this.velocity.normalize().multiplyScalar(this.SPEED * deltaTime);
        }
    
        // this.player.setVelocityX(this.velocity.x);
        // this.player.setVelocityZ(this.velocity.z);
    
        if(move.jump && this.player.getGrounded()) {
            // this.player.setVelocityY(this.JUMP_FORCE);
            // this.player.setGrounded(false);  
        } 
        else {
            // this.player.setVelocityY(currentY);
        }

        const newPos = this.player.getPosition().clone().add(this.velocity.clone());
        this.player.playercube.position.copy(newPos);
        // this.player.boundsHelper.position.copy(this.player.playercube.position);

        this.physics.broadphase(this.player);
    }
}