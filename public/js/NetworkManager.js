export class NetworkManager {
    constructor(url) {
        this.ws = new WebSocket(url);
        this.handlers = {};
        this.readyPromise = new Promise((resolve) => {
            this.ws.onopen = () => {
                console.log("Connected to WebSocket");
                resolve();
            };
        });

        this.ws.onmessage = this.handleMessage.bind(this);
    }

    async send(type, payload) {
        await this.readyPromise; // Wait until WebSocket is open
        this.ws.send(JSON.stringify({ type, ...payload }));
    }

    on(eventType, callback) {
        this.handlers[eventType] = callback;
    }

    handleMessage(event) {
        const data = JSON.parse(event.data);
        if (this.handlers[data.type]) {
            this.handlers[data.type](data);
        }
    }
}

function test() {
    const nm = new NetworkManager("ws://localhost:5173");
    nm.send("player_update", {
        position: "x,x,z,"
    });
};
//test();
