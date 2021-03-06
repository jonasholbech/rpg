import { Machine, send, sendParent } from "xstate";
import guards from "./machineparts/guards";
import { actions } from "./machineparts/actions";
import initialContext from "./machineparts/initialContext";

const RPGMachine = Machine(
  {
    initial: "createCharacter",
    strict: true,
    id: "rpgmachine",
    context: JSON.parse(JSON.stringify(initialContext)),
    states: {
      createCharacter: {
        entry: [{ type: "addToLog", payload: "createCharacter" }],
        on: {
          ASSIGN_ATTR: {
            target: "beforeTown",
            actions: "setInitialAttributes",
          },
        },
      },
      beforeTown: {
        entry: [{ type: "addToLog", payload: "idle" }, "setInitialStats"],
        on: {
          "": "town",
        },
      },

      town: {
        entry: [{ type: "addToLog", payload: "town" }, "removeAllBonuses"],
        initial: "outskirts",
        on: {
          VISIT_HEALER: ".healer",
          VISIT_BLACKSMITH: ".blacksmith",
          LEAVE: "nextEnemy",
        },

        states: {
          outskirts: {},
          healer: {
            on: {
              HEAL: {
                target: "healer",
                actions: "heal",
              },
              SELL_ITEM: {
                target: "healer",
                actions: "sellItem",
              },
              BUY_ITEM: {
                target: "healer",
                actions: "buyItem",
              },
            },
          },
          blacksmith: {
            on: {
              SELL_ITEM: {
                target: "",
                actions: "sellItem",
              },
              BUY_ITEM: {
                target: "",
                actions: "buyItem",
              },
            },
          },
        },
      },
      combat: {
        initial: "waiting",
        entry: [{ type: "addToLog", payload: "combat" }, "switchPlayer"],
        on: {
          ATTACK: ".attacking",
          PARRY: ".parrying",
          SWITCH_WEAPON: ".switchWeapon",
          USE_ITEM: [{ target: ".useItem", cond: "hasItems" }],
          LEVEL_UP: "levelUp",
          POST_BATTLE: "postBattle",
          PLAY_AGAIN: "createCharacter",
        },

        states: {
          waiting: {
            entry: { type: "addToLog", payload: "waiting" },
          },
          attacking: {
            entry: [{ type: "addToLog", payload: "attacking" }, "dealDamage"],
            on: {
              "": [
                { target: "nextPlayer", cond: "bothAlive" },
                { target: "playerWon", cond: "AIDied" },
                { target: "playerDied" },
              ],
            },
          },
          parrying: {
            entry: ["applyBonus"],
            on: {
              "": "nextPlayer",
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
          nextPlayer: {
            entry: [
              { type: "addToLog", payload: "nextPlayer" },
              "switchPlayer",
              "removeBonuses",
            ],
            on: {
              "": [
                {
                  target: "attacking",
                  cond: "isAI",
                },
                "waiting",
              ], //TODO: AI can only attack
            },
          },
          playerWon: {
            entry: [{ type: "addToLog", payload: "Player Won" }, "awardXP"],
            on: {
              "": [
                {
                  target: "#levelUp",
                  cond: "checkLevelUp",
                },
                {
                  target: "#postBattle",
                },
              ],
            },
          },

          playerDied: {
            entry: [{ type: "justLogIt", payload: "Player Died" }],
            on: {
              "": {
                actions: ["reset"],
                target: "#gameOver",
              },
            },
          },
        },
      },
      gameOver: {
        id: "gameOver",
        entry: [{ type: "justLogIt", payload: "Game over man!" }],
        on: {
          PLAY_AGAIN: "createCharacter",
        },
      },
      levelUp: {
        id: "levelUp",
        entry: [{ type: "justLogIt", payload: "Player leveled up" }],
        on: {
          NEW_STATS: {
            actions: ["applyNewStats"],
            target: "postBattle",
          },
        },
      },
      postBattle: {
        id: "postBattle",
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
          "": "combat",
        },
      },
    },
  },
  {
    guards,
    actions,
  }
);

export default RPGMachine;
