import { NextResponse } from "next/server";
import { anthropic, CHEF_MODEL } from "@/lib/ai/client";
import { RECIPE_OPTIONS_PROMPT } from "@/lib/ai/prompts";
import { SUGGEST_RECIPE_OPTIONS_TOOL, type RecipeOption } from "@/lib/ai/tools";
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
  }[] = [];

  if (Array.isArray(body.dinerIds) && body.dinerIds.length > 0) {
    const { data } = await supabase
      .from("household_members")
      .select("display_name, taste_preferences, disliked_tastes, allergies")
      .eq("household_id", household.id)
      .in("id", body.dinerIds)
      .returns<
        { display_name: string; taste_preferences: string[]; disliked_tastes: string[]; allergies: string[] }[]
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
  const system = context ? `${RECIPE_OPTIONS_PROMPT}\n\n${context}` : RECIPE_OPTIONS_PROMPT;

  const response = await anthropic.messages.create({
    model: CHEF_MODEL,
    max_tokens: 1024,
    system,
    tools: [SUGGEST_RECIPE_OPTIONS_TOOL],
    tool_choice: { type: "tool", name: "suggest_recipe_options" },
    messages: [{ role: "user", content: "What are 3 good directions for tonight?" }],
  });

  const toolUse = response.content.find(
    (block) => block.type === "tool_use" && block.name === "suggest_recipe_options",
  );
  const options: RecipeOption[] =
    toolUse && toolUse.type === "tool_use" ? (toolUse.input as { options: RecipeOption[] }).options : [];

  return NextResponse.json({ options });
}
