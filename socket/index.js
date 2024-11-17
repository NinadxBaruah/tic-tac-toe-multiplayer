const { WebSocketServer, WebSocket } = require("ws");
const {
  setGameRoom,
  getGameRoom,
  deleteRoom,
  gameRooms,
} = require("../utils/create-game-room");


function onSocketPostError(e) {
  console.log("Socket Post Error:", e);
}


function onSocketPreError(e) {
  console.log("Socket Pre Error:", e);
}

module.exports = function configure(server) {
  const wss = new WebSocketServer({ noServer: true });
  // this will triggered when http server try to upgrade the
  //conneciton to WebSocket, we can do auth here also distroy the socket if needed

  // Set up an interval outside the connection handler to send pings to all users
  setInterval(() => {
    // Iterate over all connected users in friendsRoom and send ping messages
    for (const [userId, ws] of gameRooms.entries()) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
      }
    }
  }, 30000); // Send ping every 30 seconds
  server.on("upgrade", (req, socket, head) => {
    socket.on("error", onSocketPreError);
    const urlParts = req.url.split("/");
    if (urlParts[1] == "multiplayer") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        socket.removeListener("error", onSocketPreError);
        wss.emit("connection", ws, req);
      });
    }
  });

  wss.on("connection", (ws, req) => {
    // console.log("client connected");
    ws.on("error", onSocketPostError);
    const urlParts = req.url.split("/");
    const roomId = urlParts[3];
    if (urlParts[1] == "multiplayer" && urlParts[2] == "game-board" && roomId) {
      try {
        // if(!getGameRoom(roomId)) ws.send(JSON.stringify({type:"demo"}))
        const roomDetails = getGameRoom(roomId);
        if (!roomDetails) ws.close("closed");
        if (!roomDetails.clientOne) {
          roomDetails.clientOne = ws;
          setGameRoom(roomId, roomDetails);
        } else if (!roomDetails.clientTwo) {
          roomDetails.clientTwo = ws;
          setGameRoom(roomId, roomDetails);
        }
      } catch (error) {
        console.log(error);
      }

      ws.on("message", (data) => {
        const message = data.toString();
        const parsedMessage = JSON.parse(message);
        const roomId = parsedMessage.roomId;
        const roomDetails = getGameRoom(roomId);
        if (parsedMessage.type == "closing") {
          try {
            if (roomDetails.clientOne) {
              roomDetails.clientOne.send(
                JSON.stringify({ type: "opponentLeft" })
              );
              roomDetails.clientOne.close();
            }
            if (roomDetails.clientTwo) {
              roomDetails.clientTwo.send(
                JSON.stringify({ type: "opponentLeft" })
              );
              roomDetails.clientTwo.close();
            }
            deleteRoom(roomId);
          } catch (e) {
            console.log("error from closing from message");
          }
        }
        // console.log(parsedMessage);
        const clientToSend = getGameRoom(roomId);
        if (clientToSend && clientToSend.clientOne && clientToSend.clientTwo) {
          if (clientToSend.clientOne == ws) {
            clientToSend.clientTwo.send(JSON.stringify(parsedMessage));
          } else {
            clientToSend.clientOne.send(JSON.stringify(parsedMessage));
          }
          // clientToSend.clientOne.send(JSON.stringify(parsedMessage));
          // clientToSend.clientTwo.send(JSON.stringify(parsedMessage));
        }
        // console.log(getGameRoom(roomId))
      });
      // Handle client disconnection
      ws.on("close", () => {
        const roomDetails = getGameRoom(roomId);
        if (roomDetails) {
          // Notify the other client in the room
          if (roomDetails.clientOne === ws && roomDetails.clientTwo) {
            roomDetails.clientTwo.send(
              JSON.stringify({ type: "opponentLeft" })
            );
            roomDetails.clientTwo.close();
            deleteRoom(roomId);
            return;
          } else if (roomDetails.clientTwo === ws && roomDetails.clientOne) {
            roomDetails.clientOne.send(
              JSON.stringify({ type: "opponentLeft" })
            );
            roomDetails.clientOne.close();
            deleteRoom(roomId);
            return;
          }
          // Clean up the room if both clients have disconnected
          if (!roomDetails.clientOne && !roomDetails.clientTwo) {
            deleteRoom(roomId);
          }
        }
        // console.log(getGameRoom(roomId));
      });
    }
  });
};
