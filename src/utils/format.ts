export const number = (n: number, digits = 0) =>
  n.toLocaleString("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

export const litres = (ml: number) => number(ml / 1000, 1);
