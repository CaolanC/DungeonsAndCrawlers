import { DNC } from "./Config.js";

export class Chunk {
	static _SIZE_SQUARED = DNC.CHUNK_SIZE ** 2; // Caching these because the amount omoun of blocks that need to be generated could be astounding. Removing operations without adding
	// complexity could save use headaches down the line.
	static _SIZE_CUBED = DNC.CHUNK_SIZE ** 3;
    static from(jsonChunk) {

        let newChunk = new Chunk();
        newChunk._chunk = jsonChunk.chunk; // Restore the block data

        return newChunk;
    }

	constructor(x, y) {
		this._chunk = new Array(Chunk._SIZE_CUBED).fill(0);
	}

	at(x, y, z) {
		// TODO: general bounds checking private method.
		return this._chunk[x + y * DNC.CHUNK_SIZE + z * Chunk._SIZE_SQUARED];
	}

	set(block, x, y, z) {
		this._chunk[x + y * DNC.CHUNK_SIZE + z * Chunk._SIZE_SQUARED] = block;
	}
}
