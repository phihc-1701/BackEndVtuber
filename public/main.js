$(document).ready(function() {
    var socket = io("http://" + window.location.hostname + ":3000");
    var janusServer = "http://" + window.location.hostname + ":8088/janus";

    var janus = null;
    var audioBridgePlugin = null;
    var opaqueId = "audioBridge-" + Janus.randomString(12);

    var defaultRoom = 1234;
    var webrtcUp = false;

    Janus.init({
        debug: "all",
        callback: function() {
            janusInit();
        }
    });

    // CHAT VOICE FUNCTION END

    //SOCKET EVENT
    socket.on("REGISTER_USER_EXIST", function() {
        alert("User has been register !");
    });

    socket.on("REGISTER_USER_SUCCESS", function(data) {
        if (isStreamer) {
            console.log("REGISTER_USER_SUCCESS");
        }
    });

    socket.on("SEND_MESSAGE", function(data) {
        if (data.username == $txtUsername.val()) {
            $listMessages.append("<div class='message-area' style= 'text-align: left'> <span class = 'message-text-self'>" + data.message + "</span></div>");
        } else {
            $listMessages.append("<div class='message-area' style= 'text-align: right'> <span class = 'message-text-other'>" + "<span style='color: #f39c12'>" + data.username + "</span>" + ": " + data.message + "</span> </div>");
        }
    });

    socket.on("TYPING_MESSAGE", function(data) {
        $("#notification").html("<img width='20px' src='typing05.gif'> " + data.typing);
    });

    socket.on("STOP_TYPING_MESSAGE", function() {
        $("#notification").html("");
    });

    socket.on('SEND_POSTURE', (data) => {
        $("#postureMessage").append("<div class='ms'>" + "Server receive message " + data.currentTime + "</div>");
        $("#postureMessage").append("<div class='ms'>" + "Client stop emit " + getCurrentTime() + "</div>");
    });

    socket.on('disconnect', () => {
        $("#listMessages").append("<div class='ms'>" + 'You have been disconnected' + "</div>");
    });

    socket.on('reconnect', () => {
        let role = "Viewer";
        if (isStreamer) {
            role = "Streamer";
        }
        socket.emit("REGISTER_USER", { username: $txtUsername.val(), role: role, mode: "reconnect" });

        $("#listMessages").append("<div class='ms'>" + 'You have been reconnected' + "</div>");
    });

    socket.on('reconnect_error', () => {
        $("#listMessages").append("<div class='ms'>" + 'Attempt to reconnect has failed' + "</div>");
    });


    // EVENT ON PAGE
    var $audioViewer = $("#viewer-audio");
    var $btnStreamer = $("#btnStreamer");
    var $btnViewer = $("#btnViewer");

    var $listMessages = $("#listMessages");
    var $postureMessage = $("#postureMessage")

    var $btnSendMessage = $("#btnSendMessage");

    var $btnAutoSendPosture = $("#btnAutoSendPosture");
    var $btnStopPosture = $("#btnStopPosture");

    var $txtUsername = $("#txtUsername");
    var $txtMessage = $("#txtMessage");

    var $divChatRoom = $("#chatRoom");
    var $divRegisterUser = $("#registerUser");
    var $lblCurrentUser = $("#currentUser");


    $btnStreamer.click(function() {
        if (validateUserName()) {
            $divChatRoom.show();
            $divRegisterUser.hide();
            $lblCurrentUser.text("streamer: " + $txtUsername.val());
            $audioViewer.hide();
            socket.emit("REGISTER_USER", { username: $txtUsername.val(), role: "Streamer" });
            isStreamer = true;

            var register = { "request": "join", "room": defaultRoom, "display": $txtUsername.val() };
            audioBridgePlugin.send({ "message": register });
        }
    });

    $btnViewer.click(function() {
        if (validateUserName()) {
            $divChatRoom.show();
            $divRegisterUser.hide();
            $btnAutoSendPosture.hide();
            $btnStopPosture.hide();
            $lblCurrentUser.text("viewer: " + $txtUsername.val());
            socket.emit("REGISTER_USER", { username: $txtUsername.val(), role: "Viewer" });
            isStreamer = false;
            var register = { "request": "join", "room": defaultRoom, "display": $txtUsername.val() };
            audioBridgePlugin.send({ "message": register });
        }
    });

    function validateUserName() {
        if ($txtUsername.val() === '') {
            alert('Please input username !!');

            return false;
        }

        return true;
    }

    $txtMessage.focusin(function() {
        socket.emit("TYPING_MESSAGE");
    })

    $txtMessage.focusout(function() {
        socket.emit("STOP_TYPING_MESSAGE");
    })

    $txtMessage.keydown(function() {
        if (event.which === 13)
            sendMessageAll();
    });

    $btnSendMessage.click(function() {
        sendMessageAll();
    });

    var interval;
    $btnAutoSendPosture.click(function() {
        var posture = {
            "roomID": 123,
            "userType": 1,
            "posture": {
                "position": {
                    "x": 1,
                    "y": 2,
                    "z": 3
                },
                "rotation": {
                    "x": 1,
                    "y": 2,
                    "z": 3
                },
                "mount": []
            }
        };

        interval = setInterval(function() {
            $postureMessage.append("<div class='ms'>" + "Client start emit " + getCurrentTime() + "</div>");
            console.log("send posture" + getCurrentTime());
            socket.emit('SEND_POSTURE', posture);
        }, 100);

    });

    $btnStopPosture.click(function() {
        clearInterval(interval);
    });

    const sendMessageAll = () => {
        var message = $txtMessage.val().trim();
        socket.emit("SEND_MESSAGE", { message: message });
        $txtMessage.val("");
    }

    const getCurrentTime = () => {
        var today = new Date();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        return ' ' + time;
    }

    function janusInit() {
        janus = new Janus({
            server: janusServer,
            success: function() {
                janus.attach({
                    plugin: "janus.plugin.audiobridge",
                    opaqueId: opaqueId,
                    success: function(pluginHandle) {
                        audioBridgePlugin = pluginHandle;
                        Janus.log("Plugin attached! (" + audioBridgePlugin.getPlugin() + ", id=" + audioBridgePlugin.getId() + ")");
                    },
                    error: function(error) {
                        Janus.error("  -- Error attaching plugin...", error);
                        alert("Error attaching plugin... " + error);
                    },
                    consentDialog: function(on) {},
                    onmessage: function(msg, jsep) {
                        Janus.debug(" ::: Got a message :::");
                        Janus.debug(msg);
                        var event = msg["audiobridge"];
                        Janus.debug("Event: " + event);
                        if (event != undefined && event != null) {
                            if (event === "joined") {
                                if (msg["id"]) {
                                    Janus.log("Successfully joined room " + msg["room"] + " with ID " + msg["id"]);
                                    if (!webrtcUp) {
                                        webrtcUp = true;

                                        var audioConfig;
                                        if (isStreamer) {
                                            audioConfig = { video: false, audioSend: true }
                                        } else {
                                            audioConfig = { video: false, audioSend: false }
                                        }

                                        audioBridgePlugin.createOffer({
                                            media: audioConfig, // This is an audio only room
                                            success: function(jsep) {
                                                Janus.debug("Got SDP!");
                                                Janus.debug(jsep);
                                                var publish = { "request": "configure", "muted": false };
                                                audioBridgePlugin.send({ "message": publish, "jsep": jsep });
                                            },
                                            error: function(error) {
                                                Janus.error("WebRTC error:", error);
                                                alert("WebRTC error... " + JSON.stringify(error));
                                            }
                                        });
                                    }
                                }
                                if (msg["participants"] !== undefined && msg["participants"] !== null) {

                                }
                            } else if (event === "roomchanged") {

                            } else if (event === "destroyed") {

                            } else if (event === "event") {
                                if (msg["participants"] !== undefined && msg["participants"] !== null) {

                                } else if (msg["error"] !== undefined && msg["error"] !== null) {

                                }
                                if (msg["leaving"] !== undefined && msg["leaving"] !== null) {}
                            }
                        }
                        if (jsep !== undefined && jsep !== null) {
                            Janus.debug("Handling SDP as well...");
                            Janus.debug(jsep);
                            audioBridgePlugin.handleRemoteJsep({ jsep: jsep });
                        }
                    },
                    onlocalstream: function(stream) {
                        Janus.debug(" ::: Got a local stream :::");
                        Janus.debug(stream);
                    },
                    onremotestream: function(stream) {
                        if (!isStreamer) {
                            console.log("us");
                            Janus.attachMediaStream($audioViewer.get(0), stream);
                        }
                    },
                    oncleanup: function() {
                        webrtcUp = false;
                        Janus.log(" ::: Got a cleanup notification :::");
                    }
                });
            },
            error: function(error) {
                Janus.error(error);
                alert(error, function() {
                    window.location.reload();
                });
            },
            destroyed: function() {
                window.location.reload();
            }
        });
    }

});