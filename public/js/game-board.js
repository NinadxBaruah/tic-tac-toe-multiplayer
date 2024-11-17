document.addEventListener("DOMContentLoaded", () => {
  // Getting references to DOM elements such as input box and containers for the game
  const inputBox = document.getElementById("game-link");
  const waiting_container = document.querySelector(".waiting-container");
  const game_container = document.querySelector(".game-container");
  const cells = document.querySelectorAll(".cell");

  // Initialize the current mover and symbol based on room details
  let currentMover =
    window.roomDetails.firstMove == "Oponent" ? "Opponent" : "You";
  let currentSymbol = window.roomDetails.symbol;

  // Getting references to countdown elements and current move indicator
  const youCountdown = document.getElementById("you-countdown");
  const opponentCountdown = document.getElementById("opponent-countdown");
  const currentMoveSymbol = document.querySelector(".currentMove");
  let timeStamp = 30;

  //Getting references to popup model

  const resetButton = document.getElementById("reset");
  const modal = document.getElementById("resetModal");
  const confirmResetButton = document.getElementById("confirmReset");
  const cancelResetButton = document.getElementById("cancelReset");
  const modelMessage = document.querySelector(".model-message");

  //Getting references to popup model that coming from opponent

  const resetButton2 = document.getElementById("reset2");
  const modal2 = document.getElementById("resetModal2");
  const confirmResetButton2 = document.getElementById("confirmReset2");
  const cancelResetButton2 = document.getElementById("cancelReset2");
  const modelMessage2 = document.querySelector(".model-message2");

  // Getting the score refs
  const playerScore = document.getElementById("player-score");
  const computerScore = document.getElementById("computer-score");

  // Getting GameStatus Message
  const gameStatusMessage = document.querySelector(".game-status-message");

  // Getting connection message modal
  const connectionStatus = document.getElementById("connectionStatus");
  const connectionStatusMessage = document.querySelector(".connection-status-message");

  // Getting the reset-loading-message box

  const resetLoadingMessageBox = document.querySelector(
    ".reset-loading-message"
  );

  // Determine opponent's symbol based on the player's symbol
  var opponentSymbol = "";
  if (window.roomDetails.firstMove) {
    opponentSymbol = window.roomDetails.symbol == "X" ? "O" : "X";
  }

  // Set the value of the game link for sharing the room
  inputBox.value =
    `${window.location.protocol}//${window.location.host}/multiplayer/game-board-2/${window.roomDetails.roomId}` +
    `/?move=${
      window.roomDetails.firstMove == "You" ? "Opponent" : "You"
    }&symbol=${opponentSymbol}`;

  // Initializing an empty game board
  let board = ["", "", "", "", "", "", "", "", ""];

  // Winning conditions for the tic-tac-toe game
  const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  // Trying to establish a WebSocket connection to the game server
  const domainUrl = window.location.href;
  const absoluteUrl = new URL(domainUrl);
  const hostName = absoluteUrl.host;
  const ws = new WebSocket(
    `ws://${hostName}/multiplayer/game-board/${window.roomDetails.roomId}`
  );
  window.ws = ws;
  // Function to handle the clock for the player's turn and timeout
  let timeoutId;
  function runClock() {
    clearTimeout(timeoutId);
    if (currentMover == "You") {
      if (timeStamp > 0) {
        timeStamp--;
        youCountdown.textContent =
          timeStamp > 10 ? `00:` + timeStamp : `00:0` + timeStamp;
        if (timeStamp > 1) {
          timeoutId = setTimeout(runClock, 1000);
        } else if (timeStamp == 1) {
          currentMoveSymbol.innerHTML = `<span class="currentMove-symbol">Opponent<span>`;
          clearTimeout(timeoutId);
          timeStamp = Number(window.roomDetails.timestamp.split("s")[0]);
          currentMover = "Opponent";
          youCountdown.textContent = "";
          runClock();
        }
      }
    } else if (currentMover == "Opponent") {
      if (timeStamp > 0) {
        timeStamp--;
        opponentCountdown.textContent =
          timeStamp > 10 ? `00:` + timeStamp : `00:0` + timeStamp;
        if (timeStamp > 1) {
          timeoutId = setTimeout(runClock, 1000);
        } else if (timeStamp == 1) {
          currentMoveSymbol.innerHTML = `<span class="currentMove-symbol">You<span>`;
          clearTimeout(timeoutId);
          timeStamp = Number(window.roomDetails.timestamp.split("s")[0]);
          opponentCountdown.textContent = "";
          currentMover = "You";
          runClock();
        }
      }
    }
  }

  // Handling click events when a player clicks on any cell
  const handleCellClick = (event) => {
    const clickedCell = event.target;
    const clickedCellIndex = clickedCell.getAttribute("data-index");

    // Only handle the click if it's the player's turn and the cell is empty
    if (board[clickedCellIndex] == "" && currentMover == "You") {
      if (currentMover == "You") {
        // Update the cell with the player's symbol and switch to opponent's turn
        cells[
          clickedCellIndex
        ].innerHTML = `<span class='cell-span'>${window.roomDetails.symbol}</span>`;
        board[clickedCellIndex] = window.roomDetails.symbol;
        currentMover = "Opponent";
        timeStamp = Number(window.roomDetails.timestamp.split("s")[0]);
        youCountdown.textContent = "";
        currentMoveSymbol.innerHTML = `<span class="currentMove-symbol">Opponent<span>`;
        clearTimeout(timeoutId);

        // Send the player's move to the server via WebSocket
        ws.send(
          JSON.stringify({
            type: "playerMove",
            index: clickedCellIndex,
            roomId: window.roomDetails.roomId,
          })
        );
        checkWin();
        runClock();
      }
    }
  };

  // Animate the board after a player wins
  function animateAfterWin(winningCells, symbol) {
    cells.forEach((item) => {
      const index = item.getAttribute("data-index");
      const span = item.querySelector(".cell-span");
      if (winningCells.includes(parseInt(index))) {
        if (span) {
          span.style.color = "green";
          span.style.animation = "none";
          span.style.animation =
            "scaleIn 0.3s ease-in-out, blink 0.5s ease-in-out 0.3s 2";
        }
      } else {
        if (span) {
          span.style.color = "gray";
        }
      }
      showModal(symbol);
    });

    // console.log(`${symbol} wins`);
  }

  //checkTie logic

  function checkTie() {
    if (!board.includes("")) {
      cells.forEach((cell) => {
        cell.removeEventListener("click", handleCellClick);
      });
      isMatchOver = true;
      cells.forEach((cell) =>
        cell.removeEventListener("click", handleCellClick)
      );
      youCountdown.textContent = "";
      opponentCountdown.textContent = "";
      timeStamp = 0;
      showModal("tie");
    }
  }

  //handle the logic of check win
  let isMatchOver = false;
  function checkWin() {
    for (let i = 0; i < winningConditions.length; i++) {
      const [a, b, c] = winningConditions[i];
      checkTie();
      if (board[a] && board[a] === board[b] && board[b] === board[c]) {
        animateAfterWin([a, b, c], board[a]);
        isMatchOver = true;
        cells.forEach((cell) =>
          cell.removeEventListener("click", handleCellClick)
        );
        timeStamp = 0;
        youCountdown.textContent = "";
        opponentCountdown.textContent = "";
        clearTimeout(timeoutId);
        // if (board[a] == humenSymbol) {
        //   playerScore.textContent = parseInt(playerScore.textContent) + 1;
        //   localStorage.setItem(
        //     "player_tic_tac_toe_socre",
        //     playerScore.textContent
        //   );
        // } else if (board[a] == computerSymbol) {
        //   computerScore.textContent = parseInt(computerScore.textContent) + 1;
        //   localStorage.setItem(
        //     "computer_tic_tac_toe_socre",
        //     computerScore.textContent
        //   );
        // }
        return;
      }
    }
  }

  // Attach event listeners to each cell for handling cell clicks
  cells.forEach((cell) => {
    cell.addEventListener("click", handleCellClick);
  });

  // Copy the game link to the clipboard when the copy button is clicked
  document.getElementById("copy-link").addEventListener("click", () => {
    const gameLink = document.getElementById("game-link");
    gameLink.select();
    document.execCommand("copy");
    alert("Link copied to clipboard!");
  });

  // Send a message when the player joins the game via WebSocket
  ws.onopen = () => {
    if (window.roomDetails?.sendYouJoined == "Yes") {
      ws.send(
        JSON.stringify({ type: "join", roomId: window.roomDetails.roomId })
      );
    }
    // console.log("socket connected");
    // Clear previous QR code if any
    document.getElementById("qrcode").innerHTML = "";
    const inputText = document.getElementById("game-link");
    // Create a new QR code
    var qrcode = new QRCode(document.getElementById("qrcode"), {
      text: inputText.value,
      width: 128, // QR code width
      height: 128, // QR code height
    });

    const isWsConnectionAlive = setInterval(() =>{
      if(ws.readyState == WebSocket.CLOSING || ws.readyState == WebSocket.CLOSED){
        connectionStatus.style.display = "block";
        connectionStatusMessage.textContent = "Player Left or Connection Lost!"
        ws.send(JSON.stringify({type:"opponentLeft"}));
        clearInterval(isWsConnectionAlive);
      }
    },1000);

    window.addEventListener("offline",() =>{
      connectionStatus.style.display = "block";
    })
  };

  // Handle messages received from the server (e.g., player moves or other player joining)
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type == "join") {
      // Hide waiting screen and start the game when the other player joins
      waiting_container.style.display = "none";
      game_container.style.display = "block";
      runClock();
    }
    if (data.type == "playerMove") {
      // Update the board with the opponent's move and switch the turn back to the player
      cells[data.index].innerHTML = `<span class='cell-span'>${
        window.roomDetails.symbol == "X" ? "O" : "X"
      }</span>`;
      board[data.index] = window.roomDetails.symbol == "X" ? "O" : "X";
      currentMover = "You";
      timeStamp = Number(window.roomDetails.timestamp.split("s")[0]);
      opponentCountdown.textContent = "";
      currentMoveSymbol.innerHTML = `<span class="currentMove-symbol">You<span>`;
      clearTimeout(timeoutId);
      runClock();
      checkWin();
    }
    if (data.type == "reset") {
      // Reset the board and the game state when the game is reset
      modal2.style.display = "block";
      modelMessage2.textContent = `Opponent want to reset or replay the game!`;
    }
    if (data.type == "resetMessage") {
      if (data.message == "confirm") {
        resetLoadingMessageBox.style.display = "none";
        cells.forEach((cell) =>
          cell.addEventListener("click", handleCellClick)
        );
        isMatchOver = false;
        clearTimeout(timeoutId);
        resetGame();
      } else {
        resetLoadingMessageBox.style.display = "none";
        showModal("rejected");
      }
    }
    if (data.type == "opponentLeft") {
      connectionStatus.style.display = "block"
    }
  };

  // Handle WebSocket closure and notify of disconnection
  ws.onclose = (event) => {
    if (ws.readyState == WebSocket.CLOSING) {
      // console.log("closing");
    }
  };

  // Close the WebSocket connection when the window is closed or refreshed

// Store the WebSocket closing function
let closeWebSocketCallback = null;

// Function to set up the WebSocket closing callback
function setCloseWebSocketCallback(callback) {
    closeWebSocketCallback = callback;
}

// Function to handle page unload
function handlePageUnload() {
    if (closeWebSocketCallback) {
        closeWebSocketCallback();
    }
}

// Add event listener for beforeunload
window.addEventListener("beforeunload", function (event) {
    // Cancel the event and show a warning message
    event.preventDefault();
    event.returnValue = ""; // This is needed for older browsers
    return ""; // This is needed for older browsers
});

// Add event listener for unload
window.addEventListener("unload", handlePageUnload);

// Example usage:
setCloseWebSocketCallback(function() {
    if (ws) {
        ws.send(JSON.stringify({
            type: "closing",
            roomId: window.roomDetails.roomId,
        }));
        
        ws.close();
    }
});


  // Output room details to the console for debugging
  // console.log(window.roomDetails);

  // Resetting Game Logic

  function resetGame() {
    board.fill("");
    cells.forEach(
      (cell) => (cell.innerHTML = `<span class='cell-span'><span>`)
    );
    timeStamp = Number(window.roomDetails.timestamp.split("s")[0]);
    // clearTimeout(timeoutId);
    youCountdown.textContent = "";
    opponentCountdown.textContent = "";
    runClock();
  }

  // Show the modal when the reset button is clicked
  resetButton.addEventListener("click", () => {
    modal.style.display = "block";
    modelMessage.textContent = `Are you sure you want to reset or replay the game?`;
  });

  // Close the modal and reset the game if 'Yes' is clicked
  confirmResetButton.addEventListener("click", () => {
    modal.style.display = "none";
    resetLoadingMessageBox.style.display = "block";
    ws.send(
      JSON.stringify({ type: "reset", roomId: window.roomDetails.roomId })
    );
  });

  // Close the modal without resetting the game if 'No' is clicked
  cancelResetButton.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Close the modal if the user clicks anywhere outside of the modal
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  // If accepting opponent offer to reset
  confirmResetButton2.addEventListener("click", () => {
    modal2.style.display = "none";
    resetGame();
    ws.send(
      JSON.stringify({
        type: "resetMessage",
        message: "confirm",
        roomId: window.roomDetails.roomId,
      })
    );
    cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
  });

  // If Rejecting Opponent offer to Reset

  cancelResetButton2.addEventListener("click", () => {
    modal2.style.display = "none";
    ws.send(
      JSON.stringify({
        type: "resetMessage",
        message: "reject",
        roomId: window.roomDetails.roomId,
      })
    );
  });

  // Function to show the modal of win lose or tie
  function showModal(symbol) {
    const gameStatus = document.getElementById("GameStatus");
    gameStatus.classList.add("show");

    // Remove the modal after 3 seconds to complete the animation
    setTimeout(() => {
      gameStatus.classList.remove("show");
    }, 3000); // Matches the duration of the animation (3 seconds)

    if (symbol == window.roomDetails.symbol) {
      gameStatusMessage.textContent = "You Won!";
    } else {
      gameStatusMessage.textContent = "Opponent Won!";
    }
    if (symbol == "tie") {
      gameStatusMessage.textContent = "It's a Tie!";
    }

    if (symbol == "rejected") {
      gameStatusMessage.textContent = "Opponent don't want to play!";
    }
  }

  // Redirect to HomePage when click onit , Opponent left or connection Error
  document.getElementById("showConnectionMessageButton").addEventListener("click",() =>{
    window.location.href = "/";
  })
});
