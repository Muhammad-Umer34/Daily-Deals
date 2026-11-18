import { Link } from "react-router-dom";
import { formatPrice, FREE_DELIVERY_FROM } from "@/lib/utils";

const COLUMNS = [
  ["Shop", [["Women", "/home/women"], ["Men", "/home/men"], ["Kids", "/home/kids"], ["Accessories", "/home/accessories"], ["Everything", "/home/all"]]],
  ["Help", [["AI personal shopper", "/assistant"], ["My account", "/home/profile"], ["My bag", "/customer/cart"]]],
  ["Company", [["Sell with us", "/brand-signup"], ["Create an account", "/signup"]]],
];

const Footer = () => {
  return (
    <footer className="bg-white text-ink px-4 md:px-10 pt-24 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-20">
        {[
          ["Free delivery", `On orders over ${formatPrice(FREE_DELIVERY_FROM)}.`],
          ["7-day returns", "Unworn, with tags attached."],
          ["Personal shopping", "Ask our AI shopper any time, in your own words."],
        ].map(([title, text]) => (
          <div key={title} className="pt-6 border-t-[1.5px] border-ink">
            <p className="text-xl font-semibold tracking-[-0.02em]">{title}</p>
            <p className="text-bark mt-2">{text}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-[0.9375rem]">
        {COLUMNS.map(([title, links]) => (
          <nav key={title} aria-label={title}>
            <h2 className="font-semibold mb-3">{title}</h2>
            <ul className="space-y-2">
              {links.map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="text-bark hover:text-ink transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div>
          <h2 className="font-semibold mb-3">Contact</h2>
          <a href="mailto:support@dailydeals.pk" className="text-bark hover:text-ink transition-colors break-all">support@dailydeals.pk</a>
        </div>
      </div>

      {/* SVG text stretched to its viewBox, so the name runs exactly margin to margin. */}
      <svg viewBox="0 0 1000 148" className="mt-20 w-full h-auto fill-ink" aria-hidden="true">
        <text x="0" y="140" textLength="1000" lengthAdjust="spacingAndGlyphs" fontFamily="Instrument Sans, sans-serif" fontWeight="700" fontSize="192">
          MONOFIT
        </text>
      </svg>
      <div className="mt-6 flex flex-col md:flex-row justify-between gap-2 text-[0.8125rem] text-bark">
        <span>© {new Date().getFullYear()} MonoFit</span>
        <span>Independent labels, one wardrobe.</span>
      </div>
    </footer>
  );
};

export default Footer;
