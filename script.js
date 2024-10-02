let player1BoardElement = document.getElementById("player1board");
let player2BoardElement = document.getElementById("player2board");


function NewShip(length) {
    const coordinates = [];
    let timesHit = 0;

    function hit() {
        timesHit ++;
    }
    function isSunk() {
        return timesHit >= length; // returns true if times hit = length
    }
    function addCoordinates(x, y) {
      coordinates.push({ x, y }); // Add coordinate to the ship
    }

    return { length, coordinates, hit, isSunk, addCoordinates };
}

function Gameboard() {
  // Initialize an empty board and an array to keep track of ships
  const board = [];
  const ships = []; // list of full ships
  const missedShots = []; // list of missed shots coordinates
  const hits = [];
  const clickedCells = [];

  make10x10(board); // Each cordinate / ship segment is a nested array: board[x][y]

  function make10x10(board) {
    // Loop to create 10 rows
    for (let i = 0; i < 10; i++) {
      const row = [];
      // Loop to create 10 cells per row
      for (let j = 0; j < 10; j++) {
        row.push(null); // null = empty cell
      }
      board.push(row); // Add the row to the board
    }
  }  
  function markCellAsClicked(x, y) {
    clickedCells.push({ x, y });
  }
  function isCellClicked(x, y){
    // Loops through the clickedCells array to see if any matches the given x and y coordinates
    return clickedCells.some((cell) => cell.x === x && cell.y === y);
  }
  function placeShip(ship, row, column, orientation) {
    // Check paremeters. Throw error if ne is incorrect / missing
    if (
      !ship ||
      !Number.isInteger(row) ||
      !Number.isInteger(column) ||
      !orientation
    ) {
      throw new Error("Invalid ship, coordinates, orientation or length");
    }

    let x = row;
    let y = column;
    
    // Loop through ship length in direction of orientation, set coordinates & place segments
    for (let i = 0; i < ship.length; i++) {
      // Increment the x or y (depending on orientation) by the length
      if (orientation === "horizontal") {
        y = column + i;
      } else if (orientation === "vertical") {
        x = row + i;
      }

      // Ensure new coordinates are within board bounds (10x10 board)
      if (x < 0 || y < 0 || x >= 10 || y >= 10) {
        throw new Error("Ship placement is out of bounds");
      }

      // Ensure no overlapping ships. Should be null, otherwise there is already a segment at this position
      if (board[x][y] !== null) {
        throw new Error("Ship placement overlaps with another ship");
      }

      // Place ship segment on the board
      board[x][y] = ship; // stores the ship object on the board. Allows us to retrieve the ship present at those coordinates and call its methods like hit()
      ship.addCoordinates(x, y); // Track coordinates
    }

    // Add the ship to the list of ships on the board (assuming `ships` is an array)
    ships.push(ship);
  }
  function isShipAt(x, y) {
    return board[x][y] !== null;
  }
  function getShipAt(x, y){
    return board[x][y]; // Return the ship at the given coordinates
  }   
  function receiveAttack(x, y) {
    // Convert to numbers for proper checking
    x = Number(x); 
    y = Number(y); 

    // If ship found at these coordinates, call the ship's hit method
    if (isShipAt(x, y) === true) {
      board[x][y].hit(); //board[coordinates] refers to a segment of the ship
      hits.push({ x, y });
      return "hit";
    } else {
      missedShots.push([x, y]);
      return "miss";
    }
  }
  function isHitAt(x, y) {
    // Loops through the hits array to see if any hit matches the given x and y coordinates
    return hits.some((hit) => hit.x === x && hit.y === y);
  }
  function isMissAt(x, y) {
    // Convert to numbers for proper checking
    x = Number(x);
    y = Number(y);
    
    // Loops through the missedShots array to see if any hit matches the given x and y coordinates
    return missedShots.some((miss) => miss[0] === x && miss[1] === y);
  }
  function allShipsSunk(){
    return ships.every(ship => ship.isSunk()) // Returns true if every ship in ships array is sunk.  
  }
  return { board, ships, missedShots, isHitAt, isMissAt, placeShip, isShipAt, getShipAt, receiveAttack, allShipsSunk, isCellClicked,markCellAsClicked };
}

function NewPlayer(type) {

    // If no type parameter passed, promppt user for a type
    if (!type) {
        type = prompt("Choose a player type:\n1. Human\n2. PC");
    } 

    // Set type based on different user responses
    if (type === "1" || type.toLowerCase() === "human") {
      type = "human";
    } else if (type === "2" || type.toLowerCase() === "pc") {
      type = "pc";
    } else {
        console.log("Invalid type");
        return null;
    }

    // New gameboard for this player
    const gameboard = Gameboard();

    return {gameboard, type}
}

const dom = (() => {
  const pcBtn = document.getElementById("pcBtn");
  const humanBtn = document.getElementById('humanBtn');
  
  function renderGameboard(currentPlayer, opponent) {
    const playerGameboard = currentPlayer.gameboard;
    const oppGameboard = opponent.gameboard;
    let playerGameBoardElement = null;
    let oppGameboardElement = null;

    if (currentPlayer === player1) {
      playerGameBoardElement = player1BoardElement;
      oppGameboardElement = player2BoardElement;
    } else if (currentPlayer === player2) {
      playerGameBoardElement = player2BoardElement;
      oppGameboardElement = player1BoardElement;
    }

    // Clear the player board containers
    oppGameboardElement.innerHTML = "";
    playerGameBoardElement.innerHTML = "";

    // Player physical board (10 x 10) & mark defensive cell state. No click listeners
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.x = i;
        cell.dataset.y = j;

        // Mark cells on gameboard based on state
        if (playerGameboard.isShipAt(i, j)) {
          cell.classList.add("playerShip");
        }
        if (playerGameboard.isHitAt(i, j)) {
          cell.classList.add("playerIsHit");
        }
        const playerShip = playerGameboard.getShipAt(i, j);
        if (playerShip && playerShip.isSunk()) {
          cell.classList.add("playerSunk");
        }

        // Add the cell to the board and apply click listeners
        playerGameBoardElement.appendChild(cell);

      }
    }

    // Opponent physical board (10 x 10) & mark attacking cell state. Add click listeners
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.x = i;
        cell.dataset.y = j;

        // Mark cells on gameboard based on state
        // if (oppGameboard.isShipAt(i, j)) {
        //   cell.classList.add("playerShip");
        // }
  
        if (oppGameboard.isHitAt(i, j)) {
          cell.classList.add("attackHit");
        }
        if (oppGameboard.isMissAt(i, j)) {
          cell.classList.add("attackMiss");
        }
        const opponentShip = oppGameboard.getShipAt(i, j);
        if (opponentShip && opponentShip.isSunk()) {
          cell.classList.add("oppSunk");
          console.log('opp ship sunk!');
        }

        // Add the cell to the board and apply click listeners
        oppGameboardElement.appendChild(cell);

        // Only add click listeners if the cell hasn't already been clicked (hit or miss)
        if (!oppGameboard.isCellClicked(i, j)) {
          addBoardClickListeners(
            currentPlayer,
            playerGameboard,
            oppGameboard,
            cell,
            i,
            j
          );
        }
      }
    }
  }
  function addBoardClickListeners(currentPlayer, playerGameboard, oppGameboard, cell, i, j) {
    cell.addEventListener("click", function (event){
      const x = event.target.dataset.x;
      const y = event.target.dataset.y;

      oppGameboard.receiveAttack(i, j);
      oppGameboard.markCellAsClicked(i, j);
      dom.renderGameboard(player1, player2);

      changePlayer(currentPlayer, oppGameboard, i, j);
    })
    function changePlayer(currentPlayer, oppGameboard, i, j) {
      // if (currentPlayer === player1 && !oppGameboard.isHitAt(i, j)) {
      //   console.log(`Player 1 miss. Player 2's turn`);
      //   //dom.renderGameboard(player2, player1); // Human Player 2's turn
      //   // PC's turn
      // }
      if (currentPlayer === player1 && oppGameboard.isHitAt(i, j)) {
        // Player 1 hit. Still player 1's turn
        dom.renderGameboard(player2, player1);
        dom.renderGameboard(player1, player2);
        console.log(`Player 1 hit. Still player 1's turn`);
      } else if (currentPlayer === player1 && !oppGameboard.isHitAt(i, j)) {
        // Player 1 miss. Player 2's turn
        dom.renderGameboard(player1, player2);
        dom.renderGameboard(player2, player1);
        console.log(`Player 1 miss. Player 2's turn`);
      }
      if (currentPlayer === player2 && oppGameboard.isHitAt(i, j)) {
        // Player 2 hit. Still player 2's turn
        dom.renderGameboard(player1, player2);
        dom.renderGameboard(player2, player1);
        console.log(`Player 2 hit. Still player 2's turn`);
      } else if (currentPlayer === player2 && !oppGameboard.isHitAt(i, j)) {
        // Player 2 miss. Player 1's turn
        dom.renderGameboard(player2, player1);
        dom.renderGameboard(player1, player2);
        console.log(`Player 2 miss. Player 1's turn`);
      }
    }
  }

  pcBtn.addEventListener("click", function () {
    console.log("pc button clicked!");
  });
  humanBtn.addEventListener("click", function () {
    console.log("human button clicked!");
  });


  
  return { renderGameboard, addBoardClickListeners };
})();


// Fade overlay
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
  document.querySelector(".heading").classList.add("visible");

  // Wait for the body to finish fading in before adding the visible class to the menu
  setTimeout(() => {
    document.querySelector(".menu").classList.add("visible");
  }, 2000); // Match the transition time of body
});



// Creat new players
const player1 = NewPlayer("Human");
let player2 = null

// Create new ships
const p1ship1 = NewShip(3);
const p2ship1 = NewShip(3);

//Place ships
player1.gameboard.placeShip(p1ship1, 0, 1, 'horizontal');
player2.gameboard.placeShip(p2ship1, 0, 1, 'vertical');

// Player 1's turn to start the game
dom.renderGameboard(player1, player2);

// module.exports = { NewShip, Gameboard, NewPlayer };


