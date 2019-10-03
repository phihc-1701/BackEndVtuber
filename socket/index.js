var ChatEvent = require('../socket/chat');

var init = function (app) {
    var server = require('http').Server(app);
    var io = require('socket.io')(server);

    // Define all Events
    ChatEvent.chatEvents(io);   

    // The server object will be then used to list to a port number
    return server;
}

module.exports = init;