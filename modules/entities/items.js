import { rndBetween } from "../utils";
export const items = [
  //TODO: stackable (Infinity)
  {
    name: "Healing Potion",
    usable: true,
    actionPayload: {
      type: "ATTR_CHANGE",
      duration: "permanent",
      attr: "hitpoints",
      change: "1-8",
    },
  },
  {
    name: "Strength Potion",
    usable: true,
    actionPayload: {
      type: "ATTR_CHANGE",
      duration: "combat",
      attr: "str",
      change: "10",
    },
  },
  {
    name: "Strength Ring",
    usable: true,
    actionPayload: {
      type: "ATTR_CHANGE",
      duration: "permanent",
      attr: "str",
      change: 1,
    },
  },
  {
    name: "Dexterity Ring",
    usable: true,
    actionPayload: {
      type: "ATTR_CHANGE",
      duration: "permanent",
      attr: "dex",
      change: 1,
    },
  },
  {
    name: "Constitution Ring",
    usable: true,
    actionPayload: {
      type: "ATTR_CHANGE",
      duration: "permanent",
      attr: "con",
      change: 1,
    },
  },
  {
    name: "Gold",
    usable: false,
    amount: "1-10",
  },
];

export function getRndItems(min = 0, max = 2) {
  const amount = rndBetween(min, max);
  console.log(amount, items);
  let response = [];
  for (let i = 0; i < amount; i++) {
    response.push(items[Math.floor(Math.random() * items.length)]);
  }
  console.log(amount, items, response);
  return response;
}
