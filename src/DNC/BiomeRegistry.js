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
		await DNC_Biomes.forEach((biome) => {
            this.RegisterBiome(biome);
		});
	}
}
