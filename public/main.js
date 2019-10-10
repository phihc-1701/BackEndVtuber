

$(document).ready(function () {
  var socket = io("http://localhost:3000");

  // CHAT VOICE VARIABLE START
  var isStreamer;
  var streamerStream;

  var streamerRtcPeerConnection;
  var viewerRtcPeerConnection;

  var iceServers = {
    'iceServers': [
      { 'url': 'stun:stun.services.mozilla.com' },
      { 'url': 'stun:stun.l.google.com:19302' }
    ]
  }

  var streamConstrains = window.constraints = {
    audio: true,
    video: false
  };
  // CHAT VOICE VARIABLE END

  // CHAT VOICE FUNCTION START
  function getStreamerMediaSuccess(stream) {
    const audioTracks = stream.getAudioTracks();
    console.log('Got stream with constraints:', constraints);
    console.log('Using audio device: ' + audioTracks[0].label);
    stream.oninactive = function () {
      console.log('Stream ended');
    };
    streamerStream = stream;
    document.getElementById("streamer-audio").srcObject = stream;
  }

  function handleStreamerMediaError(error) {
    console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
  }

  function viewOnAddStream(event) {
    remoteStream = event.stream;
    document.getElementById("viewer-audio").srcObject = event.stream;
  }

  function onIceCandidate(event) {
    if (event.candidate) {
      console.log('send ice candidate');
      socket.emit('ADD_CANDIDATE', {
        type: 'candidate',
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate
      });
    }
  }

  function setStreamerLocalAndOffer(sessionDescription) {
    console.log(sessionDescription);
    streamerRtcPeerConnection.setLocalDescription(sessionDescription);
    socket.emit('OFFER', {
      type: 'offer',
      sdp: sessionDescription
    });
  }

  function setViewerLocalAndAnswer(sessionDescription) {
    viewerRtcPeerConnection.setLocalDescription(sessionDescription);
    socket.emit('ANSWER', {
      type: 'answer',
      sdp: sessionDescription
    });
  }
  // CHAT VOICE FUNCTION END

  //SOCKET EVENT
  socket.on("REGISTER_USER_EXIST", function () {
    alert("User has been register !");
  });

  socket.on("REGISTER_USER_SUCCESS", function (data) {
    if (isStreamer) {
      navigator.mediaDevices.getUserMedia(streamConstrains).then(getStreamerMediaSuccess).catch(handleStreamerMediaError);
    }
  });

  socket.on("SEND_MESSAGE", function (data) {
    if(data.username == $txtUsername.val())
    {
      $listMessages.append("<div class='message-area' style= 'text-align: left'> <span class = 'message-text-self'>"  + data.message + "</span></div>");
    }
    else{
      $listMessages.append("<div class='message-area' style= 'text-align: right'> <span class = 'message-text-other'>" + "<span style='color: #f39c12'>"+ data.username +"</span>" + ": " + data.message + "</span> </div>");
    }
  });

  socket.on("TYPING_MESSAGE", function (data) {
    $("#notification").html("<img width='20px' src='typing05.gif'> " + data.typing);
  });

  socket.on("STOP_TYPING_MESSAGE", function () {
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
    $("#listMessages").append("<div class='ms'>" + 'You have been reconnected' + "</div>");
  });

  socket.on('reconnect_error', () => {
    $("#listMessages").append("<div class='ms'>" + 'Attempt to reconnect has failed' + "</div>");
  });

  // ----------CHAT VOICE SOCKET EVENT-------------------
  socket.on("CHAT_VOICE", function () {
    if (isStreamer) {  
      streamerRtcPeerConnection = new RTCPeerConnection(iceServers);
      streamerRtcPeerConnection.onicecandidate = onIceCandidate;
      streamerRtcPeerConnection.addStream(streamerStream);
      streamerRtcPeerConnection.createOffer(setStreamerLocalAndOffer, function (e) { console.log(e) })
    }
  });

  socket.on('OFFER', (event) => {
    if (!isStreamer) {
      viewerRtcPeerConnection = new RTCPeerConnection(iceServers);
      viewerRtcPeerConnection.onicecandidate = onIceCandidate;
      viewerRtcPeerConnection.onaddstream = viewOnAddStream;
      viewerRtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
      viewerRtcPeerConnection.createAnswer(setViewerLocalAndAnswer, function (e) { console.log(e) })
    }
  });

  socket.on('ANSWER', (event) => {
    if (isStreamer) {
      streamerRtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
    }
  });

  socket.on('ADD_CANDIDATE', (event) => {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: event.label,
      candidate: event.candidate
    });
    if (isStreamer) {
      streamerRtcPeerConnection.addIceCandidate(candidate);
    }
    else {
      viewerRtcPeerConnection.addIceCandidate(candidate);
    }
  });

  // EVENT ON PAGE
  var $audioStreamer = $("#streamer-audio");
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


  $btnStreamer.click(function () {
    if (validateUserName()) {
      $divChatRoom.show();
      $divRegisterUser.hide();
      $lblCurrentUser.text("streamer: " + $txtUsername.val());
      $audioViewer.hide();
      socket.emit("REGISTER_USER", { username: $txtUsername.val(), role: "Streamer" });
      isStreamer = true;
    }
  });

  $btnViewer.click(function () {
    if (validateUserName()) {
      $divChatRoom.show();
      $divRegisterUser.hide();
      $btnAutoSendPosture.hide();
      $btnStopPosture.hide();
      $lblCurrentUser.text("viewer: " + $txtUsername.val());
      $audioStreamer.hide();
      socket.emit("REGISTER_USER", { username: $txtUsername.val(), role: "Viewer" });
      isStreamer = false;
      socket.emit('CHAT_VOICE');
    }
  });

  function validateUserName() {
    if ($txtUsername.val() === '') {
      alert('Please input username !!');

      return false;
    }

    return true;
  }

  $txtMessage.focusin(function () {
    socket.emit("TYPING_MESSAGE");
  })

  $txtMessage.focusout(function () {
    socket.emit("STOP_TYPING_MESSAGE");
  })

  $txtMessage.keydown(function () {
    if (event.which === 13)
      sendMessageAll();
  });

  $btnSendMessage.click(function () {
    sendMessageAll();
  });

  var interval;
  $btnAutoSendPosture.click(function () {
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

    interval = setInterval(function () {
      $postureMessage.append("<div class='ms'>" + "Client start emit " + getCurrentTime() + "</div>");
      console.log("send posture" + getCurrentTime());
      socket.emit('SEND_POSTURE', posture);
    }, 100);

  });

  $btnStopPosture.click(function () {
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

});
