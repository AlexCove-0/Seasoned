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

### Deliberately skipping
- Recipe videos (content treadmill we can't win; AI technique notes are our answer).
- Public community features (this is a family app; household notes cover it).
- Grocery-delivery integrations (Walmart/Instacart) — revisit only if the family asks.
