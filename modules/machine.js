import { Machine, assign } from "xstate";
import { observer } from "./observer";

import monsters from "./monsters";
import { all as weapons, rndWeaponForLevel } from "./weapons";

//TODO: monster does not show , create new monster component
//TODO: healing?
//TODO: store every x levels or pick where to go
//TODO: potions

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
    guards: {
      returnFalse: (context, evt) => {
        return false;
      },
      isAI: (ctx, evt) => {
        return ctx.players[ctx.currentPlayer].AI;
      },
      bothAlive: (ctx, event) => {
        return ctx.players.every((pl) => pl.hitpoints > 0);
      },
      AIDied: (ctx) => {
        const AI = ctx.players.find((pl) => pl.AI);
        return AI.hitpoints < 1;
      },
      checkLevelUp: (context, evt) => {
        return (
          context.players[context.currentPlayer].xp >=
          context.players[context.currentPlayer].level * 1000
        );
      },
    },
    actions: {
      justLogIt: (ctx, evt, { action }) => {
        console.log(action);
        console.log("logging it", ctx, evt);
        observer.publish("LOG", action.payload);
      },
      pickupTreasures: assign({
        players: (ctx) => {
          const players = [...ctx.players];
          observer.publish(
            "LOG",
            `Player picked up a ${players[1].weapons[0].name}`
          );

          players[0].weapons.push(players[1].weapons[0]);
          return players;
        },
      }),
      createNewEnemy: assign({
        players: (ctx) => {
          const players = [...ctx.players];
          players[1] = monsters[Math.floor(Math.random() * monsters.length)]; //TODO: index hardcodet, skulle jeg finde .AI?
          players[1].weapons = [rndWeaponForLevel(players[1].level)];
          players[1].hitpoints = players[1].attributes.con * 2;
          players[1].AI = true;
          observer.publish(
            "LOG",
            `A new enemy appears, a mighty ${players[1].name} (level ${players[1].level})`
          );
          return players;
        },
      }),
      setInitialStats: assign({
        players: (ctx, evt) => {
          const players = [...ctx.players];
          players.forEach((pl) => {
            pl.hitpoints = pl.attributes.con * 2;
          });
          return players;
        },
      }),
      applyNewStats: assign({
        players: (ctx, evt) => {
          const players = [...ctx.players];
          players[ctx.currentPlayer].attributes.str = evt.stats.str;
          players[ctx.currentPlayer].attributes.dex = evt.stats.dex;
          players[ctx.currentPlayer].attributes.con = evt.stats.con;
          players[ctx.currentPlayer].level++;
          players[ctx.currentPlayer].xp = 0; //TODO: der kunne være leftover xp
          players[ctx.currentPlayer].hitpoints =
            players[ctx.currentPlayer].attributes.con * 2;
          return players;
        },
      }),
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
          const currentPlayer = players[context.currentPlayer];
          const hitChance =
            75 +
            currentPlayer.attributes.dex -
            players[nextPlayer].attributes.dex;
          const roll = Math.random() * 100;
          if (roll <= hitChance) {
            const minDamage =
              players[context.currentPlayer].weapons[0].damageMin;
            const maxDamage =
              players[context.currentPlayer].weapons[0].damageMax;
            let damage = Math.floor(
              Math.random() * (maxDamage - minDamage + 1) + minDamage
            );
            const modifier = Math.floor(
              (players[context.currentPlayer].attributes.str - 10) / 2
            );
            damage += modifier;
            if (damage < 1) {
              damage = 1;
            }
            players[nextPlayer].hitpoints -= damage;
            observer.publish(
              "LOG",
              `${players[context.currentPlayer].name} hit ${
                players[nextPlayer].name
              } for ${damage} damage`
            );
          } else {
            observer.publish(
              "LOG",
              `${players[context.currentPlayer].name} missed ${
                players[nextPlayer].name
              }`
            );
          }
          return players;
        },
      }),
      switchPlayer: assign({
        currentPlayer: (context, event) => {
          return getNextPlayer(context);
        },
      }),
      awardXP: assign({
        //TODO: xp kunne være summen af opponents stats?
        players: (ctx, evt) => {
          const players = [...ctx.players];
          players[ctx.currentPlayer].xp += 1000;
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
