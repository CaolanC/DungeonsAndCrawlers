import { DNC_Blocks } from "./blocks/index.js";

export class BlockRegistry {
	static defaultRegistry = new BlockRegistry();
	static clientRegistry = new BlockRegistry();

	#registerBlock(block) {
		console.log(block.namespace + block.name);
	}

	static RegisterBlock(block) {
		this.defaultRegistry.#registerBlock(block);
	}

	static async RegisterDefaultBlocks() {
		DNC_Blocks.forEach((block) => {
			console.log(block.name);
		});
	}
}
