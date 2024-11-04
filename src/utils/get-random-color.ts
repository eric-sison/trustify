import { DEFAULT_COLORS } from "./constants";

export function getRandomColor() {
  const randomIndex = Math.floor(Math.random() * DEFAULT_COLORS.length);
  return DEFAULT_COLORS[randomIndex];
}
