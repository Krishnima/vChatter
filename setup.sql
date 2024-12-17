CREATE DATABASE chatapp;

\c chatapp;

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
