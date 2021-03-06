var EVENTS = require('../common/constant').CONSTANTS.SOCKET_EVENTS;
var { logger } = require('../utility/logger');
const herokuLogger = require('heroku-logger');

var chatSocket = function(io) {

    //Variable declare area
    var listUserActived = [];

    io.on(EVENTS.BASE.CONNECTION, (socket) => {

        //log when create connection socketio
        logger.socketIo.info('Create SocketIO Connection Successful.');
        herokuLogger.info('Create SocketIO Connection Successful.');

        var listRooms = [];

        //---Event registration area---
        //Connection event handle
        socket.on(EVENTS.INIT.INIT_CONNECTION, function(userInfo) {
            listUserActived.push(userInfo.username);
            socket.UserName = userInfo.username;
            socket.emit(EVENTS.INIT.INIT_CONNECTION_SUCCESS, { username: userInfo.username });

            io.sockets.emit(EVENTS.SERVER_RESPONSE_LISTUSERS, listUserActived);
        });

        //Event user is typing
        socket.on(EVENTS.CHATTING.TYPING_MESSAGE, function() {
            var whoTyping = socket.UserName + EVENTS.IS_TYPING;
            io.sockets.emit(EVENTS.CHATTING.TYPING_MESSAGE, whoTyping);
        });

        //Event user is stopping type
        socket.on(EVENTS.CHATTING.STOP_TYPING_MESSAGE, function() {
            var whoStopTyping = socket.UserName + " stop" + EVENTS.IS_TYPING;
            io.sockets.emit(EVENTS.CHATTING.STOP_TYPING_MESSAGE, whoStopTyping);
        });

        // Event send message all
        socket.on(EVENTS.CHATTING.SEND_MESSAGE, function(message) {
            var currentTime = getCurrentTime();
            io.sockets.emit(EVENTS.CHATTING.SEND_MESSAGE, {
                username: socket.UserName,
                message: message.message,
                currentTime: currentTime,
            });
        });

        //Event send posture message
        socket.on(EVENTS.POSTURE.SEND_POSTURE, (data) => {
            var currentTime = getCurrentTime();
            io.sockets.emit(EVENTS.POSTURE.SEND_POSTURE, {
                postureData: data,
                currentTime: currentTime
            });
        });

        // -------------------------------------------
        //LIST EVENT IN ROOM
        //Event send message in Room
        socket.on(EVENTS.CLIENT_SENDMESSAGE_ROOM, function(message) {
            io.sockets.in(socket.RoomName).emit(EVENTS.SERVER_SENDMESSAGE_ROOM, {
                username: socket.UserName,
                message: message.message
            });
        });

        //Event user is typing in Room
        socket.on(EVENTS.TYPING_MESSAGE_IN_ROOM, function() {
            var istyping = socket.UserName + EVENTS.IS_TYPING;
            socket.broadcast.in(socket.RoomName).emit(EVENTS.TYPING_MESSAGE, istyping);
        });

        //EVENT FROM JOIN/LEAVE ROOM
        //Event join room
        socket.on(EVENTS.JOIN_ROOM, function(data) {
            socket.join(data);
            socket.RoomName = data;

            if (!listRooms.includes(data)) {
                listRooms.push(data);
            }
            socket.emit(EVENTS.CURRENT_ROOM, data);
        });

        //Event Leave room
        socket.on(EVENTS.LEAVE_ROOM, function(data) {
            socket.leave(data);
        });

        //Event log out
        socket.on(EVENTS.LOGOUT, function() {
            listUserActived.splice(
                listUserActived.indexOf(socket.UserName), 1
            );
            socket.broadcast.emit(EVENTS.SERVER_RESPONSE_LISTUSERS, listUserActived);
        });

        //Event handle disconnect when user disconnected
        socket.on(EVENTS.BASE.DISCONNECTED, function(reason) {

            //log when user disconnected
            logger.socketIo.info(socket.id + ' was disconnected Socket IO with reason: ' + reason);
            herokuLogger.info(socket.id + ' was disconnected Socket IO with reason: ' + reason);
        });

        //Event handle disconnect when user disconnecting.
        socket.on(EVENTS.BASE.DISCONNECTING, (reason) => {

            //log when user disconnecting
            logger.socketIo.info(socket.id + ' is disconnecting with reason: ' + reason);
            herokuLogger.info(socket.id + ' is disconnecting with reason: ' + reason);
        });

        //Event handle when connection error.
        socket.on(EVENTS.BASE.ERROR, function(error) {

            //log when connection error
            logger.socketIo.info(socket.id + 'error: ' + error);
            herokuLogger.info(socket.id + 'error: ' + error);
        })
    });
}

var getCurrentTime = function() {
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return time;
}

module.exports = {
    chatSocket
};