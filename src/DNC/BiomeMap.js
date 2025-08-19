import { BiomeRegistry } from "./BiomeRegistry.js";
import { perlinNoise2DNorm } from "./PerlinNoise.js";

export class BiomeMap {
    constructor(seedX = 0, seedZ = 0, scale = 0.1) {
        this.seedX = seedX;
        this.seedZ = seedZ;
        this.scale = scale; // Adjusts biome size
    }

    getBiomeAt(x, z) {
        const moisture = perlinNoise2DNorm(x * this.scale + this.seedX, z * this.scale + this.seedZ);
        const temperature = perlinNoise2DNorm((x + 1000) * this.scale + this.seedX, (z + 1000) * this.scale + this.seedZ);
        //console.log(moisture, temperature);
        // Get closest biomw 
        return BiomeRegistry.GetBiome(moisture, temperature);
    }
}

