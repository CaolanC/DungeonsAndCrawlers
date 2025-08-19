
// TODO: Addition and removal of physics bodies (?),
// Function to determine whether chunks should be unloaded or reloaded (?)

export class ChunkRendererManager {
    constructor(scene) {
        this.scene = scene;
        this.chunkMap = new Map();
    }

    convertKey(location){
        const key = location.join(',');
        return key;
    }

    getChunk(location){
        const key = this.convertKey(location);
        const chunk_mesh_obj = this.chunkMap.get(key);
        if(chunk_mesh_obj) {
            return chunk_mesh_obj;
        }
        return null;
    }

    hasChunk(location) {
        return this.chunkMap.has(this.convertKey(location)) 
    }

    storeChunk(location, chunk, mesh){
        const key = this.convertKey(location);

        if (this.chunkMap.has(key)) {
//            this.unloadChunk(location);
        }

        const chunk_mesh_obj = {
            chunk: chunk,
            mesh: mesh
        }

        this.chunkMap.set(key, chunk_mesh_obj);
    }

    reloadChunk(location){
        const key = this.convertKey(location);
        if(!this.chunkMap.has(key)){
            return "Unknown chunk";
        }
        const mesh = this.chunkMap.get(key).mesh;
        if(mesh && !this.scene.children.includes(mesh)){
            this.scene.add(mesh);
        }
    }

    unloadChunk(location, conv=false){

        const key = location;
        if (!conv) {
            key = this.convertKey(location);
        }

        if(!this.chunkMap.has(key)){
            console.warn(`Attempted to unload chunk that does not exist: ${location}`);
            return;
        }

        const chunkData = this.chunkMap.get(key);
        const mesh = chunkData.mesh

        if (mesh) {
            this.scene.remove(mesh);

            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(material => material.dispose());
                } else {
                    mesh.material.dispose();
                }
            }
            mesh.matrixAutoUpdate = false;
            mesh.matrix.identity();
            //if (mesh.instanceMatrix) mesh.instanceMatrix.dispose();
        }

        this.chunkMap.delete(key);
    }

    getMap(){
        return this.chunkMap;
    }

    cullChunks(player_position) {
        for (let key of this.chunkMap.keys()) {
            if (!this.getValidChunks(player_position).has(key)) {
                this.unloadChunk(key, true);
                // TODO: Clear the chunks efficiently
            }
        }
    }

    getValidChunks(position) {
        const CHUNK_SIZE = 16;//DNC.CHUNK_SIZE;
        const render_distance = 4;//lthis.render_distance;

        const cx = Math.floor(position.x / CHUNK_SIZE);
        const cy = Math.floor(position.y / CHUNK_SIZE);
        const cz = Math.floor(position.z / CHUNK_SIZE);

        const nearbyChunks = new Set();

        for (let x = cx - render_distance; x <= cx + render_distance; x++) {
            for (let y = cy - render_distance; y <= cy + render_distance; y++) {
                for (let z = cz - render_distance; z <= cz + render_distance; z++) {
                    nearbyChunks.add(`${x},${y},${z}`);
                }
            }
        }

        return nearbyChunks;
    }

}
