// Adds a demo seller ("Urban Thread"), a demo customer, 8 products and a few orders to the
// database in MONGO_URI. Additive only: exits if the demo seller already exists.
// Usage: MONGO_URI=... node scripts/seedDemo.js   -> writes ../DEMO_ACCOUNTS.md (git-ignored)
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { MongoClient, ObjectId } = require("mongodb");

const SITE = "https://daily-deals-phi.vercel.app/images"; // static photos served by the frontend
const STORE_EMAIL = "demo.store@dailydeals.test";
const CUSTOMER_EMAIL = "demo.customer@dailydeals.test";

const PRODUCTS = [
  ["Linen Summer Shirt", 2490, "men", "casual", "shirts", "Linen", ["white", "beige"], `${SITE}/casual.jpg`, "Breathable pure-linen shirt with a relaxed fit, made for hot summer days."],
  ["Classic Oxford Shirt", 3290, "men", "formal", "shirts", "Cotton", ["white", "blue"], `${SITE}/formal.jpg`, "Crisp cotton Oxford shirt with a button-down collar, ideal for the office."],
  ["Performance Gym Tank", 1590, "men", "gym", "t-shirt", "Polyester", ["black", "gray"], `${SITE}/gym.jpg`, "Lightweight, quick-dry tank top that keeps you cool through every workout."],
  ["Training Joggers", 2190, "women", "gym", "joggers", "Cotton blend", ["black", "navy"], `${SITE}/gym.jpg`, "Soft tapered joggers with a drawstring waist and zip pockets for training days."],
  ["Kids Graphic Tee", 990, "kids", "casual", "boys-clothing", "Cotton", ["yellow", "blue"], `${SITE}/kids.jpg`, "Bright, comfy cotton tee with a playful print that survives the wash."],
  ["Kids Party Dress", 2790, "kids", "party", "girls-clothing", "Tulle", ["pink", "purple"], `${SITE}/kids.jpg`, "Twirl-ready tulle dress with a satin bodice for birthdays and celebrations."],
  ["Evening Glam Set", 4490, "women", "party", "tops", "Satin", ["maroon", "black"], `${SITE}/party.jpg`, "Statement satin top for evening events, paired with matching accessories."],
  ["Leather Crossbody Bag", 3990, "accessories", "party", "bags", "Faux leather", ["brown", "black"], `${SITE}/party.jpg`, "Compact crossbody bag with an adjustable strap and room for all the essentials."],
];

(async () => {
  if (!process.env.MONGO_URI) throw new Error("Set MONGO_URI");
  const client = await MongoClient.connect(process.env.MONGO_URI);
  const db = client.db(); // database named in the URI
  try {
    if (await db.collection("users").findOne({ email: STORE_EMAIL })) {
      console.log("Demo data already present; nothing changed.");
      return;
    }
    const storePassword = crypto.randomBytes(6).toString("base64url");
    const customerPassword = crypto.randomBytes(6).toString("base64url");
    const now = new Date();
    const daysAgo = (d) => new Date(now.getTime() - d * 86400000);

    const storeId = new ObjectId();
    const customerId = new ObjectId();
    await db.collection("users").insertMany([
      { _id: storeId, name: "Ayesha Khan", email: STORE_EMAIL, password: await bcrypt.hash(storePassword, 10), userType: "storeOwner",
        brand_name: "Urban Thread", brand_logo: `${SITE}/daily_deals.png`, createdAt: now },
      { _id: customerId, name: "Demo Customer", email: CUSTOMER_EMAIL, password: await bcrypt.hash(customerPassword, 10), userType: "customer",
        address: ["House 12, Street 4, Gulberg III, Lahore"], phoneNumber: ["03001234567"], createdAt: now },
    ]);

    const products = PRODUCTS.map(([name, price, genre, category, subcategory, material, color, image, description], i) => ({
      _id: new ObjectId(), name, description, price, genre, category, subcategory, material, color,
      size: genre === "accessories" ? ["one size"] : ["s", "m", "l", "xl"],
      images: [image], stock: 25, storeId: String(storeId), brand: "Urban Thread", brand_logo: `${SITE}/daily_deals.png`,
      reviewsCount: 0, views: 10 + i * 7, purchasedCount: 0, ratings: 0, averageRating: 0, isAvailable: true,
      createdAt: daysAgo(i), updatedAt: daysAgo(i), __v: 0,
    }));
    await db.collection("products").insertMany(products);

    // [product indexes with quantities, days ago, status] -> spreads revenue across the dashboard charts.
    const ORDERS = [[[[0, 1], [4, 2]], 20, "Dispatched"], [[[2, 1]], 9, "Dispatched"], [[[6, 1], [7, 1]], 3, "Pending"], [[[1, 2]], 1, "Pending"]];
    for (const [lines, ago, status] of ORDERS) {
      const orderId = new ObjectId();
      const items = lines.map(([idx, quantity]) => {
        const p = products[idx];
        return { productId: String(p._id), name: p.name, image: p.images[0], price: p.price, quantity, color: p.color[0], size: p.size[0], storeId: String(storeId) };
      });
      const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
      await db.collection("orders").insertOne({
        _id: orderId, items, totalPrice: subtotal + (subtotal >= 2000 ? 0 : 200), userId: customerId,
        shippingAddress: "House 12, Street 4, Gulberg III, Lahore", orderStatus: status, paymentStatus: "Pending",
        paymentMethod: "Cash on Delivery", phoneNumber: "03001234567", expectedDeliveryDate: daysAgo(ago - 7),
        userName: "Demo Customer", userEmail: CUSTOMER_EMAIL, createdAt: daysAgo(ago), __v: 0,
      });
      await db.collection("storeorders").insertMany(items.map((i) => ({
        userId: String(customerId), productId: i.productId, storeId: String(storeId), quantity: i.quantity, size: i.size, color: i.color,
        price: i.price, productName: i.name, productImage: i.image, parentOrderId: String(orderId), userName: "Demo Customer",
        userEmail: CUSTOMER_EMAIL, status, createdAt: daysAgo(ago), __v: 0,
      })));
      for (const i of items) {
        await db.collection("products").updateOne({ _id: new ObjectId(i.productId) }, { $inc: { stock: -i.quantity, purchasedCount: i.quantity } });
      }
    }

    fs.writeFileSync(path.join(__dirname, "..", "..", "DEMO_ACCOUNTS.md"),
      `# Demo accounts (live site) — do not commit\n\nSeller (Urban Thread): ${STORE_EMAIL} / ${storePassword}\nCustomer: ${CUSTOMER_EMAIL} / ${customerPassword}\n`);
    console.log(`Inserted 2 users, ${products.length} products, ${ORDERS.length} orders into "${db.databaseName}". Credentials -> DEMO_ACCOUNTS.md`);
  } finally {
    await client.close();
  }
})().catch((e) => { console.error("FAIL:", e.message.replace(/\/\/[^@]*@/g, "//***@")); process.exit(1); });
