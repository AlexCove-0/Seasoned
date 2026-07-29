import type { AxisId } from "./axes";

/**
 * Forced-choice questions. Deliberately NOT Likert ("rate how much you like
 * spicy") -- hedonic scales cluster everyone at the top, because most people
 * answer 4/5 to anything they don't actively dislike. Forcing a pick between
 * two genuinely appealing options makes people trade one pleasure against
 * another, which is what actually separates palates.
 *
 * Structure is 14 core questions plus a pool of tie-breakers. After the core
 * round we look for axes that landed near neutral -- meaning the core
 * questions genuinely failed to learn anything about that person there -- and
 * ask targeted follow-ups for just those. Everyone gets a sharp profile
 * without everyone answering 21 questions.
 */
export type QuizOption = {
  id: string;
  label: string;
  detail: string;
  weights: Partial<Record<AxisId, number>>;
  textureFlags?: string[];
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  scene?: string;
  options: QuizOption[];
  /** Present on tie-breakers: the axis this question exists to resolve. */
  resolves?: AxisId;
};

export const CORE_QUIZ: QuizQuestion[] = [
  {
    id: "q1_chicken",
    scene: "Same roast chicken, two finishes",
    prompt: "Which plate do you want?",
    options: [
      {
        id: "pan_sauce",
        label: "The pan sauce",
        detail: "Drippings mounted with cold butter and a splash of cream, spooned over the skin.",
        weights: { richness: 2, acid: -1 },
      },
      {
        id: "bright",
        label: "The bright finish",
        detail: "Lemon squeezed over the crackling skin, torn herbs, a little of its own clean juice.",
        weights: { richness: -1, acid: 2 },
      },
    ],
  },
  {
    id: "q2_heat",
    scene: "Calibration",
    prompt: "Where does the burn stop being fun and start being work?",
    options: [
      { id: "bell", label: "Bell pepper", detail: "No heat at all, thanks.", weights: { heat: -2 } },
      { id: "poblano", label: "Poblano", detail: "A whisper of warmth.", weights: { heat: -1 } },
      { id: "jalapeno", label: "Jalapeño", detail: "Pleasant, familiar heat.", weights: { heat: 1 } },
      { id: "serrano", label: "Serrano", detail: "Now we're talking.", weights: { heat: 2 } },
      { id: "habanero", label: "Habanero", detail: "Bring it.", weights: { heat: 3, adventure: 1 } },
    ],
  },
  {
    id: "q3_side",
    scene: "One side dish with dinner",
    prompt: "Which are you reaching for?",
    options: [
      {
        id: "gratin",
        label: "Potato gratin",
        detail: "Cream, garlic, a browned cheese lid.",
        weights: { richness: 2, bitter: -1 },
      },
      {
        id: "broccoli",
        label: "Charred broccolini",
        detail: "Blistered black at the edges, chili flake, lemon.",
        weights: { bitter: 2, heat: 1, acid: 1 },
      },
      {
        id: "slaw",
        label: "Vinegar slaw",
        detail: "Sharp, crunchy, barely dressed.",
        weights: { acid: 2, richness: -1 },
        textureFlags: ["Crunch-seeker"],
      },
    ],
  },
  {
    id: "q4_grapefruit",
    scene: "Half a grapefruit is in front of you",
    prompt: "What happens next?",
    options: [
      {
        id: "straight",
        label: "Spoon, straight in",
        detail: "The bitterness is the point.",
        weights: { bitter: 2, acid: 1 },
      },
      {
        id: "sugar",
        label: "Sugar first",
        detail: "A spoonful over the top, then it's good.",
        weights: { sweet_savory: 1 },
      },
      { id: "pass", label: "Pass", detail: "Someone else can have it.", weights: { bitter: -2 } },
    ],
  },
  {
    id: "q5_caesar",
    scene: "Caesar dressing, made at the table",
    prompt: "They're about to add the anchovies. You say…",
    options: [
      {
        id: "more",
        label: "Double them",
        detail: "That's where all the flavor lives.",
        weights: { funk: 2 },
      },
      { id: "fine", label: "Sounds right", detail: "As long as it isn't fishy.", weights: {} },
      {
        id: "skip",
        label: "Leave them out",
        detail: "I'd rather keep it clean.",
        weights: { funk: -2 },
      },
    ],
  },
  {
    id: "q6_maple",
    scene: "Maple syrup has run across the plate and touched the bacon",
    prompt: "Your reaction?",
    options: [
      {
        id: "best_bite",
        label: "That's the best bite",
        detail: "Sweet and salt belong together.",
        weights: { sweet_savory: 2 },
      },
      {
        id: "no_harm",
        label: "Fine, but I didn't plan it",
        detail: "No harm done.",
        weights: {},
      },
      {
        id: "ruined",
        label: "Ruined",
        detail: "Foods should stay in their lanes.",
        weights: { sweet_savory: -2 },
      },
    ],
  },
  {
    id: "q7_cheese",
    scene: "The cheese board arrives",
    prompt: "Which one do you go for first?",
    options: [
      {
        id: "blue",
        label: "The blue",
        detail: "Veined, salty, almost too much — perfect.",
        weights: { funk: 2, bitter: 1 },
      },
      {
        id: "aged",
        label: "The aged cheddar",
        detail: "Crystalline, sharp, deeply savory.",
        weights: { funk: 1, richness: 1 },
      },
      {
        id: "fresh",
        label: "The fresh mozzarella",
        detail: "Milky, soft, clean.",
        weights: { funk: -2, richness: 1 },
        textureFlags: ["Creamy comfort"],
      },
    ],
  },
  {
    id: "q8_texture",
    scene: "Be honest",
    prompt: "Which of these would make you put a fork down?",
    options: [
      {
        id: "slime",
        label: "Anything slippery",
        detail: "Okra, oysters, natto — the texture ends it.",
        weights: { adventure: -1 },
        textureFlags: ["No slime"],
      },
      {
        id: "mush",
        label: "Mushy vegetables",
        detail: "If it's lost its bite, I've lost interest.",
        weights: {},
        textureFlags: ["Hates mushy", "Crunch-seeker"],
      },
      {
        id: "chew",
        label: "Long chewy cuts",
        detail: "Tendon, squid, gristle — too much work.",
        weights: { adventure: -1 },
        textureFlags: ["Prefers smooth"],
      },
      {
        id: "nothing",
        label: "None of these bother me",
        detail: "Texture is part of the fun.",
        weights: { adventure: 1 },
        textureFlags: ["Loves chew"],
      },
    ],
  },
  {
    id: "q9_carrots",
    scene: "Carrots, as a side",
    prompt: "How do you want them cooked?",
    options: [
      {
        id: "glazed",
        label: "Honey-glazed",
        detail: "Butter, honey, cooked down until they shine.",
        weights: { sweet_savory: 2, richness: 1 },
      },
      {
        id: "charred",
        label: "Charred whole",
        detail: "Blackened in spots, cumin, a hard squeeze of lime.",
        weights: { bitter: 2, acid: 1 },
      },
      {
        id: "raw",
        label: "Raw, with salt",
        detail: "Cold, snapping, barely touched.",
        weights: { richness: -2 },
        textureFlags: ["Crunch-seeker"],
      },
    ],
  },
  {
    id: "q10_toast",
    scene: "One slice of toast, whatever you want on it",
    prompt: "What goes on top?",
    options: [
      {
        id: "butter_jam",
        label: "Butter and jam",
        detail: "Cold butter, thick enough to leave tooth marks.",
        weights: { richness: 2, sweet_savory: 1, funk: -1 },
      },
      {
        id: "avocado",
        label: "Avocado and chili",
        detail: "Lemon, flaky salt, a lot of chili flake.",
        weights: { heat: 1, acid: 1 },
      },
      {
        id: "marmite",
        label: "Something salty and funky",
        detail: "Marmite, anchovy butter, or aged cheese under the broiler.",
        weights: { funk: 2, sweet_savory: -1 },
      },
    ],
  },
  {
    id: "q11_salad",
    scene: "Dressing the salad",
    prompt: "Which dressing is going on?",
    options: [
      {
        id: "creamy",
        label: "Creamy and garlicky",
        detail: "Buttermilk, mayo, herbs — it coats every leaf.",
        weights: { richness: 2, acid: -1 },
        textureFlags: ["Creamy comfort"],
      },
      {
        id: "sharp",
        label: "Sharp vinaigrette",
        detail: "More vinegar than you'd expect, mustard, cracked pepper.",
        weights: { acid: 2, richness: -1 },
      },
      {
        id: "oil_lemon",
        label: "Just oil and lemon",
        detail: "Good olive oil, salt, nothing else.",
        weights: { acid: 1 },
      },
    ],
  },
  {
    id: "q12_drink",
    scene: "First drink of the evening",
    prompt: "What do you order?",
    options: [
      {
        id: "negroni",
        label: "Something bitter",
        detail: "Negroni, amaro, an IPA — the bitterness is the appeal.",
        weights: { bitter: 3 },
      },
      {
        id: "crisp",
        label: "Something crisp and dry",
        detail: "A dry white, a lager, soda with lime.",
        weights: { acid: 1, sweet_savory: -1 },
      },
      {
        id: "sweet_drink",
        label: "Something with fruit in it",
        detail: "Margarita, cider, anything a little sweet.",
        weights: { sweet_savory: 2, bitter: -2 },
      },
    ],
  },
  {
    id: "q13_leftovers",
    scene: "Cold chicken and rice in the fridge, and you're hungry",
    prompt: "What do you do with it?",
    options: [
      {
        id: "kimchi",
        label: "Fry it hard with kimchi",
        detail: "A fried egg, a big spoon of gochujang.",
        weights: { funk: 2, heat: 1, adventure: 1 },
      },
      {
        id: "lemon",
        label: "Dress it cold",
        detail: "Lemon, olive oil, plenty of herbs, eat it standing up.",
        weights: { acid: 2, richness: -1 },
      },
      {
        id: "butter",
        label: "Butter and reheat",
        detail: "A knob of butter, salt, maybe cheese.",
        weights: { richness: 2, adventure: -1 },
      },
    ],
  },
  {
    id: "q14_menu",
    scene: "A dish you can't pronounce, no description, and the next table ordered it",
    prompt: "What do you do?",
    options: [
      {
        id: "order",
        label: "Order it",
        detail: "That's the whole reason to eat out.",
        weights: { adventure: 3 },
      },
      {
        id: "ask",
        label: "Ask what's in it",
        detail: "Then probably order it.",
        weights: { adventure: 1 },
      },
      {
        id: "known",
        label: "Get the thing I know is good",
        detail: "No regrets.",
        weights: { adventure: -2 },
      },
    ],
  },
];

/** One targeted follow-up per axis, asked only when the core round was inconclusive. */
export const TIE_BREAKERS: QuizQuestion[] = [
  {
    id: "tb_bitter",
    resolves: "bitter",
    scene: "Coffee, no rush",
    prompt: "How do you take it?",
    options: [
      {
        id: "black",
        label: "Black, dark roast",
        detail: "The bitterness is why I'm drinking it.",
        weights: { bitter: 3 },
      },
      { id: "splash", label: "A splash of milk", detail: "Just to take the edge off.", weights: {} },
      {
        id: "sweet",
        label: "Milk and sugar",
        detail: "Or I'd rather have tea.",
        weights: { bitter: -3 },
      },
    ],
  },
  {
    id: "tb_heat",
    resolves: "heat",
    scene: "There's hot sauce on the table",
    prompt: "Does it reach your plate?",
    options: [
      {
        id: "always",
        label: "Before I've even tasted it",
        detail: "I keep a bottle in my bag, honestly.",
        weights: { heat: 3 },
      },
      {
        id: "sometimes",
        label: "A few drops, once I've tried it",
        detail: "Depends what it needs.",
        weights: { heat: 1 },
      },
      {
        id: "never",
        label: "It stays where it is",
        detail: "The food's already seasoned.",
        weights: { heat: -3 },
      },
    ],
  },
  {
    id: "tb_richness",
    resolves: "richness",
    scene: "A ribeye, cooked how you like it",
    prompt: "What about the fat cap?",
    options: [
      {
        id: "best_part",
        label: "Best part of the steak",
        detail: "Crisped and salty — I'd eat it first.",
        weights: { richness: 3 },
      },
      { id: "some", label: "Some of it", detail: "If it's rendered properly.", weights: {} },
      {
        id: "trim",
        label: "I trim it off",
        detail: "I'm here for the meat.",
        weights: { richness: -3 },
      },
    ],
  },
  {
    id: "tb_acid",
    resolves: "acid",
    scene: "A bowl of fries",
    prompt: "What are you putting on them?",
    options: [
      {
        id: "vinegar",
        label: "Malt vinegar",
        detail: "Doused, until they're almost soggy.",
        weights: { acid: 3 },
      },
      { id: "ketchup", label: "Ketchup", detail: "Classic for a reason.", weights: {} },
      {
        id: "mayo",
        label: "Garlic mayo",
        detail: "Rich, thick, plenty of it.",
        weights: { acid: -2, richness: 1 },
      },
    ],
  },
  {
    id: "tb_funk",
    resolves: "funk",
    scene: "A recipe calls for a tablespoon of fish sauce",
    prompt: "Do you use it?",
    options: [
      {
        id: "more",
        label: "Use it — and probably more",
        detail: "It's the backbone of the dish.",
        weights: { funk: 3 },
      },
      {
        id: "as_written",
        label: "Exactly as written",
        detail: "I trust the recipe.",
        weights: {},
      },
      {
        id: "substitute",
        label: "Substitute or skip it",
        detail: "The smell alone puts me off.",
        weights: { funk: -3 },
      },
    ],
  },
  {
    id: "tb_sweet_savory",
    resolves: "sweet_savory",
    scene: "The eternal question",
    prompt: "Pineapple on pizza?",
    options: [
      {
        id: "yes",
        label: "Obviously yes",
        detail: "Sweet, salty, acidic — it works.",
        weights: { sweet_savory: 3 },
      },
      {
        id: "situational",
        label: "In the right hands",
        detail: "I won't fight about it.",
        weights: {},
      },
      {
        id: "no",
        label: "Absolutely not",
        detail: "Fruit is not a pizza topping.",
        weights: { sweet_savory: -3 },
      },
    ],
  },
  {
    id: "tb_adventure",
    resolves: "adventure",
    scene: "A vegetable at the market you've never seen before",
    prompt: "What happens?",
    options: [
      {
        id: "buy",
        label: "It's in the bag",
        detail: "I'll figure out what to do with it at home.",
        weights: { adventure: 3 },
      },
      {
        id: "research",
        label: "I look it up first",
        detail: "If there's a recipe I like, I'll come back for it.",
        weights: { adventure: 1 },
      },
      {
        id: "skip",
        label: "I walk past it",
        detail: "I've got a list.",
        weights: { adventure: -2 },
      },
    ],
  },
];

export const ALL_QUESTIONS = [...CORE_QUIZ, ...TIE_BREAKERS];
export const MAX_TIE_BREAKERS = 3;
export const QUIZ_VERSION = 2;
