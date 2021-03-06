import { setupMonster } from "../entities/monsters";
import { getRndItems } from "../entities/items";
import { all as weapons, getPlayerStartingWeapon } from "../entities/weapons";
const initialContext = {
  currentPlayer: 1,
  players: [
    {
      name: "Storm og Birk",
      hitpoints: 10,
      xp: 0,
      AI: false,
      level: 1,
      gold: 15,
      pointsToDistribute: 30,
      attributes: {
        str: 12,
        dex: 9,
        con: 9,
      },
      items: getRndItems(6, 6),
      bonuses: [],
      weapons: [getPlayerStartingWeapon()],
    },
    setupMonster(),
  ],
};
export default initialContext;
