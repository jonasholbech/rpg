import { rndWeaponForLevel } from "./weapons";
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
  return monster;
}
