import { NextResponse } from "next/server";
import { anthropic, CHEF_MODEL } from "@/lib/ai/client";
import { CHEF_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { PROPOSE_RECIPE_TOOL, type RecipeDraft } from "@/lib/ai/tools";
import { getCurrentHousehold } from "@/lib/household";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  const household = await getCurrentHousehold();
  if (!household) {
    return NextResponse.json({ error: "Not signed in to a household." }, { status: 401 });
  }

  const body = (await request.json()) as { messages?: ChatMessage[] };
  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages is required." }, { status: 400 });
  }

  const response = await anthropic.messages.create({
    model: CHEF_MODEL,
    max_tokens: 4096,
    system: CHEF_SYSTEM_PROMPT,
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

  return NextResponse.json({ reply, recipe });
}
