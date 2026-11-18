// The shopper's saved profile: sizes, favourite colours, departments, budget.
// Saved only when the shopper asks; used so "in my size" just works.
const User = require("../../models/user");
const { cleanPreferences } = require("../../controllers/customerController");

const needsLogin = (tool, args) => ({
  result: { login_required: true, message: "The shopper must be logged in to save or use a profile. Ask them to log in." },
  pendingAction: { tool, args },
});

async function getMyPreferences(_args = {}, ctx = {}) {
  if (!ctx.userId) return needsLogin("get_my_preferences", {});
  const user = await User.findById(ctx.userId).select("preferences").lean();
  const p = user?.preferences || {};
  const empty = !p.sizes?.top && !p.sizes?.bottom && !p.sizes?.shoe && !p.sizes?.kids && !p.colors?.length && !p.budget;
  return { result: empty ? { saved: false, message: "Nothing saved yet. Ask the shopper before saving anything." } : { saved: true, ...p } };
}

async function saveMyPreferences(args = {}, ctx = {}) {
  if (!ctx.userId) return needsLogin("save_my_preferences", args);
  const user = await User.findById(ctx.userId).select("preferences").lean();
  const current = user?.preferences || {};
  // Merge: only what the shopper just told us changes.
  const merged = cleanPreferences({
    sizes: { ...(current.sizes || {}), ...(args.sizes || {}) },
    colors: args.colors !== undefined ? args.colors : current.colors,
    departments: args.departments !== undefined ? args.departments : current.departments,
    budget: args.budget !== undefined ? args.budget : current.budget,
  });
  await User.updateOne({ _id: ctx.userId }, { $set: { preferences: merged } });
  return { result: { saved: true, ...merged } };
}

const definitions = [
  {
    type: "function",
    function: {
      name: "get_my_preferences",
      description: "The shopper's saved sizes, favourite colour families, departments and budget. Use it when they say 'my size' or ask for recommendations.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "save_my_preferences",
      description: "Save sizes, favourite colours, departments or a budget — ONLY after the shopper has said they want them remembered.",
      parameters: {
        type: "object",
        properties: {
          sizes: {
            type: "object",
            properties: { top: { type: "string" }, bottom: { type: "string" }, shoe: { type: "string" }, kids: { type: "string" } },
          },
          colors: { type: "array", items: { type: "string" }, description: "Colour families, e.g. black, navy→blue, beige→brown." },
          departments: { type: "array", items: { type: "string", enum: ["women", "men", "kids", "accessories"] } },
          budget: { type: "number", description: "Usual budget per item, US dollars." },
        },
        required: [],
      },
    },
  },
];

const handlers = { get_my_preferences: getMyPreferences, save_my_preferences: saveMyPreferences };

module.exports = { definitions, handlers };
