function Ship(length) {
    let timesHit = 0;

    function hit() {
        timesHit ++;
    }

    function isSunk() {
        return timesHit >= length; // returns true if times hit = length
    }

    return { length, hit, isSunk };
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
      let newX = null;
      let newY = null;

      // Icrement the x or y (depending on orientation) by the length
      if (orientation === "horizontal") {
        newX = x + i;
        newY = y;
      } else if (orientation === "vertical") {
        newX = x + i;
        newY = y;
      }

      // Ensure new coordinates are within board bounds (10x10 board)
      if (newX < 0 || newY < 0 || newX >= 10 || newY >= 10) {
        throw new Error("Ship placement is out of bounds");
      }

      // Ensure no overlapping ships. If not undefined, it means there is already a segment at this position
      if (board[`${newX},${newY}`] !== undefined) {
        throw new Error("Ship placement overlaps with another ship");
      }

      // Place ship segment on the board (the segment is a refference to the ship object)
      board[`${newX},${newY}`] = ship;
      console.log(ship);
    }

    // Add the ship to the list of ships on the board (assuming `ships` is an array)
    ships.push(ship);
  }

  return { board, ships, placeShip};
}

module.exports = { Ship, Gameboard };
