const WebSocketServer = require('ws').Server;
const socket = new WebSocketServer({ 
    port: 3000, 
});
var clients = new Map();

socket.on('connection', (ws) => {
    ws.send(createMessage('requestChannel'));
    console.log('Client connected');

    ws.on('message', (message) => {
        try {
            const messageStr = message instanceof Buffer ? message.toString() : message;
            const data = JSON.parse(messageStr);
            const targetChannel = data.channel;
            const messageType  = data.type;
            const messageText = data.text;
            const messageColor = data.color;
            // Verify validity of message
            if (!(Number.isInteger(targetChannel) && targetChannel >= 0 && targetChannel <= 1000)) {
                throw new Error(`Invalid message channel: ${targetChannel}`);
            }
            if (typeof messageText !== 'string') {
                throw new Error(`Invalid message text: ${messageText}`);
            }
            if (typeof messageColor !== 'string') {
                throw new Error(`Invalid message color: ${messageColor}`);
            }
            // Process message
            if (messageType === 'textMessage') {
                clients.forEach((channel, client) => {
                    if (channel === targetChannel) {
                        try {
                            client.send(JSON.stringify(data));
                        } catch (error) {
                            console.log(`Unable to send message to client ${client}`);
                            console.error(error);
                        }
                    }
                });

            } else if (messageType === 'updateChannel') {
                clients.set(ws, targetChannel);
                
            } else {
                throw new Error(`Invalid message type: ${messageType}`);
            }
        } catch (error) {
            console.error(error);
            ws.send(createMessage('error', 0, "We weren't able to process that :(", 'red'));
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client disconnected');
    });

    ws.on('error', (error) => {
        console.error(`Error on channel ${clients.get(ws)}: ${error.message}`);
    });
});

function createMessage(type, channel=0, text='placeholder', color='lime') {
    return JSON.stringify({
        type: type,
        channel: channel,
        text: text,
        color: color
    })
}