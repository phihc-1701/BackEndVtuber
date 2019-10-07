var EVENTS = require('../common/constant').CONSTANTS.SOCKET_EVENTS;

var chatSocket = function (io) {
    //VARIABLE
    var listUserActived = [];

    io.on(EVENTS.BASE.CONNECTION, (socket) => {
        socket.RoomName = socket.id;
        var listRooms = [];

        //Event registration
        socket.on(EVENTS.INIT.INIT_CONNECTION, function (userInfo) {
            if (listUserActived.indexOf(userInfo.username) >= 0) {
                socket.emit(EVENTS.INIT.INIT_CONNECTION_EXIST);
            }
            else {
                listUserActived.push(userInfo.username);
                socket.Username = userInfo.username;
                socket.emit(EVENTS.INIT.INIT_CONNECTION_SUCCESS, { username: userInfo.username });

                io.sockets.emit(EVENTS.SERVER_RESPONSE_LISTUSERS, listUserActived);
            }
        });

        //Event user is typing
        socket.on(EVENTS.CHATTING.TYPING_MESSAGE, function () {
            var whoTyping = socket.Username + EVENTS.IS_TYPING;
            io.sockets.emit(EVENTS.CHATTING.TYPING_MESSAGE, whoTyping);
        });

        //Event user is stopping type
        socket.on(EVENTS.CHATTING.STOP_TYPING_MESSAGE, function () {
            var whoStopTyping = socket.Username + "stop" +EVENTS.IS_TYPING;
            io.sockets.emit(EVENTS.CHATTING.STOP_TYPING_MESSAGE, whoStopTyping);
        });

        // Event send message all
        socket.on(EVENTS.CHATTING.SEND_MESSAGE, function (message) {
            var currentTime = getCurrentTime();
            io.sockets.emit(EVENTS.CHATTING.SEND_MESSAGE, {
                username: socket.Username,
                message: message.message,
                currentTime: currentTime,
            });
        });

        //Event send posture messge
        socket.on(EVENTS.POSTURE.SEND_POSTURE, (data) => {
            console.log(data);
            var currentTime = getCurrentTime();
            io.sockets.emit(EVENTS.POSTURE.SEND_POSTURE, {
                postureData: data,
                currentTime: currentTime
            });
        });



        // -------------------------------------------
        //LIST EVENT IN ROOM
        //Event send message in Room
        socket.on(EVENTS.CLIENT_SENDMESSAGE_ROOM, function (message) {
            console.log(io.sockets.adapter.rooms);
            io.sockets.in(socket.Phong).emit(EVENTS.SERVER_SENDMESSAGE_ROOM, {
                username: socket.Username,
                message: message.message
            });
        });

        //Event user is typing in Room
        socket.on(EVENTS.TYPING_MESSAGE_IN_ROOM, function () {
            var istyping = socket.Username + EVENTS.IS_TYPING;
            socket.broadcast.in(socket.Phong).emit(EVENTS.TYPING_MESSAGE, istyping);
        });

        //EVENT FROM JOIN/LEAVE ROOM
        //Event join room
        socket.on(EVENTS.JOIN_ROOM, function (data) {
            socket.join(data);
            socket.Phong = data;

            if (!listRooms.includes(data)) {
                listRooms.push(data);
            }
            socket.emit(EVENTS.CURRENT_ROOM, data);
        });

        //Event Leave room
        socket.on(EVENTS.LEAVE_ROOM, function (data) {
            socket.leave(data);
        });

        //Event log out
        socket.on(EVENTS.LOGOUT, function () {
            listUserActived.splice(
                listUserActived.indexOf(socket.Username), 1
            );
            socket.broadcast.emit(EVENTS.SERVER_RESPONSE_LISTUSERS, listUserActived);
        });

        //Event handle disconnect when user disconnected
        socket.on(EVENTS.BASE.DISCONNECTED, () => {
            listUserActived.splice(
                listUserActived.indexOf(socket.Username), 1
            );
            socket.broadcast.emit(EVENTS.SERVER_RESPONSE_LISTUSERS, listUserActived);
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