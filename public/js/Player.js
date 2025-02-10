const CHUNK_SIZE = 16;

class Server
{

}

class Position
{
    constructor(position) {
        this.tuple = position;
        this.x = position[0];
        this.y = position[1];
        this.z = position[2];
    }
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

// export class Player
// {
//     constructor(scene, world){ // scene and world of threejs render
//         this.scene = scene;
//         this.world = world;

//         const geometry = new THREE.BoxGeometry(1, 1, 1);
//         const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
//         this.cube = new THREE.Mesh(geometry, material);
//         this.cube.position.set(2, 1, 0);
//         this.scene.add(this.cube);

//         const size = new CANNON.Vec3(0.5, 0.5, 0.5);
//         this.cubeBody = new CANNON.Body({
//             mass: 5,
//             shape: new CANNON.Box(size),
//         });
//         this.cubeBody.position.set(2, 1, 0);
//         this.world.add(this.cubeBody);
//     }

//     getPosition() {
//         return this.cube.position();
//     }
// }
