const generateRandomString = require("../utils/getRandomString")
const {setGameRoom} = require("../utils/create-game-room")

const handleCreateGame = async (req, res) => {
  const { symbol, firstMove, timestamp } = req.body;
  try{
    const roomId = await generateRandomString(10)
    setGameRoom(roomId , { symbol, firstMove, timestamp , numberOfPlayerJoined:0 })
    res.status(200).json({roomId})
  }
  catch(error){
    res.status(400).json({message:"Someting went wrong!"})
    console.log(error)
  }
};


module.exports = { handleCreateGame };
