import { Machine, assign } from "xstate";

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
          level: 1,
          attributes: {
            str: 10,
            dex: 10,
            con: 10,
          },
          weapons: [
            {
              name: "Knife",
              damageMin: 1,
              damageMax: 4,
            },
            {
              name: "Sword",
              damageMin: 1,
              damageMax: 8,
            },
          ],
        },
        {
          name: "B",
          hitpoints: 10,
          xp: 0,
          level: 1,
          attributes: {
            str: 10,
            dex: 10,
            con: 10,
          },
          weapons: [
            {
              name: "Knife",
              damageMin: 1,
              damageMax: 4,
            },
          ],
        },
      ],
    },
    states: {
      idle: {
        on: {
          TURN_START: "nextPlayer",
        },
      },
      nextPlayer: {
        entry: ["switchPlayer"],
        on: {
          "": "waiting",
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
              cond: "opponentAlive",
            },
            {
              target: "playerWon",
              cond: "opponentDead",
            },
          ],
        },
      },
      parrying: {
        on: {
          "": "nextPlayer",
        },
      },
      playerWon: {
        entry: ["awardXP"],
        on: {
          "": [
            { target: "levelUp", cond: "checkLevelUp" },
            { target: "nextEnemy", cond: "returnFalse" },
          ],
        },
      },
      levelUp: {
        entry: ["justLogIt"],
      },
      nextEnemy: {},
    },
  },
  {
    guards: {
      returnFalse: (context, evt) => {
        return false;
      },
      opponentAlive: (context, event) => {
        const nextPlayer = getNextPlayer(context);
        //console.log("opponent alive", context.players[nextPlayer].hitpoints);
        return context.players[nextPlayer].hitpoints > 0;
      },
      opponentDead: (context) => {
        const nextPlayer = getNextPlayer(context);
        //console.log("opponent dead", context.players[nextPlayer].hitpoints); //TODO: ville gerne bruge !opponentAlive
        return context.players[nextPlayer].hitpoints < 1;
      },
      checkLevelUp: (context, evt) => {
        return (
          context.players[context.currentPlayer].xp >=
          context.players[context.currentPlayer].level * 1000
        );
      },
    },
    actions: {
      justLogIt: () => console.log("logging it"),
      switchWeapon: assign({
        players: (ctx, evt) => {
          //evt.index
          const players = [...ctx.players];
          const oldWeapon = players[ctx.currentPlayer].weapons[0];
          const newWeapon = players[ctx.currentPlayer].weapons[evt.index];
          players[ctx.currentPlayer].weapons[evt.index] = oldWeapon;
          players[ctx.currentPlayer].weapons[0] = newWeapon;
          return players;
        },
      }),
      dealDamage: assign({
        players: (context, event) => {
          const players = [...context.players];
          let nextPlayer = getNextPlayer(context);
          const minDamage = players[context.currentPlayer].weapons[0].damageMin;
          const maxDamage = players[context.currentPlayer].weapons[0].damageMax;
          players[nextPlayer].hitpoints -= Math.floor(
            Math.random() * (maxDamage - minDamage + 1) + minDamage
          );
          return players;
        },
      }),
      switchPlayer: assign({
        currentPlayer: (context, event) => {
          return getNextPlayer(context);
        },
      }),
      awardXP: assign({
        players: (ctx, evt) => {
          const players = [...ctx.players];
          players[ctx.currentPlayer].xp += 1001;
          return players;
        },
      }),
    },
  }
);

function getNextPlayer(ctx) {
  let nextPlayer = ctx.currentPlayer + 1;
  if (nextPlayer === ctx.players.length) {
    return 0;
  }
  return nextPlayer;
}
export default RPGMachine;
