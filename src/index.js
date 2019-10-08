const path = require('path');
// path is a core module, don't need to install it
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage, generateLocationMessage} = require('./utils/messages');


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

    socket.emit('message', generateMessage('A New User Has Joined'));

    socket.on('sendMessage', (mess, callback) => {
        const filter = new Filter();
        if (filter.isProfane(mess)) {
            return callback('Pro is not allowed');
        }
        io.emit('sendMessage', generateMessage(mess));
        callback('Delivered');
    });

    socket.on('disconnect', () => {
        io.emit('message', 'A User Has Left');
    });

    socket.on('send-location', (location, callback) => {
        // socket.broadcast.emit('message', 'location: ' + location);
        console.log(location);
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${location.latitude},${location.longitude}`));
        callback('Location Shared');
    });
});


server.listen(port, () => {
    console.log(`Express server is up on port ${port}`);
});
