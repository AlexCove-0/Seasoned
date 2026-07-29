/**
 * Seven bipolar flavor spectra, chosen because published sensory research
 * shows the population genuinely splits on them -- unlike a flat tag list
 * ("savory/sweet/spicy"), where nearly everyone claims the same handful.
 *
 * Notably included on evidence: bitter (TAS2R38/PROP taster status is the
 * best-documented genetic divider in taste), richness (fat is a validated
 * preference factor with its own tested instrument), and adventure (food
 * neophobia scales measure something orthogonal to taste entirely).
 */
export type AxisId =
  | "bitter"
  | "heat"
  | "richness"
  | "acid"
  | "funk"
  | "sweet_savory"
  | "adventure";

export type Axis = {
  id: AxisId;
  code: string;
  name: string;
  lowPole: string;
  highPole: string;
  /** Plain-language phrasing handed to the chef model, by band. */
  lowPhrase: string;
  midPhrase: string;
  highPhrase: string;
};

export const AXES: Axis[] = [
  {
    id: "bitter",
    code: "AX-1",
    name: "Bitter",
    lowPole: "Bitter-averse",
    highPole: "Seeks bitterness",
    lowPhrase: "strongly dislikes bitterness -- go easy on brassicas, chicory, heavy char, and burnt edges",
    midPhrase: "fine with moderate bitterness",
    highPhrase: "actively enjoys bitterness -- radicchio, charred edges, and bitter greens are welcome",
  },
  {
    id: "heat",
    code: "AX-2",
    name: "Heat",
    lowPole: "No burn",
    highPole: "Chili chaser",
    lowPhrase: "wants little to no chili heat",
    midPhrase: "enjoys moderate heat, around jalapeño level",
    highPhrase: "wants real chili heat and seeks the burn out",
  },
  {
    id: "richness",
    code: "AX-3",
    name: "Richness",
    lowPole: "Lean & clean",
    highPole: "Butter-forward",
    lowPhrase: "prefers lean, clean cooking -- restrained with butter, cream, and rendered fat",
    midPhrase: "comfortable with moderate richness",
    highPhrase: "loves richness -- butter-mounted sauces, cream, and rendered fat are the point",
  },
  {
    id: "acid",
    code: "AX-4",
    name: "Acid",
    lowPole: "Mellow, round",
    highPole: "Pucker-seeking",
    lowPhrase: "prefers mellow, rounded dishes over sharp acidity",
    midPhrase: "likes a normal amount of brightness",
    highPhrase: "wants bright acidity -- citrus, vinegar, and pickled elements land well",
  },
  {
    id: "funk",
    code: "AX-5",
    name: "Funk",
    lowPole: "Fresh & clean",
    highPole: "Aged & funky",
    lowPhrase: "prefers fresh and clean flavors -- avoid fish sauce, blue cheese, and heavy ferments",
    midPhrase: "okay with some fermented depth",
    highPhrase: "loves fermented, aged, funky depth -- anchovy, miso, aged cheese, kimchi",
  },
  {
    id: "sweet_savory",
    code: "AX-6",
    name: "Sweet–Savory Line",
    lowPole: "Keep them apart",
    highPole: "Blur the line",
    lowPhrase: "wants sweet kept out of savory dishes -- no fruit or sugar in dinner",
    midPhrase: "neutral about sweet notes in savory food",
    highPhrase: "enjoys sweet and savory together -- glazes, fruit with meat, honey in dinner",
  },
  {
    id: "adventure",
    code: "AX-7",
    name: "Adventure",
    lowPole: "Comfort of the known",
    highPole: "Novelty-seeking",
    lowPhrase: "wants familiar, comforting dishes -- keep techniques and ingredients recognizable",
    midPhrase: "open to a new dish now and then",
    highPhrase: "wants novelty -- unfamiliar ingredients and ambitious techniques are a draw, not a risk",
  },
];

export const AXIS_BY_ID = new Map(AXES.map((a) => [a.id, a]));

export type FlavorAxes = Record<AxisId, number>;

export const TEXTURE_FLAGS = [
  "Crunch-seeker",
  "Creamy comfort",
  "Loves chew",
  "No slime",
  "Hates mushy",
  "Prefers smooth",
] as const;
