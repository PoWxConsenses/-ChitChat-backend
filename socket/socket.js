const mapClientIdWithUser = {};
const socketExec = (client) => {
  console.log("socket connected");
  client.on("joinRoom", (payload) => {
    client.join(payload.roomId);
    // mapClientIdWithUser[client.id] = payload.friendId;
  });
  client.on("messageFromClient", (payload) => {
    client.to(payload.emittedToRoomId).emit("messageFromServer", payload);
  });
  client.on("messageStatusFromClient", (payload) => {
    client.to(payload.emittedToRoomId).emit("messageStatusFromServer", payload);
  });
  client.on("typingStatusFromClient", (payload) => {
    client.to(payload.emittedToRoomId).emit("typingStatusFromServer", payload);
  });
  client.on("isUserOnlineFromClient", (payload) => {
    client.to(payload.emittedToRoomId).emit("isUserOnlineFromServer", {
      isUserOnline: io.sockets.adapter.rooms.has(payload.emittedToRoomId),
    });
  });
  client.on("chatDeletedFromClient", (payload) => {
    client.to(payload.emittedToRoomId).emit("chatDeletedFromServer", payload);
  });
  client.on("disconnect", (payload) => {
    console.log("client disconnect with client id ", client.id);
    // delete mapClientIdWithUser[client.id];
  });
};

module.exports = socketExec;
