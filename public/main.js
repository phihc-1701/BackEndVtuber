var socket = io("http://localhost:3000");

socket.on("INIT_CONNECTION_EXIST", function () {
  alert("User has been register !");
});

socket.on("SERVER_RESPONSE_LISTUSERS", function (data) {
  $("#boxContent").html("");
  data.forEach(function (i) {
    $("#boxContent").append("<div class='user'>" + i + "</div>");
  });
});

socket.on("INIT_CONNECTION_SUCCESS", function (data) {
  $("#currentUser").html(data);
  $("#loginForm").hide(2000);
  $("#chatForm").show(1000);
});

socket.on("SEND_MESSAGE", function (data) {
  $("#listMessages").append("<div class='ms'>" + data.username + ":" + data.message + "</div>");
});

socket.on("TYPING_MESSAGE", function (data) {
  $("#notification").html("<img width='20px' src='typing05.gif'> " + data);
});

socket.on("STOP_TYPING_MESSAGE", function () {
  $("#notification").html("");
});

socket.on("CURRENT_ROOM", function (data) {
  $(".currentRoom").html(data);
});

socket.on("SERVER_SENDMESSAGE_ROOM", function (data) {
  $("#listMessages").append("<div class='ms'>" + data.username + ":" + data.message + "</div>");
});

socket.on('SEND_POSTURE', (data) => {
  $("#postureMessage").append("<div class='ms'>" + "Server receive message " + data.currentTime + "</div>");
  $("#postureMessage").append("<div class='ms'>" + "Data:  " + data.posture + "</div>");
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

const getCurrentTime = () => {
  var today = new Date();
  var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  return ' ' + time;
}

const sendMessageAll = () => {

  var currentRoom = $(".currentRoom").text();
  var message = $("#txtMessage").val().trim();
  if (currentRoom === "All") {
    socket.emit("SEND_MESSAGE", {message: message});
  } else {
    socket.emit("CLIENT_SENDMESSAGE_ROOM", {message: message});
  }

  $("#txtMessage").val("");
}

$(document).ready(function () {
  var interval;
  $("#loginForm").show();
  $("#chatForm").hide();

  $("#txtMessage").focusin(function () {
    var currentRoom = $(".currentRoom").text();
    if (currentRoom === "All") {
      socket.emit("TYPING_MESSAGE");
    } else {
      socket.emit("TYPING_MESSAGE_IN_ROOM");
    }

  })

  $("#txtMessage").focusout(function () {
    socket.emit("STOP_TYPING_MESSAGE");
  })

  $("#btnRegister").click(function () {
    var role = $('#roles option:selected').text();
    if (role === "User")
      $("#btnCreateRoom").val("Join Room");
    socket.emit("INIT_CONNECTION", {username: $("#txtUsername").val()});
  });

  $("#btnLogout").click(function () {
    socket.emit("LOGOUT");
    $("#chatForm").hide(2000);
    $("#loginForm").show(1000);
  });

  $("#txtMessage").keydown(function () {
    if (event.which === 13)
      sendMessageAll();
  });

  $("#btnSendMessage").click(function () {
    sendMessageAll();
  });

  $("#btnCreateRoom").click(function () {
    socket.emit("JOIN_ROOM", $("#txtRoom").val());
  });

  $("#btnLeaveRoom").click(function () {
    socket.emit("LEAVE_ROOM", $("#txtRoom").val());
    $(".currentRoom").html("All");
  });

  $("#btnAutoSendPosture").click(function () {

    var chatInfo = {
      "roomID": 123,
      "userID": 1,
      "userName": "MrA",
      "messenger": "Hello"
    };

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
      $("#postureMessage").append("<div class='ms'>" + "Client start emit " + getCurrentTime() + "</div>");
      socket.emit('SEND_POSTURE', posture);
    }, 100);

  });

  $("#btnStopPosture").click(function () {
    clearInterval(interval);
  });
});
