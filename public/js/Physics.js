
export class Physics {
    constructor(chunks, CHUNK_SIZE) {
        this.chunks = chunks;
        this.CHUNK_SIZE = CHUNK_SIZE
    }

    // Detects any potential collisions
    broadphase(player) {
        const potentialCollisions = [];

        const minX = Math.floor(player.getPosition().x - 0.5);
        const maxX = Math.ceil(player.getPosition().x + 0.5);
        const minY = Math.floor(player.getPosition().y - 0.5);
        const maxY = Math.ceil(player.getPosition().y + 0.5);
        const minZ = Math.floor(player.getPosition().z - 0.5);
        const maxZ = Math.ceil(player.getPosition().z + 0.5);

        for(let x = minX; x <= maxX; x++){
            for(let y = minY; y <= maxY; y++){
                for(let z = minZ; z <= maxZ; z++){

                    const chunkX = Math.floor(x / this.CHUNK_SIZE);
                    const chunkY = Math.floor(y / this.CHUNK_SIZE);
                    const chunkZ = Math.floor(z / this.CHUNK_SIZE);

                    const blockX = x % this.CHUNK_SIZE;
                    const blockY = y % this.CHUNK_SIZE;
                    const blockZ = z % this.CHUNK_SIZE;

                    const localBlockX = blockX < 0 ? this.CHUNK_SIZE + blockX : blockX;
                    const localBlockY = blockY < 0 ? this.CHUNK_SIZE + blockY : blockY;
                    const localBlockZ = blockZ < 0 ? this.CHUNK_SIZE + blockZ : blockZ;

                    // console.log("Chunk co-ordinates: ", chunkX, chunkY, chunkZ);
                    // console.log("Local chunk co-ordinates: ", blockX, blockY, blockZ);

                    const key = [chunkX, chunkY, chunkZ]
                    const chunk = this.chunks.getChunk(key);

                    if(chunk){
                        const blockID = chunk.at(localBlockX, localBlockY, localBlockZ);
                        if(blockID === 1){
                            potentialCollisions.push(new THREE.Vector3(x, y, z));
                        }
                    }
                }
            }
        }

        // console.log("Broadphase collisions detected: ", potentialCollisions.length, "Collisions :", potentialCollisions, "min values: ", minX, maxX, minY, maxY, minZ, maxZ);
    }

    // Detects actual collisions
    narrowphase() {

    }

    // Resolves collisions
    resolveCollisions() {

    }

    update(dt, player, v) {

    }
}