import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QuestionnaireForm } from "./questionnaire-form";

type InviteTarget = {
  member_id: string;
  display_name: string;
  household_name: string;
  already_claimed: boolean;
};

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();

  const { data } = await supabase.rpc("get_invite_target", { p_token: token });
  const target = (data as InviteTarget[] | null)?.[0];

  if (!target) notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-8 px-4 py-10">
      <div>
        <p className="text-xs font-medium tracking-wide text-neutral-400 uppercase">
          Invite from {target.household_name}
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Hey {target.display_name}, what do you like to eat?</h1>
        <p className="text-sm text-neutral-500">
          A couple minutes of this and the household&apos;s recipes start leaning toward what you
          actually like.
        </p>
      </div>

      {target.already_claimed ? (
        <p className="rounded-md border border-neutral-200 p-4 text-sm text-neutral-500 dark:border-neutral-800">
          This profile already has an account attached to it. Ask whoever sent you this link for a
          fresh invite.
        </p>
      ) : (
        <QuestionnaireForm token={token} displayName={target.display_name} />
      )}
    </main>
  );
}
