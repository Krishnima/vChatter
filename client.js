const socket = io('http://localhost:8000');  // Ensure this points to the correct server URL

// Get DOM elements
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector(".container");
var audio = new Audio('ting.mp3');

// Function to append messages to the container
const append = (message, position) => {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageContainer.append(messageElement);
    if (position === 'left') {
        audio.play();
    }
};

// Ask the new user for their name
const name = prompt("Enter your name to join");
socket.emit('new-user-joined', name);

// If a new user joins, receive the event from the server
socket.on('user-joined', name => {
    append(`${name} joined the chat`, 'left');
});

// When a message is received, display it in the container
socket.on('receive', data => {
    append(`${data.name}: ${data.message}`, 'left');
});

// When a user leaves, notify others
socket.on('left', name => {
    append(`${name} left the chat`, 'left');
});

// Handle sending a message
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    append(`You: ${message}`, 'right');
    socket.emit('send', message);
    messageInput.value = '';
});
