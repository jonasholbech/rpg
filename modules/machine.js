import { Machine, assign } from "xstate";
import guards from "./machineparts/guards";
import {
  awardXP,
  switchPlayer,
  dealDamage,
  switchWeapon,
  applyNewStats,
  setInitialStats,
  createNewEnemy,
  pickupTreasures,
  justLogIt,
} from "./machineparts/actions";
import { observer } from "./observer";

import monsters from "./monsters";
import { all as weapons, rndWeaponForLevel } from "./weapons";

//TODO: monster does not show , create new monster component
//TODO: healing?
//TODO: store every x levels or pick where to go
//TODO: potions
//TODO: choose to pickup?
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
            str: 10,
            dex: 10,
            con: 10,
          },
          weapons: [weapons.find((weapon) => weapon.name === "Debugger")],
        },
        monsters[0],
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
        entry: ["awardXP", "pickupTreasures"],
        on: {
          "": [
            { target: "levelUp", cond: "checkLevelUp" },
            { target: "nextEnemy" },
          ],
        },
      },
      playerDied: {}, //TODO:
      levelUp: {
        entry: [{ type: "justLogIt", payload: "Player leveled up" }],
        on: {
          NEW_STATS: {
            actions: ["applyNewStats"],
            target: "nextEnemy",
          },
        },
      },
      nextEnemy: {
        entry: ["createNewEnemy"],
        on: {
          "": "nextPlayer",
        },
      },
    },
  },
  {
    guards,
    actions: {
      justLogIt,
      pickupTreasures,
      createNewEnemy,
      setInitialStats,
      applyNewStats,
      switchWeapon,
      dealDamage,
      switchPlayer,
      awardXP,
    },
  }
);

export default RPGMachine;
