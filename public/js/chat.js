const socket = io();
// const {generateMessage} = require('./utils/messages');


//Element
const $messageForm = document.getElementById('message-form');
const $messageFormInput = document.getElementById('message');
const $messageFormButton = document.querySelector('button');
const $sendLocationButton = document.getElementById('send-location');
const $messageContainer = document.getElementById('messages');
const $sidebar = document.getElementById('sidebar');

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const autoscroll = () => {
    // New Message Element
    // const $newMessage = $messageContainer.lastElementChild;
    //
    // // Height Of The New Message
    // const newMessageStyles = getComputedStyle($newMessage);
    // const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    // const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
    //
    // // Visible Height
    // const visibleHeight = $messageContainer.offsetHeight;
    //
    // //Height Of Messages Container
    // const containerHeight = $messageContainer.scrollHeight;
    //
    // // How far have i scrolled?
    // const scrollOffset = $messageContainer.scrollTop + visibleHeight;
    //
    // if (containerHeight - newMessageHeight <= scrollOffset) {
    //     $messageContainer.scrollTop = $messageContainer.scrollHeight
    // }
    // window.scrollTo(0, $messageContainer.scrollHeight);
    $messageContainer.scrollTop = $messageContainer.scrollHeight

};

//
// socket.on('countUpdated', (count) => {
//     console.log("the count has been updated ", count);
// });
//
//
// document.getElementById("increment").addEventListener('click', () => {
//     console.log('btn add is clicked');
//     socket.emit('increment');
// });


socket.on('message', (message) => {
    console.log(message);
});


$messageForm.addEventListener('submit', evt => {
    evt.preventDefault();
    //disable form
    $messageFormButton.setAttribute('disabled', 'disabled');

    const message = document.getElementById('message').value;
    socket.emit('sendMessage', message, (message) => {
        //enable form
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        console.log(message);
    });
});

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('not support ');
    }
    $sendLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position);
        socket.emit('send-location', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (result) => {
            $sendLocationButton.removeAttribute('disabled');
            console.log(result);
        });
    });
});

socket.on('sendMessage', message => {
    console.log('message: ', message);
    // document.getElementById('messageField').innerHTML = message;
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messageContainer.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('roomDataChange', ({room, users}) => {
    console.log(room);
    console.log(users);

    document.querySelector('#sidebar').innerHTML = Mustache.render(sidebarTemplate, {
        room: room,
        users: users
    });
});

socket.on('locationMessage', (url) => {
    console.log(url);
    const htmlLocation = Mustache.render(locationMessageTemplate, {
        location: url.url,
        createdAt: moment(url.createdAt).format('h:mm a')
    });
    $messageContainer.insertAdjacentHTML('beforeend', htmlLocation);
    autoscroll();
});

socket.emit('join', {
    username, room
}, (error) => {
    console.log(error)
});


