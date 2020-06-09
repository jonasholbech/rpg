import { Machine, interpret } from "xstate";
//import is from "is_js";
import RPGMachine from "./modules/machine";

import { observer } from "./modules/observer";
import Player from "./components/Player";
import InterpreterComponent from "./components/InterpreterComponent";
import LevelUp from "./components/LevelUp";
import Logger from "./components/Logger";
import PostBattle from "./components/PostBattle";
import Monster from "./components/Monster";
import Town from "./components/Town";

const extendedMachine = RPGMachine.withConfig({});

const service = interpret(extendedMachine, { devTools: true }).onTransition(
  (state) => {
    console.log(state.value);
    console.groupCollapsed("logger");

    console.log(state.context);
    console.table(state.context.players[0].bonuses);
    console.log(state);
    console.groupEnd();
    observer.publish("MONSTER_CONTEXT", state.context.players[1]);
    render(state);
  }
);

window.service = service;

function firstPaint(initialContext) {
  console.log("First Paint", initialContext);
  let player = initialContext.players[0];

  const p = document.createElement("rpg-player");
  p.setAttribute("name", player.name);
  p.setAttribute("index", 0);
  p.setAttribute("hitpoints", player.hitpoints);
  p.xp = player.xp;
  p.str = player.attributes.str;
  p.setAttribute("con", player.attributes.con);
  p.setAttribute("dex", player.attributes.dex);
  p.weapons = player.weapons;
  p.items = player.items;
  document.querySelector("#players").appendChild(p);

  const monster = document.createElement("rpg-monster");
  document.querySelector("#players").appendChild(monster);

  setTimeout(() => {
    document.querySelector("rpg-interpreter").service = service;
    document.querySelector("rpg-interpreter").state = {}; //TODO: initialstate
    const player = document.querySelector("rpg-player");
    player.service = service;
    service.start();
  }, 1); //RAF instead? the service starts before the elements are registered
}
firstPaint(extendedMachine.context);

function render(state) {
  document.querySelector("rpg-interpreter").nextEvents = state.nextEvents;
  document.querySelector("rpg-interpreter").state = state;
  const player = document.querySelector("rpg-player");
  const index = 0;
  player.nextEvents = state.nextEvents;
  player.state = state.context.players[index];
  player.hitpoints = state.context.players[index].hitpoints;
  player.xp = state.context.players[index].xp;
  player.str = state.context.players[index].attributes.str;
  player.dex = state.context.players[index].attributes.dex;
  player.con = state.context.players[index].attributes.con;
  player.level = state.context.players[index].level;
  player.weapons = state.context.players[index].weapons;
  player.items = state.context.players[index].items;
  if (index === state.context.currentPlayer) {
    player.active = true;
  } else {
    player.active = false;
  }

  switch (state.value) {
    case "levelUp":
      openLevelUpScreen(state);
      break;
    case "postBattle":
      openPostBattleScreen(state);
      break;
  }
  if (state.matches("town")) {
    openTownScreen(state);
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

function openTownScreen(state) {
  //singleton
  if (!document.querySelector("rpg-town")) {
    const townComp = document.createElement("rpg-town");
    townComp.state = state;
    townComp.send = service.send;
    document.body.appendChild(townComp);
  } else {
    document.querySelector("rpg-town").state = state;
  }
}
