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
}

class Player
{
    constructor(position=new Position((0,0,0))) {
        this.position = position;
    }
}
