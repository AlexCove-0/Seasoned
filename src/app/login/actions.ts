"use server";

import { createClient } from "@/lib/supabase/server";

export async function sendMagicLink(
  _prevState: { error: string | null; sent: boolean },
  formData: FormData,
) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "Enter an email address.", sent: false };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/confirm?next=/`,
    },
  });

  if (error) {
    return { error: error.message, sent: false };
  }
  return { error: null, sent: true };
}
