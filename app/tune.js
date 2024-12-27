
// -- Page Setup --
var randomChannel = Math.floor(Math.random() * 1001);
var channel;
var previousChannel;

// Check if the URL contains a 'channel' parameter
var url = new URL(window.location.href);
if (url.searchParams.has("channel")) {
    channel = parseInt(url.searchParams.get("channel"), 10);
} else {
    channel = randomChannel;
}
url.searchParams.set("channel", channel);
window.history.replaceState({}, "", url);

previousChannel = channel;

const messageInput = document.getElementById('message-input');
const channelInput = document.getElementById('channel-input');
const channelRandomize = document.getElementById('channel-randomize');
const chat = document.getElementById('chat');

var colors = Array.from(document.getElementsByName("color"));
var colorSelected;
colors.forEach(color => {
    if (color.checked) {
        colorSelected = color.value;
    }
    color.addEventListener('change', function() {
        colorSelected = this.value;
        messageInput.style.color = colorSelected;
        messageInput.focus();
    });
});
var randomColor = Math.floor(Math.random() * colors.length);
colors[randomColor].checked = true;
colorSelected = colors[randomColor].value;

window.onload = function() {
    channelInput.value = channel;
    messageInput.style.color = colorSelected;
    messageInput.focus();
}



// -- Server/Client handling --
const socket = new WebSocket('wss://node.beanswithwater.net/tune');

// Send text messages
function sendMessage() {
    const trimmedMessageInput = messageInput.value.trim();
    if (trimmedMessageInput) {
        socket.send(jsonText(trimmedMessageInput, channel, colorSelected));
        messageInput.value = '';
    }
    messageInput.focus();
}

// Update your channel on server
function updateChannel() {
    previousChannel = channel;
    var newChannelValue = parseInt(channelInput.value, 10);
    if (!Number.isInteger(newChannelValue)) {
        newChannelValue = 0;
    } else if (newChannelValue < 0) {
        newChannelValue = 0;
    } else if (newChannelValue > 1000) { 
        newChannelValue = 1000;
    }
    channelInput.value = newChannelValue;
    if (newChannelValue != previousChannel) {
        channel = newChannelValue;
        socket.send(jsonUpdateChannel(channel));
    } else {
        channel = newChannelValue;
    }
    url.searchParams.set("channel", channel);
    window.history.replaceState({}, "", url);
}
channelInput.addEventListener('input', updateChannel);
channelRandomize.addEventListener('click', function() {
    randomChannel = Math.floor(Math.random() * 1001);
    channelInput.value = randomChannel;
    updateChannel();
    messageInput.focus();
});

// Receive messages and add to chat div
socket.addEventListener("message", (event) => {
    //console.log(event.data);
    const messageJSON = JSON.parse(event.data);
    const application = messageJSON.application;
    if (application === "tunejs") {
        const type = messageJSON.type;
        const data = messageJSON.data;
        if (type === "requestClient") {
            //console.log('server requested client, sending current channel')
            socket.send(jsonUpdateChannel(channel));
        } else if (type === 'textMessage' || type === 'error') {
            const text = document.createElement('p');
            text.style.color = data.color;
            text.textContent = data.text;
            chat.appendChild(text);
        }
    }
    
})

// JSON message creator
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


// -- Input Handling --
document.getElementById('input').addEventListener('submit', function(e) {
    e.preventDefault();
    updateChannel();
    sendMessage();
});