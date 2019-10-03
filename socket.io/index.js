var chat = require('./chat.socket');

let services = function (io) {

    // Define all socket services here
    chat.chatSocket(io);   
}

module.exports = services;