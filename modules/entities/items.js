import uniqid from "uniqid";
import { rndBetween } from "../utils";
export const items = [
  //TODO: change should be an integer
  //amount is the split with an interval
  //TODO: modify chances for each one
  //TODO: magic equipment (could just be a knife (1-4) that's a (2-5))
  {
    name: "Healing Potion",
    usable: true,
    price: 5,
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
    price: 10,
    actionPayload: {
      type: "ATTR_CHANGE",
      duration: 1,
      attr: "str",
      change: 10,
    },
  },
  {
    name: "Constitution Potion",
    usable: true,
    price: 10,
    actionPayload: {
      type: "ATTR_CHANGE",
      duration: 10,
      attr: "con",
      change: 10,
    },
  },
  {
    name: "Dexterity Potion",
    usable: true,
    price: 10,
    actionPayload: {
      type: "ATTR_CHANGE",
      duration: 1,
      attr: "dex",
      change: 10,
    },
  },
  {
    name: "Strength Ring",
    usable: true,
    price: 100,
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
    price: 100,
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
    price: 100,
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
  const response = [];
  for (let i = 0; i < amount; i++) {
    const item = items[Math.floor(Math.random() * items.length)];
    item.id = uniqid(i + "-");
    console.log(item.name, item.id);
    response.push(item);
  }
  return response;
}
