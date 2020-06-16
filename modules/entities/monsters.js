import uniqid from "uniqid";
import { rndWeaponForLevel } from "./weapons";
import { getAttributeWithBonuses, inBounds, rndBetween } from "../utils";
import { getRndItems } from "./items";

//TODO: initial level is not used for anything right now
//could use it to hide some monsters for later, like weapons
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
  /*{
    name: "the killer",
    level: 50,
    attributes: {
      str: 50,
      dex: 50,
      con: 50,
    },
  },*/
  {
    name: "Orc",
    level: 1,
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
  /*{
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
  },*/
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
const types = [
  {
    prefix: "Tiny",
    modifiers: {
      str: -4,
      dex: 2,
      con: -4,
    },
  },
  {
    prefix: "Small",
    modifiers: {
      str: -2,
      dex: 1,
      con: -2,
    },
  },
  {
    prefix: "Normal",
    modifiers: {
      str: 0,
      dex: 0,
      con: 0,
    },
  },
  {
    prefix: "Big",
    modifiers: {
      str: 2,
      dex: -1,
      con: 2,
    },
  },
  {
    prefix: "Huge",
    modifiers: {
      str: 4,
      dex: -2,
      con: 4,
    },
  },
];
//TODO: monsters should have treasures based on their level or something similar
export function setupMonster(level = 1) {
  const monsterLevel = inBounds(rndBetween(level - 2, level + 2), 1, level + 2);

  const localMonsters = JSON.parse(JSON.stringify(monsters)); //Deep clone necessary
  let monster = localMonsters[Math.floor(Math.random() * localMonsters.length)];
  monster = applyType(monster);
  monster.level = monsterLevel;
  if (!monster.weapons) {
    monster.weapons = [rndWeaponForLevel(monster.level)];
  }
  const attrs = ["str", "con", "dex"];
  for (let i = 0; i < monsterLevel; i++) {
    monster = modifyAttribute(monster, attrs[rndBetween(0, 2)], 1);
  }
  monster.bonuses = [];

  monster.gold = 0; //TODO: gold er i items for monstre, kan måske undværes
  monster.hitpoints = getAttributeWithBonuses(monster, "con") * 2;
  monster.AI = true;
  monster.items = getRndItems();
  monster.id = uniqid("monster-");

  return monster;
}
function applyType(monster) {
  const type = types[Math.floor(Math.random() * types.length)];
  monster = modifyAttribute(monster, "str", type.modifiers.str);
  monster = modifyAttribute(monster, "dex", type.modifiers.dex);
  monster = modifyAttribute(monster, "con", type.modifiers.con);
  monster.name = type.prefix + " " + monster.name;
  return monster;
}
function modifyAttribute(monster, attr, modifier) {
  monster.attributes[attr] += modifier;
  if (monster.attributes[attr] < 1) {
    monster.attributes[attr] = 1;
  }
  return monster;
}
