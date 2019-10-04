let CONSTANTS = {
    SEX: {
        MALE: "Male",
        FEMALE: "Female",
        GAY: "Gay",
        LESBIAN: "Lesbian"
    },

    SOCKET_EVENTS: {
        CONNECTION:"connection",
        CLIENT_REGISTRATION: "CLIENT_REGISTRATION",
        SERVER_REGISTER_FAIL: "SERVER_REGISTER_FAIL",
        SERVER_REGISTER_SUCCESS: "SERVER_REGISTER_SUCCESS",
        SERVER_RESPONSE_LISTUSERS: "SERVER_RESPONSE_LISTUSERS",        
        SERVER_RESPONSE_LISTUSERS:"SERVER_RESPONSE_LISTUSERS",
        CLIENT_SENDMESSAGE_ALL:"CLIENT_SENDMESSAGE_ALL",
        SERVER_SENDMESSAGE_ALL: "SERVER_SENDMESSAGE_ALL",
        CLIENT_SENDMESSAGE_ROOM:"CLIENT_SENDMESSAGE_ROOM",
        SERVER_SENDMESSAGE_ROOM:"SERVER_SENDMESSAGE_ROOM",
        TYPING_MESSAGE:"TYPING_MESSAGE",
        STOP_TYPING_MESSAGE:"STOP_TYPING_MESSAGE",
        TYPING_MESSAGE_IN_ROOM:"TYPING_MESSAGE_IN_ROOM",
        SEND_POSTURE:"SEND_POSTURE",
        JOIN_ROOM:"JOIN_ROOM",
        LEAVE_ROOM:"LEAVE_ROOM",
        CURRENT_ROOM:"CURRENT_ROOM",
        LOGOUT:"LOGOUT",
    }
};

module.exports = { CONSTANTS }

