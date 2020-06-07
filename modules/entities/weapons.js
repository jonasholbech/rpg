export const all = [
  {
    name: "Fork",
    damageMin: 1,
    damageMax: 1,
    minLevel: 1,
  },
  {
    name: "Sharp Fork",
    damageMin: 1,
    damageMax: 2,
    minLevel: 1,
  },
  {
    name: "Knife",
    damageMin: 1,
    damageMax: 4,
    minLevel: 1,
  },
  {
    name: "Short Sword",
    damageMin: 1,
    damageMax: 6,
    minLevel: 1,
  },
  {
    name: "Sword",
    damageMin: 1,
    damageMax: 8,
    minLevel: 1,
  },
  /*{
    name: "Debugger",
    damageMin: 20,
    damageMax: 20,
    minLevel: 20,
  },*/
];
export function rndWeaponForLevel(lvl) {
  const filtered = all.filter((weapon) => weapon.minLevel <= lvl);
  return filtered[Math.floor(Math.random() * filtered.length)];
}
