let player1BoardElement = document.getElementById("player1board");
let player2BoardElement = document.getElementById("player2board");
let currentPlayer = null;

//Main Functions
const dom = (() => {
  function addBtnClickListeners() {
    pcBtn.addEventListener("click", function () {
      console.log("pc clicked");
      player2.type = "pc";
      // Create & place ships on board
      setPlayer1Ships();
      setPlayer2Ships();
      // Render boards
      dom.renderGameboard(globalThis.currentPlayer, player2);
    });
    humanBtn.addEventListener("click", function () {
      console.log("human clicked");
      player2.type = "human";
      // Create & place ships on board
      setPlayer1Ships();
      setPlayer2Ships();
      // Render boards
      dom.renderGameboard(globalThis.currentPlayer, player2);
    });

    function setPlayer1Ships() {
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

          if (
            canPlaceShip(player1.gameboard.board, x, y, length, orientation)
          ) {
            const newShip = NewShip(length);
            player1.gameboard.placeShip(newShip, x, y, orientation);
            placed = true;
          }
        }
      });
    }
    function setPlayer2Ships() {
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

          if (
            canPlaceShip(player2.gameboard.board, x, y, length, orientation)
          ) {
            const newShip = NewShip(length);
            player2.gameboard.placeShip(newShip, x, y, orientation);
            placed = true;
          }
        }
      });
    }
  }
  function renderGameboard(currentPlayer, opponent) {
    const playerGameboard = currentPlayer.gameboard;
    const oppGameboard = opponent.gameboard;
    let playerGameBoardElement = document.getElementById("player1boardDiv");
    let oppGameboardElement = document.getElementById("player2boardDiv");

    playerGameBoardElement.style.display = "block";
    oppGameboardElement.style.display = "block";

    if (currentPlayer === player1) {
      playerGameBoardElement = player1BoardElement;
      oppGameboardElement = player2BoardElement;
    } else if (currentPlayer === player2) {
      playerGameBoardElement = player2BoardElement;
      oppGameboardElement = player1BoardElement;
    }

    oppGameboardElement.innerHTML = "";
    playerGameBoardElement.innerHTML = "";

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.x = i;
        cell.dataset.y = j;

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

        playerGameBoardElement.appendChild(cell);
      }
    }

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.x = i;
        cell.dataset.y = j;

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

        oppGameboardElement.appendChild(cell);

        if (!oppGameboard.isCellClicked(i, j)) {
          addBoardClickListeners(oppGameboard, cell, i, j);
        }
      }
    }
  }
  function addBoardClickListeners(oppGameboard, cell, i, j) {
    cell.addEventListener("click", function (event) {
      const x = event.target.dataset.x;
      const y = event.target.dataset.y;

      oppGameboard.receiveAttack(i, j);
      oppGameboard.markCellAsClicked(i, j);
      dom.renderGameboard(globalThis.currentPlayer, opponent);

      changePlayer(oppGameboard, i, j);
    });
  }
  function changePlayer(oppGameboard, i, j) {
    if (globalThis.currentPlayer === player1 && oppGameboard.isHitAt(i, j)) {
      globalThis.currentPlayer = player1;
      opponent = player2;
      console.log(
        `Player 1 hit. Still player 1's turn. Type:`,
        globalThis.currentPlayer
      );
    } else if (
      globalThis.currentPlayer === player1 &&
      !oppGameboard.isHitAt(i, j)
    ) {
      globalThis.currentPlayer = player2;
      opponent = player1;
      console.log(
        `Player 1 miss. Player 2's turn. Type:`,
        globalThis.currentPlayer
      );
    } else if (
      globalThis.currentPlayer === player2 &&
      oppGameboard.isHitAt(i, j)
    ) {
      globalThis.currentPlayer = player2;
      opponent = player1;
      console.log(
        `Player 2 hit. Still player 2's turn. Type:`,
        globalThis.currentPlayer
      );
    } else if (
      globalThis.currentPlayer === player2 &&
      !oppGameboard.isHitAt(i, j)
    ) {
      globalThis.currentPlayer = player1;
      opponent = player2;
      console.log(
        `Player 2 miss. Player 1's turn. Type:`,
        globalThis.currentPlayer
      );
    }
    dom.renderGameboard(globalThis.currentPlayer, opponent);
  }

  const menu = document.querySelector(".menu");
  const playerMenu = document.getElementById("playerMenu");
  const pcBtn = document.getElementById("pcBtn");
  const humanBtn = document.getElementById("humanBtn");
  let playerType = null;

  return { addBtnClickListeners, renderGameboard, addBoardClickListeners };
})();

function NewShip(length) {
  const coordinates = [];
  let timesHit = 0;

  function hit() {
    timesHit++;
  }
  function isSunk() {
    return timesHit >= length;
  }
  function addCoordinates(x, y) {
    coordinates.push({ x, y });
  }

  return { length, coordinates, hit, isSunk, addCoordinates };
}
function Gameboard() {
  const board = [];
  const ships = [];
  const missedShots = [];
  const hits = [];
  const clickedCells = [];

  make10x10(board);

  function make10x10(board) {
    for (let i = 0; i < 10; i++) {
      const row = [];
      for (let j = 0; j < 10; j++) {
        row.push(null);
      }
      board.push(row);
    }
  }
  function markCellAsClicked(x, y) {
    clickedCells.push({ x, y });
  }
  function isCellClicked(x, y) {
    return clickedCells.some((cell) => cell.x === x && cell.y === y);
  }
  function placeShip(ship, row, column, orientation) {
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

    for (let i = 0; i < ship.length; i++) {
      if (orientation === "horizontal") {
        y = column + i;
      } else if (orientation === "vertical") {
        x = row + i;
      }

      if (x < 0 || y < 0 || x >= 10 || y >= 10) {
        throw new Error("Ship placement is out of bounds");
      }

      if (board[x][y] !== null) {
        throw new Error("Ship placement overlaps with another ship");
      }

      board[x][y] = ship;
      ship.addCoordinates(x, y);
    }

    ships.push(ship);
  }
  function isShipAt(x, y) {
    return board[x][y] !== null;
  }
  function getShipAt(x, y) {
    return board[x][y];
  }
  function receiveAttack(x, y) {
    x = Number(x);
    y = Number(y);

    if (isShipAt(x, y) === true) {
      board[x][y].hit();
      hits.push({ x, y });
      return "hit";
    } else {
      missedShots.push([x, y]);
      return "miss";
    }
  }
  function isHitAt(x, y) {
    return hits.some((hit) => hit.x === x && hit.y === y);
  }
  function isMissAt(x, y) {
    x = Number(x);
    y = Number(y);
    return missedShots.some((miss) => miss[0] === x && miss[1] === y);
  }
  function allShipsSunk() {
    return ships.every((ship) => ship.isSunk());
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
function NewPlayer(type) {
  if (!type) {
    type = prompt("Choose a player type:\n1. Human\n2. PC");
  }

  if (type === "1" || type.toLowerCase() === "human") {
    type = "human";
  } else if (type === "2" || type.toLowerCase() === "pc") {
    type = "pc";
  } else {
    console.log("Invalid type");
    return null;
  }

  const gameboard = Gameboard();

  return { gameboard, type };
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomOrientation() {
  return Math.random() < 0.5 ? "horizontal" : "vertical";
}
function canPlaceShip(board, x, y, length, orientation) {
  if (orientation === "horizontal") {
    if (y + length > 10) return false;
  } else if (orientation === "vertical") {
    if (x + length > 10) return false;
  }

  for (let i = 0; i < length; i++) {
    let checkX = x;
    let checkY = y;

    if (orientation === "horizontal") {
      checkY = y + i;
    } else if (orientation === "vertical") {
      checkX = x + i;
    }

    if (board[checkX][checkY] !== null) {
      return false;
    }
  }

  return true;
}
function fadeOverlay() {
  window.addEventListener("load", () => {
    document.body.classList.add("loaded");
    document.querySelector(".heading").classList.add("visible");

    setTimeout(() => {
      document.querySelector(".menu").classList.add("visible");
    }, 2000);
  });
}

const player1 = NewPlayer("Human");
let player2 = NewPlayer("PC");
globalThis.currentPlayer = player1;
let opponent = player2;

dom.addBtnClickListeners();

fadeOverlay();

//Notes:
// x = row, y = column
