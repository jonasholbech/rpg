import { assign } from "xstate";
import { setupMonster } from "../entities/monsters";
import initialContext from "./initialContext";
import { rndBetween, getAttributeWithBonuses } from "../utils";
import { getRndItems } from "../entities/items";
import { observer } from "../observer";
import { all as weapons } from "../entities/weapons";

const log = [];
window.log = log;
export const actions = {
  awardXP: assign({
    //TODO: xp kunne være summen af opponents stats?
    players: (ctx, evt) => {
      const players = [...ctx.players];
      console.log("awardxp");
      players[ctx.currentPlayer].xp += 1000;
      return players;
    },
  }),
  reset: assign({
    players: (ctx) => {
      console.log("reset");
      players = JSON.parse(JSON.stringify(initialContext.players));
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
  setInitialAttributes: assign({
    players: (ctx, evt) => {
      const players = [...ctx.players];
      players[0].attributes.str = evt.stats.str;
      players[0].attributes.dex = evt.stats.dex;
      players[0].attributes.con = evt.stats.con;
      players[0].name = evt.name;
      players[0].pointsToDistribute =
        players[0].pointsToDistribute -
        evt.stats.str -
        evt.stats.dex -
        evt.stats.con;
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
      players[1] = setupMonster(players[0].level);
      observer.publish(
        "LOG",
        `A new enemy appears, a ${players[1].name} (level ${players[1].level})`
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
      players[0].weapons = players[0].weapons.filter(
        (weapon) => weapon.id !== evt.id
      );
      return players;
    },
  }),
  pickUpWeapon: assign({
    players: (ctx, evt) => {
      const players = [...ctx.players];

      const id = evt.id;
      const weaponIndex = players[1].weapons.findIndex(
        (item) => item.id === id
      );

      observer.publish(
        "LOG",
        `Player picked up a ${players[1].weapons[weaponIndex].name}`
      );

      players[0].weapons.push(players[1].weapons[weaponIndex]);
      players[1].weapons.splice(weaponIndex, 1);
      return players;
    },
  }),
  removeBonuses: assign({
    players: (ctx, evt) => {
      const players = [...ctx.players];
      const bonuses = players[ctx.currentPlayer].bonuses;
      console.log("remove bonuses");
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
  removeAllBonuses: assign({
    players: (ctx, evt) => {
      const players = [...ctx.players];
      players.forEach((pl) => {
        pl.bonuses = [];
      });
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
      const id = evt.id;
      const itemIndex = players[1].items.findIndex((item) => item.id === id);
      //TODO: hertil ikke testet, leder efter index og bruger id i stedet
      observer.publish(
        "LOG",
        `Player picked up a ${players[1].items[itemIndex].name}`
      );
      switch (players[1].items[itemIndex].name) {
        case "Gold":
          const [min, max] = players[1].items[itemIndex].amount.split("-");
          const gold = rndBetween(min, max);
          players[0].gold += gold;
          break;
        default:
          players[0].items.push(players[1].items[itemIndex]);
      }

      players[1].items.splice(itemIndex, 1);
      return players;
    },
  }),
  useItem: assign({
    players: (ctx, evt) => {
      //guard should make sure it's usable

      const players = [...ctx.players];
      const player = players[ctx.currentPlayer];
      const id = evt.id;
      const item = player.items.find((item) => item.id === id);

      observer.publish("LOG", `Player used a ${item.name}`);
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
      player.items = player.items.filter((oneItem) => oneItem.id !== id);
      return players;
    },
  }),
  applyBonus: assign({
    players: (ctx, evt) => {
      const players = [...ctx.players];
      const bonuses = evt.bonuses;
      bonuses.forEach((bonus) => {
        players[bonus.playerIndex].bonuses.push(bonus);
      });

      console.log(evt);
      return players;
    },
  }),
  sellItem: assign({
    players: (ctx, evt) => {
      const players = [...ctx.players];
      //TODO: add sold item to merchant
      /*
      evt=> type: "SELL_ITEM", id: "item-kb7qodvy", entityType: "items", price: 2 }
      */
      const soldItem = players[0][evt.entityType].find(
        (item) => item.id === evt.id
      );
      observer.publish("LOG", `Player sold a ${soldItem.name}`);
      console.log(evt.entityType, players[0][evt.entityType]);
      players[0][evt.entityType] = players[0][evt.entityType].filter(
        (item) => item.id != evt.id
      );
      players[0].gold += evt.price;
      return players;
    },
  }),
  buyItem: assign({
    players: (ctx, evt) => {
      const players = [...ctx.players];
      /*
      evt=> type: "BUY_ITEM", id: "item-kb7qodvy", entityType: "items", item: {...} }
      */
      observer.publish("LOG", `Player bought a ${evt.item.name}`);
      players[0][evt.entityType].push(evt.item);
      players[0].gold -= evt.item.price;
      return players;
    },
  }),
  justLogIt: (ctx, evt, { action }) => {
    console.log(action);
    console.log("logging it", ctx, evt);
    observer.publish("LOG", action.payload);
  },
  addToLog: (ctx, evt, { action }) => {
    log.push(action.payload);
  },
};
function getNextPlayer(ctx) {
  let nextPlayer = ctx.currentPlayer + 1;
  if (nextPlayer === ctx.players.length) {
    return 0;
  }
  return nextPlayer;
}
