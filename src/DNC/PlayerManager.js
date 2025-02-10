export class PlayerManager {
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
