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
    name: "pistol",
    damageMin: 1,
    damageMax: 25,
    minLevel: 50,
    price: 200000,
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
    minLevel: 2,
    price: 10,
  },
  {
    name: "Sword",
    damageMin: 1,
    damageMax: 8,
    minLevel: 4,
    price: 20,
  },
  {
    name: "Halberd",
    damageMin: 1,
    damageMax: 10,
    minLevel: 6,
    price: 50,
  },
  {
    name: "Greataxe",
    damageMin: 1,
    damageMax: 12,
    minLevel: 8,
    price: 100,
  },
  {
    name: "Greatsword",
    damageMin: 2,
    damageMax: 12,
    minLevel: 14,
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
  const weapon = JSON.parse(
    JSON.stringify(filtered[Math.floor(Math.random() * filtered.length)])
  );
  weapon.id = uniqid("weapon-");
  return weapon;
}
export function getPlayerStartingWeapon() {
  const weapon = { ...all.find((weapon) => weapon.name === "Knife") }; //weapons objects are only one level deep, so no need for a deep clone
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
