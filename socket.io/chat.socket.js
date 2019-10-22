var EVENTS = require('../common/constant').CONSTANTS.SOCKET_EVENTS;

var chatSocket = function (io) {

    io.on(EVENTS.BASE.CONNECTION, (socket) => {
        //---Event registration area---
        //Connection event handle
        socket.on(EVENTS.INIT.REGISTER_USER, function (userInfo) {
            socket.UserName = userInfo.username;
            socket.Role = userInfo.role;
            socket.emit(EVENTS.INIT.REGISTER_USER_SUCCESS, { username: userInfo.username });
        });

        //Event user is typing
        socket.on(EVENTS.CHATTING.TYPING_MESSAGE, function () {
            var whoTyping = socket.UserName + EVENTS.IS_TYPING;
            socket.broadcast.emit(EVENTS.CHATTING.TYPING_MESSAGE, { typing: whoTyping });
        });

        //Event user is stopping type
        socket.on(EVENTS.CHATTING.STOP_TYPING_MESSAGE, function () {
            var whoStopTyping = socket.UserName + " stop" + EVENTS.IS_TYPING;
            socket.broadcast.emit(EVENTS.CHATTING.STOP_TYPING_MESSAGE, { stopTyping: whoStopTyping });
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

        //Event handle disconnect when user disconnected
        socket.on("connect_error", (event) => {
            console.log(event);
        });

        socket.on("connect_error", (event) => {
            console.log(event);
        });

        socket.on("error", (event) => {
            console.log(event);
        });

        socket.on("reconnect_error", (event) => {
            console.log(event);
        });
    });
}

//UTILITIES FUNCTION
var getCurrentTime = function () {
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return time;
}

module.exports = {
    chatSocket
};