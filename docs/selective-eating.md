# Selective eating, sensory needs, and how Sazón can help

*Research notes, 2026-07-31. Context: Alex's daughter (4½) is a typical picky eater —
no-mixed-foods, texture-driven preferences, already improving with age, not autistic.
The observation that prompted this research: parents of kids with special needs face a
much more intense, longer-lasting version of the same dinner problem, and the same
features that help a typical 4-year-old's family should scale up to help them too. The
research below is mostly about that clinical end (autism, ARFID); the no-pressure and
exposure principles apply across the whole range.*

## What the research says

**Texture is the main event, not flavor.** Around 90% of autistic individuals experience
sensory symptoms, and 30–50%+ of autistic kids refuse foods specifically over texture. One
study found 70% of autistic children choose food based on texture versus 11% of
non-autistic children. Mushy/slimy are the most commonly-aversive textures; "consistent"
foods (crunchy, uniform, predictable — nuggets, crackers, plain noodles) are favored
because every bite is the same. This validates the earlier insight that our flavor axes
miss the dimension that matters most for kids: structure and texture.

**ARFID is the clinical end of the spectrum.** Avoidant/Restrictive Food Intake Disorder
overlaps heavily with autism (estimates: 12.5–33% of ARFID cases are autistic). Parents
of these kids aren't dealing with "picky eating" — they're managing a small, rigid set of
*safe foods*, and a bad substitution (wrong brand, broken cracker) can end a meal.

**What works — the evidence-based toolkit:**
- **Food chaining**: start from an accepted safe food and take tiny steps along shared
  sensory properties (plain noodle → buttered noodle → buttered noodle with one fleck of
  parsley). Respects the child's existing preferences instead of fighting them.
- **SOS (Sequential Oral Sensory) approach**: systematic desensitization up a ladder of
  interaction — tolerate the food nearby → touch → smell → taste → eat. Any step up the
  ladder is a win; eating is not the only success.
- **Satter's Division of Responsibility (DOR)**: the parent decides *what, when, where*;
  the child decides *whether and how much*. Backed by validated measures; the core
  insight is that pressure — even gentle pressure — reliably *reduces* acceptance.
- **Repeated neutral exposure**: children typically need 12–15 no-pressure exposures to a
  new food before accepting it. "Exposure" means it was on the table, not that it was
  eaten. Most parents give up after 3–5 tries because they're counting the wrong thing.

**A caution on ABA framing.** ABA-derived feeding interventions (escape extinction,
contingent rewards, forced bites) are strongly criticized by autistic adults and the
neurodiversity community, and the field itself is shifting toward autonomy-respecting
models. Design rule for Sazón: **support exposure, never compliance.** No streaks for
eating, no rewards for finishing, no "she has to try one bite" mechanics. We count
*offers* (the parent's job under DOR), never *consumption* (the child's).

**The competitive landscape** already has dedicated apps (EatPal does per-kid safe-food
lists + food-chaining meal plans; Safe Snacker does menu/ingredient scanning). Their gap:
they treat the selective eater in isolation. Sazón's natural angle is the opposite — **one
family dinner that already includes the selective eater**, because the chef knows everyone
at the table and writes the accommodation into the recipe itself.

## Feature directions (all fit the existing architecture)

1. **Safe-foods list on the profile.** A third category alongside likes/dislikes:
   always-accepted foods, with the specificity parents actually need ("plain spaghetti,
   buttered, no visible herbs"). Feeds the chef prompt the same way tastes already do.

2. **Texture & structure flags on the profile.** No-mixing / components-separate,
   sauce-on-the-side, texture aversions (mushy, slimy, gritty...), brand/preparation
   rigidity notes. Flags, not axes — these are constraints, not preferences on a spectrum.

3. **Fork steps in generated recipes** (solves Alex's own pain point directly). When the
   chef accommodates a diner ("plate hers before saucing"), that fork becomes an actual
   numbered step, so cooking mode surfaces "**Pull [her] portion now** — before adding the
   sauce" at exactly the right moment instead of relying on a tired parent's memory.
   Under "Cooked to order" this is automatic; under "Quick and done" the chef just picks
   dishes that are naturally safe for everyone.

4. **Bridge-food suggestions (food chaining, gently).** With the effort dial turned up,
   the chef can offer one optional exposure per meal, derived from a safe food: "She
   likes plain noodles — consider setting one buttered noodle with a tiny fleck of
   parsley on the side of her plate. No ask, no comment." Always on-the-side, always
   framed as exposure-without-expectation.

5. **Exposure tracking, not eating tracking.** A lightweight per-child log of *offers*
   ("parsley noodle: offered 4 times"). Because 12–15 exposures is the mechanism and
   parents systematically undercount, showing "offered 9x — keep going" reframes what
   success means mid-journey. Explicitly not a "did she eat it" tracker.

6. **The "picky eater" toggle — how all of this gets captured.** (Alex, 2026-07-31)
   When setting up a profile for a kid (or anyone), one plain-language question: *"Is
   ___ a picky eater?"* Toggling it on progressively discloses the deeper questions;
   everyone else keeps the short setup. Follow-ups, all skippable, checklist-style:
   safe foods (free text, encourage specificity), textures to avoid (mushy, slimy,
   gritty, mixed...), structure rules (no touching/mixing, sauce on side, components
   separate), and optionally "anything they're warming up to?" (seeds the exposure
   features). The toggle itself is signal even with zero follow-ups answered — the chef
   knows to keep that diner's portion simple and separable. And it's reversible: as a
   kid's palate expands, flipping it off is a milestone, not a settings chore.

7. **Positioning guardrail.** Sazón is a family cooking app that supports what feeding
   therapists assign as home practice (chaining, neutral exposure, DOR mealtimes). It is
   not therapy, makes no clinical claims, and should say so wherever these features
   surface. If a family works with an OT/SLP/feeding therapist, the safe-foods list and
   exposure log are useful things to bring to appointments.

## Sources

- [Food selectivity and sensory sensitivity in children with ASD (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC3601920/)
- [Food texture acceptance, sensory sensitivity, and food neophobia in children (PMC)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8535628/)
- [ARFID and autism overview (Priory)](https://www.priorygroup.com/blog/arfid-and-autism)
- [SOS Approach to Feeding](https://sosapproachtofeeding.com/) and [feasibility study (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC11940901/)
- [Food chaining overview (Expansion Speech Therapy)](https://expansionspeechtherapy.com/2025/05/12/picky-eating-strategies-101-food-chaining/)
- [Ellyn Satter Institute — Division of Responsibility](https://www.ellynsatterinstitute.org/introducing-new-foods/)
- [Therapist Neurodiversity Collective on feeding therapy](https://therapistndc.org/therapy/feeding-therapy/)
- [EatPal](https://tryeatpal.com/) — closest existing app in this space
