export const randomInt: (lower?: number, upper?: number) => number = (lower = 0, upper = 1) => {
  return lower + Math.floor(Math.random() * (upper - lower + 1));
}