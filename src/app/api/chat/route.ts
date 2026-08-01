import { NextResponse } from "next/server";
import { anthropic, CHEF_MODEL } from "@/lib/ai/client";
import { CHEF_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { PROPOSE_RECIPE_TOOL, type RecipeDraft } from "@/lib/ai/tools";
import { getCurrentHousehold } from "@/lib/household";
import { createClient } from "@/lib/supabase/server";
import type { FlavorAxes } from "@/lib/flavor/axes";
import { buildDinerContext } from "@/lib/ai/diner-context";

type ChatMessage = { role: "user" | "assistant"; content: string };
type ChatRequestBody = {
  messages?: ChatMessage[];
  dinerIds?: string[];
  servings?: number;
  regionalTwist?: string[];
  ingredientsOnHand?: string[];
};

export async function POST(request: Request) {
  const household = await getCurrentHousehold();
  if (!household) {
    return NextResponse.json({ error: "Not signed in to a household." }, { status: 401 });
  }

  const body = (await request.json()) as ChatRequestBody;
  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages is required." }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: householdRow } = await supabase
    .from("households")
    .select("appliances, pantry_staples")
    .eq("id", household.id)
    .single<{ appliances: string[]; pantry_staples: string[] }>();

  let diners: {
    display_name: string;
    taste_preferences: string[];
    disliked_tastes: string[];
    allergies: string[];
    flavor_axes: FlavorAxes | null;
    texture_flags: string[] | null;
    is_picky_eater: boolean | null;
    safe_foods: string[] | null;
    avoid_textures: string[] | null;
    structure_rules: string[] | null;
  }[] = [];

  if (Array.isArray(body.dinerIds) && body.dinerIds.length > 0) {
    const { data } = await supabase
      .from("household_members")
      .select("display_name, taste_preferences, disliked_tastes, allergies, flavor_axes, texture_flags, is_picky_eater, safe_foods, avoid_textures, structure_rules")
      .eq("household_id", household.id)
      .in("id", body.dinerIds)
      .returns<
        { display_name: string; taste_preferences: string[]; disliked_tastes: string[]; allergies: string[]; flavor_axes: FlavorAxes | null; texture_flags: string[] | null; is_picky_eater: boolean | null; safe_foods: string[] | null; avoid_textures: string[] | null; structure_rules: string[] | null }[]
      >();
    diners = data ?? [];
  }

  const dinerContext = buildDinerContext({
    diners,
    servings: typeof body.servings === "number" ? body.servings : null,
    regionalTwist: Array.isArray(body.regionalTwist) ? body.regionalTwist : [],
    ingredientsOnHand: Array.isArray(body.ingredientsOnHand) ? body.ingredientsOnHand : [],
    appliances: householdRow?.appliances ?? [],
    pantryStaples: householdRow?.pantry_staples ?? [],
  });
  const system = dinerContext ? `${CHEF_SYSTEM_PROMPT}\n\n${dinerContext}` : CHEF_SYSTEM_PROMPT;

  const response = await anthropic.messages.create({
    model: CHEF_MODEL,
    // A full recipe is a long tool payload (technique notes on every step)
    // on top of the prose reply; 4096 was getting cut mid-tool-call, which
    // surfaced as recipes with no steps.
    max_tokens: 8192,
    system,
    tools: [PROPOSE_RECIPE_TOOL],
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  let reply = "";
  let recipe: RecipeDraft | null = null;

  for (const block of response.content) {
    if (block.type === "text") {
      reply += block.text;
    } else if (block.type === "tool_use" && block.name === "propose_recipe") {
      recipe = block.input as RecipeDraft;
    }
  }

  // A truncated tool call parses fine but is missing pieces -- never hand
  // the UI a recipe it could save half-formed.
  const complete = recipe !== null && Array.isArray(recipe.steps) && recipe.steps.length > 0;
  return NextResponse.json({
    reply:
      reply ||
      (recipe && !complete ? "That recipe came through incomplete — ask me to try again." : ""),
    recipe: complete ? recipe : null,
  });
}
