
export class InputManager {
    constructor() {
        this.move = { forward: false, backward: false, left: false, right: false, jump: false };
        this.rotation = { left: false, right: false, up: false, down: false};

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
            case 'ArrowLeft': this.rotation.left = true; break;
            case 'ArrowRight': this.rotation.right = true; break;
            case 'ArrowUp': this.rotation.up = true; break;
            case 'ArrowDown': this.rotation.down = true; break;
        }
    }

    onKeyUp(e) {
        switch (e.key) {
            case 'w': this.move.forward = false; break;
            case 's': this.move.backward = false; break;
            case 'a': this.move.left = false; break;
            case 'd': this.move.right = false; break;
            case ' ': this.move.jump = false; break;
            case 'ArrowLeft': this.rotation.left = false; break;
            case 'ArrowRight': this.rotation.right = false; break;
            case 'ArrowUp': this.rotation.up = false; break;
            case 'ArrowDown': this.rotation.down = false; break;
        }
    }

    getMoveState() {
        return this.move;
    }

    getRotationState() {
        return this.rotation;
    }

}