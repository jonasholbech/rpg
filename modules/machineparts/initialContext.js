import { setupMonster } from "../entities/monsters";
import { getRndItems } from "../entities/items";
import { all as weapons, getPlayerStartingWeapon } from "../entities/weapons";
const initialContext = {
  currentPlayer: 1,
  players: [
    {
      name: "",
      hitpoints: 10,
      xp: 0,
      AI: false,
      level: 1,
      gold: 20,
      pointsToDistribute:30,
      attributes: {
        str: 1,
        dex: 1,
        con: 1,
      },
      items: [],
      bonuses: [],
      weapons: [getPlayerStartingWeapon()],
    },
    setupMonster(),
  ],
};
export default initialContext;
