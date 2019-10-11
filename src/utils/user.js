const users = [];

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({id, username, room}) => {
// Clear the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();


    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and Room are required!'
        }
    }

    // Check existence of the user
    const isExistingUser = users.find(user => {
        return user.room === room && user.username === username
    });

    // Validate username
    if (isExistingUser) {
        return {
            error: 'Username is in use!!!'
        }
    }

    // Store User
    const user = {id, username, room};
    users.push(user);
    return {user};
};

const removeUser = (id) => {
    const index = users.findIndex(value => value.id === id);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
};

const getUser = (id) => {
    const index = users.findIndex(value => value.id === id);
    if (index !== -1) {
        return users[index];
    } else return undefined;
};

const getUsersInRoom = (room) => {
    return users.filter(value => value.room === room);
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
};
