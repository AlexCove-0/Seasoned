/**
 * Grouping a shopping list by supermarket aisle, done with a keyword table
 * rather than an AI call: it's instant, free, works offline in the store,
 * and a wrong guess costs nothing (the item still appears, just under
 * "Other"). Order below is roughly the path through a typical store.
 */
export const AISLES = [
  "Produce",
  "Meat & Seafood",
  "Dairy & Eggs",
  "Bakery",
  "Pantry",
  "Spices & Seasoning",
  "Frozen",
  "Drinks",
  "Other",
] as const;

export type Aisle = (typeof AISLES)[number];

// Longer, more specific phrases must come before the generic word they
// contain -- "coconut milk" is Pantry, not Dairy, and "chicken stock" is
// Pantry, not Meat. First match wins, so order here is the whole design.
const KEYWORDS: [string, Aisle][] = [
  // Specific overrides first
  ["coconut milk", "Pantry"],
  ["almond milk", "Pantry"],
  ["oat milk", "Pantry"],
  ["buttermilk", "Dairy & Eggs"],
  ["peanut butter", "Pantry"],
  ["butter lettuce", "Produce"],
  ["sun-dried tomato", "Pantry"],
  ["canned tomato", "Pantry"],
  ["crushed tomato", "Pantry"],
  ["tomato paste", "Pantry"],
  ["tomato sauce", "Pantry"],
  ["frozen", "Frozen"],
  ["ice cream", "Frozen"],
  // Shelf-stable liquids, ahead of the animal they came from.
  ["stock", "Pantry"],
  ["broth", "Pantry"],
  ["bouillon", "Pantry"],
  // Ground/whole spices, ahead of the fresh vegetable of the same name.
  ["black pepper", "Spices & Seasoning"],
  ["white pepper", "Spices & Seasoning"],
  ["peppercorn", "Spices & Seasoning"],
  ["cayenne", "Spices & Seasoning"],
  ["chili powder", "Spices & Seasoning"],
  ["chili flake", "Spices & Seasoning"],
  ["red pepper flake", "Spices & Seasoning"],
  ["pepper flake", "Spices & Seasoning"],
  ["paprika", "Spices & Seasoning"],
  ["garlic powder", "Spices & Seasoning"],
  ["onion powder", "Spices & Seasoning"],
  ["dried ", "Spices & Seasoning"],
  ["olive", "Pantry"],
  ["caper", "Pantry"],
  ["pickle", "Pantry"],

  // Produce
  ["lettuce", "Produce"], ["spinach", "Produce"], ["kale", "Produce"],
  ["arugula", "Produce"], ["cabbage", "Produce"], ["radicchio", "Produce"],
  ["onion", "Produce"], ["shallot", "Produce"], ["scallion", "Produce"],
  ["garlic", "Produce"], ["ginger", "Produce"], ["carrot", "Produce"],
  ["celery", "Produce"], ["potato", "Produce"], ["tomato", "Produce"],
  ["pepper", "Produce"], ["chili", "Produce"], ["jalape", "Produce"],
  ["mushroom", "Produce"], ["zucchini", "Produce"], ["squash", "Produce"],
  ["broccoli", "Produce"], ["cauliflower", "Produce"], ["cucumber", "Produce"],
  ["avocado", "Produce"], ["corn", "Produce"], ["green bean", "Produce"],
  ["pea", "Produce"], ["asparagus", "Produce"], ["eggplant", "Produce"],
  ["lemon", "Produce"], ["lime", "Produce"], ["orange", "Produce"],
  ["apple", "Produce"], ["banana", "Produce"], ["berr", "Produce"],
  ["mango", "Produce"], ["pineapple", "Produce"], ["grape", "Produce"],
  ["melon", "Produce"], ["pear", "Produce"], ["peach", "Produce"],
  ["cilantro", "Produce"], ["parsley", "Produce"], ["basil", "Produce"],
  ["mint", "Produce"], ["dill", "Produce"], ["rosemary", "Produce"],
  ["thyme", "Produce"], ["sage", "Produce"], ["herb", "Produce"],
  ["lettuce", "Produce"], ["sprout", "Produce"], ["leek", "Produce"],

  // Meat & seafood
  ["chicken", "Meat & Seafood"], ["beef", "Meat & Seafood"],
  ["steak", "Meat & Seafood"], ["pork", "Meat & Seafood"],
  ["bacon", "Meat & Seafood"], ["sausage", "Meat & Seafood"],
  ["ham", "Meat & Seafood"], ["turkey", "Meat & Seafood"],
  ["lamb", "Meat & Seafood"], ["shrimp", "Meat & Seafood"],
  ["salmon", "Meat & Seafood"], ["tuna", "Meat & Seafood"],
  ["fish", "Meat & Seafood"], ["cod", "Meat & Seafood"],
  ["scallop", "Meat & Seafood"], ["anchov", "Meat & Seafood"],
  ["pancetta", "Meat & Seafood"], ["chorizo", "Meat & Seafood"],
  ["ground ", "Meat & Seafood"],

  // Dairy & eggs
  ["milk", "Dairy & Eggs"], ["cream", "Dairy & Eggs"],
  ["butter", "Dairy & Eggs"], ["cheese", "Dairy & Eggs"],
  ["parmesan", "Dairy & Eggs"], ["mozzarella", "Dairy & Eggs"],
  ["cheddar", "Dairy & Eggs"], ["feta", "Dairy & Eggs"],
  ["yogurt", "Dairy & Eggs"], ["egg", "Dairy & Eggs"],
  ["ricotta", "Dairy & Eggs"], ["mascarpone", "Dairy & Eggs"],

  // Bakery
  ["bread", "Bakery"], ["tortilla", "Bakery"], ["bun", "Bakery"],
  ["baguette", "Bakery"], ["pita", "Bakery"], ["naan", "Bakery"],
  ["roll", "Bakery"], ["breadcrumb", "Bakery"],

  // Spices & seasoning
  ["salt", "Spices & Seasoning"], ["cumin", "Spices & Seasoning"],
  ["paprika", "Spices & Seasoning"], ["cinnamon", "Spices & Seasoning"],
  ["curry", "Spices & Seasoning"], ["oregano", "Spices & Seasoning"],
  ["bay lea", "Spices & Seasoning"], ["chili powder", "Spices & Seasoning"],
  ["red pepper flake", "Spices & Seasoning"], ["nutmeg", "Spices & Seasoning"],
  ["turmeric", "Spices & Seasoning"], ["coriander", "Spices & Seasoning"],
  ["cardamom", "Spices & Seasoning"], ["saffron", "Spices & Seasoning"],
  ["seasoning", "Spices & Seasoning"], ["spice", "Spices & Seasoning"],

  // Drinks
  ["wine", "Drinks"], ["beer", "Drinks"], ["juice", "Drinks"],
  ["soda", "Drinks"], ["coffee", "Drinks"], ["tea", "Drinks"],

  // Pantry (last, so specifics above win)
  ["rice", "Pantry"], ["pasta", "Pantry"], ["spaghetti", "Pantry"],
  ["noodle", "Pantry"], ["flour", "Pantry"], ["sugar", "Pantry"],
  ["oil", "Pantry"], ["vinegar", "Pantry"], ["soy sauce", "Pantry"],
  ["fish sauce", "Pantry"], ["stock", "Pantry"], ["broth", "Pantry"],
  ["bean", "Pantry"], ["lentil", "Pantry"], ["chickpea", "Pantry"],
  ["quinoa", "Pantry"], ["oat", "Pantry"], ["honey", "Pantry"],
  ["mustard", "Pantry"], ["ketchup", "Pantry"], ["mayo", "Pantry"],
  ["hot sauce", "Pantry"], ["salsa", "Pantry"], ["canned", "Pantry"],
  ["nut", "Pantry"], ["seed", "Pantry"], ["baking", "Pantry"],
  ["cornstarch", "Pantry"], ["yeast", "Pantry"], ["vanilla", "Pantry"],
];

/** Best-guess aisle for a shopping-list line like "2 tbsp olive oil". */
export function aisleFor(itemName: string): Aisle {
  const text = itemName.toLowerCase();
  for (const [keyword, aisle] of KEYWORDS) {
    if (text.includes(keyword)) return aisle;
  }
  return "Other";
}

/** Groups items by aisle, in store-walk order, skipping empty aisles. */
export function groupByAisle<T>(
  items: T[],
  nameOf: (item: T) => string,
): { aisle: Aisle; items: T[] }[] {
  const buckets = new Map<Aisle, T[]>();
  for (const item of items) {
    const aisle = aisleFor(nameOf(item));
    const bucket = buckets.get(aisle);
    if (bucket) bucket.push(item);
    else buckets.set(aisle, [item]);
  }
  return AISLES.filter((a) => buckets.has(a)).map((aisle) => ({
    aisle,
    items: buckets.get(aisle)!,
  }));
}
