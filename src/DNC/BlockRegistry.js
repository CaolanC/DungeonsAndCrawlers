import { DNC_Blocks } from "./blocks/index.js";

export class BlockRegistry {
	static defaultRegistry = new BlockRegistry();
	static clientRegistry = new BlockRegistry();
    static blocks = new Map();

	static #registerBlock(block) {
        this.blocks.set(`${block.mod_namespace}:${block.name}`, block.id);
	}

	static RegisterBlock(block) {
		this.#registerBlock(block);
	}

	static async RegisterDefaultBlocks() {

        for (let block of DNC_Blocks) {
            this.RegisterBlock(block);
        }
	}
}
