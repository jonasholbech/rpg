import { Machine, interpret } from "xstate";
//import is from "is_js";
import RPGMachine from "./modules/machine";

import Player from "./components/Player";
import InterpreterComponent from "./components/InterpreterComponent";
import LevelUp from "./components/LevelUp";
import Logger from "./components/Logger";
import PostBattle from "./components/PostBattle";

const extendedMachine = RPGMachine.withConfig({
  /*actions: {
    UIclearForm: clearForm(),
    UIonChange: (ctx, evt) => {
      console.log("my change", ctx, evt);
    },
  },*/
});

const service = interpret(extendedMachine, { devTools: true }).onTransition(
  (state) => {
    console.groupCollapsed("logger");
    console.log(state.value);
    console.log(state.context);
    console.log(
      state.context.players[0].weapons[0],
      state.context.players[1].weapons[0]
    );
    console.log(state);
    console.groupEnd();
    render(state);
  }
);

window.service = service;

function firstPaint(initialContext) {
  console.log("First Paint");
  initialContext.players.forEach((player, index) => {
    const p = document.createElement("rpg-player");
    p.setAttribute("name", player.name);
    p.setAttribute("index", index);
    p.setAttribute("hitpoints", player.hitpoints);
    p.xp = player.xp;
    p.str = player.attributes.str;
    p.setAttribute("con", player.attributes.con);
    p.setAttribute("dex", player.attributes.dex);

    p.weapons = player.weapons;
    document.querySelector("#players").appendChild(p);
  });

  setTimeout(() => {
    document.querySelector("rpg-interpreter").service = service;
    document.querySelector("rpg-interpreter").state = {}; //TODO: initialstate
    document.querySelectorAll("rpg-player").forEach((player, index) => {
      player.service = service;
    });
    service.start();
  }, 1); //RAF instead? the service starts before the elements are registered
}
firstPaint(extendedMachine.context);

function render(state) {
  document.querySelector("rpg-interpreter").nextEvents = state.nextEvents;
  document.querySelector("rpg-interpreter").state = state;
  //document.querySelector("rpg-player").str = Date.now();
  document.querySelectorAll("rpg-player").forEach((player, index) => {
    player.nextEvents = state.nextEvents;
    player.state = state.context.players[index];
    player.hitpoints = state.context.players[index].hitpoints;
    player.xp = state.context.players[index].xp;
    player.str = state.context.players[index].attributes.str;
    player.dex = state.context.players[index].attributes.dex;
    player.con = state.context.players[index].attributes.con;
    player.level = state.context.players[index].level;
    if (index === state.context.currentPlayer) {
      player.active = true;
    } else {
      player.active = false;
    }
  });
  switch (state.value) {
    case "levelUp":
      openLevelUpScreen(state);
      break;
    case "postBattle":
      openPostBattleScreen(state);
      break;
  }
}

function openLevelUpScreen(state) {
  const lu = document.createElement("rpg-levelup");
  lu.str = state.context.players[state.context.currentPlayer].attributes.str;
  lu.dex = state.context.players[state.context.currentPlayer].attributes.dex;
  lu.con = state.context.players[state.context.currentPlayer].attributes.con;
  lu.completeCallback = service.send;
  document.body.appendChild(lu);
}
function openPostBattleScreen(state) {
  const pbsComp = document.createElement("rpg-postbattle");
  pbsComp.state = state;
  pbsComp.send = service.send;
  document.body.appendChild(pbsComp);
}
//window.addEventListener("load", () => firstPaint(extendedMachine.context));
