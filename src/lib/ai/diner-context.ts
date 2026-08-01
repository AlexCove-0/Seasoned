import { describeAxes } from "@/lib/flavor/scoring";
import type { FlavorAxes } from "@/lib/flavor/axes";

type Diner = {
  display_name: string;
  taste_preferences: string[];
  disliked_tastes: string[];
  allergies: string[];
  flavor_axes?: FlavorAxes | null;
  texture_flags?: string[] | null;
  is_picky_eater?: boolean | null;
  safe_foods?: string[] | null;
  avoid_textures?: string[] | null;
  structure_rules?: string[] | null;
};

type SessionContext = {
  diners: Diner[];
  servings: number | null;
  regionalTwist: string[];
  ingredientsOnHand: string[];
  appliances: string[];
  pantryStaples?: string[];
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
  pantryStaples = [],
}: SessionContext): string {
  const lines: string[] = [];

  if (servings) lines.push(`Cooking for ${servings} serving(s).`);

  if (regionalTwist.length > 0) {
    lines.push(`Tonight's regional twist: ${regionalTwist.join(", ")}.`);
  } else {
    lines.push("No particular regional twist requested tonight -- don't default to any one cuisine.");
  }

  if (ingredientsOnHand.length > 0) {
    lines.push(
      `Tonight's ingredients -- what they specifically want to cook with: ${ingredientsOnHand.join(", ")}.`,
    );
  }

  // Staples are assumed present, so the chef can call for them freely without
  // treating them as a constraint the way tonight's ingredients are.
  if (pantryStaples.length > 0) {
    lines.push(
      `Always stocked in this kitchen, use freely without asking: ${pantryStaples.join(", ")}.`,
    );
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

      // Flavor-quiz axes give calibrated intensity, which is far more useful
      // than tags: they say HOW MUCH acid or richness to reach for, rather
      // than merely that someone "likes tangy".
      for (const phrase of describeAxes(d.flavor_axes ?? null)) {
        lines.push(`    · ${phrase}`);
      }
      if (d.texture_flags && d.texture_flags.length > 0) {
        lines.push(`    · texture notes: ${d.texture_flags.join(", ")}`);
      }

      // Selective eaters: structure and texture usually decide whether a
      // plate gets eaten at all, so these read as constraints on how the
      // food is served, not as flavor preferences to balance.
      if (d.is_picky_eater) {
        lines.push(`    · SELECTIVE EATER — keep their portion simple and separable.`);
        if (d.safe_foods && d.safe_foods.length > 0) {
          lines.push(`    · always-safe foods: ${d.safe_foods.join(", ")}`);
        }
        if (d.avoid_textures && d.avoid_textures.length > 0) {
          lines.push(`    · textures to avoid: ${d.avoid_textures.join(", ")}`);
        }
        if (d.structure_rules && d.structure_rules.length > 0) {
          lines.push(`    · how food must be served: ${d.structure_rules.join(", ")}`);
        }
      }
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
