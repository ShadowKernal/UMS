export type MacroBreakdown = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type Ingredient = {
  name: string;
  qty: number;
  unit: string;
  category: string;
};

export type Meal = {
  id: string;
  name: string;
  image: string;
  diet: string[];
  time: number;
  cost: "value" | "balanced" | "premium";
  macros: MacroBreakdown;
  ingredients: Ingredient[];
  notes?: string;
};

export const weeklyPlan: Meal[] = [
  {
    id: "ginger-chicken",
    name: "Ginger Sesame Chicken Bowls",
    image: "https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg/preview",
    diet: ["balanced", "high-protein", "low-carb"],
    time: 30,
    cost: "balanced",
    macros: { calories: 520, protein: 46, carbs: 35, fat: 18 },
    ingredients: [
      { name: "chicken thigh", qty: 400, unit: "g", category: "protein" },
      { name: "jasmine rice", qty: 200, unit: "g", category: "grains" },
      { name: "edamame", qty: 180, unit: "g", category: "produce" },
      { name: "sesame oil", qty: 2, unit: "tbsp", category: "pantry" },
      { name: "ginger", qty: 20, unit: "g", category: "produce" }
    ],
    notes: "Batch-friendly and reheats well for lunches."
  },
  {
    id: "salmon-miso",
    name: "Miso Glazed Salmon + Greens",
    image: "https://www.themealdb.com/images/media/meals/xxrxux1503070723.jpg/preview",
    diet: ["balanced", "pescatarian", "low-carb", "high-protein"],
    time: 22,
    cost: "premium",
    macros: { calories: 480, protein: 42, carbs: 20, fat: 24 },
    ingredients: [
      { name: "salmon", qty: 350, unit: "g", category: "protein" },
      { name: "broccolini", qty: 220, unit: "g", category: "produce" },
      { name: "miso paste", qty: 2, unit: "tbsp", category: "pantry" },
      { name: "sesame seeds", qty: 1, unit: "tbsp", category: "pantry" }
    ],
    notes: "Glaze + roast for a 20 minute dinner."
  },
  {
    id: "tofu-peanut",
    name: "Crispy Tofu Peanut Crunch",
    image: "https://www.themealdb.com/images/media/meals/rvxxuy1468312893.jpg/preview",
    diet: ["plant-based", "balanced"],
    time: 25,
    cost: "value",
    macros: { calories: 510, protein: 32, carbs: 55, fat: 18 },
    ingredients: [
      { name: "extra firm tofu", qty: 400, unit: "g", category: "protein" },
      { name: "brown rice", qty: 200, unit: "g", category: "grains" },
      { name: "red cabbage", qty: 180, unit: "g", category: "produce" },
      { name: "peanut sauce", qty: 120, unit: "ml", category: "pantry" },
      { name: "lime", qty: 1, unit: "pc", category: "produce" }
    ],
    notes: "Press tofu, crisp hard, and finish with lime."
  },
  {
    id: "turkey-pasta",
    name: "Lean Turkey Ragu Pasta",
    image: "https://www.themealdb.com/images/media/meals/sutysw1468247559.jpg/preview",
    diet: ["balanced", "high-protein"],
    time: 28,
    cost: "value",
    macros: { calories: 590, protein: 52, carbs: 62, fat: 16 },
    ingredients: [
      { name: "ground turkey", qty: 500, unit: "g", category: "protein" },
      { name: "rigatoni", qty: 260, unit: "g", category: "grains" },
      { name: "marinara", qty: 320, unit: "ml", category: "pantry" },
      { name: "onion", qty: 1, unit: "pc", category: "produce" },
      { name: "parmesan", qty: 40, unit: "g", category: "dairy" }
    ],
    notes: "Comfort food that still hits protein targets."
  },
  {
    id: "chia-parfait",
    name: "Protein Chia Parfait",
    image: "https://www.themealdb.com/images/media/meals/ysqrus1487425681.jpg/preview",
    diet: ["balanced", "plant-based", "high-protein", "pescatarian"],
    time: 10,
    cost: "value",
    macros: { calories: 320, protein: 26, carbs: 28, fat: 12 },
    ingredients: [
      { name: "protein yogurt", qty: 200, unit: "g", category: "dairy" },
      { name: "chia seeds", qty: 2, unit: "tbsp", category: "pantry" },
      { name: "berries", qty: 120, unit: "g", category: "produce" },
      { name: "almonds", qty: 20, unit: "g", category: "pantry" }
    ],
    notes: "Quick breakfast or recovery snack."
  },
  {
    id: "sheet-pan",
    name: "Sheet Pan Veggie & Sausage",
    image: "https://www.themealdb.com/images/media/meals/sxysrt1468240488.jpg/preview",
    diet: ["balanced", "high-protein", "pescatarian"],
    time: 30,
    cost: "balanced",
    macros: { calories: 540, protein: 38, carbs: 42, fat: 22 },
    ingredients: [
      { name: "chicken sausage", qty: 360, unit: "g", category: "protein" },
      { name: "sweet potato", qty: 300, unit: "g", category: "produce" },
      { name: "zucchini", qty: 200, unit: "g", category: "produce" },
      { name: "olive oil", qty: 2, unit: "tbsp", category: "pantry" }
    ],
    notes: "One pan dinner, easy cleanup."
  }
];

export type FoodFinderItem = {
  name: string;
  source: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
  note?: string;
};

export const foodFinderSamples: FoodFinderItem[] = [
  {
    name: "Chicken thigh, roasted",
    source: "Foundation 168123",
    calories: 209,
    protein: 26,
    carbs: 0,
    fat: 11,
    category: "protein",
    note: "skinless, bone removed"
  },
  {
    name: "Atlantic salmon",
    source: "SR Legacy 15236",
    calories: 208,
    protein: 22,
    carbs: 0,
    fat: 13,
    category: "protein",
    note: "raw, farmed"
  },
  {
    name: "Extra firm tofu",
    source: "FNDDS 63111110",
    calories: 144,
    protein: 17,
    carbs: 4,
    fat: 8,
    category: "protein",
    note: "pressed and ready to crisp"
  },
  {
    name: "Steel-cut oats",
    source: "FNDDS 51106100",
    calories: 150,
    protein: 5,
    carbs: 27,
    fat: 3,
    category: "pantry",
    note: "dry, 40g"
  },
  {
    name: "Jasmine rice",
    source: "SR Legacy 10968",
    calories: 180,
    protein: 4,
    carbs: 38,
    fat: 1,
    category: "grains",
    note: "cooked, 1 cup"
  },
  {
    name: "Greek yogurt, 0% fat",
    source: "Foundation 174785",
    calories: 100,
    protein: 17,
    carbs: 6,
    fat: 0,
    category: "dairy",
    note: "per 170g cup"
  },
  {
    name: "Broccolini",
    source: "Foundation 169910",
    calories: 50,
    protein: 5,
    carbs: 9,
    fat: 0,
    category: "produce",
    note: "raw, 150g"
  },
  {
    name: "Chickpeas",
    source: "SR Legacy 16057",
    calories: 180,
    protein: 10,
    carbs: 30,
    fat: 3,
    category: "pantry",
    note: "canned, 1 cup"
  }
];

export type FeatureCallout = {
  title: string;
  description: string;
  tag: string;
};

export const featureCallouts: FeatureCallout[] = [
  {
    title: "Meal planning core",
    tag: "Planner",
    description: "Weekly plan, macros, batch cooking, and live grocery lists tailored to your diet style."
  },
  {
    title: "UMS login + dashboard",
    tag: "Identity",
    description: "Account creation, password resets, verification, and gated dashboards are already wired up."
  },
  {
    title: "Actionable analytics",
    tag: "Insights",
    description: "Push saved plans into UMS analytics to track adherence, churn, and nutrition at a glance."
  }
];
