// The catalogue's controlled vocabulary — the one place every allowed value lives.
//
// The product model validates against it, the migration normalises old data to
// it, the API exposes it for filters, and the shop assistant maps a shopper's
// words onto it. Add a value here and every part of the system knows it.

const DEPARTMENTS = ["women", "men", "kids", "accessories"];

// Kept in `product.category` (the URL segment the site already uses).
const STYLES = ["casual", "formal", "party", "gym", "traditional"];

const OCCASIONS = ["everyday", "office", "wedding-guest", "mehndi", "eid", "party", "evening", "gym", "travel", "beach", "winter-events"];
const SEASONS = ["spring", "summer", "autumn", "winter", "all-season"];
const FITS = ["slim", "regular", "relaxed", "oversized", "tailored"];
const PATTERNS = ["solid", "striped", "checked", "printed", "embroidered", "textured", "block-print"];
const FABRIC_WEIGHTS = ["light", "medium", "heavy"];
const STATUSES = ["active", "draft", "archived"];

// Categories (stored in `product.subcategory`). Synonyms are how the assistant
// understands shoppers: "pants" and "chinos" both mean trousers.
const CATEGORIES = [
  { slug: "shirts", name: "Shirts", departments: ["men", "women"], synonyms: ["shirt", "button-down", "oxford", "overshirt", "blouse shirt"] },
  { slug: "t-shirt", name: "T-shirts & polos", departments: ["men", "women"], synonyms: ["tee", "tees", "tshirt", "t-shirts", "polo", "polos", "tank", "vest"] },
  { slug: "tops", name: "Tops & blouses", departments: ["women"], synonyms: ["top", "blouse", "blouses", "camisole"] },
  { slug: "dresses", name: "Dresses & gowns", departments: ["women", "kids"], synonyms: ["dress", "gown", "gowns", "frock", "kaftan", "maxi", "midi", "mini dress"] },
  { slug: "kurta", name: "Kurtas & sets", departments: ["men", "women"], synonyms: ["kurtas", "kurti", "shalwar kameez", "shalwar", "kameez", "eastern", "lawn suit"] },
  { slug: "trousers", name: "Trousers", departments: ["men", "women"], synonyms: ["pants", "chinos", "slacks", "wide-leg", "joggers", "jogger", "trouser"] },
  { slug: "jeans", name: "Jeans & denim", departments: ["men", "women"], synonyms: ["denim", "jean"] },
  { slug: "shorts", name: "Shorts", departments: ["men", "women"], synonyms: ["short"] },
  { slug: "knitwear", name: "Knitwear", departments: ["men", "women"], synonyms: ["sweater", "jumper", "cardigan", "pullover", "knit"] },
  { slug: "jacket", name: "Jackets & suits", departments: ["men"], synonyms: ["jackets", "suit", "suits", "blazer", "sport coat", "trucker"] },
  { slug: "blazer", name: "Blazers", departments: ["women"], synonyms: ["blazers", "tailored jacket"] },
  { slug: "outerwear", name: "Coats & outerwear", departments: ["men", "women"], synonyms: ["coat", "coats", "trench", "overcoat", "parka"] },
  { slug: "leggings", name: "Activewear", departments: ["women"], synonyms: ["legging", "activewear", "sports bra", "yoga", "gym set"] },
  { slug: "shoes", name: "Shoes", departments: ["men", "women"], synonyms: ["shoe", "loafers", "loafer", "sneakers", "trainers", "derby", "boots"] },
  { slug: "boys-clothing", name: "Boys", departments: ["kids"], synonyms: ["boys", "boy"] },
  { slug: "girls-clothing", name: "Girls", departments: ["kids"], synonyms: ["girls", "girl"] },
  { slug: "bags", name: "Bags", departments: ["accessories"], synonyms: ["bag", "handbag", "tote", "satchel", "crossbody", "weekender", "messenger", "purse"] },
  { slug: "scarves", name: "Scarves", departments: ["accessories"], synonyms: ["scarf", "shawl", "stole", "dupatta"] },
  { slug: "eyewear", name: "Sunglasses", departments: ["accessories"], synonyms: ["sunglasses", "glasses", "shades"] },
];

// Old free-text values found in the data, and where they now belong.
const LEGACY_CATEGORY = { shirt: "shirts", pants: "trousers", joggers: "trousers" };

// Colour names grouped into the families shoppers actually search by.
const COLOR_FAMILIES = {
  black: ["black", "charcoal", "jet", "onyx"],
  white: ["white", "ivory", "ecru", "off-white", "cream", "natural", "oat"],
  grey: ["grey", "gray", "dove grey", "slate", "silver", "heather grey"],
  blue: ["blue", "navy", "light blue", "sky blue", "indigo", "denim", "cobalt", "teal"],
  red: ["red", "crimson", "maroon", "burgundy", "wine", "coral"],
  pink: ["pink", "blush", "rose", "fuchsia"],
  green: ["green", "olive", "sage", "mint", "emerald", "khaki green"],
  brown: ["brown", "tan", "camel", "cognac", "chocolate", "tortoise", "khaki", "beige", "sand"],
  yellow: ["yellow", "mustard", "gold", "butter"],
  orange: ["orange", "rust", "saffron", "terracotta"],
  purple: ["purple", "lilac", "violet", "plum", "lavender"],
};

const colorFamilyOf = (name) => {
  const value = String(name || "").trim().toLowerCase();
  for (const [family, names] of Object.entries(COLOR_FAMILIES)) if (names.includes(value)) return family;
  for (const [family, names] of Object.entries(COLOR_FAMILIES)) if (names.some((n) => value.includes(n))) return family;
  return "";
};

// Sizes normalised for display and comparison ("s" -> "S", "2-3y" stays as is).
const normaliseSize = (size) => {
  const value = String(size || "").trim();
  if (/^(xxs|xs|s|m|l|xl|xxl|xxxl)$/i.test(value)) return value.toUpperCase();
  if (/^one size$/i.test(value)) return "One size";
  if (/^s\/m$|^l\/xl$/i.test(value)) return value.toUpperCase();
  return value;
};

// A shopper's word -> category slug ("frock" -> "dresses"), or "".
const categoryForWord = (word) => {
  const w = String(word || "").trim().toLowerCase();
  if (!w) return "";
  for (const c of CATEGORIES) if (c.slug === w || c.name.toLowerCase() === w || c.synonyms.includes(w)) return c.slug;
  return LEGACY_CATEGORY[w] || "";
};

const slugify = (value) => String(value || "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

module.exports = {
  DEPARTMENTS, STYLES, OCCASIONS, SEASONS, FITS, PATTERNS, FABRIC_WEIGHTS, STATUSES,
  CATEGORIES, LEGACY_CATEGORY, COLOR_FAMILIES,
  colorFamilyOf, normaliseSize, categoryForWord, slugify,
};
