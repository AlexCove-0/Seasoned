import type { Ingredient } from "@/lib/types";

// Common cooking fractions, checked in order so the closest reasonable one wins.
const FRACTIONS: [number, string][] = [
  [1 / 8, "⅛"],
  [1 / 4, "¼"],
  [1 / 3, "⅓"],
  [1 / 2, "½"],
  [2 / 3, "⅔"],
  [3 / 4, "¾"],
];

/** Formats a scaled quantity the way a recipe card would: "1½", "¾", "2", "3.4". */
export function formatQuantity(value: number): string {
  const whole = Math.floor(value);
  const remainder = value - whole;

  if (remainder < 0.05) return String(whole || 0);

  for (const [frac, symbol] of FRACTIONS) {
    if (Math.abs(remainder - frac) < 0.04) {
      return whole > 0 ? `${whole}${symbol}` : symbol;
    }
  }

  // No clean fraction match -- fall back to one decimal place.
  const rounded = Math.round(value * 10) / 10;
  return String(rounded);
}

export function scaleIngredient(ingredient: Ingredient, multiplier: number): string {
  const parts: string[] = [];
  if (ingredient.quantity != null) parts.push(formatQuantity(ingredient.quantity * multiplier));
  if (ingredient.unit) parts.push(ingredient.unit);
  parts.push(ingredient.name);
  return parts.join(" ");
}
