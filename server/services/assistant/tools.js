// The catalogue tools: the only way the assistant reads products.
//
// The model never writes a query. It passes words; this file maps them onto the
// controlled vocabulary (services/catalog/taxonomy.js) — "frock" -> dresses,
// "navy" -> the blue family, "wedding" -> wedding-guest — builds the query in
// code with every input escaped or validated, and ranks by meaning when the
// shopper describes something in their own words. Prices, stock and sizes in
// the results always come from the database, never from the model.
const Product = require("../../models/store").default;
const Label = require("../../models/label");
const taxonomy = require("../catalog/taxonomy");
const { embedQuery, cosine } = require("../catalog/embeddings");

const PAGE_SIZE = 6;
const MAX_TEXT = 80;
const SEMANTIC_POOL = 400; // shortcut: in-memory ranking over the filtered pool; move to Atlas $vectorSearch past a few thousand products

// ── input hygiene ──────────────────────────────────────────────────────────

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const cleanText = (value) => (typeof value === "string" ? value.trim().slice(0, MAX_TEXT) : "");
const exactIgnoreCase = (value) => new RegExp(`^${escapeRegex(cleanText(value))}$`, "i");
const containsIgnoreCase = (value) => new RegExp(escapeRegex(cleanText(value)), "i");
const clampNumber = (value, min, max) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : undefined;
};
const oneOf = (value, allowed) => {
  const v = cleanText(value).toLowerCase().replace(/\s+/g, "-");
  return allowed.includes(v) ? v : "";
};

// Shopper words for occasions and seasons that are not the vocabulary itself.
const OCCASION_WORDS = {
  wedding: "wedding-guest", "wedding guest": "wedding-guest", shaadi: "wedding-guest", barat: "wedding-guest", valima: "wedding-guest",
  work: "office", business: "office", meeting: "office", interview: "office",
  holiday: "travel", vacation: "travel", trip: "travel", "beach holiday": "beach",
  dinner: "evening", date: "evening", "night out": "evening", gala: "evening",
  workout: "gym", training: "gym", running: "gym", yoga: "gym",
  "eid ul fitr": "eid", "eid ul adha": "eid", festive: "eid", christmas: "winter-events", "new year": "party",
  daily: "everyday", casual: "everyday",
};
const SEASON_WORDS = { fall: "autumn", "hot weather": "summer", warm: "summer", cold: "winter", "cold weather": "winter" };

const occasionFrom = (w) => oneOf(w, taxonomy.OCCASIONS) || OCCASION_WORDS[cleanText(w).toLowerCase()] || "";
const seasonFrom = (w) => oneOf(w, taxonomy.SEASONS) || SEASON_WORDS[cleanText(w).toLowerCase()] || "";
const colorFamilyFrom = (w) => {
  const v = cleanText(w).toLowerCase();
  return taxonomy.COLOR_FAMILIES[v] ? v : taxonomy.colorFamilyOf(v);
};

// Keyword fallback when semantic search is unavailable.
const expandTerms = (query) => {
  const words = cleanText(query).toLowerCase().split(/\s+/).filter((w) => w.length > 1).slice(0, 8);
  return [...new Set(words)];
};
const TEXT_FIELDS = ["name", "description", "brand", "subcategory", "material", "tags"];

// ── query building ─────────────────────────────────────────────────────────

/**
 * Filters (all optional, all already normalised): genre, subcategory, style,
 * occasion, season, colorFamily, size, material, brand, fit, pattern,
 * fabricWeight, minPrice, maxPrice, inStockOnly, terms (keyword fallback).
 */
const buildFilter = (f) => {
  const and = [{ status: "active" }];

  // Size and colour are checked on the same variant, so "M in navy" means a navy M exists.
  if (f.size || (f.inStockOnly && f.colorFamily)) {
    and.push({
      variants: {
        $elemMatch: {
          ...(f.size ? { size: exactIgnoreCase(taxonomy.normaliseSize(f.size)) } : {}),
          ...(f.colorFamily ? { colorFamily: f.colorFamily } : {}),
          ...(f.inStockOnly ? { stock: { $gt: 0 } } : {}),
        },
      },
    });
  } else if (f.inStockOnly) {
    and.push({ stock: { $gt: 0 } });
  }
  if (f.colorFamily) and.push({ colorFamilies: f.colorFamily });

  for (const term of f.terms || []) {
    and.push({ $or: TEXT_FIELDS.map((field) => ({ [field]: containsIgnoreCase(term) })) });
  }
  if (f.genre) and.push({ genre: f.genre });
  if (f.subcategory) and.push({ subcategory: f.subcategory });
  if (f.style) and.push({ category: f.style });
  if (f.occasion) and.push({ occasions: f.occasion });
  if (f.season) and.push({ seasons: { $in: [f.season, "all-season"] } });
  if (f.fit) and.push({ fit: f.fit });
  if (f.pattern) and.push({ pattern: f.pattern });
  if (f.fabricWeight) and.push({ fabricWeight: f.fabricWeight });
  if (f.material) and.push({ material: containsIgnoreCase(f.material) });
  if (f.brand) and.push({ brand: exactIgnoreCase(f.brand) });

  const price = {};
  if (f.minPrice !== undefined) price.$gte = f.minPrice;
  if (f.maxPrice !== undefined) price.$lte = f.maxPrice;
  if (Object.keys(price).length) and.push({ price });

  return and.length === 1 ? and[0] : { $and: and };
};

const SORTS = {
  relevance: { purchasedCount: -1, averageRating: -1, createdAt: -1 },
  price_low: { price: 1 },
  price_high: { price: -1 },
  popular: { purchasedCount: -1 },
  rating: { averageRating: -1, reviewsCount: -1 },
  newest: { createdAt: -1 },
};

// What the model sees and what the chat card renders.
const toCard = (p) => ({
  id: String(p._id),
  name: p.name,
  brand: p.brand || "",
  price: p.price,
  currency: p.currency || "USD",
  genre: p.genre,
  category: p.category,
  subcategory: p.subcategory,
  colors: p.color || [],
  sizes: p.size || [],
  sizes_in_stock: p.sizesInStock || [],
  occasions: p.occasions || [],
  image: p.images?.[0] || "",
  inStock: (p.stock ?? 0) > 0,
  rating: p.averageRating ? Number(p.averageRating.toFixed(1)) : 0,
  reviews: p.reviewsCount || 0,
  url: `/home/${p.category}/${p.subcategory}/${p._id}`,
});

const CARD_FIELDS = "name brand price currency genre category subcategory color size sizesInStock occasions images stock averageRating reviewsCount purchasedCount createdAt";

// Least important constraint first; the shopper's core intent last.
const RELAXATION_ORDER = [
  ["material", (v) => `material "${v}"`],
  ["brand", (v) => `the ${v} label`],
  ["fit", (v) => `${v} fit`],
  ["pattern", (v) => `${v} pattern`],
  ["fabricWeight", (v) => `${v}-weight fabric`],
  ["season", (v) => `the ${v} season`],
  ["size", (v) => `size ${String(v).toUpperCase()}`],
  ["colorFamily", (v) => `the colour ${v}`],
  ["occasion", (v) => `the ${v.replace(/-/g, " ")} occasion`],
  ["maxPrice", (v) => `the $${v} budget`],
  ["style", (v) => `${v} style`],
  ["subcategory", (v) => `"${v}"`],
];

/** Ranks a pool by meaning against the shopper's words; null if unavailable. */
async function semanticRank(filter, query) {
  let vector;
  try {
    vector = await embedQuery(query);
  } catch (err) {
    console.warn("[assistant] semantic search unavailable:", err.message);
    return null;
  }
  const pool = await Product.find(filter).select(`${CARD_FIELDS} +embedding`).limit(SEMANTIC_POOL).lean();
  return pool
    .filter((p) => p.embedding?.length)
    .map((p) => ({ p, score: cosine(vector, p.embedding) }))
    .sort((a, b) => b.score - a.score)
    .map(({ p }) => p);
}

// ── tools ──────────────────────────────────────────────────────────────────

async function searchProducts(args = {}) {
  const query = cleanText(args.query);
  const filters = {
    genre: oneOf(args.department || args.genre, taxonomy.DEPARTMENTS),
    subcategory: taxonomy.categoryForWord(args.category || args.subcategory),
    style: oneOf(args.style, taxonomy.STYLES),
    occasion: occasionFrom(args.occasion),
    season: seasonFrom(args.season),
    colorFamily: colorFamilyFrom(args.color),
    size: cleanText(args.size),
    material: cleanText(args.material),
    brand: cleanText(args.label || args.brand),
    fit: oneOf(args.fit, taxonomy.FITS),
    pattern: oneOf(args.pattern, taxonomy.PATTERNS),
    fabricWeight: oneOf(args.fabric_weight, taxonomy.FABRIC_WEIGHTS),
    minPrice: clampNumber(args.min_price, 0, 1_000_000),
    maxPrice: clampNumber(args.max_price, 0, 1_000_000),
    inStockOnly: args.in_stock_only !== false,
  };
  const sort = SORTS[args.sort] ? args.sort : "relevance";
  const page = Math.max(1, Math.min(Number(args.page) || 1, 20));
  // Meaning-ranked only when the shopper described something and asked for "best match".
  const bySemantics = Boolean(query) && sort === "relevance";

  const run = async (f) => {
    if (bySemantics) {
      const ranked = await semanticRank(buildFilter(f), query);
      if (ranked) return { items: ranked.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total: ranked.length };
    }
    const keyword = { ...f, terms: query ? expandTerms(query) : [] };
    const filter = buildFilter(keyword);
    const [items, total] = await Promise.all([
      Product.find(filter).select(CARD_FIELDS).sort(SORTS[sort]).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
      Product.countDocuments(filter),
    ]);
    return { items, total };
  };

  let working = { ...filters };
  let { items, total } = await run(working);
  const relaxed = [];

  for (const [key, describe] of RELAXATION_ORDER) {
    if (items.length || !working[key]) continue;
    const dropped = working[key];
    if (key === "maxPrice") {
      const cheapest = await Product.findOne(buildFilter({ ...working, maxPrice: undefined })).select("price").sort({ price: 1 }).lean();
      working = { ...working, maxPrice: cheapest ? cheapest.price : undefined };
      relaxed.push(cheapest ? `raised your $${dropped} budget to $${cheapest.price}` : `ignored ${describe(dropped)}`);
    } else {
      working = { ...working, [key]: "" };
      relaxed.push(`dropped ${describe(dropped)}`);
    }
    ({ items, total } = await run(working));
  }

  return {
    result: {
      count: items.length,
      total,
      page,
      has_more: total > page * PAGE_SIZE,
      ranked_by: bySemantics ? "meaning" : sort,
      relaxed,
      products: items.map(toCard),
    },
    searchState: {
      query,
      genre: working.genre || "",
      category: working.style || "",
      subcategory: working.subcategory || "",
      occasion: working.occasion || "",
      season: working.season || "",
      color: working.colorFamily || "",
      size: working.size || "",
      material: working.material || "",
      brand: working.brand || "",
      minPrice: working.minPrice,
      maxPrice: working.maxPrice,
      sort,
      page,
    },
  };
}

/** Compare 2 to 4 products by features, fabric, fit, price, and customer rating. */
async function compareProducts(args = {}) {
  const ids = Array.isArray(args.product_ids) ? args.product_ids : [];
  const names = Array.isArray(args.product_names) ? args.product_names : [];

  let products = [];
  if (ids.length) {
    const validIds = ids.filter((id) => /^[a-f\d]{24}$/i.test(String(id)));
    if (validIds.length) {
      products = await Product.find({ _id: { $in: validIds }, status: "active" }).select(CARD_FIELDS + " description material fit pattern fabricWeight seasons").lean();
    }
  }

  // If no IDs or couldn't find enough, search by names/keywords
  if (products.length < 2 && names.length) {
    const matched = await Product.find({
      status: "active",
      $or: names.map((n) => ({ name: containsIgnoreCase(n) })),
    }).select(CARD_FIELDS + " description material fit pattern fabricWeight seasons").limit(4).lean();
    products = [...products, ...matched.filter((m) => !products.some((p) => String(p._id) === String(m._id)))];
  }

  if (products.length < 2) {
    return {
      result: {
        error: "Could not find at least two products to compare. Specify product names or IDs.",
      },
    };
  }

  const comparison = products.map((p) => ({
    id: String(p._id),
    name: p.name,
    brand: p.brand || "",
    price: `$${p.price}`,
    department: p.genre,
    category: p.subcategory || p.category,
    material: p.material || "Standard fabric",
    fit: p.fit || "Regular",
    pattern: p.pattern || "Solid",
    weight: p.fabricWeight || "Medium",
    occasions: (p.occasions || []).join(", ") || "Versatile",
    rating: p.averageRating ? `${p.averageRating.toFixed(1)} / 5 (${p.reviewsCount || 0} reviews)` : "Not yet rated",
    colors: (p.color || []).join(", "),
    sizes_available: (p.sizesInStock || []).join(", "),
  }));

  return {
    result: {
      count: comparison.length,
      products_compared: comparison,
    },
    // Also hand back the product cards so the UI renders them side-by-side
    comparisonProducts: products.map(toCard),
  };
}

/** One product in full, with what is actually in stock in each colour. */
async function getProduct(args = {}) {
  const id = cleanText(args.product_id);
  if (!/^[a-f\d]{24}$/i.test(id)) return { result: { error: "Unknown product." } };

  const product = await Product.findOne({ _id: id, status: "active" }).lean();
  if (!product) return { result: { error: "That product isn't available." } };

  const byColor = {};
  for (const v of product.variants || []) {
    byColor[v.color] = byColor[v.color] || { in_stock: [], sold_out: [], low_stock: [] };
    if (v.stock <= 0) byColor[v.color].sold_out.push(v.size);
    else {
      byColor[v.color].in_stock.push(v.size);
      if (v.stock <= 2) byColor[v.color].low_stock.push(`${v.size} (${v.stock} left)`);
    }
  }
  return {
    result: {
      ...toCard(product),
      description: String(product.description || "").slice(0, 600),
      material: product.material || "",
      fit: product.fit || "",
      pattern: product.pattern || "",
      fabric_weight: product.fabricWeight || "",
      seasons: product.seasons || [],
      tags: product.tags || [],
      availability_by_colour: byColor,
    },
  };
}

/** What the shop actually stocks, so the assistant only offers real choices. */
async function getFilterOptions(args = {}) {
  const scope = { status: "active" };
  const genre = oneOf(args.department || args.genre, taxonomy.DEPARTMENTS);
  const subcategory = taxonomy.categoryForWord(args.category);
  if (genre) scope.genre = genre;
  if (subcategory) scope.subcategory = subcategory;

  const [categories, families, sizes, labels, occasions, seasons, priceRange] = await Promise.all([
    Product.distinct("subcategory", scope),
    Product.distinct("colorFamilies", scope),
    Product.distinct("sizesInStock", scope),
    Product.distinct("brand", scope),
    Product.distinct("occasions", scope),
    Product.distinct("seasons", scope),
    Product.aggregate([{ $match: scope }, { $group: { _id: null, min: { $min: "$price" }, max: { $max: "$price" } } }]),
  ]);
  const names = new Map(taxonomy.CATEGORIES.map((c) => [c.slug, c.name]));
  return {
    result: {
      departments: taxonomy.DEPARTMENTS,
      categories: categories.map((slug) => ({ slug, name: names.get(slug) || slug })),
      styles: taxonomy.STYLES,
      colour_families: families.sort(),
      sizes_in_stock: sizes,
      labels: labels.sort(),
      occasions: occasions.sort(),
      seasons: seasons.sort(),
      price_min: priceRange[0]?.min ?? 0,
      price_max: priceRange[0]?.max ?? 0,
      currency: "USD",
    },
  };
}

/** A label's own description, plus what it sells. */
async function getLabel(args = {}) {
  const name = cleanText(args.name);
  if (!name) return { result: { error: "Which label?" } };
  const label = await Label.findOne({ $or: [{ name: exactIgnoreCase(name) }, { slug: taxonomy.slugify(name) }], active: true }).lean();
  if (!label) {
    const all = await Label.find({ active: true }).select("name").lean();
    return { result: { error: `No label called "${name}".`, labels: all.map((l) => l.name) } };
  }
  const [count, categories, priceRange] = await Promise.all([
    Product.countDocuments({ labelId: label._id, status: "active" }),
    Product.distinct("subcategory", { labelId: label._id, status: "active" }),
    Product.aggregate([{ $match: { labelId: label._id, status: "active" } }, { $group: { _id: null, min: { $min: "$price" }, max: { $max: "$price" } } }]),
  ]);
  return {
    result: {
      name: label.name,
      description: label.description,
      styles: label.styles,
      products: count,
      categories,
      price_from: priceRange[0]?.min ?? null,
      price_to: priceRange[0]?.max ?? null,
      currency: "USD",
    },
  };
}

// ── tool definitions handed to the model ───────────────────────────────────

const enumOf = (list) => ({ type: "string", enum: list });

const definitions = [
  {
    type: "function",
    function: {
      name: "search_products",
      description:
        "Search the MonoFit catalogue. Use it before saying anything about what is or isn't available. Put the shopper's own description in `query` (it is matched by meaning), and set any filters you are sure of. Returns at most 6 real products with the sizes actually in stock.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The shopper's words, e.g. 'breezy outfit for a beach holiday'." },
          department: enumOf(taxonomy.DEPARTMENTS),
          category: { type: "string", description: `Item type in the shopper's words or one of: ${taxonomy.CATEGORIES.map((c) => c.slug).join(", ")}.` },
          style: enumOf(taxonomy.STYLES),
          occasion: { type: "string", description: `One of: ${taxonomy.OCCASIONS.join(", ")} (shopper words like 'wedding' or 'work' are understood).` },
          season: enumOf(taxonomy.SEASONS),
          color: { type: "string", description: "A colour or colour family; 'blue' also finds navy and sky blue." },
          size: { type: "string", description: "Only products with this size in stock, e.g. S, M, L, XL, 32, 9, 4-5y." },
          material: { type: "string" },
          label: { type: "string", description: "A MonoFit label, e.g. Noor Atelier." },
          fit: enumOf(taxonomy.FITS),
          pattern: enumOf(taxonomy.PATTERNS),
          fabric_weight: enumOf(taxonomy.FABRIC_WEIGHTS),
          min_price: { type: "number", description: "US dollars." },
          max_price: { type: "number", description: "US dollars." },
          in_stock_only: { type: "boolean", description: "Defaults to true." },
          sort: enumOf(Object.keys(SORTS)),
          page: { type: "number", description: "2, 3… for 'show more'." },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_product",
      description: "Full details of one product, including which sizes are in stock in each colour and which are nearly gone.",
      parameters: { type: "object", properties: { product_id: { type: "string" } }, required: ["product_id"] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_filter_options",
      description: "The categories, colours, sizes in stock, labels, occasions, seasons and price range that exist. Use it before offering the shopper choices.",
      parameters: {
        type: "object",
        properties: { department: enumOf(taxonomy.DEPARTMENTS), category: { type: "string" } },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "compare_products",
      description:
        "Compare 2 to 4 products side-by-side by their price, materials, fit, fabric weight, occasion suitability, color options, and customer ratings. Use this whenever the shopper asks to compare items (e.g. 'compare product A and B', 'what is the difference between...', 'which one is better?').",
      parameters: {
        type: "object",
        properties: {
          product_ids: {
            type: "array",
            items: { type: "string" },
            description: "Array of product ID strings (2 to 4 products).",
          },
          product_names: {
            type: "array",
            items: { type: "string" },
            description: "Array of product names or keywords to identify products if IDs are unknown.",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_label",
      description: "About one of MonoFit's labels: what it makes, its styles and price range.",
      parameters: { type: "object", properties: { name: { type: "string" } }, required: ["name"] },
    },
  },
];

const handlers = {
  search_products: searchProducts,
  get_product: getProduct,
  compare_products: compareProducts,
  get_filter_options: getFilterOptions,
  get_label: getLabel,
};

module.exports = { definitions, handlers, searchProducts, getProduct, compareProducts, getFilterOptions, getLabel, escapeRegex, buildFilter, toCard, PAGE_SIZE, occasionFrom, colorFamilyFrom };
