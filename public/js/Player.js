import * as CANNON from "https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/+esm";

const CHUNK_SIZE = 16;

class Server
{

}

class ClientChunkManager
{
    constructor(player, render_distance=8) {
        this.player = player;
        this.render_distance = 8;
        this.loaded_chunks = new Set();
    }

    async updateChunks() {
        let visible_chunks = getVisibleChunks();
    }

    async getVisibleChunks() {
        let x = Math.floor(this.player.position.x / CHUNK_SIZE);
        let y = Math.floor(this.player.position.y / CHUNK_SIZE);
        let z = Math.floor(this.player.position.z / CHUNK_SIZE);

        for(let cx = x - this.render_distance; cx <= x + this.render_distance; cx++) {
            for(let cy = y - this.render_distance; cy <= y + this.render_distance; cy++) {
                for(let cz = z - this.render_distance; cz <= z + this.render_distance; cz++) {
                        
                }
            }
        }
    }
}

export class PlayerObject
{
    constructor(scene, world){ // scene and world of threejs render
        this.scene = scene;
        this.world = world;
        this.onGround = false;

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        this.playercube = new THREE.Mesh(geometry, material);
        this.playercube.position.set(2, 3, 0);
        this.scene.add(this.playercube);

        const size = new CANNON.Vec3(0.5, 0.5, 0.5);
        this.playerbody = new CANNON.Body({
            mass: 5,
            shape: new CANNON.Box(size),
        });
        this.playerbody.position.set(2, 3, 0);
        this.world.addBody(this.playerbody);
    }

    getPosition() {
        return this.playercube.position;
    }

    getBodyPos() {
        return this.playerbody.position;
    }

    getVelocity() {
        return this.playerbody.velocity
    }

    getGrounded() {
        return this.onGround;
    }

}
