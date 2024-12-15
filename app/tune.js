
// -- Page Setup --
var randomChannel = Math.floor(Math.random() * 1001);
var channel = randomChannel;
var previousChannel = channel

const channelHeading = document.getElementById('channel-heading');
const messageInput = document.getElementById('message-input');
const channelInput = document.getElementById('channel-input');
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
    channelHeading.textContent = `channel ${channel}`;
    messageInput.focus();
}



// -- Server/Client handling --
const socket = new WebSocket('ws://localhost:3000')

// Send text messages
function sendMessage() {
    const trimmedMessageInput = messageInput.value.trim();
    if (trimmedMessageInput) {
        const message = createMessage('textMessage', channel, trimmedMessageInput, colorSelected);
        socket.send(message);
        messageInput.value = '';
    }
    input.focus();
}

// Update your channel on server
function updateChannel() {
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
        previousChannel = channel;
        channel = newChannelValue;
        socket.send(createMessage('updateChannel', channel));
    } else {
        channel = newChannelValue;
    }
    channelHeading.textContent = `channel ${channel}`;
}
channelInput.addEventListener('input', updateChannel);

// Receive messages and add to chat div
socket.addEventListener('message', (event) => {
    console.log(event.data);
    const message = JSON.parse(event.data);
    const type = message.type;
    if (type === 'requestChannel') {
        socket.send(createMessage('updateChannel', channel));
    } else if (type === 'textMessage' || type === 'error') {
        const text = document.createElement('p');
        text.style.color = message.color;
        text.textContent = message.text;
        chat.appendChild(text);
    }
    
})

// JSON message creator
function createMessage(type, channel=0, text='placeholder', color='lime') {
    return JSON.stringify({
        type: type,
        channel: channel,
        text: text,
        color: color
    })
}


// -- Input Handling --
document.getElementById('input').addEventListener('submit', function(e) {
    e.preventDefault();
    updateChannel();
    sendMessage();
});