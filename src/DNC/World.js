import { readdir } from "fs/promises";
import { DNC_Blocks } from "./blocks/index.js";
import { DNC_Biomes } from "./biomes/index.js";
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DNC = {
	CHUNK_SIZE: 16,
	NAMESPACE: 255,
	BLOCK: {
		AIR: 0, // Air is kind of special in that we can use it's state and reserved bits for maybe adding extra information. We could encode air pressure, our fluid dynamics
		// into the block itself. TODO: Consider adding metadata to air with the extra bits.
		STONE: 1,
	},
    FRAMERATE: 10,
    RENDER_DISTANCE: 8
};

DNC.FRAME_DURATION = 1000 / DNC.FRAMERATE;

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

class ChunkManager { 

    constructor(render_distance=DNC.RENDER_DISTANCE) {
        this.render_distance = render_distance;
    }
    
    getValidChunks(position) {
        const CHUNK_SIZE = DNC.CHUNK_SIZE;
        const render_distance = this.render_distance;

        const cx = Math.floor(position.x / CHUNK_SIZE);
        const cy = Math.floor(position.y / CHUNK_SIZE);
        const cz = Math.floor(position.z / CHUNK_SIZE);

        const nearbyChunks = [];

        for (let x = cx - render_distance; x <= cx + render_distance; x++) {
            for (let y = cy - render_distance; y <= cy + render_distance; y++) {
                for (let z = cz - render_distance; z <= cz + render_distance; z++) {
                    nearbyChunks.push({ x, y, z });
                }
            }
        }

    return nearbyChunks;
    }
}

class World {
	constructor(seed) {
		this.seed = seed;
	}
}

// TODO: During registration time, we need to create a map for unique ID's of blocks for the server's use, to a way for clients and users to identify blocks "DNC:stone" for example is mapped to an abstract id decided by the system

// TODO: Expand on our blocks, refine the properties and implement a registry system for the frontend and backend as well as shared components. Add a solid block, skip direct registry for now, get them sent to our frontned.


class BlockRegistry {
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

// TODO: Separate client and server block data
// TODO: Implement data view to store chunk height maps in a flatbuffer. 11 bits, signed -1023-1023. Also, when it comes to chunk loading what we really need to do is ->
// draw a cylinder around the player, start from the render distance in the sky. When a chunk is loaded work down until all the values of the height map have been used. Then fill al
// the remaining values.

class BiomeRegistry {
	static defaultRegistry = new BiomeRegistry();

	#registerBiome(biome) { }

	static RegisterBiome(biome) {
		this.defaultRegistry.#registerBiome(biome);
	}

	static async RegisterDefaultBiomes() {
		await DNC_Biomes.forEach((biome) => {
			console.log(biome);
		});
	}
}

class Position {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}   

class Player {
    
    custom_spawnpoint = null;
    constructor(display_name, position) {
        this.display_name = display_name;
        this.position = position;        
    }
}

class PlayerManager {
    players = new Map();
    constructor() {

    }

    addPlayer(username, player) {
        this.players.set(username, player);
        console.log(player.display_name);
    }

    getPlayers() {
        return this.players;
    }
}

export class Server {
    
    world = null;
    tick_counter = 0;
    playerManager = new PlayerManager();
    chunkManager = new ChunkManager();

    #lastFrameTime = Date.now();

    constructor(app, port) {
        this.app = app;
        this.port = port;
    }


    start() {

        this.initApp();
        this.gameLoop();
        this.app.listen(this.port, () => {
            console.log(`PORT: ${this.port}`);
        });
    }

    getDefaultSpawnPoint() {
        const position = new Position(0, 0, 0);
        return position;
    }

    gameLoop() {
        const now = Date.now();

        const deltaTime = now - this.#lastFrameTime;

        if (deltaTime >= DNC.FRAME_DURATION) {
            this.#lastFrameTime = now;
            this.playerManager.getPlayers().forEach((player, key) => {
                //EntityPhysicsManager.updatePlayerPhysics(player);
                console.log(this.chunkManager.getValidChunks(player.position));
            });
            // Game state calls and such
        }

        this.tick_counter++; // For client syncing. We need a global tick counter so that clients only send us updates every tick, instead of wasting calls to the server.
        setTimeout(() => this.gameLoop(), Math.max(0, DNC.FRAME_DURATION - deltaTime));
    }

    initApp() {

        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true}));
        this.app.use(express.static(path.join(__dirname, '../../public')));

        this.app.get('/game', (req, res) => {
            res.sendFile(path.join(__dirname, '../../public', 'game.html'));
        });

        this.app.post('/join', (req, res) => {
            const username = req.body.username;
            const player = new Player(username, this.getDefaultSpawnPoint());
            this.playerManager.addPlayer(username, player);
            res.redirect('/game');
        });

        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../../public', 'index.html'));
        });


        this.app.get('*', (req, res) => {
            res.send('Bad page');
        });

        const socket = new WebSocket("ws://localhost:24011");

        socket.addEventListener("open", () => {
            console.log("Established websocket connection");
        });
    }


    loadMainMenu() {
    }
}

async function main() {
	let chunk = new Chunk(0, 0);
	let block = BlockMaker.Create(DNC.NAMESPACE, DNC.BLOCK.STONE);
	chunk.set(block, 15, 15, 15);
	console.log(chunk.at(15, 15, 15));
	await BlockRegistry.RegisterDefaultBlocks();
	await BiomeRegistry.RegisterDefaultBiomes();
}
