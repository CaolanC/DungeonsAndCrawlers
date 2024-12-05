const DNC = {
    CHUNK_SIZE: 16,
    NAMESPACE: 255,
    BLOCK: {
        AIR: 0, // Air is kind of special in that we can use it's state and reserved bits for maybe adding extra information. We could encode air pressure, our fluid dynamics
        // into the block itself. TODO: Consider adding metadata to air with the extra bits.
        STONE: 1,
    },
};

/**
 * Block bit layout (32 bits total):
 * - Bits 0-7:    Namespace (8 bits, 0-255)
 * - Bits 8-23:   ID (16 bits, 0-65535)
 * - Bits 24-27:  State (4 bits, 0-15)
 * - Bits 28-31:  Reserved (4 bits, 0-15)
 */
class BlockMaker {
    static Create(namespace, id, state = 0, reserved = 0) {
        let block = 0b0;

        block |= namespace & 0xff; // bitmask, 0xf is 1111 in binary, ensuring that we never risk overflow. Even on the offchance a cosmic particle shifts our bit, it can just be considered a cool easter egg or something. TODO: Error checking. We probabaly want to return something in the result of an error.
        block |= (id & 0xffff) << 8;
        block |= (state & 0xf) << 24;
        block |= (reserved & 0xf) << 28; // Future proofing, don't assume reserved just has to be reserved. If it isn't being used, we can used it.

        return block;
    }

    // TODO: Add a decoder, and maybe a map to string names.
}

class Chunk {
    static _SIZE_SQUARED = DNC.CHUNK_SIZE ** 2; // Caching these because the amount omoun of blocks that need to be generated could be astounding. Removing operations without adding
    // complexity could save use headaches down the line.
    static _SIZE_CUBED = DNC.CHUNK_SIZE ** 3;

    constructor(x, y) {
        this._chunk = new Array(this._SIZE_CUBED).fill(0);
    }

    at(x, y, z) {
        // TODO: general bounds checking private method.
        return this._chunk[x + y * DNC.CHUNK_SIZE + z * this._SIZE_SQUARED];
    }

    set(block, x, y, z) {
        this._chunk[x + y * DNC.CHUNK_SIZE + z * this._SIZE_SQUARED] = block;
    }
}

class ChunkManager {}

class World {
    constructor(seed) {
        this.seed = seed;
    }
}

main();

function main() {
    let chunk = new Chunk(0, 0);
    let block = BlockMaker.Create(DNC.NAMESPACE, DNC.BLOCK.STONE);
    chunk.set(block, 15, 15, 15);
    console.log(chunk.at(15, 15, 15));
}

// TODO: During registration time, we need to create a map for unique ID's of blocks for the server's use, to a way for clients and users to identify blocks "DNC:stone" for example is mapped to an abstract id decided by the system

// TODO: Expand on our blocks, refine the properties and implement a registry system for the frontend and backend as well as shared components. Add a solid block, skip direct registry for now, get them sent to our frontned.
