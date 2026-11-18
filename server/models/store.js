// A product. Every attribute the shop or the assistant filters on is a
// controlled value from services/catalog/taxonomy.js, and stock lives on each
// size-and-colour variant. The flat fields the site has always read (color,
// size, stock, isAvailable, colorFamilies, sizesInStock) are derived from the
// variants on every save, so they can never disagree with them.
import mongoose from "mongoose";
import taxonomy from "../services/catalog/taxonomy.js";

const {
  DEPARTMENTS, STYLES, OCCASIONS, SEASONS, FITS, PATTERNS, FABRIC_WEIGHTS, STATUSES, CATEGORIES,
  colorFamilyOf, normaliseSize, slugify,
} = taxonomy;
const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);

const variantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, trim: true },
    size: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    colorFamily: { type: String, default: "" },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, index: true },
    description: { type: String, required: true, trim: true },

    // Taxonomy. `genre` is the department and `category` the style; both keep
    // their old names because they are already in every product URL.
    genre: { type: String, required: true, enum: DEPARTMENTS, index: true },
    category: { type: String, required: true, enum: STYLES },
    subcategory: { type: String, required: true, enum: CATEGORY_SLUGS, index: true },

    // Who makes it.
    labelId: { type: mongoose.Schema.Types.ObjectId, ref: "Label", index: true },
    brand: { type: String, default: "", trim: true },
    brand_logo: { type: String, default: "" },
    storeId: { type: String, required: true, index: true },

    // Price, in the store currency.
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null, min: 0 },
    currency: { type: String, default: "USD", enum: ["USD"] },

    // What it is for, and what it is like.
    occasions: { type: [{ type: String, enum: OCCASIONS }], default: [] },
    seasons: { type: [{ type: String, enum: SEASONS }], default: [] },
    fit: { type: String, enum: [...FITS, ""], default: "" },
    pattern: { type: String, enum: [...PATTERNS, ""], default: "" },
    fabricWeight: { type: String, enum: [...FABRIC_WEIGHTS, ""], default: "" },
    material: { type: String, default: "", trim: true },
    tags: { type: [String], default: [] },

    // Stock lives here: one entry per size-and-colour combination.
    variants: {
      type: [variantSchema],
      validate: { validator: (v) => Array.isArray(v) && v.length > 0, message: "At least one size and colour is required" },
    },

    images: {
      type: [String],
      required: true,
      validate: { validator: (val) => Array.isArray(val) && val.length > 0, message: "At least one image URL is required" },
    },

    // Derived from the variants on save — read them, never write them directly.
    color: { type: [String], default: [] },
    size: { type: [String], default: [] },
    colorFamilies: { type: [String], default: [], index: true },
    sizesInStock: { type: [String], default: [] },
    stock: { type: Number, default: 0, min: 0 },
    isAvailable: { type: Boolean, default: true },

    status: { type: String, enum: STATUSES, default: "active", index: true },

    // Meaning vector for semantic search; never sent to browsers.
    embedding: { type: [Number], select: false, default: undefined },
    embeddingText: { type: String, select: false, default: "" },

    reviewsCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    purchasedCount: { type: Number, default: 0 },
    ratings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
  },
  { timestamps: true, strict: true }
);

/** Build variants from plain size and colour lists, sharing the stock between them. */
export function buildVariants({ sizes = [], colors = [], stock = 0, skuPrefix = "MF" }) {
  const S = [...new Set(sizes.map(normaliseSize).filter(Boolean))];
  const C = [...new Set(colors.map((c) => String(c).trim().toLowerCase()).filter(Boolean))];
  const combos = S.flatMap((size) => C.map((color) => ({ size, color })));
  if (!combos.length) return [];
  const base = Math.floor(stock / combos.length);
  let extra = stock - base * combos.length;
  return combos.map(({ size, color }) => ({
    sku: `${skuPrefix}-${slugify(color).slice(0, 6)}-${slugify(size)}`.toUpperCase(),
    size,
    color,
    colorFamily: colorFamilyOf(color),
    stock: base + (extra-- > 0 ? 1 : 0),
  }));
}

/** The flat fields the site reads, recomputed from the variants. */
export function deriveFromVariants(variants = []) {
  const unique = (list) => [...new Set(list.filter(Boolean))];
  return {
    color: unique(variants.map((v) => v.color)),
    size: unique(variants.map((v) => v.size)),
    colorFamilies: unique(variants.map((v) => v.colorFamily || colorFamilyOf(v.color))),
    sizesInStock: unique(variants.filter((v) => v.stock > 0).map((v) => v.size)),
    stock: variants.reduce((n, v) => n + (v.stock || 0), 0),
  };
}

productSchema.pre("validate", function deriveFields() {
  for (const v of this.variants || []) {
    v.size = normaliseSize(v.size);
    v.colorFamily = v.colorFamily || colorFamilyOf(v.color);
  }
  Object.assign(this, deriveFromVariants(this.variants || []));
  this.isAvailable = this.status === "active";
  if (!this.slug && this.name) this.slug = slugify(this.name);
});

// Text index for keyword search across what a shopper might type.
productSchema.index(
  { name: "text", description: "text", tags: "text", brand: "text", material: "text" },
  { weights: { name: 8, tags: 5, brand: 4, material: 2, description: 1 }, name: "product_text" }
);

export default mongoose.model("Product", productSchema);
