import { DNC } from "./Config.js";
import { perlinNoise2DNorm, perlinNoise2D } from "./PerlinNoise.js";
import { Chunk } from "./Chunk.js";
import { BiomeRegistry } from "./BiomeRegistry.js";
import { BlockRegistry } from "./BlockRegistry.js";
import { BiomeMap } from "./BiomeMap.js";
import { md5 } from "./Hash.js";

export class ChunkManager { 

    constructor(render_distance) {
        this.render_distance = render_distance;
        this.loaded_chunks = new Set();
        this.generated_chunks = new Map();
        this.biome_map = new BiomeMap(0, 0, 0.01);
    }

    getChunksToLoad(player) {
        const chunks = new Set();
        const chunk_ids = this.getValidChunks(player.position);
        chunk_ids.forEach((chunk_id) => {
            if (!player.loaded_chunks.has(chunk_id)) {
                if (!this.generated_chunks.has(chunk_id)) {
                    let new_chunk = this.generateChunk(chunk_id);
                    this.generated_chunks.set(chunk_id, new_chunk);
                    player.loaded_chunks.add(chunk_id);
                    chunks.add(new_chunk);
                } else {
                    let chunk = this.generated_chunks.get(chunk_id);
                    player.loaded_chunks.add(chunk_id);
                    //console.log(chunk);
                    chunks.add(chunk);
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
                let biome = this.biome_map.getBiomeAt(worldX, worldZ);
                //if (biome.name == "Grassland") {
                //    console.log(biome);
                //}
                let terrainHeight = this.generateTerrainHeight(worldX, worldZ, biome);
                //console.log(x, z, "\n-> ", terrainHeight);
                let should_place_tree = this.shouldPlaceTree(worldX, worldZ);
                for (let y = 0; y < CHUNK_SIZE; y++) {
                    let worldY = cy * CHUNK_SIZE + y;

                    if (chunk.at(x, y, z) != 0) {
                        continue;
                    }

                    if (worldY == terrainHeight) {
                        let block = BlockRegistry.blocks.get(biome.layers.surface);

                        if (should_place_tree) { 
                            this.placeTree(x, y, z, chunk);
                            should_place_tree = false;
                        };
                        chunk.set(block, x, y, z);
                    } else if (worldY < terrainHeight) {
                        let block = BlockRegistry.blocks.get(biome.layers.subsurface);
                        chunk.set(block, x, y, z); 
                    } else {
                        chunk.set(0, x, y, z); // Air
                    }
                }
            }
        }

        return chunk;
    }

    placeTree(x, y, z, chunk) {
        for (let dx = -2; dx <= 2; dx++) {
            for (let dz = -2; dz <= 2; dz++) {
                if (chunk.at(x + dx, y + 1, z + dz) === BlockRegistry.blocks.get("DNC:Ice")) {
                    return; 
                }
            }
        }

        let block = BlockRegistry.blocks.get("DNC:Ice");
        chunk.set(block, x,  y + 1, z);
    }   

    shouldPlaceTree(x, z) {
        let noise_value = perlinNoise2D(0.01 + x * 0.15, 0.01 + z * 0.015) * 40;
        let hash_input = `${x},${z}`;
        let hash_value = parseInt(md5(hash_input).slice(0, 8), 16) % 100;
    
        let threshold = noise_value + 30; 
    
        return hash_value > threshold * 10;
    }
    

    generateTerrainHeight(x, z, biome) {
        let height = perlinNoise2D(x * 0.05, z * 0.05) * biome.terrain_amplitude; // Scale from -3 to 3
        return Math.floor(height); // Ensure integer values
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
