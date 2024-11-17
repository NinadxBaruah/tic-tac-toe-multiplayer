const gameRooms = new Map()


const setGameRoom = (roomId , gameDetails) =>{
    if(roomId) gameRooms.set(roomId , gameDetails)
}

const getGameRoom = (roomId) =>{
    return gameRooms.get(roomId)
}

const deleteRoom = (roomId) => {
    if(roomId) gameRooms.delete(roomId);
}



module.exports = {setGameRoom , getGameRoom ,deleteRoom , gameRooms}