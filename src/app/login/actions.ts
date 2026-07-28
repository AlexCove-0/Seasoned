"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type SendState = { error: string | null; sent: boolean; email?: string };

export async function sendMagicLink(_prevState: SendState, formData: FormData): Promise<SendState> {
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
  return { error: null, sent: true, email };
}

type VerifyState = { error: string | null };

export async function verifyCode(_prevState: VerifyState, formData: FormData): Promise<VerifyState> {
  const email = String(formData.get("email") ?? "").trim();
  const token = String(formData.get("token") ?? "").trim();
  if (!token) {
    return { error: "Enter the code from your email." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });

  if (error) {
    return { error: error.message };
  }
  redirect("/");
}
