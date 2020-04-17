const users = [];

//add user
const adduser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();
  if (!username || !room) {
    return {
      error: "Username and Room required"
    };
  }
  const existingUsers = users.find(user => {
    return user.room === room && user.username === username;
  });
  if (existingUsers) {
    return {
      error: "Username is in use"
    };
  }

  const user = { id, username, room };

  users.push(user);

  return { user };
};

//removeuser

const removeuser = id => {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

//getusers

const getUser = id => {
  return users.find(user => user.id === id);
};
//getusersinroom
const getusersinroom = room => {
  return users.find(user => user.room === room);
};

module.exports = { adduser, removeuser, getusersinroom, getUser };
