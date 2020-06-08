import { Machine } from "xstate";
import guards from "./machineparts/guards";
import { actions } from "./machineparts/actions";
import initialContext from "./machineparts/initialContext";

//TODO: auto combat? setinterval=>attack (+ level up?)
//TODO: create character initially
//TODO: negative bonuses, poison (throwable on opponent, or through weapon (bite))
const RPGMachine = Machine(
  {
    initial: "idle",
    strict: true,
    context: { ...initialContext },
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
        //TODO: curse (bonus) on opponent, -50 on attack (dex)?
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
      playerDied: {
        on: {
          PLAY_AGAIN: {
            actions: ["reset"],
            target: "idle",
          },
        },
      },
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
