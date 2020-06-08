import { setupMonster } from "../entities/monsters";
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
      gold: 0,
      attributes: {
        str: 10,
        dex: 10,
        con: 10,
      },
      items: [],
      bonuses: [],
      weapons: [getPlayerStartingWeapon()],
    },
    setupMonster(),
  ],
};
export default initialContext;
