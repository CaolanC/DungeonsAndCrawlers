
export class ClientPlayerMovement {
    constructor(player, camera, inputManager, physics, SPEED=4, JUMP_FORCE=5) {
        this.player = player;
        this.camera = camera;
        this.inputManager = inputManager;
        this.physics = physics;
        this.SPEED = SPEED;
        this.JUMP_FORCE = JUMP_FORCE;
        this.gravity = 9.8;
    }



    updateMovement(deltaTime) {
        const move = this.inputManager.getMoveState();
        const currentY = this.player.velocity.y;

        const { vert, hori } = this.camera.getDirection();
    
        this.player.velocity.x = 0;
        this.player.velocity.z = 0;

        if(move.forward) { this.player.velocity.add(vert); }
        if(move.backward) { this.player.velocity.sub(vert); }
        if(move.right) { this.player.velocity.add(hori); }
        if(move.left) { this.player.velocity.sub(hori); }
    
        if (this.player.velocity.length() > 0) {
            this.player.velocity.normalize().multiplyScalar(this.SPEED * deltaTime);
        }
    
        if(!this.player.getGrounded()){
            this.player.velocity.y -= this.gravity * deltaTime;
        }
        else{
            this.player.velocity.y = 0;
        }
    
        if(move.jump && this.player.getGrounded()) {
            this.player.velocity.y += this.JUMP_FORCE;
        }

        const newPos = this.player.getPosition().clone().add(this.player.velocity.clone());
        this.player.playercube.position.copy(newPos);

    }
}