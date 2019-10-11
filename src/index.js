const path = require('path');
// path is a core module, don't need to install it
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage, generateLocationMessage} = require('./utils/messages');
const {addUser, getUser, getUsersInRoom, removeUser} = require('./utils/user');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));
// let count = 0;


io.on('connection', (socket) => {
    console.log('new websocket connection from ');

    // socket.emit('message', 'Hello New User!');
    // socket.emit('countUpdated', count);
    // socket.on('increment', () => {
    //     count++;
    //     // socket.emit('countUpdated', count);
    //     // working when we just send data to the connection we on
    //     io.emit('countUpdated', count);
    // });

    socket.on('join', (options, callback) => {
        const {error, user} = addUser({
            id: socket.id,
            ...options
        });

        if (error) {
            return callback(error);
        }

        // sử dụng return để kết thúc

        socket.join(user.room);

        socket.emit('sendMessage', generateMessage('Welcome!'));
        socket.broadcast.to(user.room).emit('sendMessage', generateMessage(`${user.username} has joined!`));

        io.to(user.room).emit('roomDataChange', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        callback();

        // three ways to send from server to client
        // socket.emit, io.emit, socket.broadcast.emit
        // two ways to communicate in specific room
        // io.to.emit, socket.broadcast.to.emit
    });

    socket.on('sendMessage', (mess, callback) => {
        const user = getUser(socket.id);

        const filter = new Filter();
        if (filter.isProfane(mess)) {
            return callback('Pro is not allowed');
        }

        io.to(user.room).emit('sendMessage', generateMessage(mess));

        callback('Delivered');
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('sendMessage', generateMessage(`${user.username} has left`));
            io.to(user.room).emit('roomDataChange', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    });

    socket.on('send-location', (location, callback) => {
        // socket.broadcast.emit('message', 'location: ' + location);
        const user = getUser(socket.id);
        if (user) {
            io.to(user.room).emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${location.latitude},${location.longitude}`));
            callback('Location Shared');
        }
    });
});


server.listen(port, () => {
    console.log(`Express server is up on port ${port}`);
});
