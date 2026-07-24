type Diner = {
  display_name: string;
  taste_preferences: string[];
  disliked_tastes: string[];
  allergies: string[];
};

type SessionContext = {
  diners: Diner[];
  servings: number | null;
  regionalTwist: string[];
  ingredientsOnHand: string[];
  appliances: string[];
};

/**
 * Turns this cooking session's explicit setup (who, how many, tonight's
 * regional twist, what's on hand) plus each diner's standing taste/allergy
 * profile into system-prompt context.
 *
 * Deliberately does NOT auto-apply anyone's stored regional taste or a
 * household default cuisine -- that used to mean e.g. every recipe leaned
 * Ecuadorian just because one person's profile had it set, even on nights
 * nobody wanted that. Regional style is opt-in per session via
 * `regionalTwist`, chosen explicitly at the start of each recipe instead.
 */
export function buildDinerContext({
  diners,
  servings,
  regionalTwist,
  ingredientsOnHand,
  appliances,
}: SessionContext): string {
  const lines: string[] = [];

  if (servings) lines.push(`Cooking for ${servings} serving(s).`);

  if (regionalTwist.length > 0) {
    lines.push(`Tonight's regional twist: ${regionalTwist.join(", ")}.`);
  } else {
    lines.push("No particular regional twist requested tonight -- don't default to any one cuisine.");
  }

  if (ingredientsOnHand.length > 0) {
    lines.push(`Ingredients already on hand: ${ingredientsOnHand.join(", ")}.`);
  }

  if (appliances.length > 0) {
    lines.push(`Appliances available in this kitchen: ${appliances.join(", ")}.`);
  }

  if (diners.length > 0) {
    lines.push("Who you're cooking for this time:");
    for (const d of diners) {
      const parts: string[] = [];
      if (d.taste_preferences.length > 0) parts.push(`likes ${d.taste_preferences.join(", ")}`);
      if (d.disliked_tastes.length > 0) parts.push(`dislikes ${d.disliked_tastes.join(", ")}`);
      if (d.allergies.length > 0) parts.push(`ALLERGIC TO: ${d.allergies.join(", ")}`);
      lines.push(`- ${d.display_name}${parts.length > 0 ? ` — ${parts.join("; ")}` : " — no preferences set"}`);
    }
    const allAllergies = [...new Set(diners.flatMap((d) => d.allergies))];
    if (allAllergies.length > 0) {
      lines.push(
        `Hard constraint: the recipe must not contain ${allAllergies.join(", ")}, and any substitution must avoid them too.`,
      );
    }
  }

  if (lines.length === 0) return "";
  return `--- Tonight's setup ---\n${lines.join("\n")}`;
}
