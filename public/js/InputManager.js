
export class InputManager {
    constructor(cameraManager) {
        this.cameraManager = cameraManager;
        this.move = { forward: false, backward: false, left: false, right: false, jump: false };

        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
    }
    
    onKeyDown(e) {
        switch (e.key) {
            case 'w': this.move.forward = true; break;
            case 's': this.move.backward = true; break;
            case 'a': this.move.left = true; break;
            case 'd': this.move.right = true; break; 
            case ' ': this.move.jump = true; break;
            case 'ArrowLeft': 
                if (this.cameraManager.getRotating()) { break; }
                this.cameraManager.setTargetOffset(new THREE.Vector3(0, 1, 0), Math.PI / 2); // rotates camera left by 90 degrees
                this.cameraManager.setIsRotating(true);
                break;
            case 'ArrowRight': 
                if (this.cameraManager.getRotating()) { break; } 
                this.cameraManager.setTargetOffset(new THREE.Vector3(0, 1, 0), -Math.PI / 2); // rotates camera right by 90 degrees
                this.cameraManager.setIsRotating(true);
                break;
        }
    }

    onKeyUp(e) {
        switch (e.key) {
            case 'w': this.move.forward = false; break;
            case 's': this.move.backward = false; break;
            case 'a': this.move.left = false; break;
            case 'd': this.move.right = false; break;
            case ' ': this.move.jump = false; break;
        }
    }

    getMoveState() {
        return this.move;
    }

}