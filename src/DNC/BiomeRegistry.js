import { DNC_Biomes } from "./biomes/index.js";

export class BiomeRegistry {
    static defaultRegistry = new BiomeRegistry();
    static biomes = new Map();

    static #registerBiome(biome) { 
        this.biomes.set(`${biome.mod_namespace}:${biome.name}`, biome); 
    }

    static RegisterBiome(biome) {
        this.#registerBiome(biome);
    }

    static async RegisterDefaultBiomes() {
        for (const biome of DNC_Biomes) {  
            this.RegisterBiome(biome);
        }
    }

    static GetBiome(moisture, temperature) {

        if (this.biomes.size === 0) {
            console.warn("No biomes registered yet, check async calls"); // To the future, I leave unto you a gift that will save thine headaches :DDD
            return null;
        }
        //console.log("Available biomes:", Array.from(this.biomes.values()));

        let closestBiome = null;
        let minDistance = Infinity;

        for (const biome of this.biomes.values()) {
            const dist = Math.hypot(
                biome.moisture - moisture,
                biome.temperature - temperature
            );

            if (dist < minDistance) {
                minDistance = dist;
                closestBiome = biome;
            }
        }

        return closestBiome;
    }
}

