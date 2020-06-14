const guards = {
  returnFalse: (context, evt) => {
    return false;
  },
  isAI: (ctx, evt) => {
    return ctx.players[ctx.currentPlayer].AI;
  },
  hasItems: (ctx, evt) => {
    const usable = ctx.players[ctx.currentPlayer].items.filter(
      (item) => item.usable
    );
    return usable.length > 0;
  },
  bothAlive: (ctx, event) => {
    return ctx.players.every((pl) => pl.hitpoints > 0);
  },
  AIDied: (ctx) => {
    const AI = ctx.players.find((pl) => pl.AI);
    return AI.hitpoints < 1;
  },
  checkLevelUp: (context, evt) => {
    console.log("checklevel up");
    return (
      context.players[context.currentPlayer].xp >=
      context.players[context.currentPlayer].level * 1000
    );
  },
};
export default guards;
