const { Ship, Gameboard } = require("./script.js");

test("creates a ship with given length", () => {
  const ship = Ship(3);
  expect(ship.length).toBe(3);
});

test("hit() increments the number of hits", () => {
  const ship = Ship(3);
  ship.hit();
  expect(ship.isSunk()).toBe(false);
  ship.hit();
  expect(ship.isSunk()).toBe(false);
  ship.hit();
  expect(ship.isSunk()).toBe(true);
});

test("place ship horizontally on gameboard", () => {
  const gameboard = Gameboard();
  const ship = Ship(3);

  gameboard.placeShip(ship, 0, 0, "horizontal", 3);

  // Check if placing a ship horizontally worked
  //   expect(gameboard.receiveAttack([0, 0])).toBe("hit");
  //   expect(gameboard.receiveAttack([0, 1])).toBe("hit");
  //   expect(gameboard.receiveAttack([0, 2])).toBe("hit");
  //   expect(gameboard.receiveAttack([1, 1])).toBe("miss");
});
