const CONSTANTS = {
    SEX: {
        MALE: "Male",
        FEMALE: "Female",
        GAY: "Gay",
        LESBIAN: "Lesbian"
    },
    SOCKET_EVENTS: {
        BASE:{
            CONNECTION: "connection",
            DISCONNECTED: "disconnect"
        },
        INIT:{
            REGISTER_USER: "REGISTER_USER",
            REGISTER_USER_EXIST: "REGISTER_USER_EXIST",
            REGISTER_USER_SUCCESS: "REGISTER_USER_SUCCESS"
        },
        CHATTING:{
            TYPING_MESSAGE: "TYPING_MESSAGE",
            STOP_TYPING_MESSAGE: "STOP_TYPING_MESSAGE",
            SEND_MESSAGE: "SEND_MESSAGE"
        },
        POSTURE:{
            SEND_POSTURE: "SEND_POSTURE"
        },
        
        SERVER_RESPONSE_LISTUSERS: "SERVER_RESPONSE_LISTUSERS",
        SERVER_RESPONSE_LISTUSERS: "SERVER_RESPONSE_LISTUSERS",
        SERVER_SENDMESSAGE_ALL: "SERVER_SENDMESSAGE_ALL",
        CLIENT_SENDMESSAGE_ROOM: "CLIENT_SENDMESSAGE_ROOM",
        SERVER_SENDMESSAGE_ROOM: "SERVER_SENDMESSAGE_ROOM",
        TYPING_MESSAGE_IN_ROOM: "TYPING_MESSAGE_IN_ROOM",
        JOIN_ROOM: "JOIN_ROOM",
        LEAVE_ROOM: "LEAVE_ROOM",
        CURRENT_ROOM: "CURRENT_ROOM",
        LOGOUT: "LOGOUT",
        IS_TYPING: " is typing...",
    }
};

module.exports = { CONSTANTS }

