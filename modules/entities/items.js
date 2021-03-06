import uniqid from "uniqid";
import { rndBetween } from "../utils";
export const items = [
  //TODO: initialDuration on items
  //TODO: change should be an integer
  //amount is the split with an interval
  //TODO: modify chances for each one
  //TODO: magic equipment (could just be a knife (1-4) that has (2-5))
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
      duration: 10,
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
      duration: 10,
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
    amount: "1-100",
  },
];
//non usable bonuses
//bonuses are applied to currentPlayer
//curses to nextPlayer
export const bonuses = {
  parryBonus: {
    type: "ATTR_CHANGE",
    duration: "turn",
    attr: "dex",
    change: 50,
    duration: 2,
  },
  parryCurse: {
    type: "ATTR_CHANGE",
    duration: "turn",
    attr: "dex",
    change: -50,
    duration: 2,
  },
};
export function getRndItems(min = 0, max = 2) {
  const amount = rndBetween(min, max);
  const response = [];
  for (let i = 0; i < amount; i++) {
    const item = JSON.parse(
      JSON.stringify(items[Math.floor(Math.random() * items.length)])
    );
    item.id = uniqid("item-");
    response.push(item);
  }
  response.sort((a, b) => a.name > b.name);
  return response;
}
