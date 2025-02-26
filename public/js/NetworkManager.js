export class NetworkManager {
    constructor(url) {
        this.url = url;
        this.handlers = {};
        this.connect();
    }

    connect() {
        this.ws = new WebSocket(this.url);
        this.readyPromise = new Promise((resolve) => {
            this.ws.onopen = () => {
                console.log("Connected to WebSocket");
            };
        });
        this.ws.onmessage = this.handleMessage.bind(this);
        this.ws.onerror = (err) => {
            console.error("WebSocket Error:", err);
        };

        this.ws.onclose = () => {
            console.warn("WebSocket closed. Reconnecting in 3 seconds...");
            setTimeout(() => this.connect(), 3000);
        };
    };

    async send(type, payload) {
        await this.readyPromise; // Wait until WebSocket is open
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, ...payload }));
        } else {
            console.error("WebSocket is not open. Failed to send message:", type, payload);
        }
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
