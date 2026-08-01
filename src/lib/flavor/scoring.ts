import { AXES, type AxisId, type FlavorAxes } from "./axes";
import {
  CORE_QUIZ,
  MAX_TIE_BREAKERS,
  TIE_BREAKERS,
  type QuizQuestion,
} from "./quiz";

/** answers: questionId -> optionId */
export type QuizAnswers = Record<string, string>;

export type QuizResult = {
  axes: FlavorAxes;
  textureFlags: string[];
  archetype: string;
};

/**
 * Per axis, the largest positive and largest negative swing the asked
 * questions can produce. Computed over the questions actually asked (not the
 * whole bank) so adaptive tie-breakers don't skew the scale for people who
 * never saw them.
 */
function axisRanges(questions: QuizQuestion[]) {
  const range = new Map<AxisId, { max: number; min: number }>();
  for (const axis of AXES) range.set(axis.id, { max: 0, min: 0 });

  for (const q of questions) {
    for (const axis of AXES) {
      const deltas = q.options.map((o) => o.weights[axis.id] ?? 0);
      const r = range.get(axis.id)!;
      r.max += Math.max(...deltas, 0);
      r.min += Math.min(...deltas, 0);
    }
  }
  return range;
}

export function scoreQuiz(answers: QuizAnswers, asked: QuizQuestion[] = CORE_QUIZ): QuizResult {
  const raw = new Map<AxisId, number>(AXES.map((a) => [a.id, 0]));
  const flags = new Set<string>();

  for (const q of asked) {
    const option = q.options.find((o) => o.id === answers[q.id]);
    if (!option) continue;
    for (const [axisId, delta] of Object.entries(option.weights)) {
      raw.set(axisId as AxisId, (raw.get(axisId as AxisId) ?? 0) + (delta ?? 0));
    }
    for (const flag of option.textureFlags ?? []) flags.add(flag);
  }

  const ranges = axisRanges(asked);
  const axes = {} as FlavorAxes;
  for (const axis of AXES) {
    const score = raw.get(axis.id) ?? 0;
    const { max, min } = ranges.get(axis.id)!;
    let position = 50;
    if (score > 0 && max > 0) position = 50 + (score / max) * 50;
    else if (score < 0 && min < 0) position = 50 - (score / min) * 50;
    axes[axis.id] = Math.round(Math.min(100, Math.max(0, position)));
  }

  return { axes, textureFlags: [...flags], archetype: archetypeFor(axes) };
}

/**
 * Which follow-ups are worth asking. An axis sitting near 50 after the core
 * round means we genuinely didn't learn anything about it -- either the
 * person's answers cancelled out, or they picked neutral options. Those are
 * exactly the axes a targeted question can resolve, and asking only those
 * keeps the quiz short for people whose core answers were already decisive.
 */
export function pickTieBreakers(coreAnswers: QuizAnswers): QuizQuestion[] {
  const { axes } = scoreQuiz(coreAnswers, CORE_QUIZ);

  return AXES.map((axis) => ({ axis: axis.id, ambiguity: 50 - Math.abs(axes[axis.id] - 50) }))
    .filter((entry) => entry.ambiguity > 40) // i.e. axis landed within 10 of neutral
    .sort((a, b) => b.ambiguity - a.ambiguity)
    .slice(0, MAX_TIE_BREAKERS)
    .map((entry) => TIE_BREAKERS.find((q) => q.resolves === entry.axis))
    .filter((q): q is QuizQuestion => Boolean(q));
}

const ARCHETYPE_WORDS: Record<AxisId, { high: [string, string]; low: [string, string] }> = {
  // [adjective (used when secondary), noun (used when primary)]
  bitter: { high: ["Bracing", "Bitter Seeker"], low: ["Mellow", "Smooth Palate"] },
  heat: { high: ["Fiery", "Heat Chaser"], low: ["Cool-Headed", "Gentle Palate"] },
  richness: { high: ["Silky", "Butter Devotee"], low: ["Lean", "Clean Plate"] },
  acid: { high: ["Bright", "Brightness Hunter"], low: ["Round", "Round Palate"] },
  funk: { high: ["Funk-Forward", "Fermenter"], low: ["Fresh", "Fresh Eater"] },
  sweet_savory: { high: ["Boundary-Blurring", "Line Blurrer"], low: ["Classic", "Purist"] },
  adventure: { high: ["Restless", "Explorer"], low: ["Homebound", "Traditionalist"] },
};

/**
 * Named from the two axes furthest from neutral -- NOT the two highest.
 * Naming by highest score is exactly why most quizzes hand out the same three
 * results to everyone: it rewards enthusiasm rather than character.
 * Distance-from-median rewards whatever is unusual about this person.
 */
export function archetypeFor(axes: FlavorAxes): string {
  const ranked = AXES.map((a) => ({
    id: a.id,
    distance: Math.abs(axes[a.id] - 50),
    high: axes[a.id] >= 50,
  })).sort((a, b) => b.distance - a.distance);

  const [primary, secondary] = ranked;
  if (!primary || primary.distance < 8) return "The Even Keel";

  const noun = ARCHETYPE_WORDS[primary.id][primary.high ? "high" : "low"][1];
  if (!secondary || secondary.distance < 8) return `The ${noun}`;

  const adjective = ARCHETYPE_WORDS[secondary.id][secondary.high ? "high" : "low"][0];
  return `The ${adjective} ${noun}`;
}

/**
 * Reads the vector back as a portrait of how someone eats -- what they reach
 * for, what to go easy on -- rather than as scores. Ordered by how far each
 * axis sits from average, so the most characteristic thing leads.
 */
export type ProfileTrait = {
  axisName: string;
  /** Short food-language claim, e.g. "loves richness". */
  claim: string;
  /** The concrete examples behind it, when the phrase carries them. */
  examples: string | null;
  distance: number;
  /** Above the midpoint on this axis. */
  high: boolean;
  /** Far enough out to be a defining trait rather than a mild lean. */
  strong: boolean;
};

export function describeProfile(axes: FlavorAxes): ProfileTrait[] {
  return AXES.map((axis) => {
    const value = axes[axis.id];
    const distance = Math.abs(value - 50);
    const high = value >= 50;
    const phrase = high ? axis.highPhrase : axis.lowPhrase;
    const [claim, ...rest] = phrase.split("--");
    return {
      axisName: axis.name,
      claim: claim.trim(),
      examples: rest.join("--").trim() || null,
      distance,
      high,
      strong: distance >= 20,
    };
  })
    .filter((t) => t.distance >= 8)
    .sort((a, b) => b.distance - a.distance);
}

/**
 * Turns the vector into prose for the chef prompt. The model reasons about
 * intensity far better than it does about a bare tag list -- and the
 * archetype name is deliberately never sent, only the underlying numbers.
 */
export function describeAxes(axes: FlavorAxes | null): string[] {
  if (!axes) return [];
  const lines: string[] = [];
  for (const axis of AXES) {
    const v = axes[axis.id];
    if (typeof v !== "number") continue;
    if (v >= 70) lines.push(axis.highPhrase);
    else if (v <= 30) lines.push(axis.lowPhrase);
  }
  return lines;
}

/** How stale a profile is, for the "tastes change" nudge. */
export function monthsSince(iso: string | null): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24 * 30.44));
}

export const STALE_AFTER_MONTHS = 9;
