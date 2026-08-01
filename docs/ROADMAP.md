# Sazón Roadmap

*Written 2026-07-31, after a competitive look at Tasty, ReciMe, NYT Cooking, and Epicurious.
Goal: make Sazón the app the family actually opens every day.*

## What the big four do

### Tasty (BuzzFeed)
- **Video-first**: every recipe has a looping overhead video; the brand *is* the video format.
- **Cook mode**: each step fills the screen, won't advance until you tap, keeps the phone awake.
- **Botatouille**: AI chat (ChatGPT-based) for "what can I make with what's in my fridge."
- **Shoppable recipes**: Walmart integration for grocery delivery from a recipe.
- Recommendations keyed to time of day / day of week / holidays.

### ReciMe
- **Import from anywhere** is the whole product: URL, Instagram, TikTok, YouTube, Pinterest,
  screenshots, photos of handwritten recipes or cookbook pages.
- Custom cookbooks (folders), drag-and-drop weekly meal planner.
- Grocery list auto-generated from the plan, sorted by supermarket aisle or by recipe.
- Per-recipe calorie calculation. Freemium: 5 imports/week free, $39.99/yr unlimited.

### NYT Cooking
- **Editorial quality**: professional photography carries the app; clean typography.
- Recipe Box with auto-categorization + custom folders ("Want To Cook").
- Editor-published **Weekly Plan**; 125+ curated collections.
- **Community notes** on every recipe — swaps, tips, fixes from other cooks (beloved feature).
- Grocery list combined across recipes, grouped by aisle.
- Technique guides and videos as evergreen content.

### Epicurious
- 50k+ recipes across Condé Nast brands; reviews/ratings from home cooks.
- **Smart timer** (reads cook times from the recipe), seasonal ingredient finder.
- Advanced filtered search (meal type, ingredient, diet, occasion).

## Overlap map

| Feature | Tasty | ReciMe | NYT | Epicurious | Sazón today |
|---|---|---|---|---|---|
| Recipe box / folders | ✓ | ✓ | ✓ | ✓ | ✓ (flat list + carousels) |
| Step-through cook mode | ✓ | – | ✓ | – | ✓ |
| Grocery list from recipes | ✓ | ✓ | ✓ | – | ✓ (basic) |
| Aisle-grouped list | – | ✓ | ✓ | – | – |
| Weekly meal plan | – | ✓ | ✓ | – | – |
| Import from anywhere | – | ✓✓ | – | – | URL only |
| AI chat / generation | ✓ | – | – | – | ✓✓ (core loop) |
| Taste personalization | light | – | light | light | ✓✓ (flavor quiz + profiles) |
| Cook history / ratings | – | – | notes | reviews | ✓✓ (cook logs) |
| Photos/video on recipes | ✓✓ | ✓ | ✓✓ | ✓✓ | **none** |
| Community/family notes | – | – | ✓✓ | ✓ | partial (cook logs are private-ish) |

**Sazón's moat** (nobody else has it): recipes born from conversation, a real taste-profile
system feeding the AI, and compounding cook logs. Don't chase their content libraries —
they can't chase our personalization.

**Sazón's glaring gap**: zero imagery. Every competitor leads with pictures; food apps sell
with the eyes. Second gap: no meal planning, which is what makes an app *daily* rather than
*night-of*.

## Design trends worth stealing

- Photography does the heavy lifting; typography stays quiet (NYT). Our "Clean Counter"
  theme is compatible — add images, keep the calm.
- Full-screen, tap-to-advance cook steps with **screen wake lock** (Tasty).
- Ingredient checklists you can cross off while shopping/cooking (NYT).
- Voice/hands-free step navigation is the 2026 trend ("next step" with dough hands).
- AI as copilot, not autopilot — present, optional (already our philosophy).

## Roadmap

### Phase 1 — Looks like dinner (imagery + kitchen ergonomics)
The cheapest, highest-impact fixes for daily desire to open the app.
1. **Recipe photos**: camera/photo upload on the recipe and on each cook log ("how mine
   turned out" — family history in pictures). Supabase Storage.
2. Photo thumbnails in carousels, recipe list, and recipe page hero.
3. **Wake lock** in cooking mode (Screen Wake Lock API) + bigger tap targets for greasy hands.
4. Ingredient check-off in cooking mode and shopping list.

### Phase 2 — Plan the week (the daily-open habit)
5. **This Week planner**: assign recipes to days (drag or tap), breakfast/lunch/dinner slots
   optional — dinner-first keeps it simple.
6. Shopping list generated from the week's plan, **grouped by aisle**, minus pantry staples
   (staples logic already exists).
7. Home screen becomes "Tonight": what's planned, who's eating (dining groups picker —
   task #20), one tap into cooking mode.

### Phase 3 — Capture everything (ReciMe's trick, but ours is smarter)
8. **Import from a photo/screenshot**: snap a cookbook page or handwritten card; Claude
   vision extracts structured recipe. We already have the structured-recipe pipeline —
   this is mostly a new input path.
9. Instagram/TikTok/YouTube link import (fetch caption/transcript, extract recipe).
10. Imports run through the taste-profile lens: "Cris will love this, go easy on the heat."

### Phase 4 — Family glue
11. **Family notes on recipes** (NYT's most-loved feature, household-scoped): "used half the
    sugar, kids preferred it."
12. After-dinner nudge: previously cooked tonight's plan → prompt for rating/photo/note.
13. Weekly recap: what we cooked, top-rated dish, streaks. Shareable.
14. Kid mode / picky-eater picks driven by the flavor profiles.

### Phase 5 — Delight (later, earn it first)
15. Voice step navigation in cooking mode ("next", "read ingredients").
16. Inline timers parsed from steps (Epicurious smart timer, but automatic).
17. Seasonal/holiday suggestions keyed to the calendar (Tasty does this well).

## Idea backlog (from real cooking life)

*2026-07-31, from Alex — the al dente problem.* Alex likes pasta under, his wife likes
it over, and her preference wins because he doesn't feel strongly. Three product ideas
fall out of that one dinner:

- **Split-the-difference technique.** When diners' profiles conflict on a dish, the AI
  shouldn't average them — it should resolve the conflict *in the steps* where possible:
  "pull half the spaghetti at 9 minutes, give the rest 2 more." A human chef would never
  force one doneness on a table of two. Static recipe apps can't do this; a generated
  recipe that knows tonight's diners can. Sauce heat (split before adding chili), doneness,
  dressing on the side — lots of conflicts are cheap to split late in the cook.
- **Preference intensity, not just direction.** "Her preference wins b/c I don't really
  care" is data: two people at the same point on a flavor axis can hold it with different
  strength. A light "how much do you care?" dimension on profile answers (or inferred from
  who defers in ratings/notes) would let the chef weight tonight's compromise honestly.
  Related social patterns worth supporting someday: turn-taking ("whose night wins"),
  kids'-choice nights.
- **The effort dial.** (Alex, 2026-07-31) Preference-matching must never make dinner
  harder for someone who's just trying to get food on the table. Splitting the pasta is
  for the night you have the bandwidth; a parent cooking for 3 kids may want one pot,
  period. So per-cook, the chef should ask (or remember) an effort level — **"Quick and
  done"** vs **"Cooked to order"** — and only propose forks in the steps when invited.
  (Borrowed from restaurant vernacular: *to order* means each plate made to that diner's
  spec instead of batched — exactly the distinction, and it reads as care rather than
  extra work.) Same household, different nights, different answers.
- **Kid profiles: texture and structure, not just flavor.** (Alex, 2026-07-31, from his
  4½-year-old) The seven flavor axes measure *taste*, but picky eating is often about
  *structure and texture*: her foods must not be mixed (plain noodles = great, sauced
  noodles = ruined), loves cherry tomatoes and most fruit but not blueberries, lactose
  intolerant. What that needs:
  - Specific item likes/dislikes and intolerances already fit the existing profile
    fields — that part works today.
  - A structural/texture dimension does not exist yet: "components separate", "sauce on
    the side", texture aversions (mushy, slimy...). Probably profile flags, not axes.
  - The payoff connects to the effort dial and split-technique ideas: "plate hers before
    saucing" is a one-line fork the chef can write into the steps — deconstructing a
    meal for one diner is cheap when the recipe knows to do it.
  - A kid-appropriate way to *capture* this (parent fills it in, or a fun mini-quiz)
    is its own design question.
- **Selective eating & sensory needs** — researched 2026-07-31, full writeup in
  [selective-eating.md](selective-eating.md). Short version: texture drives refusal far
  more than flavor for autistic/ARFID kids; the evidence-based toolkit is food chaining,
  SOS-style desensitization, Satter's Division of Responsibility, and 12–15 neutral
  exposures; pressure reliably backfires, so Sazón counts *offers*, never *eating*.
  Feature directions: safe-foods list + texture/structure flags on profiles, fork steps
  in generated recipes ("pull her portion now — before the sauce"), optional bridge-food
  suggestions, an exposure log. Positioning: supports home practice, is not therapy.
- **Standalone, shareable taste quiz.** (Alex, 2026-07-31) Not everyone will install
  the app. Some people just want to take the taste test — for fun, or to hand the
  result to whoever cooks for them. Make the flavor quiz work logged-out: public URL,
  take it, get your archetype + axes, share the result to the family cook (who *does*
  use the app) or via a link. The invite questionnaire already proved the pattern of
  public, no-login profile capture; this extends it to the full quiz and doubles as
  the app's natural growth loop ("share with the person who actually cooks").
- **Profiles that learn from cooking.** The quiz is a snapshot; the cook logs are the
  stream. But (Alex, 2026-07-31, "the Cholula problem"): behavior is context-bound while
  preferences are durable — someone who put hot sauce on everything for a week was
  probably camping, not becoming a heat person. Design principles that fall out:
  - *Most adjustments are about the dish, not the person.* "Added 2 min" usually means
    the recipe was miscalibrated. So learn at two levels with different bars:
  - *Dish-level learning* (low risk, do first): "You've added extra garlic to this dish
    twice — bake it in?" A recipe correcting toward how the family actually cooks it.
  - *Person-level learning* (high bar): only propose moving a flavor axis when the same
    signal shows up across many *different* dishes over a long window — that's the filter
    that drops the camping trip. One dish adjusted repeatedly = the dish. Twenty dishes
    drifting the same direction over months = the person.
  - *Propose, never silently drift.* "More heat across 14 cooks since spring — bump your
    heat axis?" lets vacation-me get vetoed by home-me. `flavor_profile_history` already
    exists to record confirmed changes; needs more design before building.

### Deliberately skipping
- Recipe videos (content treadmill we can't win; AI technique notes are our answer).
- Public community features (this is a family app; household notes cover it).
- Grocery-delivery integrations (Walmart/Instacart) — revisit only if the family asks.
