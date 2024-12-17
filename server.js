const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { Pool } = require('pg');

// Create an Express app and a HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Connect to PostgreSQL
const pool = new Pool({
    user: 'your_pg_user',       // Change to your PostgreSQL username
    host: 'localhost',
    database: 'chatapp',
    password: 'your_pg_password',  // Change to your PostgreSQL password
    port: 5432,
});

const users = {};

io.on('connection', socket => {
    // When a new user joins, save their name and broadcast it
    socket.on('new-user-joined', name => {
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);

        // Fetch previous messages from the database
        pool.query('SELECT user_name, message FROM messages ORDER BY created_at ASC', (err, result) => {
            if (err) {
                console.error('Error fetching messages:', err);
                return;
            }
            // Send the previous messages to the new user
            result.rows.forEach(msg => {
                socket.emit('receive', { message: msg.message, name: msg.user_name });
            });
        });
    });

    // When a user sends a message, store it in the database and broadcast it
    socket.on('send', message => {
        const name = users[socket.id];

        // Insert the message into PostgreSQL
        pool.query(
            'INSERT INTO messages (user_name, message) VALUES ($1, $2)',
            [name, message],
            (err, result) => {
                if (err) {
                    console.error('Error saving message to database:', err);
                    return;
                }
                // Broadcast the message to other users
                socket.broadcast.emit('receive', { message, name });
            }
        );
    });

    // When a user disconnects, let others know
    socket.on('disconnect', () => {
        const name = users[socket.id];
        socket.broadcast.emit('left', name);
        delete users[socket.id];
    });
});

// Serve static files (optional: for serving front-end files if using a local server)
app.use(express.static('public'));

// Start the server on port 8000
server.listen(8000, () => {
    console.log('Server is running on port 8000');
});
