
// -- Page Setup --
var channel = 0;
var previousChannel = 0;

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
    });
});
var randomColor = Math.floor(Math.random() * colors.length);
colors[randomColor].checked = true;
colorSelected = colors[randomColor].value;

window.onload = function() {
    channelInput.value = channel;
    messageInput.style.color = colorSelected;
}



// -- Server/Client handling --
const socket = new WebSocket('ws://localhost:3000')

function sendMessage() {
    const trimmedMessageInput = messageInput.value.trim();
    if (trimmedMessageInput) {
        const message = createMessage('textMessage', channel, trimmedMessageInput, colorSelected);
        socket.send(message);
        messageInput.value = '';
    }
    input.focus();
}

channelInput.addEventListener('input', updateChannel);

function updateChannel() {
    var channelValue = parseInt(channelInput.value, 10);
    if (!Number.isInteger(channelValue)) {
        channelValue = 0;
    } else if (channelValue < 0) {
        channelValue = 0;
    } else if (channelValue > 1000) { 
        channelValue = 1000;
    }
    channelInput.value = channelValue;
    if (channelValue != previousChannel) {
        previousChannel = channel;
        channel = channelValue;
        const message = createMessage('updateChannel', channel);
        socket.send(message);
    } else {
        channel = channelValue;
    }
    channelHeading.textContent = `Channel ${channel}`;

}

// Receive messages and add to chat div
socket.addEventListener('message', (event) => {
    console.log(event.data);
    const message = JSON.parse(event.data);
    const text = document.createElement('p');
    text.style.color = message.color;
    text.textContent = message.text;
    chat.appendChild(text);

})

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