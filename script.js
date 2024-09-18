function Ship(length) {
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

// Ship Usage:
// const battleship = Ship(3);
// battleship.hit();
// battleship.hit();
// battleship.hit();

// console.log(battleship.isSunk());


function Gameboard() {
  // Initialize an empty board and an array to keep track of ships
  const board = {};
  const ships = [];
  const missedShots = [];

  function placeShip(ship, x, y, orientation, length) {
    // Throw error if there is an issue with parameters
    if (
      !ship ||
      !Number.isInteger(x) ||
      !Number.isInteger(y) ||
      !orientation ||
      !length
    ) {
      throw new Error("Invalid ship, coordinates, orientation or length");
    }

    // Loop through ship length in direction of orientation, set coordinates & place segments
    for (let i = 0; i < length; i++) {
      let newX = x;
      let newY = y;

      // Icrement the x or y (depending on orientation) by the length
      if (orientation === "horizontal") {
        newX = x + i;
      } else if (orientation === "vertical") {
        newY = y + i;
      }

      // Ensure new coordinates are within board bounds (10x10 board)
      if (newX < 0 || newY < 0 || newX >= 10 || newY >= 10) {
        throw new Error("Ship placement is out of bounds");
      }

      // Ensure no overlapping ships. If not undefined, it means there is already a segment at this position
      if (board[`${newX},${newY}`] !== undefined) {
        throw new Error("Ship placement overlaps with another ship");
      }

      // Place ship segment on the board
      board[`${newX},${newY}`] = ship; // stores the ship object on the board. Allows us to retrieve the ship present at those coordinates and call its methods like hit()
      ship.addCoordinates(newX, newY); // Track coordinates
    }

    // Add the ship to the list of ships on the board (assuming `ships` is an array)
    ships.push(ship);
  }
    
  function shipIsHere(x, y) {
    if (board[`${x},${y}`] !== undefined) { // undefined at that board position means no ship there. 
      return true;
    } else {
        return false;
    }
  }
    
  function receiveAttack(x, y) {
    // If ship found at these coordinates, call the ship's hit method
    if (shipIsHere(x,y) === true) {
        board[`${x},${y}`].hit(); //board[coordinates] refers to a segment (instance) of the ship
        return 'hit';
    } else {
      missedShots.push(`${x},${y}`);
      return "miss";
    }
  }
    
  return { board, ships, placeShip, shipIsHere, receiveAttack};
}

module.exports = { Ship, Gameboard };
