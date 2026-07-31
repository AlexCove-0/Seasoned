import { NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, CHEF_MODEL } from "@/lib/ai/client";
import { IMPORT_RECIPE_PROMPT } from "@/lib/ai/prompts";
import { PROPOSE_RECIPE_TOOL, type RecipeDraft } from "@/lib/ai/tools";

type RequestBody =
  | { mode: "text"; content: string }
  | { mode: "image"; imageBase64: string; mediaType: string };

async function fetchUrlText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; SazonRecipeImport/1.0)" },
    signal: AbortSignal.timeout(10000),
  });
  const html = await res.text();
  const withoutNoise = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  const text = withoutNoise
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  // Recipe pages are often huge with lots of unrelated boilerplate; cap it
  // to keep the request reasonable while still covering the actual recipe.
  return text.slice(0, 15000);
}

export async function POST(request: Request) {
  const body = (await request.json()) as RequestBody;

  let userContent: Anthropic.MessageParam["content"];

  if (body.mode === "image") {
    if (!body.imageBase64 || !body.mediaType) {
      return NextResponse.json({ error: "Missing image." }, { status: 400 });
    }
    userContent = [
      {
        type: "image",
        source: {
          type: "base64",
          media_type: body.mediaType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
          data: body.imageBase64,
        },
      },
      { type: "text", text: "Here's a photo of a recipe. Please structure it as described." },
    ];
  } else {
    const raw = (body.content ?? "").trim();
    if (!raw) {
      return NextResponse.json({ error: "Nothing to import." }, { status: 400 });
    }

    let sourceText = raw;
    if (/^https?:\/\//i.test(raw)) {
      try {
        sourceText = await fetchUrlText(raw);
      } catch {
        return NextResponse.json(
          { error: "Couldn't fetch that link. Try pasting the recipe text directly instead." },
          { status: 400 },
        );
      }
    }

    userContent = `Here's the recipe to import:\n\n${sourceText}`;
  }

  const response = await anthropic.messages.create({
    model: CHEF_MODEL,
    max_tokens: 4096,
    system: IMPORT_RECIPE_PROMPT,
    tools: [PROPOSE_RECIPE_TOOL],
    tool_choice: { type: "tool", name: "propose_recipe" },
    messages: [{ role: "user", content: userContent }],
  });

  const toolUse = response.content.find(
    (block) => block.type === "tool_use" && block.name === "propose_recipe",
  );

  if (!toolUse || toolUse.type !== "tool_use") {
    return NextResponse.json({ error: "Couldn't find a recipe in that." }, { status: 422 });
  }

  const recipe = toolUse.input as RecipeDraft;
  return NextResponse.json({ recipe });
}
