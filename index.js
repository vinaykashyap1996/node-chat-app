const http = require("http");
const path = require("path");
const express = require("express");
const app = express();
const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);
const mongoose = require("mongoose");
const PORT = process.env.PORT || 8000;
const generateMessage = require("./messages");
const { adduser, removeuser, getUser, getusersinroom } = require("./users");
mongoose.connect(
  "mongodb://localhost:27017/chat",
  { useNewUrlParser: true },
  function(err) {
    if (err) console.log("Error While connecting to DB:", err);
    else console.log("DB Connected Successfully");
  }
);

const publicDirectory = path.join(__dirname, "./public");
app.use(express.static(publicDirectory));

io.on("connection", socket => {
  socket.on("join", (options, callback) => {
    const { error, user } = adduser({
      id: socket.id,
      ...options
    });

    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    socket.emit("message", generateMessage.getMessage("Admin", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage.getMessage("Admin", `${user.username} has joined`)
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getusersinroom(user.room)
    });
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "message",
      generateMessage.getMessage(user.username, message)
    );
    callback("Delivered!");
  });
  socket.on("send-location", (coords, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "location",
      generateMessage.getMessage(
        user.username,
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback("Deliverd!");
  });

  socket.on("disconnect", () => {
    const user = removeuser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage.getMessage("Admin", `${user.username} has left!`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getusersinroom(user.room)
      });
    }
  });
});
server.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
