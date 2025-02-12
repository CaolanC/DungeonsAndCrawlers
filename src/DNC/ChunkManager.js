import { DNC } from "./Config.js";
import { perlinNoise2DNorm, perlinNoise2D } from "./PerlinNoise.js";
import { Chunk } from "./Chunk.js";

export class ChunkManager { 

    constructor(render_distance) {
        this.render_distance = render_distance;
        this.loaded_chunks = new Set();
        this.generated_chunks = new Map();
    }

    getChunksToLoad(player) {
        const chunks = new Set();
        const chunk_ids = this.getValidChunks(player.position);
        chunk_ids.forEach((chunk_id) => {
            if (!player.loaded_chunks.has(chunk_id)) {
                if (!this.generated_chunks.has(chunk_id)) {
                    let new_chunk = this.generateChunk(chunk_id)
                    this.generated_chunks.set(chunk_id, new_chunk);
                    chunks.add(new_chunk);
                } else {
                    // Load the chunk from storage
                }
            }
        });

        return chunks;
    }
    generateChunk(chunk_id) {
        const CHUNK_SIZE = DNC.CHUNK_SIZE;
        const MAX_VARIATION = 6; 
        const BASE_HEIGHT = 0; 

        let [cx, cy, cz] = chunk_id.split(',').map(Number);

        let chunk = new Chunk(chunk_id); 

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                let worldX = cx * CHUNK_SIZE + x;
                let worldZ = cz * CHUNK_SIZE + z;

                let terrainHeight = this.generateTerrainHeight(worldX, worldZ);

                for (let y = 0; y < CHUNK_SIZE; y++) {
                    let worldY = cy * CHUNK_SIZE + y;

                    if (worldY <= terrainHeight) {
                        chunk.set(1, x, y, z); // Solid block
                    } else {
                        chunk.set(0, x, y, z); // Air
                    }
                }
            }
        }

        return chunk;
    }

    generateTerrainHeight(x, z) {
        let height = perlinNoise2D(x * 0.1, z * 0.1) * 3; // Scale from -3 to 3
        return Math.round(height); // Ensure integer values
    }

    
    getValidChunks(position) {
        const CHUNK_SIZE = DNC.CHUNK_SIZE;
        const render_distance = this.render_distance;

        const cx = Math.floor(position.x / CHUNK_SIZE);
        const cy = Math.floor(position.y / CHUNK_SIZE);
        const cz = Math.floor(position.z / CHUNK_SIZE);

        const nearbyChunks = new Set();

        for (let x = cx - render_distance; x <= cx + render_distance; x++) {
            for (let y = cy - render_distance; y <= cy + render_distance; y++) {
                for (let z = cz - render_distance; z <= cz + render_distance; z++) {
                    nearbyChunks.add(`${x},${y},${z}`);
                }
            }
        }

    return nearbyChunks;
    }
}
