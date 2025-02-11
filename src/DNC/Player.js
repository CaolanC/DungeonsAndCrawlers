export class Player {
    
    custom_spawnpoint = null;
    pending_position = null;
    last_update_time = null;
    constructor(display_name, position) {
        this.display_name = display_name;
        this.position = position;        
    }
}
