import { io } from 'socket.io-client';

const socket = io("http://localhost:3000"); // Create the Socket.io instance and send a 'connection' event to the server

export default socket;