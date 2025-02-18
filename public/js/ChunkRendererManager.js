
// TODO: Addition and removal of physics bodies (?),
// Function to determine whether chunks should be unloaded or reloaded (?)

export class ChunkRendererManager {
    constructor(scene) {
        this.scene = scene;
        // this.world = world;
        this.chunkMap = new Map();
    }

    convertKey(location){
        const key = location.join(',');
        return key;
    }

    getChunk(location){
        const key = this.convertKey(location);
        const innermap = this.chunkMap.get(key);
        if(innermap){
            return innermap.get("chunk");
        }
    }

    storeChunk(location, chunk, mesh){
        const innermap = new Map();
        innermap.set("chunk", chunk);
        innermap.set("mesh", mesh);
        const key = this.convertKey(location);
        this.chunkMap.set(key, innermap);
    }

    reloadChunk(location){
        const key = this.convertKey(location);
        if(!this.chunkMap.has(key)){
            return "Unknown chunk";
        }
        const mesh = this.chunkMap.get(key);
        if(mesh && !this.scene.children.includes(mesh)){
            this.scene.add(mesh);
        }
    }

    unloadChunk(location){
        const key = this.convertKey(location);
        if(!this.chunkMap.has(key)){
            return "Chunk not loaded";
        }
        const mesh = this.chunkMap.get(key);
        if(mesh){
            this.scene.remove(mesh);
        }
    }

    getMap(){
        return this.chunkMap;
    }
}