import uniqid from "uniqid";
import { rndBetween } from "../utils";

//TODO: more weapons
//https://roll20.net/compendium/dnd5e/Weapons#content
export const all = [
  {
    name: "Fork",
    damageMin: 1,
    damageMax: 1,
    minLevel: 1,
    price: 1,
  },
  {
    name: "Sharp Fork",
    damageMin: 1,
    damageMax: 2,
    minLevel: 1,
    price: 2,
  },
  {
    name: "Club",
    damageMin: 1,
    damageMax: 4,
    minLevel: 1,
    price: 1,
  },
  {
    name: "Knife",
    damageMin: 1,
    damageMax: 4,
    minLevel: 1,
    price: 3,
  },
  {
    name: "Short Sword",
    damageMin: 1,
    damageMax: 6,
    minLevel: 1,
    price: 10,
  },
  {
    name: "Sword",
    damageMin: 1,
    damageMax: 8,
    minLevel: 1,
    price: 20,
  },
  {
    name: "Halberd",
    damageMin: 1,
    damageMax: 10,
    price: 50,
  },
  {
    name: "Greataxe",
    damageMin: 1,
    damageMax: 12,
    price: 100,
  },
  {
    name: "Greatsword",
    damageMin: 2,
    damageMax: 12,
    price: 150,
  },
  /*{
    name: "Debugger",
    damageMin: 20,
    damageMax: 20,
    minLevel: 20,
  },*/
];
export function rndWeaponForLevel(lvl) {
  const filtered = [...all.filter((weapon) => weapon.minLevel <= lvl)];
  const weapon = filtered[Math.floor(Math.random() * filtered.length)];
  weapon.id = uniqid("weapon-");
  return weapon;
}
export function getPlayerStartingWeapon() {
  const weapon = { ...all.find((weapon) => weapon.name === "Knife") };
  weapon.id = uniqid("weapon-");
  return weapon;
}
export function getRndWeapons(min = 0, max = 2) {
  const amount = rndBetween(min, max);
  let response = [];
  for (let i = 0; i < amount; i++) {
    const item = { ...all[Math.floor(Math.random() * all.length)] };
    item.id = uniqid("weapon-", "-" + i);
    response.push(item);
  }
  return response;
}
