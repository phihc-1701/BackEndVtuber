var EVENTS = require('../common/constant').CONSTANTS.SOCKET_EVENTS;
var { logger } = require('../utility/logger');
var chatSocket = function(io) {

    // Rooms namespace
    io.of('/rooms').on(EVENTS.BASE.CONNECTION, (socket) => {

        var listRoom = [];
        // Create a new room
        socket.on('JOIN_ROOM', (roomInfo) => {

            if (!listRoom.includes(roomInfo.roomname)) {
                listRoom.push(roomInfo.roomname);
                socket.join(roomInfo.roomname);

                var abc = io.sockets.adapter.rooms;
                console.log(abc);
            }

            socket.emit("JOIN_ROOM_SUCCESS", { listRoom: listRoom })
        });
    });

    io.on(EVENTS.BASE.CONNECTION, (socket) => {

        logger.socketIo.info('Create SocketIO Connection Successful.');

        //---Event registration area---
        //Connection event handle
        socket.on(EVENTS.INIT.REGISTER_USER, function(userInfo) {
            socket.UserName = userInfo.username;
            socket.Role = userInfo.role;

            let messageLog = userInfo.mode == EVENTS.RECONNECT ? ' has been reconnected with role: ' : ' has been connected with role: ';
            logger.socketIo.info(socket.UserName + messageLog + socket.Role);
            socket.emit(EVENTS.INIT.REGISTER_USER_SUCCESS, { username: userInfo.username });
        });

        //Event user is typing
        socket.on(EVENTS.CHATTING.TYPING_MESSAGE, function() {
            var whoTyping = socket.UserName + EVENTS.IS_TYPING;
            socket.broadcast.emit(EVENTS.CHATTING.TYPING_MESSAGE, { typing: whoTyping });
        });

        //Event user is stopping type
        socket.on(EVENTS.CHATTING.STOP_TYPING_MESSAGE, function() {
            var whoStopTyping = socket.UserName + " stop" + EVENTS.IS_TYPING;
            socket.broadcast.emit(EVENTS.CHATTING.STOP_TYPING_MESSAGE, { stopTyping: whoStopTyping });
        });

        // Event send message all
        socket.on(EVENTS.CHATTING.SEND_MESSAGE, function(message) {
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

        //EVENT FOR WEB RTC P2P   
        socket.on(EVENTS.WEB_RTC.CHAT_VOICE, () => {
            socket.broadcast.emit(EVENTS.WEB_RTC.CHAT_VOICE);
        });

        socket.on(EVENTS.WEB_RTC.ADD_CANDIDATE, (event) => {
            socket.broadcast.emit(EVENTS.WEB_RTC.ADD_CANDIDATE, event);
        });

        socket.on(EVENTS.WEB_RTC.OFFER, (event) => {
            socket.broadcast.emit(EVENTS.WEB_RTC.OFFER, event.sdp);
        });

        socket.on(EVENTS.WEB_RTC.ANSWER, (event) => {
            socket.broadcast.emit(EVENTS.WEB_RTC.ANSWER, event.sdp);
        });
        // CHAT VOICE   

        //EVENT HANDLE DISCONNECT   
        //Event handle disconnect when user disconnected
        socket.on(EVENTS.BASE.DISCONNECTED, function(reason) {

            //log when user disconnected
            logger.socketIo.info(socket.UserName + ' was disconnected Socket IO with reason: ' + reason);
        });

        //Event handle disconnect when user disconnecting.
        socket.on(EVENTS.BASE.DISCONNECTING, (reason) => {

            //log when user disconnecting
            logger.socketIo.info(socket.UserName + ' is disconnecting with reason: ' + reason);
        });

        //Event handle when connection error.
        socket.on(EVENTS.BASE.ERROR, function(error) {

            //log when connection error
            logger.socketIo.info(socket.UserName + 'error: ' + error);
        })

        //Event ROOMS
    });
}

//UTILITIES FUNCTION
var getCurrentTime = function() {
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return time;
}

module.exports = {
    chatSocket
};