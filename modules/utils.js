export function rndBetween(min, max) {
  return Math.floor(
    Math.random() * (Number(max) - Number(min) + 1) + Number(min)
  );
}
