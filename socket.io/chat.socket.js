var EVENTS = require('../common/constant').CONSTANTS.SOCKET_EVENTS;

var chatSocket = function (io) {

    //Variable declare area
    var listUserActived = [];

    io.on(EVENTS.BASE.CONNECTION, (socket) => {
        var listRooms = [];

        //---Event registration area---
        //Connection event handle
        socket.on(EVENTS.INIT.INIT_CONNECTION, function (userInfo) {
            listUserActived.push(userInfo.username);
                socket.UserName = userInfo.username;
                socket.emit(EVENTS.INIT.INIT_CONNECTION_SUCCESS, { username: userInfo.username });
        });

        //Event user is typing
        socket.on(EVENTS.CHATTING.TYPING_MESSAGE, function () {
            var whoTyping = socket.UserName + EVENTS.IS_TYPING;
            io.sockets.emit(EVENTS.CHATTING.TYPING_MESSAGE, {typing: whoTyping});
        });

        //Event user is stopping type
        socket.on(EVENTS.CHATTING.STOP_TYPING_MESSAGE, function () {
            var whoStopTyping = socket.UserName + " stop" + EVENTS.IS_TYPING;
            io.sockets.emit(EVENTS.CHATTING.STOP_TYPING_MESSAGE, {stopTyping: whoStopTyping});
        });

        // Event send message all
        socket.on(EVENTS.CHATTING.SEND_MESSAGE, function (message) {
            io.sockets.emit(EVENTS.CHATTING.SEND_MESSAGE, {
                username: socket.UserName,
                message: message.message,
                currentTime: getCurrentTime(),
            });
        });

        //Event send posture message
        socket.on(EVENTS.POSTURE.SEND_POSTURE, (data) => {
            io.sockets.emit(EVENTS.POSTURE.SEND_POSTURE, {
                postureData: data,
                currentTime: getCurrentTime()
            });
        });

        // -------------------------------------------
        //LIST EVENT IN ROOM
        //Event send message in Room
        socket.on(EVENTS.CLIENT_SENDMESSAGE_ROOM, function (message) {
            console.log(io.sockets.adapter.rooms);
            io.sockets.in(socket.Phong).emit(EVENTS.SERVER_SENDMESSAGE_ROOM, {
                username: socket.UserName,
                message: message.message
            });
        });

        //Event user is typing in Room
        socket.on(EVENTS.TYPING_MESSAGE_IN_ROOM, function () {
            var istyping = socket.UserName + EVENTS.IS_TYPING;
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
                listUserActived.indexOf(socket.UserName), 1
            );
            socket.broadcast.emit(EVENTS.SERVER_RESPONSE_LISTUSERS, listUserActived);
        });

        //Event handle disconnect when user disconnected
        socket.on(EVENTS.BASE.DISCONNECTED, () => {
            listUserActived.splice(
                listUserActived.indexOf(socket.UserName), 1
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