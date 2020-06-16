export function rndBetween(min, max) {
  return Math.floor(
    Math.random() * (Number(max) - Number(min) + 1) + Number(min)
  );
}
export function getAttributeWithBonuses(player, attr) {
  const relevant = player.bonuses.filter((bonus) => bonus.attr === attr);
  const bonuses = relevant.reduce((a, b) => ({ change: a.change + b.change }), {
    change: 0,
  });
  return bonuses.change + player.attributes[attr];
}
export function getAttributeBonuses(player, attr) {
  const relevant = player.bonuses.filter((bonus) => bonus.attr === attr);
  const bonuses = relevant.reduce((a, b) => ({ change: a.change + b.change }), {
    change: 0,
  });
  return bonuses.change;
}
export function inBounds(value, min, max) {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}
