"use client";

import { PhotoPicker } from "@/components/photo-picker";
import { setRecipePhoto } from "./actions";

export function RecipePhoto({
  recipeId,
  householdId,
  imagePath,
}: {
  recipeId: string;
  householdId: string;
  imagePath: string | null;
}) {
  return (
    <PhotoPicker
      householdId={householdId}
      initialPath={imagePath}
      onUploaded={(path) => setRecipePhoto(recipeId, path)}
      label="Add a photo of this dish"
    />
  );
}
