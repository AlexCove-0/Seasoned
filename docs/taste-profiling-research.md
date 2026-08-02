# Taste profiling: research notes and design rules

*2026-08-01. Prompted by two real failures: the quiz read Alex as a chili chaser when he
never uses chili flakes, and his wife couldn't read the question headers. Sources at the
bottom.*

---

## 1. The finding that changes the most: people are not spread evenly

The largest relevant dataset is the **Italian Taste project** (n = 2,258), which fed people
the same four food models spiked with four rising levels of sucrose, citric acid, salt, and
capsaicin, and measured liking against perceived intensity.

| Sensation | Shape of liking vs intensity | Cluster split |
|---|---|---|
| **Sweet** | Rises monotonically | 62% strong positive; only 9% negative |
| **Sour** (citric) | **Falls** with intensity | **64% negative, only 10% positive** |
| **Salty** | **Inverted U** — an optimum, not a direction | 62% negative past the peak |
| **Pungent** (capsaicin) | Falls with intensity | 44% negative, 22% positive |

Three consequences for us:

1. **Our midpoint is a lie.** We score 50 as "average person." For sour and pungent, the
   real population centre sits well below the middle of our weight range. Someone scoring
   40 on heat isn't below average — they're near the middle of how people actually are.
   Until we calibrate against real data, the honest fix is to make sure the *phrasing*
   claims less: "moderate heat" rather than "dislikes heat".
2. **Salt is the wrong shape for a bipolar axis.** If we ever add salt, it needs an
   optimum, not a direction. (We don't have a salt axis — that turns out to be lucky.)
3. **Expect skew, don't design against it.** A quiz where most people land low on heat is
   correct, not broken.

## 2. What actually discriminates, per axis

### Bitter — the strongest evidence base in all of taste
**PROP/PTC taster status** is the best-documented individual difference in taste. Roughly
**25% supertasters, 45–50% medium, 25–30% non-tasters**, driven by *TAS2R38*; supertasters
have visibly more fungiform papillae. Supertasters eat fewer cruciferous vegetables.

Good discriminating foods (in rough order of how far out they sit):
`tonic water / Campari > raw radicchio, endive > black coffee > IPA / hoppy beer >
grapefruit > brussels sprouts, broccoli rabe > dark chocolate 85% > kale`

Caveat worth remembering: reviews find the food-preference correlations **weaker and less
consistent than the popular story suggests**. Bitter sensitivity is real; "supertasters
dislike X" is shakier. Don't over-claim.

### Heat — not a taste at all, and it correlates with personality
Capsaicin is a **trigeminal pain signal**, not a taste. Liking it is explained by Rozin's
**"benign masochism"**: the body reads threat, the mind knows there's no danger, and the
mismatch itself becomes the pleasure. Chili liking correlates with **sensation seeking,
reward sensitivity, and risk-taking**; avoiders score higher on **disgust sensitivity**.

**This means heat and adventure are genuinely correlated, not independent axes.** That's
useful as a cross-check (high adventure + low heat is informative), but it also means we
must never infer one from the other.

The Scoville ladder is a real instrument, but it is **wildly non-linear** and our weights
treated it as evenly spaced:

| Pepper | SHU | vs previous |
|---|---|---|
| Bell | 0 | — |
| Poblano | 1,000–2,000 | — |
| Jalapeño | 2,500–8,000 | ~3× |
| Serrano | 8,000–20,000 | ~3× |
| **Habanero** | **100,000–350,000** | **~15×** |

Serrano → habanero is a different *category* of experience, not one more step. Weighting
them +2 and +3 understated the gap badly.

### Acid — most people want less, and it's the easiest to confound
64% of people like a dish less as sourness rises. But acid is also the sensation cooks use
most as a *corrective* ("it needs lemon"), so liking acid **in a finished dish** and liking
sour **as a standalone sensation** are different questions. Ask about the finishing squeeze,
not about sucking a lemon.

Discriminators: `straight lemon juice > vinegar-forward pickles, sauerkraut > sharp
vinaigrette > sour beer / kombucha > tomato, yoghurt > finishing squeeze of lemon`

### Funk — the most polarizing foods we have
Harris Poll / Instacart survey of divisive foods puts **anchovies, black licorice, and
oysters** at the top, then **capers, brussels sprouts, cilantro**. Nearly half of Americans
dislike black licorice; **41% dislike oysters**. These are excellent discriminators
precisely because they split the population near 50/50.

One caution: **cilantro is its own genetic thing** (*OR6A2*, soapy-smell perception), not a
funk marker. It deserves a standalone flag, never an axis weight.

Umami sensitivity is genuine (*TAS1R1/TAS1R3* variants) but is heavily shaped by exposure
and culture — detection thresholds differ between populations by diet. So funk is more
"what you grew up eating" than most axes.

### Adventure — there is a validated scale, and it's balanced
The **Food Neophobia Scale** (Pliner & Hobden, 1992) is 10 items, deliberately **5 worded
toward novelty and 5 against**, to cancel acquiescence bias. Thirty years of studies confirm
it holds up. It correlates with anxiety and experience-seeking, and notably **not with
"pickiness"** — those are separate constructs.

Lesson for us: balance the framing of adventure questions, and keep adventure separate from
the picky-eater toggle.

### Richness
Fat preference has its own validated instruments and relates to PROP status. The Leeds Food
Preference Questionnaire crosses **fat (high/low) × taste (sweet/savoury)** — a reminder
that richness and the sweet–savoury axis interact and shouldn't be asked about in the same
breath.

## 3. The design flaw we actually hit: confounded options

Conjoint analysis exists to separate the effects of multiple attributes in a single choice —
and it only works because attributes are **randomised across profiles**, so effects can be
statistically disentangled. With a fixed 16-question quiz we get none of that protection.
The literature's own warning applies directly: *the common design mistake is asking people
to compare too much at once.*

Our audit found **9 options carrying more than one sensory cue**, and worse, several with
cues in the prose that were **not scored at all**:

- "Charred broccolini — blistered black at the edges, **chili flake**, lemon" → scored
  bitter + acid, heat unscored. A chili-avoider is pushed off an option that would have read
  them correctly on two axes.
- "Avocado and chili — **lemon**, flaky salt, **a lot of chili flake**" → to express liking
  lemon you must accept heat.

**Rules adopted:**

1. **One axis per option wherever the dish allows.** If prose mentions a sensation, either
   score it or remove the word.
2. **Never leave an unscored cue in the text.** It repels people for reasons the model can't
   see — strictly worse than scoring it.
3. **Where a bundle is intrinsic** (kimchi genuinely is both funky and warm), follow up and
   ask which part drove the choice, rather than guessing.
4. **Isolate the finishing question.** Ask about lemon *alone* on a plain dish, not lemon
   riding along with three other things.

## 4. Traits worth capturing that we currently miss

- **Texture / mouthfeel** — already partly covered by the picky-eater flags, but it's the
  single biggest driver for children and for ARFID (see `selective-eating.md`). Crunch,
  slime, and mixed-texture aversions predict refusal better than flavour does.
- **Temperature preference** — some people want food hot, some warm; affects plating advice.
- **Salt** — real and inverted-U shaped. Would need optimum-style scoring.
- **Aroma-driven genetic quirks** — cilantro (*OR6A2*) is the famous one; treat as a flag.
- **Portion / richness tolerance over a meal** — someone may love a rich bite but not a rich
  plate. The Leeds instrument separates "liking" from "wanting" for exactly this reason.
- **Familiarity vs novelty for a given cuisine** — adventure is not one number; someone can
  be adventurous within Mexican food and conservative about seafood.

## Sources

- [Italian Taste: intensity vs liking, large-scale segmentation (Foods, n=2258)](https://pmc.ncbi.nlm.nih.gov/articles/PMC8750454/)
- [PROP taster status & food preference (PubMed)](https://pubmed.ncbi.nlm.nih.gov/23648895/)
- [Harvard Nutrition Source — supertasters vs non-tasters](https://nutritionsource.hsph.harvard.edu/2016/05/31/super-tasters-non-tasters-is-it-better-to-be-average/)
- [Rozin's benign masochism](https://www.sas.upenn.edu/~baron/journal/12/12502a/jdm12502a.html)
- [Spicy personality: traits and spicy food preference (Foods)](https://www.mdpi.com/2304-8158/15/3/559)
- [Food Neophobia Scale — 30-year systematic review](https://www.sciencedirect.com/science/article/abs/pii/S0950329321001245)
- [Leeds Food Preference Questionnaire](https://www.sciencedirect.com/science/article/abs/pii/S0950329319306792)
- [Genetic basis of umami perception (PLOS One)](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0006717)
- [Most polarizing foods — Harris/Instacart via CNN](https://www.cnn.com/travel/article/polarizing-foods-cilantro-olives-scn/index.html)
- [Scoville scale reference](https://www.chilipeppermadness.com/frequently-asked-questions/the-scoville-scale/)
- [Conjoint analysis & multidimensional choice](https://www.papersurvey.io/blog/discrete-choice-conjoint-analysis-surveys)
