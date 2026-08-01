import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Recipe } from "@/lib/types";
import { CookModeClient } from "./cook-mode-client";

export default async function CookModePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: recipe } = await supabase
    .from("recipes")
    .select("id, title, ingredients, steps, base_servings, created_at, image_path")
    .eq("id", id)
    .maybeSingle<Recipe>();

  if (!recipe) notFound();

  return <CookModeClient recipe={recipe} />;
}
