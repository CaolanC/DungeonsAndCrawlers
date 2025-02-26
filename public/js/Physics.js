// Some logic on page taken from the following source: https://www.youtube.com/watch?v=_aK-1L-GC6I

import { sub } from "three/tsl";

export class Physics {
    constructor(chunks, CHUNK_SIZE, scene) {
        this.chunks = chunks;
        this.CHUNK_SIZE = CHUNK_SIZE
        this.scene = scene;

        this.helpers = new THREE.Group();
        this.scene.add(this.helpers);
    }

    // Detects any potential collisions
    broadphase(player) {
        const potentialCollisions = [];
        const subvoxels = 3;
        const minX = Math.floor((player.getPosition().x - 0.5) * subvoxels);
        const maxX = Math.ceil((player.getPosition().x + 0.5) * subvoxels);
        const minY = Math.floor((player.getPosition().y - 0.5) * subvoxels);
        const maxY = Math.ceil((player.getPosition().y + 0.5) * subvoxels);
        const minZ = Math.floor((player.getPosition().z - 0.5) * subvoxels);
        const maxZ = Math.ceil((player.getPosition().z + 0.5) * subvoxels);

        for(let x = minX; x <= maxX; x++){
            for(let y = minY; y <= maxY; y++){
                for(let z = minZ; z <= maxZ; z++){

                    const chunkX = Math.floor(x / (this.CHUNK_SIZE * subvoxels));
                    const chunkY = Math.floor(y / (this.CHUNK_SIZE * subvoxels));
                    const chunkZ = Math.floor(z / (this.CHUNK_SIZE * subvoxels));

                    const blockX = (x % (this.CHUNK_SIZE * subvoxels)) / subvoxels;
                    const blockY = (y % (this.CHUNK_SIZE * subvoxels)) / subvoxels;
                    const blockZ = (z % (this.CHUNK_SIZE * subvoxels)) / subvoxels;

                    const localBlockX = blockX < 0 ? this.CHUNK_SIZE + blockX : blockX;
                    const localBlockY = blockY < 0 ? this.CHUNK_SIZE + blockY : blockY;
                    const localBlockZ = blockZ < 0 ? this.CHUNK_SIZE + blockZ : blockZ;

                    const key = [chunkX, chunkY, chunkZ];
                    const chunkData = this.chunks.getChunk(key);

                    if(chunkData != null && chunkData.chunk) {
                        const blockID = chunkData.chunk.at(localBlockX, localBlockY, localBlockZ);
                        if(blockID != 0){
                            potentialCollisions.push(new THREE.Vector3(x / subvoxels, y / subvoxels, z / subvoxels));
                        }
                    }
                }
            }
        }

        return potentialCollisions;

    }

    // Detects actual collisions
    narrowphase(player, potentialCollisions) {
        const collisions = [];

        for(const block of potentialCollisions) {
            const pos = player.getPosition();
            const closestPoint = {
                x: Math.max(block.x - 0.5, Math.min(pos.x, block.x + 0.5)),
                y: Math.max(block.y - 0.5, Math.min(pos.y, block.y + 0.5)),
                z: Math.max(block.z - 0.5, Math.min(pos.z, block.z + 0.5)),
            }

            const cx = closestPoint.x - pos.x;
            const cy = closestPoint.y - pos.y;
            const cz = closestPoint.z - pos.z;

            if(Math.abs(cx) <= 0.5 && Math.abs(cy) <= 0.5 && Math.abs(cz) <= 0.5){
                const overlapX = 0.5 - Math.abs(cx);
                const overlapY = 0.5 - Math.abs(cy);
                const overlapZ = 0.5 - Math.abs(cz);

                const overlapXZ = 0.5 - Math.sqrt(cx * cx + cz * cz);

                let normal, overlap;
    
                if(overlapY < overlapXZ){
                    normal = new THREE.Vector3(0, -Math.sign(cy), 0)
                    overlap = overlapY;
                    player.onGround = true;
                }
                else{
                    normal = new THREE.Vector3(-cx, 0, -cz).normalize();
                    overlap = overlapXZ;
                }

                collisions.push({
                    block: block,
                    contactPoint: closestPoint,
                    overlap: overlap,
                    normal: normal,
                });

            }
        }

        return collisions;
    }

    // Resolves collisions
    resolveCollisions(player, collisions) {
        collisions.sort((a, b) => { return a.overlap < b.overlap })

        for(const collision of collisions){
            const p = player.getPosition();
            const cx = collision.contactPoint.x - p.x;
            const cy = collision.contactPoint.y - p.y;
            const cz = collision.contactPoint.z - p.z;
            if(!(Math.abs(cx) < 0.5 && Math.abs(cy) < 0.5 && Math.abs(cz) < 0.5)){
                continue;
            }
            const newpos = collision.normal.clone();
            newpos.multiplyScalar(collision.overlap);
            player.getPosition().add(newpos);

            const vel = player.getVelocity();
            const vnormal = vel.clone().dot(collision.normal);

            if(vnormal < 0){
                const adjust = collision.normal.clone().multiplyScalar(-vnormal);
                vel.add(adjust);
                player.velocity = vel;
            }
        }

    }

    update(dt, player) {
        player.onGround = false;
        this.helpers.clear();
        const potentialCollisions = this.broadphase(player);
        const collisions = this.narrowphase(player, potentialCollisions);

        if(collisions.length > 0){
            this.resolveCollisions(player, collisions);
        }
    }

}
