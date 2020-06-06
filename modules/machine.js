import { Machine } from "xstate";
import guards from "./machineparts/guards";
import {
  dropStuff,
  awardXP,
  switchPlayer,
  dealDamage,
  switchWeapon,
  applyNewStats,
  setInitialStats,
  createNewEnemy,
  pickUpStuff,
  justLogIt,
} from "./machineparts/actions";
/*const dropStuff = assign({
  players: (ctx, evt) => {
    const players = [...ctx.players];
    console.log(evt);
    players[0].level++;
    return players;
  },
}),*/

import { setupMonster } from "./monsters";

import { all as weapons } from "./weapons";

//TODO: monster does not show weapons , create new monster component
//TODO: healing?
//TODO: store every x levels or pick where to go
//TODO: potions
//TODO: monster treasures
//TODO: carry weight = strength?
//TODO: auto combat? setinterval=>attack (+ level up?)

const RPGMachine = Machine(
  {
    initial: "idle",
    strict: true,
    context: {
      currentPlayer: -1,
      players: [
        {
          name: "Lord Holle",
          hitpoints: 10,
          xp: 0,
          AI: false,
          level: 1,
          attributes: {
            str: 2,
            dex: 10,
            con: 10,
          },
          weapons: [weapons.find((weapon) => weapon.name === "Knife")],
        },
        setupMonster(),
      ],
    },
    states: {
      idle: {
        entry: ["setInitialStats", "createNewEnemy"],
        on: {
          TURN_START: "nextPlayer",
        },
      },
      nextPlayer: {
        entry: ["switchPlayer"],
        on: {
          "": [{ target: "attacking", cond: "isAI" }, "waiting"], //TODO: AI can only attack
        },
      },
      waiting: {
        on: {
          ATTACK: "attacking",
          PARRY: "parrying",
          SWITCH_WEAPON: "switchWeapon",
        },
      },
      switchWeapon: {
        entry: ["switchWeapon"],
        on: {
          "": "waiting",
        },
      },
      attacking: {
        entry: ["dealDamage"],
        on: {
          "": [
            {
              target: "nextPlayer",
              cond: "bothAlive",
            },
            {
              target: "playerWon",
              cond: "AIDied",
            },
            {
              target: "playerDied",
            },
          ],
        },
      },
      parrying: {
        //TODO:
        on: {
          "": "nextPlayer",
        },
      },
      playerWon: {
        entry: ["awardXP"],
        on: {
          "": [
            { target: "levelUp", cond: "checkLevelUp" },
            { target: "postBattle" },
          ],
        },
      },
      playerDied: {}, //TODO:
      levelUp: {
        entry: [{ type: "justLogIt", payload: "Player leveled up" }],
        on: {
          NEW_STATS: {
            actions: ["applyNewStats"],
            target: "postBattle",
          },
        },
      },
      postBattle: {
        //entry: "pickupTreasures",
        on: {
          PICKUP: {
            actions: ["pickUpStuff"],
            target: "",
          },
          DROP: {
            target: "",
            actions: ["dropStuff"],
          },
          TELEPORT: "town",
          NEXT: "nextEnemy",
        },
      },
      nextEnemy: {
        entry: ["createNewEnemy"],
        on: {
          "": "nextPlayer",
        },
      },
      town: {}, //TODO:
    },
  },
  {
    guards,
    actions: {
      justLogIt,
      createNewEnemy,
      setInitialStats,
      applyNewStats,
      switchWeapon,
      dealDamage,
      switchPlayer,
      pickUpStuff,
      dropStuff,
      awardXP,
    },
  }
);

export default RPGMachine;
