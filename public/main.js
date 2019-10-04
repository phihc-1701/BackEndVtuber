var socket = io("http://localhost:3000");

socket.on("server-send-register-fail", function () {
  alert("User has been register !");
});

socket.on("server-send-listUser", function (data) {
  $("#boxContent").html("");
  data.forEach(function (i) {
    $("#boxContent").append("<div class='user'>" + i + "</div>");
  });
});

socket.on("server-send-register-successed", function (data) {
  $("#currentUser").html(data);
  $("#loginForm").hide(2000);
  $("#chatForm").show(1000);
});

socket.on("server-send-mesage", function (data) {
  $("#listMessages").append("<div class='ms'>" + data.un + ":" + data.nd + "</div>");
});

socket.on("had typing", function (data) {
  $("#notification").html("<img width='20px' src='typing05.gif'> " + data);
});

socket.on("who stop typing", function () {
  $("#notification").html("");
});

socket.on("current room", function (data) {
  $(".currentRoom").html(data);
});

socket.on("serverChatRoom", function (data) {
  $("#listMessages").append("<div class='ms'>" + data.un + ":" + data.nd + "</div>");
});

socket.on('test connection', (data) => {
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

$(document).ready(function () {
  var interval;
  $("#loginForm").show();
  $("#chatForm").hide();

  $("#txtMessage").focusin(function () {
    var currentRoom = $(".currentRoom").text();
    if (currentRoom === "All") {
      socket.emit("typing message");
    } else {
      socket.emit("typing in Room");
    }

  })

  $("#txtMessage").focusout(function () {
    socket.emit("stop typing");
  })

  $("#btnRegister").click(function () {
    var role = $('#roles option:selected').text();
    if (role === "User")
      $("#btnCreateRoom").val("Join Room");
    socket.emit("client-send-Username", $("#txtUsername").val());
  });

  $("#btnLogout").click(function () {
    socket.emit("logout");
    $("#chatForm").hide(2000);
    $("#loginForm").show(1000);
  });

  $("#btnSendMessage").click(function () {

    var currentRoom = $(".currentRoom").text();
    var message = $("#txtMessage").val();
    if (currentRoom === "All") {
      socket.emit("user-send-message", message);
    } else {
      socket.emit("chatRoom", message);
    }
  });

  $("#btnCreateRoom").click(function () {
    socket.emit("create room", $("#txtRoom").val());
  });

  $("#btnLeaveRoom").click(function () {
    socket.emit("leave room", $("#txtRoom").val());
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
      socket.emit('auto connect', posture);
    }, 100);

  });

  $("#btnStopPosture").click(function () {
    clearInterval(interval);
  });
});
