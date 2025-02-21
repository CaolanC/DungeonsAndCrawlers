import { DNC_NPCs } from "./npcs/index.js";

export class NPCRegistry {
	static defaultRegistry = new NPCRegistry();
    static NPCs = new Map();

	static #registerBlock(npc) {
        this.NPCs.set(`${npc.namespace}:${npc.name}`, npc);
	}

	static RegisterNPC(block) {
		this.#registerBlock(block);
	}

	static async RegisterDefaultNPCs() {

        for (let npc of DNC_NPCs) {
            this.RegisterBlock(npc);
        }
	}
}
