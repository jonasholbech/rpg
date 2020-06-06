import { rndWeaponForLevel } from "./weapons";
import { getRndItems } from "./items";
export const monsters = [
  {
    name: "Snotling",
    AI: true,
    level: 1,
    attributes: {
      str: 2,
      dex: 7,
      con: 2,
    },
  },
  {
    name: "Snot-Pack",
    AI: true,
    level: 1,
    attributes: {
      str: 2,
      dex: 5,
      con: 6,
    },
  },
  {
    name: "Goblin",
    level: 1,
    attributes: {
      str: 4,
      dex: 7,
      con: 4,
    },
  },
];
export function setupMonster() {
  const monster = monsters[Math.floor(Math.random() * monsters.length)];
  monster.weapons = [rndWeaponForLevel(monster.level)];
  monster.hitpoints = monster.attributes.con * 2;
  monster.AI = true;
  monster.items = getRndItems();
  return monster;
}
