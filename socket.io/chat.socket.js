var chatSocket = function (io) {

    // Chatroom namespace
    var numUsers = 0;
    io.on('connection', (socket) => {
        var addedUser = false;
        //console.log(socket.id);  
        socket.RoomName = socket.id;

        // when the client emits 'new message', this listens and executes
        socket.on('new message', (data) => {
            // we tell the client to execute 'new message'
            socket.broadcast.emit('new message', {
                username: socket.username,
                message: data
            });
        });

        // when the client emits 'add user', this listens and executes
        socket.on('add user', (username) => {

            if (addedUser) return;

            // we store the username in the socket session for this client
            socket.username = username;
            ++numUsers;
            addedUser = true;
            socket.emit('login', {
                numUsers: numUsers
            });
            // echo globally (all clients) that a person has connected
            socket.broadcast.emit('user joined', {
                username: socket.username,
                numUsers: numUsers
            });
        });

        // when the client emits 'typing', we broadcast it to others
        socket.on('typing', () => {
            socket.broadcast.emit('typing', {
                username: socket.username
            });
        });

        // when the client emits 'stop typing', we broadcast it to others
        socket.on('stop typing', () => {
            socket.broadcast.emit('stop typing', {
                username: socket.username
            });
        });

        // when the user disconnects.. perform this
        socket.on('disconnect', () => {
            if (addedUser) {
                --numUsers;
                // echo globally that this client has left
                socket.broadcast.emit('user left', {
                    username: socket.username,
                    numUsers: numUsers
                });
            }
        });

        //Test connection
        socket.on('test connection', () => {
            console.log('connect successful');
        });

        socket.on('auto connect', () =>{
            var currentTime = getCurrentTime();
        });
    });
}

var getCurrentTime = function () {
    var today = new Date();    
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return time;
  }

module.exports = {
    chatSocket
};