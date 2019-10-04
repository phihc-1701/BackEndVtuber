var EVENTS = require('../common/constant').CONSTANTS.SOCKET_EVENTS;

var chatSocket = function (io) {

    var listUserActived = [];

    io.on(EVENTS.CONNECTION, (socket) => {
        socket.RoomName = socket.id;
        var listRooms = [];

        // EVENT FOR CHATTING
        // Event send message all
        socket.on(EVENTS.CLIENT_SENDMESSAGE_ALL, function (data) {
            io.sockets.emit(EVENTS.SERVER_SENDMESSAGE_ALL, {
                un: socket.Username,
                nd: data
            });
        });

        //Event send message in Room
        socket.on(EVENTS.CLIENT_SENDMESSAGE_ROOM, function (data) {
            console.log(io.sockets.adapter.rooms);
            io.sockets.in(socket.Phong).emit(EVENTS.SERVER_SENDMESSAGE_ROOM, {
                un: socket.Username,
                nd: data
            });
        });

        //Event user is typing
        socket.on(EVENTS.TYPING_MESSAGE, function () {
            var s = socket.Username + " is typing...";
            socket.broadcast.emit(EVENTS.TYPING_MESSAGE, s);
        });

        //Event user is stoping type
        socket.on(EVENTS.STOP_TYPING_MESSAGE, function () {
            io.sockets.emit(EVENTS.STOP_TYPING_MESSAGE);
        });

        //Event user is typing in Room
        socket.on(EVENTS.TYPING_MESSAGE_IN_ROOM, function () {
            var s = socket.Username + " is typing...";
            socket.broadcast.in(socket.Phong).emit(EVENTS.TYPING_MESSAGE, s);
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

        //Event send posture messge
        socket.on(EVENTS.SEND_POSTURE, (data) => {
            var currentTime = getCurrentTime();
            io.sockets.emit(EVENTS.SEND_POSTURE, {
                currentTime: currentTime,
                posture: data.posture
            });
        });

        //EVENT FOR UTILITY

        //Event registration
        socket.on(EVENTS.CLIENT_REGISTRATION, function (data) {
            if (listUserActived.indexOf(data) >= 0) {
                socket.emit(EVENTS.SERVER_REGISTER_FAIL);
            } else {
                listUserActived.push(data);
                socket.Username = data;
                socket.emit(EVENTS.SERVER_REGISTER_SUCCESS, data);
                io.sockets.emit(EVENTS.SERVER_RESPONSE_LISTUSERS, listUserActived);
            }
        });

        //Event log out
        socket.on(EVENTS.LOGOUT, function () {
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