const game = (() => {
  // Initialize Players
  const player1 = Player("Human");
  const player2 = Player("PC"); //Set to PC by default until changed manually
  let currentPlayer = player1;
  let opponent = player2;

  // Tracker for PC Intelligence
  let lastHit = null;
  let potentialTargets = [];

  fadeOverlay();
  openPlayerMenu();


  // Game Controller Functions
  function renderGameboard() {
    // Initiate gameboards & gameboard elements
    const playerGameboard = currentPlayer.gameboard;
    const oppGameboard = opponent.gameboard;
    let playerGameBoardElement = document.getElementById("player1boardDiv");
    let oppGameboardElement = document.getElementById("player2boardDiv");
    let player1BoardElement = document.getElementById("player1board");
    let player2BoardElement = document.getElementById("player2board");

    //Display gameboard elements
    playerGameBoardElement.style.display = "block";
    oppGameboardElement.style.display = "block";

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
        if (oppGameboard.isHitAt(i, j)) {
          cell.classList.add("attackHit");
        }
        if (oppGameboard.isMissAt(i, j)) {
          cell.classList.add("attackMiss");
        }
        const opponentShip = oppGameboard.getShipAt(i, j);
        if (opponentShip && opponentShip.isSunk()) {
          cell.classList.add("oppSunk");
          console.log("opp ship sunk!");
        }

        // Add the cell to the board and apply click listeners
        oppGameboardElement.appendChild(cell);

        // Only add click listeners if the cell hasn't already been clicked (hit or miss)
        if (!oppGameboard.isCellClicked(i, j)) {
          addBoardClickListeners(playerGameboard, oppGameboard, cell, i, j);
        }
      }
    }

    // Check if it is the PC's turn and apply random click plays if so
    pcClicks();
  }
  function pcClicks() {
    if (currentPlayer === player2 && player2.type == "pc") {
      // Check if there are cells to target around a known hit
      if (potentialTargets.length > 0) {
        const nextTarget = potentialTargets.shift();
        const { x, y } = nextTarget;

        if (!opponent.gameboard.isCellClicked(x, y)) {
          opponent.gameboard.receiveAttack(x, y);
          opponent.gameboard.markCellAsClicked(x, y);

          if (opponent.gameboard.isShipAt(x, y)) {
            lastHit = { x, y }; // Track the successful hit
            addPotentialTargets(x, y); // Add adjacent cells to potential targets
          } else {
            lastHit = null; // Reset if it was a miss
          }

          changePlayer(opponent.gameboard, x, y);
          return;
        }
      } else if (!potentialTargets.length > 0) {
        // If no specific target, choose a random cell
        let validMove = false; // Look for random until a valid one is found & clicked. 
        while (!validMove) {
          const x = Math.floor(Math.random() * 10);
          const y = Math.floor(Math.random() * 10);

          // Check if cell at x & y has already been clicked
          if (!opponent.gameboard.isCellClicked(x, y)) {
            // If not previously clicked, mark attack & click
            opponent.gameboard.receiveAttack(x, y);
            opponent.gameboard.markCellAsClicked(x, y);

            validMove = true; 

            // If random click resulted in a hit, push it to last hit list
            if (opponent.gameboard.isShipAt(x, y)) {
              lastHit = { x, y };
              addPotentialTargets(x, y);
            } else {
              lastHit = null;
            }

            changePlayer(opponent.gameboard, x, y);
          }
        }
      }
    } 
    function addPotentialTargets(x, y) {
      // Add adjacent cells to the potential targets array, ensuring they're within bounds
      const adjacentCells = [
        { x: x + 1, y: y }, // down
        { x: x - 1, y: y }, // up
        { x: x, y: y + 1 }, // right
        { x: x, y: y - 1 }, // left
      ];

      adjacentCells.forEach((cell) => {
        if (cell.x >= 0 && cell.x < 10 && cell.y >= 0 && cell.y < 10) {
          // Ensure the cell hasn't been clicked already
          if (!opponent.gameboard.isCellClicked(cell.x, cell.y)) {
            potentialTargets.push(cell);
          }
        }
      });
    }
  }
  function addBoardClickListeners(playerGameboard, oppGameboard, cell, i, j) {
    cell.addEventListener("click", function (event) {
      const x = event.target.dataset.x;
      const y = event.target.dataset.y;

      oppGameboard.receiveAttack(i, j);
      oppGameboard.markCellAsClicked(i, j);
      renderGameboard();

      changePlayer(oppGameboard, i, j);
    });
  }
  function changePlayer(oppGameboard, i, j) {
    if (currentPlayer === player1 && oppGameboard.isHitAt(i, j)) {
      // Player 1 hit. Still player 1's turn
      currentPlayer = player1;
      opponent = player2;
      // console.log(`Player 1 hit. Still player 1's turn. Type:`,currentPlayer);
    } else if (currentPlayer === player1 && !oppGameboard.isHitAt(i, j)) {
      // Player 1 miss. Player 2's turn
      currentPlayer = player2;
      opponent = player1;
      // console.log(`Player 1 miss. Player 2's turn. Type:`, currentPlayer);
    } else if (currentPlayer === player2 && oppGameboard.isHitAt(i, j)) {
      // Player 2 hit. Still player 2's turn
      currentPlayer = player2;
      opponent = player1;
      // console.log(`Player 2 hit. Still player 2's turn. Type:`,currentPlayer);
    } else if (currentPlayer === player2 && !oppGameboard.isHitAt(i, j)) {
      // Player 2 miss. Player 1's turn
      currentPlayer = player1;
      opponent = player2;
      // console.log(`Player 2 miss. Player 1's turn. Type:`, currentPlayer);
    }
    // Re-render board
    renderGameboard();
  }
  function randomPlayerShips() {
    //Code
  }
  function setPlayerShips(player) {
    // Create 4 ships w random sizes (2-5) and random coordinates
    const shipLengths = [
      getRandomInt(2, 5),
      getRandomInt(2, 5),
      getRandomInt(2, 5),
      getRandomInt(2, 5),
    ];
    shipLengths.forEach((length) => {
      let placed = false;

      while (!placed) {
        const x = getRandomInt(0, 9);
        const y = getRandomInt(0, 9);
        const orientation = getRandomOrientation();

        // Ensure ship can be placed
        if (canPlaceShip(player.gameboard.board, x, y, length, orientation)) {
          const ship = Ship(length);
          player.gameboard.placeShip(ship, x, y, orientation);
          placed = true;
        }
      }
    });
    function canPlaceShip(board, x, y, length, orientation) {
      // Check if ship is within bounds
      if (orientation === "horizontal") {
        if (y + length > 10) return false; // Out of bounds horizontally
      } else if (orientation === "vertical") {
        if (x + length > 10) return false; // Out of bounds vertically
      }

      // Check if any of the cells are already occupied by another ship
      for (let i = 0; i < length; i++) {
        let checkX = x;
        let checkY = y;

        if (orientation === "horizontal") {
          checkY = y + i;
        } else if (orientation === "vertical") {
          checkX = x + i;
        }

        if (board[checkX][checkY] !== null) {
          return false; // There's already a ship here
        }
      }

      return true; // Ship can be placed
    }
    function getRandomOrientation() {
      return Math.random() < 0.5 ? "horizontal" : "vertical";
    }
    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }

  // User Interface (Menus)
  function fadeOverlay() {
    window.addEventListener("load", () => {
      document.body.classList.add("loaded");
      document.querySelector(".heading").classList.add("visible");

      // Wait for the body to finish fading in before adding the visible class to the menu
      setTimeout(() => {
        document.querySelector(".menu").classList.add("visible");
      }, 2000); // Match the transition time of body
    });
  }
  function openPlayerMenu() {
    const oppSelectBtns = document.getElementById("oppSelectBtns");
    oppSelectBtns.addEventListener("click", function (event) {
      // Get the opponent type from the data-type attribute
      const opponentType = event.target.getAttribute("data-type");
      if (opponentType === "pc") {
        player2.type = "pc";
      } else if (opponentType === "human") {
        player2.type = "human";
      } else {
        console.log("invalid type");
      }

      console.log("player 2 type = ", player2.type);

      closePlayerMenu();
      openShipsMenu();
    });
  }
  function closePlayerMenu() {
    const playerMenu = document.getElementById("playerMenu");
    playerMenu.classList.add("fade-out");
    setTimeout(() => {
      playerMenu.style.display = "none";
    }, 500);

  }
  function openShipsMenu() {
    const shipsMenu = document.getElementById("shipsMenu");
    const orientationBtn = document.getElementById("orientationBtn");
    const randomBtn = document.getElementById("randomBtn");
    const readyBtn = document.getElementById("readyBtn");

    // Define ship sizes
    const shipSizes = [5, 4, 3, 3, 2];
    let currentShipIndex = 0; // Tracks the current ship to place
    let currentOrientation = "horizontal"; // Default orientation

    // Create the board in the ships menu
    createShipsBoard();

    // Display ships menu
    setTimeout(() => {
      shipsMenu.classList.add("fade-in");
    }, 500);
    shipsMenu.style.visibility = "visible";

    // Btn Ev. Listeners
    orientationBtn.addEventListener("click", function () {});
    randomBtn.addEventListener("click", function () {});
    readyBtn.addEventListener("click", function () {
      closeMenu();

      // Create & place ships on board
      setPlayerShips(player1);
      setPlayerShips(player2);

      // Render boards once menu is closed
      setTimeout(() => {
        renderGameboard();
      }, 500);
    });

    // Functions for ship creation
    function createShipsBoard() {
      const player1ShipBoard = document.getElementById("player1ShipBoard");
      player1ShipBoard.innerHTML = ""; // Clear any existing board

      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          const cell = document.createElement("div");
          cell.classList.add("cell");
          cell.dataset.x = i;
          cell.dataset.y = j;

          // Add event listeners for hover and click events
          cell.addEventListener("mouseenter", highlightCells);
          cell.addEventListener("mouseleave", removeHighlight);
          cell.addEventListener("click", placeShip);

          player1ShipBoard.appendChild(cell);
        }
      }
    }
    function highlightCells(event) {
      const x = parseInt(event.target.dataset.x);
      const y = parseInt(event.target.dataset.y);
      const length = shipSizes[currentShipIndex];

      if (canPlaceShip(x, y, length, currentOrientation)) {
        for (let i = 0; i < length; i++) {
          let highlightCell;
          if (currentOrientation === "horizontal") {
            highlightCell = document.querySelector(
              `[data-x='${x}'][data-y='${y + i}']`
            );
          } else {
            highlightCell = document.querySelector(
              `[data-x='${x + i}'][data-y='${y}']`
            );
          }
          if (highlightCell) highlightCell.classList.add("highlight");
        }
      } else {
        // Add some indication that placement is invalid
        event.target.classList.add("invalid");
      }
    }
    function removeHighlight(event) {
      const cells = document.querySelectorAll(".highlight, .invalid");
      cells.forEach((cell) => {
        cell.classList.remove("highlight");
        cell.classList.remove("invalid");
      });
    }
    function placeShip(event) {
      const x = parseInt(event.target.dataset.x);
      const y = parseInt(event.target.dataset.y);
      const length = shipSizes[currentShipIndex];

      if (canPlaceShip(x, y, length, currentOrientation)) {
        for (let i = 0; i < length; i++) {
          let shipCell;
          if (currentOrientation === "horizontal") {
            shipCell = document.querySelector(
              `[data-x='${x}'][data-y='${y + i}']`
            );
          } else {
            shipCell = document.querySelector(
              `[data-x='${x + i}'][data-y='${y}']`
            );
          }
          if (shipCell) shipCell.classList.add("playerShip"); // Mark cells as occupied by a ship
        }
        currentShipIndex++; // Move to the next ship
        if (currentShipIndex >= shipSizes.length) {
          alert("All ships placed! Click 'Ready' to start the game.");
        }
      }
    }
    function canPlaceShip(x, y, length, orientation) {
      for (let i = 0; i < length; i++) {
        let checkCell;
        if (orientation === "horizontal") {
          if (y + i >= 10) return false; // Out of bounds
          checkCell = document.querySelector(
            `[data-x='${x}'][data-y='${y + i}']`
          );
        } else {
          if (x + i >= 10) return false; // Out of bounds
          checkCell = document.querySelector(
            `[data-x='${x + i}'][data-y='${y}']`
          );
        }

        if (checkCell && checkCell.classList.contains("playerShip")) {
          return false; // Overlapping another ship
        }
      }
      return true;
    }
  }
  function closeMenu() {
    const menu = document.querySelector(".menu");
    menu.classList.add("fade-out");
    setTimeout(() => {
      menu.style.display = "none";
    }, 500);
  }


  return { openPlayerMenu, renderGameboard, addBoardClickListeners };
})();

// Modules
function Ship(length) {
  const coordinates = [];
  let timesHit = 0;

  function hit() {
    timesHit++;
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
  function isCellClicked(x, y) {
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
  function getShipAt(x, y) {
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
  function allShipsSunk() {
    return ships.every((ship) => ship.isSunk()); // Returns true if every ship in ships array is sunk.
  }
  return {
    board,
    ships,
    missedShots,
    isHitAt,
    isMissAt,
    placeShip,
    isShipAt,
    getShipAt,
    receiveAttack,
    allShipsSunk,
    isCellClicked,
    markCellAsClicked,
  };
}
function Player(typeParam) {
  // Set type based on different user responses
  if (typeParam === "1" || typeParam.toLowerCase() === "human") {
    type = "human";
  } else if (typeParam === "2" || typeParam.toLowerCase() === "pc") {
    type = "pc";
  } else {
    console.log("Invalid type");
    return null;
  }

  // New gameboard for this player
  const gameboard = Gameboard();

  return { gameboard, type };
}

//Notes:
// x = row, y = column



