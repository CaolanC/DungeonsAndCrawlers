import { DNC } from "./Config.js";

export class Chunk {
	static _SIZE_SQUARED = DNC.CHUNK_SIZE ** 2; // Caching these because the amount omoun of blocks that need to be generated could be astounding. Removing operations without adding
	// complexity could save use headaches down the line.
	static _SIZE_CUBED = DNC.CHUNK_SIZE ** 3;
    static from(jsonChunk) {

        let newChunk = new Chunk();

        let chunk = jsonChunk._chunk;
        newChunk.location = jsonChunk.location;

        for(let x = 0; x < DNC.CHUNK_SIZE; x++) {
            for(let y = 0; y < DNC.CHUNK_SIZE; y++) {
                for(let z = 0; z < DNC.CHUNK_SIZE; z++) {
                    newChunk.set(chunk.at(x, y, z), x, y, z);
                }
            }
        }
    
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
