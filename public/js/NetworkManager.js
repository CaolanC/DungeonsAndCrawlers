export class NetworkManager {
    constructor(url) {
        this.ws = new WebSocket(url);
        this.ws.onopen = () => console.log("Connected to WebSocket");
        this.ws.onmessage = this.handleMessage.bind(this);
        this.handlers = {};
    }

    handleMessage(event) {
        const data = JSON.parse(event.data);
        if (this.handlers[data.type]) {
            this.handlers[data.type](data);
        }
    }

    send(type, payload) {
        this.ws.send(JSON.stringify({ type, ...payload }));
    }

    on(eventType, callback) {
        this.handlers[eventType] = callback;
    }
}

function test() {
    const nm = new NetworkManager("ws://localhost:5173");
};
