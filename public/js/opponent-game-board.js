document.addEventListener("DOMContentLoaded", () => {
  // Selects the input box, containers, cells, and initializes player info from window.roomDetails
  const inputBox = document.getElementById("game-link");
  const waiting_container = document.querySelector(".waiting-container");
  const game_container = document.querySelector(".game-container");
  const cells = document.querySelectorAll(".cell");
  let currentMover = window.roomDetails.firstMove; // Stores current player ("You" or "Opponent")
  let currentSymbol = window.roomDetails.symbol; // Stores player's symbol ("X" or "O")

  // Selects countdown timers for both players and initializes the move timer
  const youCountdown = document.getElementById("you-countdown");
  const opponentCountdown = document.getElementById("opponent-countdown");
  const currentMoveSymbol = document.querySelector(".currentMove");
  let timeStamp = 30; // Initial time for each player's move

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

  // Getting GameStatus Message
  const gameStatusMessage = document.querySelector(".game-status-message");

  // Getting connection message modal
  const connectionStatus = document.getElementById("connectionStatus");
  const connectionStatusMessage = document.querySelector(
    ".connection-status-message"
  );

  // Getting the reset-loading-message box

  const resetLoadingMessageBox = document.querySelector(
    ".reset-loading-message"
  );

  // Initializes the game board as an array of 9 empty strings (3x3 grid)
  let board = ["", "", "", "", "", "", "", "", ""];

  // Winning conditions for the Tic-Tac-Toe game (rows, columns, diagonals)
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

  // Establish a WebSocket connection for real-time multiplayer interaction
  const domainUrl = window.location.href;
  const absoluteUrl = new URL(domainUrl);
  const hostName = absoluteUrl.host;
  const ws = new WebSocket(
    `ws://${hostName}/multiplayer/game-board/${window.roomDetails.roomId}`
  );
  window.ws = ws;

  // ****************** Setting the clock for player turn and timeout ***************** //
  let timeoutId; // Holds the setTimeout ID for managing clock intervals

  function runClock() {
    // Manage countdown for "You" (the current player)
    clearTimeout(timeoutId);
    if (currentMover == "You") {
      if (timeStamp > 0) {
        timeStamp--;
        youCountdown.textContent =
          timeStamp > 10 ? `00:` + timeStamp : `00:0` + timeStamp;

        // Set timeout to continue clock ticking or switch to opponent when time runs out
        if (timeStamp > 1) timeoutId = setTimeout(runClock, 1000);
        else if (timeStamp == 1) {
          currentMoveSymbol.innerHTML = `<span class="currentMove-symbol">Opponent<span>`;
          clearTimeout(timeoutId);
          timeStamp = Number(window.roomDetails.timestamp.split("s")[0]); // Reset timer
          currentMover = "Opponent"; // Switch turn
          youCountdown.textContent = ""; // Clear your countdown
          runClock(); // Restart clock for opponent
        }
      }
    }
    // Manage countdown for "Opponent" (the other player)
    else if (currentMover == "Opponent") {
      if (timeStamp > 0) {
        timeStamp--;
        opponentCountdown.textContent =
          timeStamp > 10 ? `00:` + timeStamp : `00:0` + timeStamp;

        // Set timeout to continue clock ticking or switch back to you when time runs out
        if (timeStamp > 1) timeoutId = setTimeout(runClock, 1000);
        else if (timeStamp == 1) {
          currentMoveSymbol.innerHTML = `<span class="currentMove-symbol">You<span>`;
          clearTimeout(timeoutId);
          timeStamp = Number(window.roomDetails.timestamp.split("s")[0]); // Reset timer
          opponentCountdown.textContent = ""; // Clear opponent's countdown
          currentMover = "You"; // Switch turn
          runClock(); // Restart clock for you
        }
      }
    }
  }

  // Function to handle cell animations after winning the game
  function animateAfterWin(winningCells, symbol) {
    cells.forEach((item) => {
      const index = item.getAttribute("data-index");
      const span = item.querySelector(".cell-span");

      if (winningCells.includes(parseInt(index))) {
        if (span) {
          span.style.color = "green"; // Highlight winning cells in green
          span.style.animation = "none"; // Reset animation
          span.style.animation =
            "scaleIn 0.3s ease-in-out, blink 0.5s ease-in-out 0.3s 2"; // Add animations
        }
      } else {
        if (span) {
          span.style.color = "gray"; // Dim the non-winning cells
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

  // Check if there's a winning combination on the board
  function checkWin() {
    for (let i = 0; i < winningConditions.length; i++) {
      const [a, b, c] = winningConditions[i];
      checkTie();
      if (board[a] && board[a] == board[b] && board[b] == board[c]) {
        animateAfterWin([a, b, c], board[a]); // Animate the win if found
        cells.forEach((cell) =>
          cell.removeEventListener("click", handleCellClick)
        );
        youCountdown.textContent = "";
        opponentCountdown.textContent = "";
        timeStamp = 0;
        isMatchOver = true;
        return;
      }
    }
  }

  // ********************* End CheckWin ************************ //

  // WebSocket events
  ws.onopen = () => {
    if (window.roomDetails?.sendYouJoined == "Yes") {
      ws.send(
        JSON.stringify({ type: "join", roomId: window.roomDetails.roomId })
      ); // Notify server you joined
      runClock(); // Start the clock
    }
    // console.log("socket connected");
    const isWsConnectionAlive = setInterval(() =>{
      if(ws.readyState == WebSocket.CLOSING || ws.readyState == WebSocket.CLOSED){
        connectionStatus.style.display = "block";
        connectionStatusMessage.textContent = "Player Left or Connection Lost!"
        clearInterval(isWsConnectionAlive);
      }
    },1000);
    window.addEventListener("offline",() =>{
      connectionStatus.style.display = "block";
    })
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type == "playerMove") {
      cells[data.index].innerHTML = `<span class='cell-span'>${
        window.roomDetails.symbol == "X" ? "O" : "X"
      }</span>`; // Update opponent's move on the board
      board[data.index] = window.roomDetails.symbol == "X" ? "O" : "X"; // Update the board state
      currentMover = "You"; // Switch turn back to you
      timeStamp = Number(window.roomDetails.timestamp.split("s")[0]); // Reset timer
      opponentCountdown.textContent = ""; // Clear opponent's countdown
      currentMoveSymbol.innerHTML = `<span class="currentMove-symbol">You<span>`; // Show it's your turn
      clearTimeout(timeoutId); // Clear previous timeout
      runClock(); // Restart clock
      checkWin(); // Check for a win after the move
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
        clearTimeout(timeoutId);
        resetGame();
      } else {
        resetLoadingMessageBox.style.display = "none";
        showModal("rejected");
      }
    }
    if (data.type == "opponentLeft") {
      connectionStatus.style.display = "block";
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
  // *********************************************//

  // Attach click event listeners to each game cell
  cells.forEach((cell) => {
    cell.addEventListener("click", handleCellClick);
  });

  // Function to handle what happens when a cell is clicked
  function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = clickedCell.getAttribute("data-index");

    // console.log(clickedCellIndex);

    if (board[clickedCellIndex] == "" && currentMover == "You") {
      cells[
        clickedCellIndex
      ].innerHTML = `<span class='cell-span'>${window.roomDetails.symbol}</span>`; // Update cell with your symbol
      board[clickedCellIndex] = window.roomDetails.symbol; // Update the board state
      currentMover = "Opponent"; // Switch to opponent's turn
      timeStamp = Number(window.roomDetails.timestamp.split("s")[0]); // Reset timer
      youCountdown.textContent = ""; // Clear your countdown
      currentMoveSymbol.innerHTML = `<span class="currentMove-symbol">Opponent<span>`; // Show it's opponent's turn
      clearTimeout(timeoutId); // Clear previous timeout
      ws.send(
        JSON.stringify({
          type: "playerMove",
          index: clickedCellIndex,
          roomId: window.roomDetails.roomId,
        })
      ); // Send move to server
      runClock(); // Restart clock
      checkWin(); // Check if the move resulted in a win
    }
  }

  // console.log(window.roomDetails); // Log room details for debugging purposes

  // Resetting Game Logic

  function resetGame() {
    board.fill("");
    cells.forEach(
      (cell) => (cell.innerHTML = `<span class='cell-span'><span>`)
    );
    timeStamp = Number(window.roomDetails.timestamp.split("s")[0]);
    youCountdown.textContent = "";
    opponentCountdown.textContent = "";
    // clearTimeout(timeoutId);
    runClock();
  }

  // Show the modal when the reset button is clicked
  resetButton.addEventListener("click", () => {
    modal.style.display = "block";
  });

  // Close the modal and reset the game if 'Yes' is clicked
  confirmResetButton.addEventListener("click", () => {
    resetLoadingMessageBox.style.display = "block";
    modal.style.display = "none";
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
  document
    .getElementById("showConnectionMessageButton")
    .addEventListener("click", () => {
      window.location.href = "/";
    });
});
