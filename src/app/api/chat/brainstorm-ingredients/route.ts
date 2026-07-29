import { NextResponse } from "next/server";
import { anthropic, CHEF_MODEL } from "@/lib/ai/client";
import { EXTRA_INGREDIENTS_PROMPT } from "@/lib/ai/prompts";
import { SUGGEST_EXTRA_INGREDIENTS_TOOL } from "@/lib/ai/tools";
import { getCurrentHousehold } from "@/lib/household";
import { createClient } from "@/lib/supabase/server";
import { buildDinerContext } from "@/lib/ai/diner-context";

type RequestBody = {
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

  const body = (await request.json()) as RequestBody;
  const supabase = await createClient();

  const { data: householdRow } = await supabase
    .from("households")
    .select("appliances")
    .eq("id", household.id)
    .single<{ appliances: string[] }>();

  let diners: {
    display_name: string;
    taste_preferences: string[];
    disliked_tastes: string[];
    allergies: string[];
    flavor_axes: Record<string, number> | null;
    texture_flags: string[] | null;
  }[] = [];

  if (Array.isArray(body.dinerIds) && body.dinerIds.length > 0) {
    const { data } = await supabase
      .from("household_members")
      .select("display_name, taste_preferences, disliked_tastes, allergies, flavor_axes, texture_flags")
      .eq("household_id", household.id)
      .in("id", body.dinerIds)
      .returns<
        { display_name: string; taste_preferences: string[]; disliked_tastes: string[]; allergies: string[]; flavor_axes: Record<string, number> | null; texture_flags: string[] | null }[]
      >();
    diners = data ?? [];
  }

  const context = buildDinerContext({
    diners,
    servings: typeof body.servings === "number" ? body.servings : null,
    regionalTwist: Array.isArray(body.regionalTwist) ? body.regionalTwist : [],
    ingredientsOnHand: Array.isArray(body.ingredientsOnHand) ? body.ingredientsOnHand : [],
    appliances: householdRow?.appliances ?? [],
  });
  const system = context ? `${EXTRA_INGREDIENTS_PROMPT}\n\n${context}` : EXTRA_INGREDIENTS_PROMPT;

  const response = await anthropic.messages.create({
    model: CHEF_MODEL,
    max_tokens: 1024,
    system,
    tools: [SUGGEST_EXTRA_INGREDIENTS_TOOL],
    tool_choice: { type: "tool", name: "suggest_extra_ingredients" },
    messages: [
      { role: "user", content: "Based on what's on hand, what else might round out a good recipe?" },
    ],
  });

  const toolUse = response.content.find(
    (block) => block.type === "tool_use" && block.name === "suggest_extra_ingredients",
  );
  const extraIngredients =
    toolUse && toolUse.type === "tool_use"
      ? ((toolUse.input as { extra_ingredients: string[] }).extra_ingredients ?? [])
      : [];

  return NextResponse.json({ extraIngredients });
}
