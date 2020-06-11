import uniqid from "uniqid";
import { rndWeaponForLevel } from "./weapons";
import { getAttributeWithBonuses, ID } from "../utils";
import { getRndItems } from "./items";

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
    name: "Boar",
    level: 1,
    attributes: {
      str: 10,
      dex: 7,
      con: 3,
    },
    weapons: [
      {
        name: "Tusks",
        damageMin: 1,
        damageMax: 5,
        minLevel: 1,
        notCollectable: true,
      },
    ],
  },
  {
    name: "Cut Throat",
    level: 1,
    attributes: {
      str: 6,
      dex: 7,
      con: 4,
    },
  },
  {
    name: "Orc",
    level: 2,
    attributes: {
      str: 11,
      dex: 6,
      con: 10,
    },
  },
  {
    name: "Zombie",
    level: 1,
    attributes: {
      str: 8,
      dex: 5,
      con: 15,
    },
    weapons: [
      {
        name: "Bite",
        damageMin: 4,
        damageMax: 4,
        minLevel: 1,
        notCollectable: true,
      },
    ],
  },
  {
    name: "Dinosaur Monster",
    level: 4,
    attributes: {
      str: 20,
      dex: 1,
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
//TODO: monsters should have treasures based on their level or something similar
export function setupMonster() {
  const monster = { ...monsters[Math.floor(Math.random() * monsters.length)] };
  if (!monster.weapons) {
    monster.weapons = [rndWeaponForLevel(monster.level)];
  }

  monster.bonuses = [];
  monster.gold = 0; //TODO: gold er i items for monstre, kan måske undværes
  monster.hitpoints = getAttributeWithBonuses(monster, "con") * 2;
  monster.AI = true;
  monster.items = getRndItems();
  monster.id = uniqid("monster-");

  return monster;
}
