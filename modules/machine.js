import { Machine } from "xstate";
import guards from "./machineparts/guards";
import { actions } from "./machineparts/actions";

import { setupMonster } from "./entities/monsters";

import { all as weapons } from "./entities/weapons";

//TODO: create new monster component
//TODO: store every x levels or pick where to go
//TODO: auto combat? setinterval=>attack (+ level up?)
//TODO: create character initially
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
          gold: 0,
          attributes: {
            str: 10,
            dex: 10,
            con: 10,
          },
          items: [],
          bonuses: [],
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
          USE_ITEM: [{ target: "useItem", cond: "hasItems" }],
        },
      },
      switchWeapon: {
        entry: ["switchWeapon"],
        on: {
          "": "waiting",
        },
      },
      useItem: {
        entry: ["useItem"],
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
        entry: ["awardXP", "removeBonuses"],
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
        on: {
          PICKUP_WEAPON: {
            actions: ["pickUpWeapon"],
            target: "",
          },
          DROP_WEAPON: {
            target: "",
            actions: ["dropWeapon"],
          },
          PICKUP_ITEM: {
            actions: ["pickUpItem"],
            target: "",
          },
          DROP_ITEM: {
            target: "",
            actions: ["dropItem"],
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
    actions,
  }
);

export default RPGMachine;
