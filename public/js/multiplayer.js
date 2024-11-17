const allSymbols = document.querySelectorAll(".playing-symbol");
const playerMoves = document.querySelectorAll(".playing-move");
const playingTimeStamp = document.querySelectorAll(".playing-timestamp");
const createButton = document.querySelector(".create-game-button");

var symbol = "";
var firstMove = "";
var timestamp = "";

// Handle symbol selection
allSymbols.forEach((item) => {
  item.addEventListener("click", () => {
    symbol = item.textContent;
    allSymbols.forEach((value) => {
      if (value === item) {
        value.style.backgroundColor = "#007bff";
        value.style.color = "#ffffff";
      } else {
        value.style.backgroundColor = "#f0f0f0";
        value.style.color = "#000000";
      }
    });
  });
});

// Handle first move selection
playerMoves.forEach((item) => {
  item.addEventListener("click", () => {
    firstMove = item.textContent;
    playerMoves.forEach((value) => {
      if (value === item) {
        value.style.backgroundColor = "#007bff";
        value.style.color = "#ffffff";
      } else {
        value.style.backgroundColor = "#f0f0f0";
        value.style.color = "#000000";
      }
    });
  });
});

// Handle timestamp selection
playingTimeStamp.forEach((item) => {
  item.addEventListener("click", () => {
    timestamp = item.textContent;
    playingTimeStamp.forEach((value) => {
      if (value === item) {
        value.style.backgroundColor = "#007bff";
        value.style.color = "#ffffff";
      } else {
        value.style.backgroundColor = "#f0f0f0";
        value.style.color = "#000000";
      }
    });
  });
});

createButton.addEventListener("click", async() => {
  if(firstMove == "Oponent"){
    symbol = (symbol == "X" ? "O" : "X");
  }
  if (symbol  && firstMove  && timestamp) {
    try {
      const domainUrl = window.location.href;
      const absoluteUrl = new URL(domainUrl);
      const hostName = absoluteUrl.host;
      const response = await fetch(
        `http://${hostName}/multiplayer/create-game`,
        {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({symbol, firstMove, timestamp})
        }
      );
      const data = await response.json()
      if(data.roomId){
        window.location.href = `/multiplayer/game-board/${data.roomId}`
      }else{
        alert(`Failed to create game. (Message: ${data.message}`)
      }
      // console.log(data)
    } catch (error) {
      console.log(error);
    }
  }
});
