import { assign } from "xstate";
import { setupMonster } from "../entities/monsters";
import initialContext from "./initialContext";
import { rndBetween, getAttributeWithBonuses } from "../utils";
import { observer } from "../observer";
import { all as weapons } from "../entities/weapons";
export const actions = {
  awardXP: assign({
    //TODO: xp kunne være summen af opponents stats?
    players: (ctx, evt) => {
      const players = [...ctx.players];
      players[ctx.currentPlayer].xp += 100;
      return players;
    },
  }),
  reset: assign({
    players: (ctx) => {
      //using initialContext messses stuff up (xp and stuff is kept)
      const players = [
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
      ];
      return players;
    },
    currentPlayer: (ctx) => {
      return initialContext.currentPlayer;
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
        75 +
        getAttributeWithBonuses(currentPlayer, "dex") -
        getAttributeWithBonuses(players[nextPlayer], "dex");
      const roll = Math.random() * 100;
      if (roll <= hitChance) {
        const minDamage = players[context.currentPlayer].weapons[0].damageMin;
        const maxDamage = players[context.currentPlayer].weapons[0].damageMax;
        let damage = rndBetween(minDamage, maxDamage);
        const modifier = Math.floor(
          (getAttributeWithBonuses(players[context.currentPlayer], "str") -
            10) /
            2
        );
        damage += modifier;
        if (damage < minDamage) {
          damage = minDamage;
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
        getAttributeWithBonuses(players[ctx.currentPlayer], "con") * 2; //TODO: når con potion ophører skal hp ned til ny max
      return players;
    },
  }),
  setInitialStats: assign({
    players: (ctx, evt) => {
      const players = [...ctx.players];
      players.forEach((pl) => {
        pl.hitpoints = getAttributeWithBonuses(pl, "con") * 2;
      });
      return players;
    },
  }),
  heal: assign({
    players: (ctx, evt) => {
      const players = [...ctx.players];
      console.log(evt);
      players[0].hitpoints = getAttributeWithBonuses(players[0], "con") * 2;
      players[0].gold -= evt.price;
      return players;
    },
  }),
  createNewEnemy: assign({
    players: (ctx) => {
      const players = [...ctx.players];
      players[1] = setupMonster(); //TODO: index hardcodet, should it be?
      observer.publish(
        "LOG",
        `A new enemy appears, a mighty ${players[1].name} (level ${players[1].level})`
      );
      return players;
    },
    currentPlayer: (ctx) => {
      return -1;
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
  removeBonuses: assign({
    players: (ctx, evt) => {
      const players = [...ctx.players];
      const bonuses = players[ctx.currentPlayer].bonuses;
      const modifiedBonuses = bonuses.map((b) => {
        b.duration--;
        return b;
      });
      players[ctx.currentPlayer].bonuses = modifiedBonuses.filter(
        (b) => b.duration > 0
      );
      return players;
    },
  }),
  dropItem: assign({
    players: (ctx, evt) => {
      const players = [...ctx.players];
      players[0].items.splice(Number(evt.index), 1);
      return players;
    },
  }),
  pickUpItem: assign({
    players: (ctx, evt) => {
      const players = [...ctx.players];
      const index = Number(evt.index);
      observer.publish(
        "LOG",
        `Player picked up a ${players[1].items[index].name}`
      );

      switch (players[1].items[index].name) {
        case "Gold":
          const [min, max] = players[1].items[index].amount.split("-");
          const gold = rndBetween(min, max);
          players[0].gold += gold;
          break;
        default:
          players[0].items.push(players[1].items[index]);
      }

      players[1].items.splice(index, 1);
      return players;
    },
  }),
  useItem: assign({
    players: (ctx, evt) => {
      //guard should make sure it's usable
      const players = [...ctx.players];
      const player = players[ctx.currentPlayer];
      const index = Number(evt.index);
      const item = player.items[index];

      switch (item.actionPayload.type) {
        case "ATTR_CHANGE":
          if (item.actionPayload.duration === "permanent") {
            switch (item.actionPayload.attr) {
              case "hitpoints":
                const [min, max] = item.actionPayload.change.split("-");
                player.hitpoints += rndBetween(min, max);
                if (
                  player.hitpoints >
                  getAttributeWithBonuses(player, "con") * 2
                ) {
                  player.hitpoints = getAttributeWithBonuses(player, "con") * 2;
                }
                break;
              default:
                player.attributes[item.actionPayload.attr] += Number(
                  item.actionPayload.change
                );
            }
          } else {
            player.bonuses.push(item.actionPayload);
            //temporary boost
          }
          break;
        /*
          { attribute: "str", amount: 20, duration: 1 },
            { attribute: "dex", amount: 20, duration: 10 },
          */
      }
      /*
    actionPayload: {
      type: "ATTR_CHANGE",
      duration: "permanent",
      attr: "hitpoints",
      change: "1-8",
    },
        */
      player.items.splice(index, 1);
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
