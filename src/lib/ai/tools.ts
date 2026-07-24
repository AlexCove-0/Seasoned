import type Anthropic from "@anthropic-ai/sdk";

export type RecipeDraft = {
  title: string;
  base_servings: number;
  ingredients: { name: string; quantity: number | null; unit: string | null }[];
  steps: { instruction: string; technique_note: string | null }[];
};

export const PROPOSE_RECIPE_TOOL: Anthropic.Tool = {
  name: "propose_recipe",
  description:
    "Submit the complete, structured recipe once you have enough detail to give the cook a full plan.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      base_servings: {
        type: "integer",
        description: "How many people this recipe as written serves.",
      },
      ingredients: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            quantity: { type: ["number", "null"] },
            unit: {
              type: ["string", "null"],
              description: "e.g. 'cup', 'tbsp', 'each', 'lb'. Null if not applicable.",
            },
          },
          required: ["name", "quantity", "unit"],
        },
      },
      steps: {
        type: "array",
        items: {
          type: "object",
          properties: {
            instruction: { type: "string" },
            technique_note: {
              type: ["string", "null"],
              description:
                "The chef-instructor detail behind this step: timing, temperature, sensory cues, why it matters, or a pitfall to avoid.",
            },
          },
          required: ["instruction", "technique_note"],
        },
      },
    },
    required: ["title", "base_servings", "ingredients", "steps"],
  },
};

export const SUGGEST_EXTRA_INGREDIENTS_TOOL: Anthropic.Tool = {
  name: "suggest_extra_ingredients",
  description:
    "Suggest a short list of additional ingredients (not already on hand) that would open up good recipe directions.",
  input_schema: {
    type: "object",
    properties: {
      extra_ingredients: {
        type: "array",
        items: { type: "string" },
        description:
          "5-8 common, easy-to-have ingredients -- not already on hand -- that would meaningfully expand what's possible to cook.",
      },
    },
    required: ["extra_ingredients"],
  },
};

export type RecipeOption = { title: string; pitch: string; style: string | null };

export const SUGGEST_RECIPE_OPTIONS_TOOL: Anthropic.Tool = {
  name: "suggest_recipe_options",
  description: "Propose exactly 3 distinct recipe directions given the ingredients and context.",
  input_schema: {
    type: "object",
    properties: {
      options: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            pitch: {
              type: "string",
              description: "1-2 sentences selling why this direction is a good pick right now.",
            },
            style: {
              type: ["string", "null"],
              description:
                "Short cuisine/style tag, e.g. 'Mexican-inspired', 'Classic comfort'. Null if none fits.",
            },
          },
          required: ["title", "pitch", "style"],
        },
        minItems: 3,
        maxItems: 3,
      },
    },
    required: ["options"],
  },
};
