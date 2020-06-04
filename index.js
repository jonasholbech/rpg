import { Machine, interpret } from "xstate";
//import is from "is_js";
import RPGMachine from "./modules/machine";

import Player from "./components/Player";
import InterpreterComponent from "./components/InterpreterComponent";

const extendedMachine = RPGMachine.withConfig({
  /*actions: {
    UIclearForm: clearForm(),
    UIonChange: (ctx, evt) => {
      console.log("my change", ctx, evt);
    },
  },*/
});

const service = interpret(extendedMachine).onTransition((state) => {
  console.groupCollapsed("logger");
  console.log(state.value);
  console.log(state.context);
  console.log(state);
  console.groupEnd();
  render(state);
});

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
    document.querySelectorAll("rpg-player").forEach((player, index) => {
      player.service = service;
    });
    service.start();
  }, 1); //RAF instead? the service starts before the elements are registered
}
firstPaint(extendedMachine.context);

function render(state) {
  document.querySelector("rpg-interpreter").nextEvents = state.nextEvents;
  //document.querySelector("rpg-player").str = Date.now();
  document.querySelectorAll("rpg-player").forEach((player, index) => {
    player.nextEvents = state.nextEvents;

    player.hitpoints = state.context.players[index].hitpoints;
    player.xp = state.context.players[index].xp;
    if (index === state.context.currentPlayer) {
      player.active = true;
    } else {
      player.active = false;
    }
  });
}

//window.addEventListener("load", () => firstPaint(extendedMachine.context));
