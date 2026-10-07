import  { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

const rooms = new Map();

wss.on("connection", (ws) => {
    console.log("user connected");

    ws.on("message", (data) => {
        const message = JSON.parse(data);

        // JOIN ROOM
        if (message.type === "join") {
            const roomcode = message.roomcode;

            if (!rooms.has(roomcode)) {
                rooms.set(roomcode, new Set());
            }

            const room = rooms.get(roomcode);

            room.add(ws);

            ws.roomcode = roomcode;

            console.log("user joined:", roomcode);

            // Tell existing users that someone joined
            for (const client of room) {
                if (client !== ws) {
                    client.send(JSON.stringify({
                        type: "join",
                        username: message.username
                    }));
                }
            }
        }

        // OFFER / ANSWER / ICE
        if (
            message.type === "offer" ||
            message.type === "answer" ||
            message.type === "ice"
        ) {
            const room = rooms.get(ws.roomcode);

            if (!room) return;

            for (const client of room) {
                if (client !== ws) {
                    client.send(JSON.stringify(message));
                }
            }
        }
    });

    ws.on("close", () => {
        console.log("user disconnected");

        const roomcode = ws.roomcode;

        if (!roomcode) return;

        const room = rooms.get(roomcode);

        if (!room) return;

        room.delete(ws);

        if (room.size === 0) {
            rooms.delete(roomcode);
        }
    });
});

console.log("WebSocket server running on ws://localhost:8080");