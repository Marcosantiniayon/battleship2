function Ship(length) {
    let timesHit = 0;

    function hit() {
        timesHit ++;
    }

    function isSunk() {
        return timesHit >= length; // returns true if times hit = length
    }

    return { hit, isSunk };
}

// Ship Usage:
// const battleship = Ship(3);
// battleship.hit();
// battleship.hit();
// battleship.hit();

// console.log(battleship.isSunk());


function Gameboard() {


  function something() {
    
  }

  return { hit, isSunk };
}