import { setupMonster } from "../entities/monsters";
import { getRndItems } from "../entities/items";
import { all as weapons, getPlayerStartingWeapon } from "../entities/weapons";
const initialContext = {
  currentPlayer: 1,
  players: [
    {
      name: "Lord Holle",
      hitpoints: 10,
      xp: 0,
      AI: false,
      level: 1,
      gold: 200,
      attributes: {
        str: 10,
        dex: 10,
        con: 10,
      },
      items: getRndItems(2, 4),
      bonuses: [],
      weapons: [getPlayerStartingWeapon()],
    },
    setupMonster(),
  ],
};
export default initialContext;
