// A label (brand) on MonoFit: one per selling account, described once instead
// of being repeated as free text on every product.
const mongoose = require("mongoose");
const { STYLES, slugify } = require("../services/catalog/taxonomy");

const labelSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    description: { type: String, default: "", trim: true, maxlength: 400 },
    story: { type: String, default: "", trim: true, maxlength: 2000 },
    styles: { type: [{ type: String, enum: STYLES }], default: [] },
    logo: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

labelSchema.pre("validate", function setSlug() {
  if (!this.slug && this.name) this.slug = slugify(this.name);
});

module.exports = mongoose.model("Label", labelSchema);
