export class ChunkManager { 

    constructor(render_distance) {
        this.render_distance = render_distance;
        this.loaded_chunks = new Set();
    }

    loadChunks(player_position) {
        chunk_ids = getValidChunks(player_position);
        chunk_ids.forEach((chunk_id) => {
            
        });
    }

    generateChunk(chunk_id) {

    }
    
    getValidChunks(position) {
        const CHUNK_SIZE = DNC.CHUNK_SIZE;
        const render_distance = this.render_distance;

        const cx = Math.floor(position.x / CHUNK_SIZE);
        const cy = Math.floor(position.y / CHUNK_SIZE);
        const cz = Math.floor(position.z / CHUNK_SIZE);

        const nearbyChunks = [];

        for (let x = cx - render_distance; x <= cx + render_distance; x++) {
            for (let y = cy - render_distance; y <= cy + render_distance; y++) {
                for (let z = cz - render_distance; z <= cz + render_distance; z++) {
                    nearbyChunks.push({ x, y, z });
                }
            }
        }

    return nearbyChunks;
    }
}
