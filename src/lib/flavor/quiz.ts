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
  /**
   * The axis this question primarily measures. Set on tie-breakers and
   * alternates; used to keep retake sets covering every axis and to target
   * "go deeper" rounds at whatever is still uncertain.
   */
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
      // Weights track the Scoville scale's actual shape, which is violently
      // non-linear: jalapeño ~5k SHU, serrano ~15k, habanero ~200k. Treating
      // serrano -> habanero as one more step (+2 -> +3) badly understated a
      // ~15x jump, so habanero now sits well clear of the rest.
      { id: "bell", label: "Bell pepper", detail: "No heat at all, thanks.", weights: { heat: -3 } },
      { id: "poblano", label: "Poblano", detail: "A whisper of warmth.", weights: { heat: -1 } },
      { id: "jalapeno", label: "Jalapeño", detail: "Pleasant, familiar heat.", weights: { heat: 1 } },
      { id: "serrano", label: "Serrano", detail: "Now we're talking.", weights: { heat: 2 } },
      { id: "habanero", label: "Habanero", detail: "Bring it.", weights: { heat: 4, adventure: 1 } },
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
        // Chili flake removed from the description entirely. It was never
        // scored, so it couldn't help -- it could only push chili-avoiders
        // off an option that reads them correctly on char and acid.
        detail: "Blistered black at the edges, a squeeze of lemon.",
        weights: { bitter: 2, acid: 1 },
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
        // Was "Avocado and chili ... a lot of chili flake", scored heat+acid
        // together -- so liking lemon on toast required accepting heat. The
        // heat now lives in its own option below, where it can be declined.
        label: "Avocado and lemon",
        detail: "Flaky salt, a hard squeeze of lemon.",
        weights: { acid: 2 },
      },
      {
        id: "chili_crisp",
        label: "Chili crisp",
        detail: "Spooned on thick, oil and all.",
        weights: { heat: 2 },
      },
      {
        id: "marmite",
        label: "Something salty and funky",
        detail: "Marmite, anchovy butter, or aged cheese under the broiler.",
        // Richness was implied by "butter"/"cheese" but unscored; an unscored
        // cue can only mislead, so it's scored now.
        weights: { funk: 2, sweet_savory: -1, richness: 1 },
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
        // Gochujang dropped from the description: it implied heat that was
        // never scored, which is the one thing an option must never do.
        detail: "A fried egg on top, edges crisped in the pan.",
        weights: { funk: 2, adventure: 1 },
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
  // q15 and q16 exist because heat and acid were previously inferred almost
  // entirely from side effects -- charred greens and kimchi were quietly
  // scoring people as chili chasers, and choosing a rich pan sauce over a
  // squeeze of lemon was reading as "dislikes acidity". Both axes needed a
  // question that asks the thing directly, in both directions.
  {
    id: "q15_chili_flakes",
    scene: "There's a jar of chili flakes on the table",
    prompt: "What happens to it?",
    options: [
      {
        id: "never",
        label: "It stays where it is",
        detail: "Heat isn't something I add. The dish is the dish.",
        weights: { heat: -3 },
      },
      {
        id: "occasional",
        label: "A pinch now and then",
        detail: "Some dishes want it. Most don't.",
        weights: { heat: -1 },
      },
      {
        id: "usually",
        label: "Most plates get a shake",
        detail: "A little heat sharpens nearly anything.",
        weights: { heat: 2 },
      },
      {
        id: "always",
        label: "First, and then again",
        detail: "I'm building toward a burn.",
        weights: { heat: 3, adventure: 1 },
      },
    ],
  },
  {
    id: "q16_lemon_finish",
    scene: "The food is cooked and plated, seconds from the table",
    prompt: "Does it get a squeeze of lemon first?",
    options: [
      {
        id: "always",
        label: "Almost always",
        detail: "Acid is how you wake a dish up. I keep citrus within reach.",
        weights: { acid: 3 },
      },
      {
        id: "rich_dishes",
        label: "When it needs cutting",
        // "fatty, fried, heavy" read as a richness signal that wasn't scored.
        // Reworded so the option is purely about the acid habit.
        detail: "Some dishes ask for it, some don't.",
        weights: { acid: 1 },
      },
      {
        id: "rarely",
        label: "Rarely",
        detail: "If I wanted it sharp I'd have built it that way.",
        weights: { acid: -2 },
      },
      {
        id: "never",
        label: "No — it'd fight the dish",
        detail: "I'd rather the flavors stay round and settled.",
        weights: { acid: -3, richness: 1 },
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
        label: "Enough milk to hide it",
        // Was "Milk and sugar", which leaked a sweet-tooth signal into a
        // question that exists only to resolve bitterness.
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

/**
 * Interchangeable with the core questions: each targets one axis through a
 * different everyday scene, so a retake isn't a memory test of last time's
 * answers, and "go deeper" rounds have fresh material. Same discipline as
 * the core set -- forced choices between real pleasures, weights mostly on
 * the one axis the scene is actually about.
 */
export const ALTERNATES: QuizQuestion[] = [
  {
    id: "alt_coffee",
    resolves: "bitter",
    scene: "Morning coffee",
    prompt: "How does it leave the counter?",
    options: [
      { id: "black", label: "Black, dark roast", detail: "The edge is the point.", weights: { bitter: 3 } },
      { id: "splash", label: "A splash of milk", detail: "Just to round the corners.", weights: { bitter: 1 } },
      { id: "sweet", label: "Pale and sweet", detail: "Coffee-flavored comfort.", weights: { bitter: -2, richness: 1 } },
      { id: "none", label: "Tea or nothing", detail: "Coffee's not my thing.", weights: {} },
    ],
  },
  {
    id: "alt_greens",
    resolves: "bitter",
    scene: "The salad mix is heavy on arugula and radicchio",
    prompt: "Good news or bad news?",
    options: [
      { id: "good", label: "Good news", detail: "The sharp leaves are the best ones.", weights: { bitter: 2 } },
      { id: "fine", label: "Fine with dressing", detail: "They earn their place dressed.", weights: { bitter: 0 } },
      { id: "bad", label: "I'd pick around them", detail: "Give me the sweet crunchy lettuce.", weights: { bitter: -2 } },
    ],
  },
  {
    id: "alt_salsa",
    resolves: "heat",
    scene: "Taqueria counter, four salsas",
    prompt: "Which one goes on?",
    options: [
      { id: "pico", label: "Pico, mild", detail: "Flavor without the burn.", weights: { heat: -2 } },
      { id: "verde", label: "The green one", detail: "A gentle hum.", weights: { heat: 1 } },
      { id: "roja", label: "The dark red one", detail: "Proper heat.", weights: { heat: 2 } },
      { id: "warned", label: "The one they warn you about", detail: "That's why it exists.", weights: { heat: 3, adventure: 1 } },
    ],
  },
  {
    id: "alt_thai",
    resolves: "heat",
    scene: "Ordering Thai",
    prompt: "Spice level?",
    options: [
      { id: "mild", label: "Mild, please", detail: "I'm here for the herbs and lime.", weights: { heat: -3 } },
      { id: "medium", label: "Medium", detail: "Warmth, not pain.", weights: { heat: 1 } },
      { id: "hot", label: "Hot", detail: "Sweat a little, live a little.", weights: { heat: 2 } },
      { id: "thai_hot", label: "Thai hot", detail: "Same as the kitchen eats it.", weights: { heat: 3 } },
    ],
  },
  {
    id: "alt_mash",
    resolves: "richness",
    scene: "You're making the mashed potatoes",
    prompt: "What goes in?",
    options: [
      { id: "loaded", label: "Butter, then more butter", detail: "Cream too. It's a holiday somewhere.", weights: { richness: 3 } },
      { id: "balanced", label: "Enough butter to notice", detail: "Rich, but still potato.", weights: { richness: 1 } },
      { id: "olive", label: "Olive oil and the cooking water", detail: "Silky without the dairy weight.", weights: { richness: -2 } },
    ],
  },
  {
    id: "alt_fries",
    resolves: "acid",
    scene: "Hot fries on the table",
    prompt: "What are they getting dipped in?",
    options: [
      { id: "vinegar", label: "Malt vinegar, straight on", detail: "Sharp beats creamy.", weights: { acid: 2 } },
      { id: "ketchup", label: "Ketchup", detail: "The classic for a reason.", weights: {} },
      { id: "mayo", label: "Mayo or aioli", detail: "Fat on fat, no notes.", weights: { richness: 2, acid: -1 } },
      { id: "plain", label: "Nothing, just salt", detail: "Don't interrupt a good fry.", weights: {} },
    ],
  },
  {
    id: "alt_pickle",
    resolves: "acid",
    scene: "The sandwich comes with a big dill pickle",
    prompt: "What happens to it?",
    options: [
      { id: "first", label: "Eaten first", detail: "Might ask for a second.", weights: { acid: 2 } },
      { id: "alongside", label: "Bites in rotation", detail: "It's there to cut the sandwich.", weights: { acid: 1 } },
      { id: "traded", label: "Traded away", detail: "Too sharp, too loud.", weights: { acid: -2 } },
    ],
  },
  {
    id: "alt_cheese",
    resolves: "funk",
    scene: "A cheese board goes by",
    prompt: "First reach?",
    options: [
      { id: "stinky", label: "The soft stinky one", detail: "If it clears the room, it's mine.", weights: { funk: 3 } },
      { id: "aged", label: "The hard aged one", detail: "Crystals and depth.", weights: { funk: 1 } },
      { id: "fresh", label: "The fresh mild one", detail: "Mozzarella territory, clean and milky.", weights: { funk: -2 } },
    ],
  },
  {
    id: "alt_fishsauce",
    resolves: "funk",
    scene: "The recipe calls for a tablespoon of fish sauce",
    prompt: "Your move?",
    options: [
      { id: "more", label: "I round it up", detail: "That's where the savor lives.", weights: { funk: 2 } },
      { id: "aswritten", label: "As written", detail: "Trust the recipe.", weights: { funk: 0 } },
      { id: "swap", label: "Swap in something milder", detail: "Soy sauce and call it close enough.", weights: { funk: -2 } },
    ],
  },
  {
    id: "alt_pineapple",
    resolves: "sweet_savory",
    scene: "The eternal question",
    prompt: "Pineapple on pizza?",
    options: [
      { id: "yes", label: "Yes, gladly", detail: "Sweet, salty, a little char — that's a system working.", weights: { sweet_savory: 3 } },
      { id: "try", label: "I'd eat a slice", detail: "Not my order, not a crime.", weights: { sweet_savory: 1 } },
      { id: "never", label: "Absolutely not", detail: "Fruit had its chance at breakfast.", weights: { sweet_savory: -2 } },
    ],
  },
  {
    id: "alt_maple",
    resolves: "sweet_savory",
    scene: "Breakfast plate, syrup migrating",
    prompt: "The maple syrup is touching the bacon.",
    options: [
      { id: "best", label: "That's the best bite", detail: "I'd drag it through on purpose.", weights: { sweet_savory: 2 } },
      { id: "tolerable", label: "It happens", detail: "Not mad about it.", weights: { sweet_savory: 0 } },
      { id: "walls", label: "Everything in its place", detail: "Sweet stays on its side of the plate.", weights: { sweet_savory: -2 } },
    ],
  },
  {
    id: "alt_newcity",
    resolves: "adventure",
    scene: "First night somewhere you've never been",
    prompt: "Dinner is...",
    options: [
      { id: "street", label: "Whatever the street line is for", detail: "Can't read the menu. Perfect.", weights: { adventure: 3 } },
      { id: "researched", label: "The place I bookmarked", detail: "Adventurous, but vetted.", weights: { adventure: 1 } },
      { id: "familiar", label: "Something I recognize", detail: "Travel is tiring. Dinner shouldn't be.", weights: { adventure: -2 } },
    ],
  },
  {
    id: "alt_swap",
    resolves: "adventure",
    scene: "The recipe needs three ingredients you've never bought",
    prompt: "What happens?",
    options: [
      { id: "hunt", label: "I hunt them down", detail: "That's half the fun.", weights: { adventure: 2 } },
      { id: "sub", label: "I substitute familiar ones", detail: "Close enough is close enough.", weights: { adventure: -2 } },
    ],
  },
];

export const ALL_QUESTIONS = [...CORE_QUIZ, ...TIE_BREAKERS, ...ALTERNATES];
export const MAX_TIE_BREAKERS = 3;
// 3: added direct heat/acid questions, symmetric scoring, and the
// alternates bank for retake variance and go-deeper rounds.
export const QUIZ_VERSION = 3;

/** The axis a question is mostly about, for coverage checks and targeting. */
export function primaryAxis(q: QuizQuestion): AxisId | null {
  if (q.resolves) return q.resolves;
  const totals = new Map<AxisId, number>();
  for (const o of q.options) {
    for (const [axis, w] of Object.entries(o.weights)) {
      totals.set(axis as AxisId, (totals.get(axis as AxisId) ?? 0) + Math.abs(w ?? 0));
    }
  }
  let best: AxisId | null = null;
  let bestTotal = 0;
  for (const [axis, total] of totals) {
    if (total > bestTotal) { best = axis; bestTotal = total; }
  }
  return best;
}

/**
 * The question set for a sitting. First-timers get the calibrated core set.
 * Retakes swap a shuffled handful of core questions for alternates covering
 * the same axes, so coming back isn't re-answering last time's quiz from
 * memory. Scoring normalizes over whatever was actually asked, so any mix
 * is valid.
 */
export function buildQuizSet(opts: { retake: boolean } = { retake: false }): QuizQuestion[] {
  if (!opts.retake) return CORE_QUIZ;

  const shuffledAlts = [...ALTERNATES].sort(() => Math.random() - 0.5);
  const set = [...CORE_QUIZ];

  // Swap one core question per alternate axis, at most once per axis, and
  // cap the swaps so the calibrated core still anchors most of the sitting.
  const swappedAxes = new Set<string>();
  let swaps = 0;
  for (const alt of shuffledAlts) {
    if (swaps >= 5) break;
    const axis = primaryAxis(alt);
    if (!axis || swappedAxes.has(axis)) continue;
    const coreIdx = set.findIndex((q) => !q.id.startsWith("alt_") && primaryAxis(q) === axis);
    if (coreIdx === -1) continue;
    set[coreIdx] = alt;
    swappedAxes.add(axis);
    swaps++;
  }
  return set;
}
