const express = require("express")

const handleMultiplayer = require("../../controllers/handleMultiplayer")
const handleGameBoard = require("../../controllers/handleGameBoard")
const handleGameBoard2 = require("../../controllers/handleGameBoard2")
const {handleCreateGame , handleWaitingPlayer} = require("../../controllers/handleCreateGame")


const router = express.Router()


router.get('/', handleMultiplayer)
router.post('/create-game',handleCreateGame)
router.use('/game-board/:roomId',handleGameBoard)
router.get('/game-board-2/:roomId',handleGameBoard2)

module.exports = router