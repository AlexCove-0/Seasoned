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
