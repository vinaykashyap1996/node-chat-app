const socket = io();
const sideBarTemplate = document.querySelector("#sideBar-template").innerHTML;
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = document.querySelector("input");
const $messageFormButton = document.querySelector("button");
const $LocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");
const locationTemplate = document.querySelector("#location-template").innerHTML;
const messageTemplate = document.querySelector("#message-template").innerHTML;
socket.on("message", message => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a")
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

socket.on("location", url => {
  const location = Mustache.render(locationTemplate, {
    username: url.username,
    url: url.text,
    createdAt: moment(url.createdAt).format("h:mm a")
  });
  $messages.insertAdjacentHTML("beforeend", location);
});

socket.on("roomData", ({ room, users }) => {
  const roomData = Mustache.render(sideBarTemplate, {
    room,
    users
  });
  document.querySelector("#sideBar").innerHTML = roomData;
});
$messageForm.addEventListener("submit", e => {
  e.preventDefault();
  $messageFormButton.setAttribute("disable", "disable");
  message = e.target.elements.message.value;
  socket.emit("sendMessage", message, message => {
    $messageFormButton.removeAttribute("disable", "");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    console.log("The Message was Delivered!", message);
  });
});

$LocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser.");
  }
  $LocationButton.setAttribute("disable", "disable");
  navigator.geolocation.getCurrentPosition(position => {
    socket.emit(
      "send-location",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      message => {
        $LocationButton.removeAttribute("disable", "");
        console.log("Location has been shared", message);
      }
    );
  });
});

socket.emit("join", { username, room }, error => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
