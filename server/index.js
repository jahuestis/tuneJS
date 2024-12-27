const WebSocketServer = require('ws').Server;
const socket = new WebSocketServer({ 
    //host: '127.0.0.1', // Bind to localhost only
    port: 3000, 
});
var clients = new Map();

socket.on('connection', (ws) => {
    console.log('Client connected');
    ws.send(jsonMessage('requestClient', {test: 0}));
    
    // Set up a keepalive ping
    const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.ping(); // Send ping frame
        }
    }, 30000); // Send every 30 seconds

    ws.on('message', (message) => {
        try {
            const messageStr = message instanceof Buffer ? message.toString() : message;
            //console.log(messageStr)
            const messageJSON = JSON.parse(messageStr);

            const application = messageJSON.application;
            if (application === "tunejs") {
                //console.log('valid application')
                const type = messageJSON.type;
                const data = messageJSON.data;

                if (type === "textMessage") {
                    const targetChannel = data.channel;
                    if (!(Number.isInteger(targetChannel) && targetChannel >= 0 && targetChannel <= 1000)) {
                        throw new Error(`Invalid message channel: ${targetChannel}`);
                    }
                    clients.forEach((channel, client) => {
                        if (channel === targetChannel) {
                            try {
                                client.send(jsonText(data.text, data.channel, data.color));
                            } catch (error) {
                                console.log(`Unable to send message to client ${client}`);
                                console.error(error);
                            }
                        }
                    });

                } else if (type === "updateChannel") {
                    const targetChannel = data.channel;
                    if (!(Number.isInteger(targetChannel) && targetChannel >= 0 && targetChannel <= 1000)) {
                        throw new Error(`Invalid message channel: ${targetChannel}`);
                    }
                    clients.set(ws, targetChannel);
                    console.log(`Moved client to ${targetChannel}`);

                } else {
                    throw new Error(`Invalid message type: ${messageType}`);
                }

            } else {
                //console.log(`Invalid application: ${application}`)
            }
            
        } catch (error) {
            console.error(error);
            ws.send("We weren't able to process that :(", 0, 'red');
        }
    });

    ws.on('close', () => {
        clearInterval(interval);
        clients.delete(ws);
        console.log('Client disconnected');
    });

    ws.on('error', (error) => {
        console.error(`Error on channel ${clients.get(ws)}: ${error.message}`);
    });
});

function jsonMessage(type, data) {
    return JSON.stringify({
        application: "tunejs",
        type: type,
        data: data
    });
}

function jsonText(text, channel, color) {
    return jsonMessage("textMessage", {
        text: text,
        channel: channel,
        color: color
    });
}

function jsonUpdateChannel(channel) {
    return jsonMessage("updateChannel", {
        channel: channel
    });
}