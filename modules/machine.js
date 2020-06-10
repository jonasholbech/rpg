import { Machine, send, sendParent } from "xstate";
import guards from "./machineparts/guards";
import { actions } from "./machineparts/actions";
import initialContext from "./machineparts/initialContext";
//TODO: tror player skal bruge observer så den er opdateret i baggrunden af diverse overlays
//TODO: more logs
//TODO: filter on logs (type)
//TODO: player classes?
//TODO: auto combat? setinterval=>attack (+ level up?)
//TODO: create character initially, start in town
//TODO: negative bonuses, poison (throwable on opponent, or through weapon (bite))
//TODO: spells & mana, fires on own turn, but does not end it
//Spells are earned or picked up?
//TODO: initially we are in town, but the UI has a monster
const RPGMachine = Machine(
  {
    initial: "createCharacter",
    strict: true,
    id: "rpgmachine",
    context: { ...initialContext },
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
        entry: [
          { type: "addToLog", payload: "idle" },
          "setInitialStats",
          "assignInitialItems",
        ], //, "createNewEnemy"
        on: {
          "": "town",
        },
      },

      town: {
        entry: [{ type: "addToLog", payload: "town" }],
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
            ],
            on: {
              "": [{ target: "attacking", cond: "isAI" }, "waiting"], //TODO: AI can only attack
            },
          },
          playerWon: {
            entry: [
              { type: "addToLog", payload: "Player Won" },
              "awardXP",
              "removeBonuses",
            ],
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
        type: "final",
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
