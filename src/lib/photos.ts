export const PHOTO_BUCKET = "recipe-photos";

/** Public URL for a stored photo path. Safe on both server and client. */
export function photoUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${PHOTO_BUCKET}/${path}`;
}

/**
 * Downscale a photo before upload. A modern phone camera produces ~12MP /
 * 4MB files and we never render one wider than a phone screen, so this is
 * the difference between an upload that lands while you're still stirring
 * and one that doesn't. `from-image` honours the EXIF rotation flag, without
 * which portrait phone shots arrive sideways.
 */
export async function resizeImage(file: File, maxEdge = 1400, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Could not read that image.");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality),
  );
  if (!blob) throw new Error("Could not process that image.");
  return blob;
}
