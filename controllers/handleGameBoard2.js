const { getGameRoom, setGameRoom } = require("../utils/create-game-room");


const handleGameBoard2 = (req, res) => {
  const { move, symbol } = req.query;
  const roomId = req.params.roomId;
  const roomDetails = getGameRoom(roomId);

  try {
    if (roomDetails.numberOfPlayerJoined < 2) {
      roomDetails.numberOfPlayerJoined += 1;
      roomDetails.roomId = roomId;
      if (move) {
        roomDetails.sendYouJoined = "Yes";
        roomDetails.firstMove = move;
      }
      if (symbol) {
        roomDetails.symbol = symbol;
        // console.log("here");
      }
      // console.log("here sym:", symbol);
      setGameRoom(roomId, roomDetails);
      // console.log(move)
      return res.render("opponent-game-board", { roomDetails, roomId });
    } else {
      return res.render("someone-already-joined");
    }
  } catch (e) {
    return res.render("multiplayer");
  }
};

module.exports = handleGameBoard2;
