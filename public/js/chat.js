const socket = io();
// const {generateMessage} = require('./utils/messages');


//Element
const $messageForm = document.getElementById('message-form');
const $messageFormInput = document.getElementById('message');
const $messageFormButton = document.querySelector('button');
const $sendLocationButton = document.getElementById('send-location');
const $messageContainer = document.getElementById('messages');


//Templates

const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;

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
});

socket.on('locationMessage', (url) => {
    console.log(url);
    const htmlLocation = Mustache.render(locationMessageTemplate, {
        location: url.url,
        createdAt: moment(url.createdAt).format('h:mm a')
    });
    $messageContainer.insertAdjacentHTML('beforeend', htmlLocation);
});
