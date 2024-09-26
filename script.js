let player1board = document.getElementById("player1board");
let player2board = document.getElementById("player2board");


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
        x = row + i;
      } else if (orientation === "vertical") {
        y = column + i;
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
    // Loops through the missedShots array to see if any hit matches the given x and y coordinates
    return missedShots.some((miss) => miss.x === x && miss.y === y);
  }
  function allShipsSunk(){
    return ships.every(ship => ship.isSunk()) // Returns true if every ship in ships array is sunk.  
  }
  return { board, ships, missedShots, isHitAt, isMissAt, placeShip, isShipAt, getShipAt, receiveAttack, allShipsSunk };
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
    function renderGameboard(currentPlayer, opponent) {
        const playerGameboard = currentPlayer.gameboard;
        const oppGameboard = opponent.gameboard;

        // Clear the board container
        player1board.innerHTML = "";

        // Create a 10 x 10 visual of the board (100 cells total) 
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
                if (oppGameboard.isHitAt(i, j)) {
                    cell.classList.add("oppHit");
                }
                if (oppGameboard.isMissAt(i, j)) {
                    cell.classList.add("playerMissed");
                }

                // Check if the ship at the current coordinates is sunk
                const playerShip = playerGameboard.getShipAt(i, j);
                const opponentShip = oppGameboard.getShipAt(i, j);

                if (playerShip && playerShip.isSunk()) {
                    cell.classList.add("playerShipSunk");
                }
                if (opponentShip && opponentShip.isSunk()) {
                    cell.classList.add("oppSunk");
                }

                player1board.appendChild(cell);
            }
        }
    }
    function addBoardClickListeners() {
        //code
    }
    return { renderGameboard, addBoardClickListeners };
})();


const player1 = NewPlayer("Human");
const player2 = NewPlayer("PC");

// Render player 1's board
dom.renderGameboard(player1, player2);
// Create new ship
const p1ship1 = NewShip(3);

player1.gameboard.placeShip(p1ship1, 0, 1, 'vertical');
dom.renderGameboard(player1, player2);

// module.exports = { NewShip, Gameboard, NewPlayer };


