import { rndWeaponForLevel } from "./weapons";
import { getAttributeWithBonuses } from "../utils";
import { getRndItems } from "./items";
//TODO: if monster has a weapon (like a tail for a dragon), dont add another
//TODO: not all weapons are collecatble (like a bite), maybe that should drop other stuff? like a tooth?
export const monsters = [
  {
    name: "Snotling",
    level: 1,
    attributes: {
      str: 2,
      dex: 7,
      con: 2,
    },
  },
  {
    name: "Snot-Pack",
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
  {
    name: "Dinosaur Monster",
    level: 1,
    attributes: {
      str: 20,
      dex: 7,
      con: 20,
    },
    weapons: [
      {
        name: "Vicious Bite",
        damageMin: 1,
        damageMax: 20,
        minLevel: 1,
        notCollectable: true,
      },
    ],
  },
  {
    name: "møg unge",
    level: 1,
    attributes: {
      str: 1,
      dex: 50,
      con: 5,
    },
  },
];
export function setupMonster() {
  const monster = monsters[Math.floor(Math.random() * monsters.length)];
  if (!monster.weapons) {
    monster.weapons = [rndWeaponForLevel(monster.level)];
  }

  monster.bonuses = [];
  monster.gold = 0; //TODO: gold er i items for monstre
  monster.hitpoints = getAttributeWithBonuses(monster, "con") * 2;
  monster.AI = true;
  monster.items = getRndItems();

  return monster;
}