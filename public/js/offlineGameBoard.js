// Getting references to DOM elements such as input box and containers for the game
const cells = document.querySelectorAll(".cell");

// Getting the reset button
const resetButton = document.getElementById("reset");

// Getting Modal yes and no button
const resetConfirmButton = document.getElementById("confirmReset");
const resetCancelButton = document.getElementById("cancelReset");

// Getting GameStatus Message
const gameStatusMessage = document.querySelector(".game-status-message");

// Getting the Model Reference
const modalRef = document.querySelector(".modal ");

// Getting the score refs
const playerScore = document.getElementById("player-score");
const computerScore = document.getElementById("computer-score");

// Defining Player Symbols

const humenSymbol = "X";
const computerSymbol = "O";

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

// Setting scores from localStorage if available

if (localStorage.getItem("player_tic_tac_toe_socre")) {
  playerScore.textContent = localStorage.getItem("player_tic_tac_toe_socre");
} else {
  playerScore.textContent = "0";
}

if (localStorage.getItem("computer_tic_tac_toe_socre")) {
  computerScore.textContent = localStorage.getItem(
    "computer_tic_tac_toe_socre"
  );
} else {
  computerScore.textContent = "0";
}

//checkTie logic

function checkTie(){
  if(!board.includes("")){
    cells.forEach((cell) => {
      cell.removeEventListener("click", handleCellClick);
    });
    isMatchOver = true;
    showModal('tie')
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
      if (board[a] == humenSymbol) {
        playerScore.textContent = parseInt(playerScore.textContent) + 1;
        localStorage.setItem(
          "player_tic_tac_toe_socre",
          playerScore.textContent
        );
      } else if (board[a] == computerSymbol) {
        computerScore.textContent = parseInt(computerScore.textContent) + 1;
        localStorage.setItem(
          "computer_tic_tac_toe_socre",
          computerScore.textContent
        );
      }
      return;
    }
  }
}

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
  });
  cells.forEach((cell) => {
    cell.removeEventListener("click", handleCellClick);
  });
  showModal(symbol);
}

//handle the logic of computer move

function makeComputerMove() {
  const computerMoveIndex = Math.floor(Math.random() * 9);
  if (board[computerMoveIndex] == "") {
    setTimeout(() => {
      cells[
        computerMoveIndex
      ].innerHTML = `<span class='cell-span'>${computerSymbol}</span>`;
      board[computerMoveIndex] = computerSymbol;
      if(isMatchOver == false) checkWin();
      return;
    }, 500);
  } else {
    makeComputerMove();
    checkWin();
  }
}

// handle cell click
function handleCellClick(event) {
  const clickedCell = event.target;
  const clickedCellIndex = clickedCell.getAttribute("data-index");

  if (board[clickedCellIndex] == "") {
    cells[
      clickedCellIndex
    ].innerHTML = `<span class='cell-span'>${humenSymbol}</span>`;
    board[clickedCellIndex] = humenSymbol;
    if(isMatchOver == false) checkWin();
    if(isMatchOver == false) makeComputerMove();
  }
}

// Handle Reset Button click

resetButton.addEventListener("click", () => {
  modalRef.style.display = "block";
});

//Handle modal no button

resetCancelButton.addEventListener("click", () => {
  modalRef.style.display = "none";
});

//Handle modal Yes button
resetConfirmButton.addEventListener("click", () => {
  modalRef.style.display = "none";
  board.fill("");
  cells.forEach((cell) => {
    cell.innerHTML = "";
  });
  cells.forEach((cell) => {
    cell.addEventListener("click", handleCellClick);
  });
  isMatchOver = false;
});

// Close the modal if the user clicks anywhere outside of the modal
window.addEventListener("click", (event) => {
  if (event.target === modalRef) {
    modalRef.style.display = "none";
  }
});

// Function to show the modal of win lose or tie
function showModal(symbol) {
  const gameStatus = document.getElementById("GameStatus");
  gameStatus.classList.add("show");

  // Remove the modal after 3 seconds to complete the animation
  setTimeout(() => {
    gameStatus.classList.remove("show");
  }, 3000); // Matches the duration of the animation (3 seconds)

  if (symbol == humenSymbol) {
    gameStatusMessage.textContent = "You Won!";
  } else {
    gameStatusMessage.textContent = "Computer Won!";
  }
 if(symbol == "tie"){
  gameStatusMessage.textContent = "It's a Tie!";
 }
}

cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
