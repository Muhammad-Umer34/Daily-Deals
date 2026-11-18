import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import CustomerHeader from "../../components/ui/customer/header";
import ProductCard from "./card";
import Footer from "./footer";
import { getProductsForCustomer } from "../../features/customer/customerApi";
import { formatPrice } from "@/lib/utils";

const photo = (id, w = 1400, h) => `https://images.unsplash.com/${id}?w=${w}${h ? `&h=${h}` : ""}&q=80&auto=format&fit=crop`;

const CATEGORIES = [
  { label: "Women", to: "/home/women", img: "photo-1745313452052-0e4e341f326c", alt: "Block-printed white kurta set" },
  { label: "Men", to: "/home/men", img: "photo-1619603364937-8d7af41ef206", alt: "Camel wool overcoat" },
  { label: "Accessories", to: "/home/accessories", img: "photo-1691480150204-66dd1eb77391", alt: "Cognac leather weekender bag" },
  { label: "Kids", to: "/home/kids", img: "photo-1578897367107-2828e351c8a8", alt: "Red ruffled party dress" },
];

const EDITS = [
  { label: "The women's edit", to: "/home/women", img: "photo-1659522761084-79196b64abe4", alt: "Model in an ivory column dress" },
  { label: "The men's edit", to: "/home/men", img: "photo-1715536369840-9e314f847d78", alt: "Man in a long olive coat" },
];

// Shown on the home page; search links filter the listing by label name.
const LABELS = [
  ["Noor Atelier", "Occasion wear and soft tailoring"],
  ["Ashcroft Tailoring", "Suits, coats and shirting"],
  ["Studio Sabr", "Leather goods and accessories"],
  ["Urban Thread", "Linen, denim and everyday"],
  ["Little Lantern", "Childrenswear, ages 2–9"],
];

const TABS = [
  ["All", null],
  ["Women", "women"],
  ["Men", "men"],
  ["Accessories", "accessories"],
];

const PROMPTS = ["Wedding guest", "Office wear", "Weekend linen", "Gifts under $50"];

function Hero({ count }) {
  return (
    <section className="grid md:grid-cols-[5fr_7fr] md:min-h-[calc(100svh-4rem)] pt-16">
      <div className="order-2 md:order-1 flex flex-col justify-between gap-10 px-4 md:px-10 pt-10 md:pt-16 pb-12">
        <div>
          <h1 className="display-1 text-ink">
            Five labels.
            <br />
            One wardrobe.
          </h1>
          <p className="mt-7 text-lg md:text-[1.1875rem] leading-relaxed text-[#333] max-w-[25rem]">
            Independent designers, edited into one collection — tailoring, occasion wear, linen and leather for women, men and children.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/home/women" className="btn-ink">Shop women</Link>
            <Link to="/home/men" className="btn-line">Shop men</Link>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-7 gap-y-2 text-sm text-bark">
          {count > 0 && <span>{count} pieces in the collection</span>}
          <span>5 independent labels</span>
          <span>AI personal shopper</span>
        </div>
      </div>
      <div className="order-1 md:order-2 h-[62svh] md:h-auto overflow-hidden bg-parchment">
        <img
          src={photo("photo-1676716105765-e19fe6a01851", 1600, 1400)}
          alt="Woman in a belted trench coat"
          fetchPriority="high"
          className="w-full h-full object-cover object-[center_20%]"
        />
      </div>
    </section>
  );
}

function SectionHead({ title, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <h2 className="display-2 text-ink">{title}</h2>
      {children}
    </div>
  );
}

function NewArrivals({ products }) {
  const [tab, setTab] = useState(null);
  const shown = useMemo(
    () =>
      [...products]
        .filter((p) => !tab || p.genre === tab)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8),
    [products, tab]
  );
  return (
    <section className="px-4 md:px-10 pb-24" aria-labelledby="new-title">
      <SectionHead title={<span id="new-title">New arrivals</span>}>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter new arrivals">
          {TABS.map(([label, value]) => (
            <button
              key={label}
              role="tab"
              aria-selected={tab === value}
              onClick={() => setTab(value)}
              className={`px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors ${tab === value ? "bg-ink text-white" : "bg-parchment text-ink hover:bg-hairline"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </SectionHead>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 md:gap-x-4 gap-y-10">
        {shown.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
      <div className="mt-12 text-center">
        <Link to="/home/all" className="btn-line">View all {products.length || ""} pieces</Link>
      </div>
    </section>
  );
}

function AskAI() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const ask = (text) => navigate(`/assistant?q=${encodeURIComponent(text)}`);
  return (
    <section className="mx-4 md:mx-10 bg-parchment grid md:grid-cols-2 gap-10 md:gap-14 px-5 py-10 md:p-16 items-center" aria-labelledby="ask-title">
      <div>
        <h2 id="ask-title" className="text-[clamp(2.25rem,4vw,3.75rem)] font-semibold leading-none tracking-[-0.04em]">
          Not sure where to start?
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-[#333] max-w-[28rem]">
          Describe the occasion, your style and your budget. Our AI personal shopper searches every label and puts the look together with you.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) ask(q.trim());
          }}
          className="mt-7 flex items-center gap-2 bg-white p-2 pl-5"
        >
          <label htmlFor="ask-ai" className="sr-only">Ask the AI personal shopper</label>
          <input
            id="ask-ai"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`e.g. “A wedding-guest outfit under ${formatPrice(100)}”`}
            className="flex-1 min-w-0 bg-transparent text-base text-ink placeholder:text-bark focus:outline-none"
          />
          <button type="submit" className="btn-ink !min-h-11 !px-5">Ask</button>
        </form>
        <div className="mt-3.5 flex flex-wrap gap-2">
          {PROMPTS.map((p) => (
            <button key={p} onClick={() => ask(p)} className="bg-white px-3.5 py-2 text-sm font-medium cursor-pointer hover:bg-hairline transition-colors">
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white p-5 md:p-6 flex flex-col gap-3" aria-hidden="true">
        <p className="self-end max-w-[86%] bg-ink text-white px-4 py-3.5 text-[0.9375rem] leading-snug">
          Something for a summer wedding, under {formatPrice(60)}
        </p>
        <p className="max-w-[86%] bg-parchment px-4 py-3.5 text-[0.9375rem] leading-snug">
          The Embroidered Red Kurta Set from Noor Atelier — raw silk with hand embroidery. Two lighter options below.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {["photo-1765529374855-7353c3c47fc6", "photo-1747396206869-75ea57b325ce", "photo-1595777457583-95e059d581b8"].map((id) => (
            <img key={id} src={photo(id, 300, 400)} alt="" loading="lazy" className="w-full aspect-[3/4] object-cover" />
          ))}
        </div>
      </div>
    </section>
  );
}

const CustomerHome = () => {
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProductsForCustomer(user, accessToken)
      .then((r) => setProducts(Array.isArray(r) ? r : []))
      .catch((error) => console.error("Failed to fetch products:", error));
  }, [user, accessToken]);

  return (
    <div className="flex flex-col min-h-dvh w-full bg-white">
      <CustomerHeader />
      <main>
        <Hero count={products.length} />

        <section className="px-4 md:px-10 py-24" aria-labelledby="cat-title">
          <SectionHead title={<span id="cat-title">Shop by category</span>} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {CATEGORIES.map((c) => (
              <Link key={c.label} to={c.to} className="group block">
                <div className="aspect-[4/5] overflow-hidden bg-parchment">
                  <img src={photo(c.img, 700, 875)} alt={c.alt} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                </div>
                <p className="mt-3.5 flex justify-between text-lg font-semibold tracking-[-0.01em]">
                  {c.label}
                  <span aria-hidden="true">→</span>
                </p>
              </Link>
            ))}
          </div>
        </section>

        <NewArrivals products={products} />

        <section className="grid md:grid-cols-2 gap-3 md:gap-4 px-4 md:px-10" aria-label="Editorial">
          {EDITS.map((e) => (
            <Link key={e.label} to={e.to} className="group relative block h-[70svh] md:h-[88svh] overflow-hidden bg-parchment">
              <img src={photo(e.img, 1200, 1500)} alt={e.alt} loading="lazy" className="w-full h-full object-cover object-[center_20%] transition-transform duration-700 group-hover:scale-[1.03]" />
              <div className="absolute left-3 right-3 bottom-3 md:left-4 md:right-4 md:bottom-4 bg-white px-5 py-5 md:px-7 md:py-6 flex items-center justify-between gap-4">
                <span className="text-xl md:text-2xl font-semibold tracking-[-0.02em]">{e.label}</span>
                <span className="text-[0.9375rem] font-semibold underline underline-offset-[5px]">Shop now</span>
              </div>
            </Link>
          ))}
        </section>

        <section className="px-4 md:px-10 py-24" aria-labelledby="labels-title">
          <SectionHead title={<span id="labels-title">The labels</span>} />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 border-t-[1.5px] border-ink">
            {LABELS.map(([name, text]) => (
              <Link key={name} to={`/home/all?q=${encodeURIComponent(name.toLowerCase())}`} className="pt-6 pb-6 md:pb-0 pr-4 group">
                <span className="block text-xl font-semibold tracking-[-0.02em] group-hover:underline underline-offset-4">{name}</span>
                <span className="block mt-1.5 text-[0.9375rem] text-bark leading-snug">{text}</span>
              </Link>
            ))}
          </div>
        </section>

        <AskAI />
      </main>
      <Footer />
    </div>
  );
};

export default CustomerHome;
