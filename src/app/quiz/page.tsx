import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { FlavorAxes } from "@/lib/flavor/axes";
import { QuizClient } from "./quiz-client";

type Subject = { display_name: string; flavor_axes: FlavorAxes | null; quiz_taken_at: string | null };

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<{ member?: string; next?: string }>;
}) {
  const { member, next } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: subject } = member
    ? await supabase
        .from("household_members")
        .select("display_name, flavor_axes, quiz_taken_at")
        .eq("id", member)
        .maybeSingle<Subject>()
    : await supabase
        .from("profiles")
        .select("display_name, flavor_axes, quiz_taken_at")
        .eq("user_id", user.id)
        .maybeSingle<Subject>();

  const previous =
    subject?.flavor_axes && subject.quiz_taken_at
      ? { axes: subject.flavor_axes, takenAt: subject.quiz_taken_at }
      : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-12">
      <QuizClient
        memberId={member}
        personName={subject?.display_name ?? "Your"}
        doneHref={next ?? "/kitchen"}
        previous={previous}
      />
    </main>
  );
}
