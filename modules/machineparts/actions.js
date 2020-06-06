import { assign } from "xstate";
import { setupMonster } from "../monsters";

import { observer } from "../observer";
const methods = {
  awardXP: assign({
    //TODO: xp kunne være summen af opponents stats?
    players: (ctx, evt) => {
      const players = [...ctx.players];
      players[ctx.currentPlayer].xp += 100;
      return players;
    },
  }),
  switchPlayer: assign({
    currentPlayer: (context, event) => {
      return getNextPlayer(context);
    },
  }),
  dealDamage: assign({
    players: (context, event) => {
      const players = [...context.players];
      let nextPlayer = getNextPlayer(context);
      const currentPlayer = players[context.currentPlayer];
      const hitChance =
        75 + currentPlayer.attributes.dex - players[nextPlayer].attributes.dex;
      const roll = Math.random() * 100;
      if (roll <= hitChance) {
        const minDamage = players[context.currentPlayer].weapons[0].damageMin;
        const maxDamage = players[context.currentPlayer].weapons[0].damageMax;
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
  switchWeapon: assign({
    players: (ctx, evt) => {
      const players = [...ctx.players];
      const oldWeapon = players[ctx.currentPlayer].weapons[0];
      const newWeapon = players[ctx.currentPlayer].weapons[evt.index];
      players[ctx.currentPlayer].weapons[evt.index] = oldWeapon;
      players[ctx.currentPlayer].weapons[0] = newWeapon;
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
  setInitialStats: assign({
    players: (ctx, evt) => {
      const players = [...ctx.players];
      players.forEach((pl) => {
        pl.hitpoints = pl.attributes.con * 2;
      });
      return players;
    },
  }),
  createNewEnemy: assign({
    players: (ctx) => {
      const players = [...ctx.players];
      players[1] = setupMonster(); //TODO: index hardcodet, should it be?
      console.log(observer);
      observer.publish(
        "LOG",
        `A new enemy appears, a mighty ${players[1].name} (level ${players[1].level})`
      );
      return players;
    },
  }),
  dropWeapon: assign({
    players: (ctx, evt) => {
      const players = [...ctx.players];
      players[0].weapons.splice(Number(evt.index), 1);
      return players;
    },
  }),
  pickUpWeapon: assign({
    players: (ctx, evt) => {
      const players = [...ctx.players];
      console.log(ctx.players[1], evt.index);
      const index = Number(evt.index);
      observer.publish(
        "LOG",
        `Player picked up a ${players[1].weapons[index].name}`
      );

      players[0].weapons.push(players[1].weapons[index]);
      players[1].weapons.splice(index, 1);
      return players;
    },
  }),

  justLogIt: (ctx, evt, { action }) => {
    console.log(action);
    console.log("logging it", ctx, evt);
    observer.publish("LOG", action.payload);
  },
};
function getNextPlayer(ctx) {
  let nextPlayer = ctx.currentPlayer + 1;
  if (nextPlayer === ctx.players.length) {
    return 0;
  }
  return nextPlayer;
}
export const {
  awardXP,
  switchPlayer,
  dealDamage,
  switchWeapon,
  applyNewStats,
  setInitialStats,
  createNewEnemy,
  pickUpWeapon,
  dropWeapon,
  justLogIt,
} = methods;
