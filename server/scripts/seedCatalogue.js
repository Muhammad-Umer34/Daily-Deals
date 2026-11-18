// Adds a realistic multi-brand catalogue (66 products from four labels) so the
// shop and the Shop Assistant have enough to search, filter and narrow down.
// Additive only: exits if the labels already exist. Photos are Unsplash images
// (free licence, hotlinking is how Unsplash asks them to be used).
// Usage: node scripts/seedCatalogue.js   (uses MONGO_URI / MONGO_DB_NAME from .env)
// Seller logins are appended to ../DEMO_ACCOUNTS.md (git-ignored).
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const dns = require("dns");
const bcrypt = require("bcryptjs");
const { MongoClient, ObjectId } = require("mongodb");

if (dns.getServers().every((s) => s.startsWith("127.") || s === "::1")) dns.setServers(["8.8.8.8", "1.1.1.1"]);

const img = (id) => `https://images.unsplash.com/${id}?w=1200&q=80&auto=format&fit=crop`;

const LABELS = {
  ashcroft: { name: "Ashcroft Tailoring", owner: "Hamza Qureshi", email: "ashcroft.store@dailydeals.test" },
  noor: { name: "Noor Atelier", owner: "Mahnoor Siddiqui", email: "noor.store@dailydeals.test" },
  lantern: { name: "Little Lantern", owner: "Sana Javed", email: "lantern.store@dailydeals.test" },
  sabr: { name: "Studio Sabr", owner: "Bilal Ahmed", email: "sabr.store@dailydeals.test" },
};

const TOPS = ["s", "m", "l", "xl"];
const SHOES = ["7", "8", "9", "10", "11"];
const KIDS = ["2-3y", "4-5y", "6-7y", "8-9y"];
const ONE = ["one size"];

// [label, name, price, genre, category, subcategory, material, colours, sizes, photo, description]
const P = [
  // ── Men ────────────────────────────────────────────────────────────────
  ["ashcroft", "Patterned Poplin Shirt", 4290, "men", "formal", "shirts", "Cotton poplin", ["navy", "white"], TOPS, "photo-1602810316693-3667c854239a", "Crisp cotton poplin with a fine micro-print, a spread collar and a clean, tailored fit for the office."],
  ["ashcroft", "Brushed Twill Overshirt", 4990, "men", "casual", "shirts", "Brushed cotton twill", ["khaki"], TOPS, "photo-1776838103951-993ff1ffc916", "A soft, brushed twill overshirt with two chest pockets — worn open over a tee or buttoned on its own."],
  ["ashcroft", "Formal Shirt and Tie Set", 6490, "men", "formal", "shirts", "Cotton and silk", ["blue", "pink"], TOPS, "photo-1598032895397-b9472444bf93", "A pressed formal shirt paired with a woven silk tie, boxed together and ready for interviews and weddings."],
  ["ashcroft", "Mandarin Collar Linen Shirt", 4590, "men", "casual", "shirts", "Pure linen", ["ecru", "white"], TOPS, "photo-1627686011747-74adda3d2343", "Breathable washed linen with a band collar; cut relaxed for Karachi summers and softened with every wash."],
  ["urban", "Resort Linen Shirt", 3990, "men", "casual", "shirts", "Pure linen", ["white"], TOPS, "photo-1792433413663-31eb3dccf89f", "An easy, open-collar linen shirt with a slightly cropped hem — made for holidays and long lunches."],
  ["urban", "Striped Cotton Shirt", 3690, "men", "casual", "shirts", "Cotton", ["blue"], TOPS, "photo-1617117475026-2eb3e68b63cf", "Fine blue-and-white stripes on soft cotton, with a button-down collar that holds its shape all day."],
  ["ashcroft", "Unstructured Cotton Blazer", 12900, "men", "casual", "jacket", "Cotton", ["tan"], TOPS, "photo-1697319501786-8f5dc64326ad", "A soft-shouldered, half-lined blazer in warm tan — sharp enough for dinner, easy enough for weekends."],
  ["ashcroft", "Tailored Two-Piece Suit", 34900, "men", "formal", "jacket", "Wool blend", ["black"], TOPS, "photo-1617113930975-f9c7243ae527", "A single-breasted suit in a fine wool blend with a slim lapel and trousers cut to sit cleanly on the shoe."],
  ["ashcroft", "Single-Breasted Wool Blazer", 18500, "men", "formal", "jacket", "Wool", ["grey", "charcoal"], TOPS, "photo-1630173250799-2813d34ed14b", "A grey wool blazer with natural shoulders and horn buttons — the backbone of a smart wardrobe."],
  ["ashcroft", "Camel Wool Overcoat", 29500, "men", "formal", "jacket", "Wool and cashmere", ["camel"], TOPS, "photo-1619603364937-8d7af41ef206", "A knee-length overcoat in a wool-cashmere blend, cut to sit over a suit through the coldest Lahore winters."],
  ["ashcroft", "Belted Long Coat", 24900, "men", "casual", "jacket", "Cotton gabardine", ["olive"], TOPS, "photo-1715536369840-9e314f847d78", "A long, belted coat in water-resistant gabardine with a storm flap and deep pockets."],
  ["urban", "Rinsed Denim Jacket", 8990, "men", "casual", "jacket", "Denim", ["blue"], TOPS, "photo-1643858040625-3e806a9e5be3", "A classic trucker jacket in rinsed indigo denim that fades in beautifully with wear."],
  ["urban", "Washed Trucker Jacket", 7990, "men", "casual", "jacket", "Denim", ["light blue"], TOPS, "photo-1516257984-b1b4d707412e", "A lighter, sun-washed denim jacket with a boxy fit — layer it over hoodies and tees."],
  ["ashcroft", "Fine-Knit V-Neck Sweater", 9490, "men", "formal", "knitwear", "Merino wool", ["burgundy", "grey"], TOPS, "photo-1599032909736-0155c1d43a6c", "A fine-gauge merino V-neck that layers neatly over a shirt and tie without adding bulk."],
  ["ashcroft", "Knitted Long-Sleeve Shirt", 8490, "men", "casual", "knitwear", "Cotton knit", ["maroon"], TOPS, "photo-1642886512785-b5fee9faad7f", "A knitted shirt with a soft collar in deep maroon — the comfort of a sweater with the polish of a shirt."],
  ["urban", "Essential Crew Tee", 1690, "men", "casual", "t-shirt", "Organic cotton", ["white", "black"], TOPS, "photo-1581655353564-df123a1eb820", "A heavyweight organic cotton tee with a close-cut neckline. The one you'll reach for every day."],
  ["urban", "Piqué Polo Shirt", 2990, "men", "casual", "t-shirt", "Cotton piqué", ["white", "black"], TOPS, "photo-1622622016645-7b7065e7c129", "A clean cotton piqué polo with a two-button placket and ribbed collar."],
  ["urban", "Printed Resort Polo", 3490, "men", "casual", "t-shirt", "Cotton", ["sky blue"], TOPS, "photo-1779907448384-bcd21af9bbbf", "A short-sleeve polo with a small all-over print, cut for warm evenings."],
  ["urban", "Slim Black Trousers", 4490, "men", "formal", "trousers", "Stretch cotton", ["black"], ["28", "30", "32", "34", "36"], "photo-1584865288642-42078afe6942", "Slim, cropped trousers in stretch cotton — sharp with a shirt, relaxed with trainers."],
  ["noor", "Block-Print Kurta", 6490, "men", "casual", "kurta", "Cotton lawn", ["mint"], TOPS, "photo-1727835523545-70ee992b5763", "A hand block-printed kurta in airy cotton lawn with a band collar and side pockets."],
  ["noor", "Mustard Cotton Kurta", 5990, "men", "party", "kurta", "Cotton", ["mustard"], TOPS, "photo-1701365676249-9d7ab5022dec", "A rich mustard kurta with a classic collar — made for mehndi nights and Eid mornings."],
  ["noor", "White Shalwar Kameez", 7990, "men", "formal", "kurta", "Wash and wear", ["white"], TOPS, "photo-1734418040900-e964f84e8abb", "A crisp white shalwar kameez in easy-care fabric, cut long and straight for Jummah and formal days."],
  ["urban", "Linen Drawstring Shorts", 2790, "men", "casual", "shorts", "Linen blend", ["olive"], ["s", "m", "l", "xl"], "photo-1621496503717-095a410e1566", "Relaxed linen-blend shorts with a drawstring waist for beaches and hot afternoons."],
  ["urban", "Training Shorts", 2290, "men", "gym", "shorts", "Quick-dry polyester", ["black", "grey"], ["s", "m", "l", "xl"], "photo-1587249247014-079373c40427", "Lightweight, quick-dry training shorts with a zipped pocket for keys."],
  ["sabr", "Chunky Leather Loafers", 12900, "men", "formal", "shoes", "Polished leather", ["black"], SHOES, "photo-1760616172899-0681b97a2de3", "Polished black loafers on a chunky sole — formal shape, modern weight."],
  ["sabr", "Suede Penny Loafers", 11900, "men", "casual", "shoes", "Suede", ["brown"], SHOES, "photo-1576792741377-eb0f4f6d1a47", "Soft brown suede penny loafers, unlined for a broken-in feel from day one."],
  ["sabr", "Leather Driving Loafers", 10500, "men", "casual", "shoes", "Leather", ["tan"], SHOES, "photo-1662541089338-c7d53b88be70", "Supple tan driving loafers with a metal bit and a grippy pebble sole."],

  // ── Women ──────────────────────────────────────────────────────────────
  ["noor", "Linen Shift Dress", 8990, "women", "casual", "dresses", "Pure linen", ["natural"], TOPS, "photo-1747396206869-75ea57b325ce", "A sleeveless linen shift that falls just below the knee — simple, cool and quietly elegant."],
  ["noor", "Sage Strappy Midi Dress", 9490, "women", "party", "dresses", "Linen viscose", ["sage"], TOPS, "photo-1789110519607-6176d668fb72", "A strappy midi in soft sage with an elasticated back for an easy, flattering fit."],
  ["noor", "Linen Mini Dress with Rope Belt", 7490, "women", "casual", "dresses", "Pure linen", ["white"], TOPS, "photo-1789110520302-3df8ce0410f0", "A short-sleeve linen mini cinched with a braided rope belt."],
  ["noor", "Oversized Linen Kaftan", 8490, "women", "casual", "dresses", "Linen", ["oat"], ["s/m", "l/xl"], "photo-1764298493197-a1c1cce57800", "A wide, flowing linen kaftan with dropped sleeves — throw it on and go."],
  ["urban", "Coral Shirt Dress", 7990, "women", "casual", "dresses", "Cotton", ["coral"], TOPS, "photo-1789110853872-f416085557fa", "A button-through shirt dress in warm coral with a self-tie waist."],
  ["noor", "Satin Wrap Blouse", 6990, "women", "party", "tops", "Satin", ["black"], TOPS, "photo-1704775983224-43dae05da876", "A fluid satin blouse with a wrap neckline and full sleeves."],
  ["urban", "Classic White Shirt", 5490, "women", "formal", "tops", "Cotton poplin", ["white"], TOPS, "photo-1704775991298-38b9139fdad9", "The white shirt, perfected: crisp poplin, a soft collar and a relaxed, slightly oversized cut."],
  ["noor", "Crimson V-Neck Blouse", 6490, "women", "party", "tops", "Crepe", ["red"], TOPS, "photo-1761117228880-df2425bd70da", "A softly draped crepe blouse in crimson with a deep V and a delicate chain detail."],
  ["noor", "Block-Print Kurta Set", 11900, "women", "casual", "kurta", "Cotton lawn", ["white"], TOPS, "photo-1745313452052-0e4e341f326c", "A three-piece set — block-printed kurta, straight trousers and a matching dupatta."],
  ["noor", "Embroidered Red Kurta Set", 14500, "women", "party", "kurta", "Raw silk", ["red"], TOPS, "photo-1765529374855-7353c3c47fc6", "Raw silk in deep red with hand embroidery at the neckline and cuffs — made for celebrations."],
  ["urban", "Wide-Leg Trousers", 5990, "women", "formal", "trousers", "Crepe", ["beige"], TOPS, "photo-1789110853687-71692f0e86be", "High-waisted, wide-leg trousers with front pleats that skim the floor."],
  ["urban", "Drawstring Cotton Trousers", 4490, "women", "casual", "trousers", "Cotton", ["blush"], TOPS, "photo-1789111161026-1763989e210c", "Soft cotton trousers with a drawstring waist in a washed blush pink."],
  ["urban", "Cropped Drawstring Trousers", 4290, "women", "casual", "trousers", "Cotton", ["mint"], TOPS, "photo-1789110520410-4fce7246f844", "Cropped, relaxed trousers in pale mint that sit just above the ankle."],
  ["urban", "Tie-Waist Denim Trousers", 5490, "women", "casual", "jeans", "Denim", ["indigo"], TOPS, "photo-1789110854236-8de32351d62a", "Wide denim trousers with a tie waist — the comfort of joggers, the look of jeans."],
  ["noor", "Classic Trench Coat", 22900, "women", "casual", "outerwear", "Cotton gabardine", ["khaki"], TOPS, "photo-1676716105765-e19fe6a01851", "A double-breasted trench with a storm flap, epaulettes and a tie belt."],
  ["noor", "Long Camel Coat", 26500, "women", "formal", "outerwear", "Wool blend", ["camel"], TOPS, "photo-1618244985759-a8a1dc26bce3", "A long, single-breasted coat in a warm camel wool blend."],
  ["noor", "Tailored Black Blazer", 14900, "women", "formal", "blazer", "Wool blend", ["black"], TOPS, "photo-1616065297556-f05bc00c9a3e", "A sharply tailored blazer with a nipped waist and peak lapels."],
  ["noor", "Grey Wool Blazer", 15500, "women", "formal", "blazer", "Wool", ["grey"], TOPS, "photo-1604904612715-47bf9d9bc670", "A grey wool blazer cut straight and long, for the office and beyond."],
  ["noor", "Mustard Knit Cardigan", 7990, "women", "casual", "knitwear", "Wool blend", ["mustard"], TOPS, "photo-1610288311735-39b7facbd095", "A chunky, ribbed cardigan in warm mustard with tortoiseshell buttons."],
  ["noor", "Cable-Knit Jumper", 8490, "women", "casual", "knitwear", "Wool blend", ["brown"], TOPS, "photo-1581497396202-5645e76a3a8e", "A cosy cable-knit jumper with long, slouchy sleeves."],
  ["noor", "Red Column Gown", 24900, "women", "party", "dresses", "Silk crepe", ["red"], TOPS, "photo-1595777457583-95e059d581b8", "A floor-length gown in red silk crepe with a full, swirling skirt."],
  ["noor", "Embellished Tulle Gown", 32900, "women", "party", "dresses", "Tulle", ["burgundy"], TOPS, "photo-1568252542512-9fe8fe9c87bb", "A strapless burgundy gown in layered tulle scattered with hand-sewn floral embellishment."],
  ["noor", "Black Ruffle Gown", 27500, "women", "party", "dresses", "Organza", ["black"], TOPS, "photo-1568251188392-ae32f898cb3b", "A dramatic black gown with tiers of ruffled organza and an off-shoulder neckline."],
  ["urban", "Rib Training Set", 4990, "women", "gym", "leggings", "Recycled nylon", ["rose"], TOPS, "photo-1606902965551-dce093cda6e7", "A matching ribbed sports bra and high-waist leggings with four-way stretch."],
  ["urban", "Sculpt Leggings", 3490, "women", "gym", "leggings", "Nylon elastane", ["black"], TOPS, "photo-1626026397008-3316047db4fc", "High-waisted, squat-proof leggings with a smoothing waistband."],

  // ── Kids ───────────────────────────────────────────────────────────────
  ["lantern", "Sunshine Pullover Hoodie", 2990, "kids", "casual", "boys-clothing", "Cotton fleece", ["yellow"], KIDS, "photo-1586038693164-cb7ee3fb8e2c", "A bright yellow fleece hoodie with a roomy hood and kangaroo pocket."],
  ["lantern", "Smiley Slogan Sweatshirt", 2490, "kids", "casual", "girls-clothing", "Cotton fleece", ["grey"], KIDS, "photo-1678354787621-c16724e8bc5d", "A soft grey hoodie with a cheerful slogan and smiley print on the back."],
  ["lantern", "Twirl Ruffle Dress", 4490, "kids", "party", "girls-clothing", "Cotton", ["red"], KIDS, "photo-1578897367107-2828e351c8a8", "A red ruffled dress with a full skirt made for twirling at birthdays."],
  ["lantern", "Tulle Party Dress", 4990, "kids", "party", "girls-clothing", "Tulle", ["sky blue"], KIDS, "photo-1618232468971-54188a224417", "A sky-blue tulle party dress with puff sleeves and a lace hem."],
  ["lantern", "Little Denim Jacket", 3990, "kids", "casual", "boys-clothing", "Denim", ["light blue"], KIDS, "photo-1541043081679-e877f6b15b51", "A tough little denim jacket, washed soft so it's comfy from day one."],

  // ── Accessories ────────────────────────────────────────────────────────
  ["sabr", "Structured Satchel", 16900, "accessories", "formal", "bags", "Pebbled leather", ["dove grey"], ONE, "photo-1605733513597-a8f8341084e6", "A structured leather satchel with brass buckles and a detachable strap."],
  ["sabr", "Quilted Top-Handle Bag", 13900, "accessories", "party", "bags", "Quilted leather", ["blush"], ONE, "photo-1681747685985-a401c271156c", "A blush quilted bag with a top handle and a slim crossbody strap."],
  ["sabr", "Cognac Weekender", 18900, "accessories", "casual", "bags", "Vegetable-tanned leather", ["cognac"], ONE, "photo-1691480150204-66dd1eb77391", "A glossy cognac leather holdall for weekends away."],
  ["sabr", "Leather Messenger Bag", 14500, "accessories", "formal", "bags", "Leather", ["brown"], ONE, "photo-1603219527847-24c87f552a77", "A dark brown messenger with buckled flaps and room for a laptop."],
  ["sabr", "Butter Yellow Mini Bag", 11500, "accessories", "party", "bags", "Croc-embossed leather", ["yellow"], ONE, "photo-1640901555383-7335ec5a6476", "A compact top-handle bag in croc-embossed butter yellow."],
  ["sabr", "Ivory Silk Scarf", 4990, "accessories", "formal", "scarves", "Mulberry silk", ["ivory"], ONE, "photo-1606259458027-54d2a728b6ab", "A large square of pure mulberry silk with hand-rolled edges."],
  ["sabr", "Saffron Silk Scarf", 3490, "accessories", "casual", "scarves", "Silk", ["orange"], ONE, "photo-1677478863154-55ecce8c7536", "A lightweight saffron silk scarf to knot at the neck or wear in the hair."],
  ["sabr", "Round Gold-Frame Sunglasses", 6900, "accessories", "casual", "eyewear", "Metal", ["gold"], ONE, "photo-1511499767150-a48a237f0083", "Round wire-frame sunglasses with gold metal and green tinted lenses."],
  ["sabr", "Tortoise Sunglasses", 7500, "accessories", "casual", "eyewear", "Acetate", ["tortoise"], ONE, "photo-1785672021160-29cccd65500d", "Oversized acetate sunglasses in warm tortoiseshell with amber lenses."],
];

(async () => {
  if (!process.env.MONGO_URI) throw new Error("Set MONGO_URI");
  const client = await MongoClient.connect(process.env.MONGO_URI);
  const db = client.db(process.env.MONGO_DB_NAME || "dailydeals");
  try {
    if (await db.collection("users").findOne({ email: LABELS.noor.email })) {
      console.log("Catalogue already present; nothing changed.");
      return;
    }
    const urban = await db.collection("users").findOne({ email: "demo.store@dailydeals.test" });
    if (!urban) throw new Error("Run scripts/seedDemo.js first (Urban Thread owns part of this catalogue).");

    const now = new Date();
    const ids = { urban: urban._id };
    const logins = [];
    for (const [key, label] of Object.entries(LABELS)) {
      const password = crypto.randomBytes(6).toString("base64url");
      const _id = new ObjectId();
      await db.collection("users").insertOne({
        _id, name: label.owner, email: label.email, password: await bcrypt.hash(password, 10),
        userType: "storeOwner", brand_name: label.name, brand_logo: "", createdAt: now,
      });
      ids[key] = _id;
      logins.push(`${label.name}: ${label.email} / ${password}`);
    }

    const docs = P.map(([label, name, price, genre, category, subcategory, material, color, size, photo, description], i) => {
      const storeName = label === "urban" ? "Urban Thread" : LABELS[label].name;
      const created = new Date(now.getTime() - (i % 45) * 86400000);
      return {
        _id: new ObjectId(), name, description, price, genre, category, subcategory, material, color, size,
        images: [img(photo)],
        // A few sold out on purpose, so "in stock only" and out-of-stock states can be tested.
        stock: i % 17 === 5 ? 0 : 6 + ((i * 7) % 30),
        storeId: String(ids[label]), brand: storeName, brand_logo: "",
        reviewsCount: 0, views: 15 + ((i * 37) % 400), purchasedCount: (i * 13) % 40,
        ratings: 0, averageRating: 0, isAvailable: true, createdAt: created, updatedAt: created, __v: 0,
      };
    });
    await db.collection("products").insertMany(docs);

    fs.appendFileSync(path.join(__dirname, "..", "..", "DEMO_ACCOUNTS.md"), `\nCatalogue sellers:\n${logins.join("\n")}\n`);
    console.log(`Inserted 4 sellers and ${docs.length} products into "${db.databaseName}". Logins -> DEMO_ACCOUNTS.md`);
  } finally {
    await client.close();
  }
})().catch((e) => { console.error("FAIL:", e.message.replace(/\/\/[^@]*@/g, "//***@")); process.exit(1); });
