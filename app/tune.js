const socket = new WebSocket('ws://localhost:3000')

function sendMessage(e) {
    e.preventDefault();
    const input = document.getElementById('message-input');
    if (input.value) {
        socket.send(input.value);
        input.value = '';
    }
    input.focus();
}

document.getElementById('message-form').addEventListener('submit', sendMessage);

// Listen for messages
socket.addEventListener('message', ({ data }) => {
    const li = document.createElement('li');
    li.textContent = data;
    document.getElementById('messages').appendChild(li);
})