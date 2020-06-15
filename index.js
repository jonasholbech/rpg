import { Machine, interpret } from "xstate";
//import is from "is_js";
import RPGMachine from "./modules/machine";

import { observer } from "./modules/observer";
import CharacterBuilder from "./components/CharacterBuilder";
import Player from "./components/Player";
import InterpreterComponent from "./components/InterpreterComponent";
import LevelUp from "./components/LevelUp";
import Logger from "./components/Logger";
import PostBattle from "./components/PostBattle";
import Monster from "./components/Monster";
import Town from "./components/Town";
import Merchant from "./components/Merchant";
import GameOver from "./components/GameOver";
import BonusCounter from "./components/BonusCounter";
const extendedMachine = RPGMachine.withConfig({});

const service = interpret(extendedMachine, { devTools: true }).onTransition(
  (state) => {
    console.groupCollapsed("logger");
    console.log(state.value);

    console.log(state);
    console.groupEnd();
    document.querySelector("rpg-interpreter").nextEvents = state.nextEvents;
    document.querySelector("rpg-interpreter").state = state;
    document.querySelector("rpg-interpreter").service = service;
    render(state);
  }
);

window.service = service;
service.start();

function render(state) {
  if (state.matches("createCharacter")) {
    createCharacter(state);
  }
  if (state.matches("town")) {
    openTownScreen(state);
  }
  if (state.matches("combat")) {
    setupCombat(state);
  }
  if (state.matches("postBattle")) {
    //document.querySelector("rpg-player").remove();
    //document.querySelector("rpg-monster").remove();
    openPostBattleScreen(state);
  }
  if (state.matches("levelUp")) {
    openLevelUpScreen(state);
  }
  if (state.matches("gameOver")) {
    openGameOverScreen(state);
  }
}
function createCharacter(state) {
  const builder = document.createElement("rpg-character-builder");
  builder.classList.add("overlay");
  document.querySelector("main").appendChild(builder);
  builder.state = state;
  builder.send = service.send;
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

function setupCombat(state) {
  if (!document.querySelector("rpg-player")) {
    const p = document.createElement("rpg-player");
    p.state = state.context.players[0];
    p.send = service.send;
    p.active = state.context.currentPlayer === 0 ? true : false;
    p.nextEvents = state.nextEvents;
    document.querySelector("#players").appendChild(p);

    const monster = document.createElement("rpg-monster");
    document.querySelector("#players").appendChild(monster);
    observer.publish("MONSTER_CONTEXT", state.context.players[1]);
  } else {
    const p = document.querySelector("rpg-player");
    p.state = state.context.players[0];
    p.active = state.context.currentPlayer === 0 ? true : false;
    p.nextEvents = state.nextEvents;
    observer.publish("MONSTER_CONTEXT", state.context.players[1]);
  }
}
function openPostBattleScreen(state) {
  const pbsComp = document.createElement("rpg-postbattle");
  pbsComp.state = state;
  pbsComp.send = service.send;
  document.body.appendChild(pbsComp);
}
function openLevelUpScreen(state) {
  const lu = document.createElement("rpg-levelup");
  lu.str = state.context.players[state.context.currentPlayer].attributes.str;
  lu.dex = state.context.players[state.context.currentPlayer].attributes.dex;
  lu.con = state.context.players[state.context.currentPlayer].attributes.con;
  lu.completeCallback = service.send;
  document.body.appendChild(lu);
}
function openGameOverScreen(state) {
  const go = document.createElement("rpg-gameover");
  go.classList.add("overlay");
  document.body.appendChild(go);
  go.state = state;
  go.send = service.send;
}
/*

/

function render(state) {
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





*/
