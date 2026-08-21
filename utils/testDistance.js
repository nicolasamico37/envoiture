import { calculateDistanceKm } from "./distance";

const distance = calculateDistanceKm(
  47.385361,
  0.645125,
  47.384542,
  0.721786
);

console.log(
  "Distance domicile → gare :",
  distance,
  "km"
);