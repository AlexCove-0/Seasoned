import type { Metadata } from "next";
import { TasteQuiz } from "./taste-quiz";

export const metadata: Metadata = {
  title: "What kind of eater are you? · Sazón",
  description:
    "A two-minute taste quiz that maps your palate across seven spectra — then hand the result to whoever cooks for you.",
};

export default function TastePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-12">
      <TasteQuiz />
    </main>
  );
}
