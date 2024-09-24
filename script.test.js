const { NewShip, Gameboard, NewPlayer } = require("./script.js");

test("creates a ship with given length", () => {
  const ship = NewShip(3);
  expect(ship.length).toBe(3);
});

test("hit() increments the number of hits", () => {
  const ship = NewShip(3);
  ship.hit();
  expect(ship.isSunk()).toBe(false);
  ship.hit();
  expect(ship.isSunk()).toBe(false);
  ship.hit();
  expect(ship.isSunk()).toBe(true);
});

test("place ship horizontally on gameboard", () => {
  const gameboard = Gameboard();
  const ship = NewShip(3);

  gameboard.placeShip(ship, 0, 0, "horizontal");
    expect(gameboard.isShipAt(0,0)).toBe(true);
    expect(gameboard.isShipAt(1,0)).toBe(true);
    expect(gameboard.isShipAt(2,0)).toBe(true);
    expect(gameboard.isShipAt(3,0)).toBe(false);

  // Check if placing a ship horizontally worked
  //   expect(gameboard.receiveAttack([0, 0])).toBe("hit");
  //   expect(gameboard.receiveAttack([0, 1])).toBe("hit");
  //   expect(gameboard.receiveAttack([0, 2])).toBe("hit");
  //   expect(gameboard.receiveAttack([1, 1])).toBe("miss");
});

test("place ship and access its coordinates", () => {
  const gameboard = Gameboard();
  const ship = NewShip(3);

  gameboard.placeShip(ship, 0, 0, "horizontal");

  console.log(ship.coordinates); // This will print the ship's coordinates

  expect(ship.coordinates).toEqual([
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
  ]);
});

test("are all ships sunk", () => {
    const gameboard = Gameboard();
    const ship = NewShip(2);
    gameboard.placeShip(ship, 0, 0, "horizontal");
    ship.hit();
    ship.hit();

    expect(gameboard.allShipsSunk()).toBe(true)

    const ship2 = NewShip(1);
    gameboard.placeShip(ship2, 2, 2, "vertical");

    expect(gameboard.allShipsSunk()).toBe(false);

    ship2.hit();

    expect(gameboard.allShipsSunk()).toBe(true);
})

test("new player has board and type", () => {
    const player1 = NewPlayer("human");
    const player2 = NewPlayer("pc");

    expect(player1.gameboard).toBeDefined();
    expect(player2.gameboard).toBeDefined();

    expect(player1.type).toBe("human");
    expect(player2.type).toBe("pc");

})
