var chatSocket = function (io) {

    var arrayUsers = [];

    // Chatroom namespace
    var numUsers = 0;
    io.on('connection', (socket) => {
        var addedUser = false;       
        socket.RoomName = socket.id;
        var listRooms = [];

        socket.on("client-send-Username", function (data) {
            if (arrayUsers.indexOf(data) >= 0) {
                socket.emit("server-send-register-fail");
            } else {
                arrayUsers.push(data);
                socket.Username = data;
                socket.emit("server-send-register-successed", data);
                io.sockets.emit("server-send-listUser", arrayUsers);
            }
        });
        socket.on("logout", function () {
            arrayUsers.splice(
                arrayUsers.indexOf(socket.Username), 1
            );
            socket.broadcast.emit("server-send-listUser", arrayUsers);
        });

        socket.on("user-send-message", function (data) {
            io.sockets.emit("server-send-mesage", {
                un: socket.Username,
                nd: data
            });
        });

        socket.on("typing message", function () {
            var s = socket.Username + " is typing...";
            socket.broadcast.emit("had typing", s);
        });

        socket.on("stop typing", function () {
            io.sockets.emit("who stop typing");
        });

        socket.on("typing in Room", function () {
            var s = socket.Username + " is typing...";
            //socket.broadcast.emit("had typing", s);
            socket.broadcast.in(socket.Phong).emit("had typing", s);
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

        socket.on('auto connect', (data) => {
            var currentTime = getCurrentTime();
            io.sockets.emit('test connection', {
                currentTime: currentTime,
                posture: data.posture
            });
        });

        //Create room
        socket.on("create room", function (data) {
            socket.join(data);
            socket.Phong = data;

            if (!listRooms.includes(data)) {
                listRooms.push(data);
            }

            io.sockets.emit("server-send-rooms", listRooms);
            socket.emit("current room", data);

        });

        //Leave room
        socket.on("leave room", function (data) {
            socket.leave(data);
        });

        //chat in room
        socket.on("chatRoom", function (data) {
            console.log(io.sockets.adapter.rooms);
            io.sockets.in(socket.Phong).emit("serverChatRoom", {
                un: socket.Username,
                nd: data
            });
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