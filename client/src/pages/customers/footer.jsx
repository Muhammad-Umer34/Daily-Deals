import { Link } from "react-router-dom";

const SHOP = [["Men", "/home/men"], ["Women", "/home/women"], ["Kids", "/home/kids"], ["Accessories", "/home/accessories"]];
const LINKS = [["Home", "/home"], ["Shop All", "/home/all"], ["Cart", "/customer/cart"], ["My Account", "/home/profile"]];

const FooterList = ({ title, links }) => (
  <div>
    <h3 className="text-white text-lg font-semibold mb-3">{title}</h3>
    <ul className="space-y-2 text-sm">
      {links.map(([label, to]) => (
        <li key={to}>
          <Link to={to} className="hover:text-white">{label}</Link>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 px-6 mt-12">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2">
          <h2 className="text-white text-2xl font-bold mb-3">Daily Deals</h2>
          <p className="text-sm max-w-sm">
            Discover a wide range of products at the best prices. Shop smart, live better.
          </p>
          <p className="text-sm mt-3">
            Questions? <a href="mailto:support@dailydeals.pk" className="text-white hover:underline">support@dailydeals.pk</a>
          </p>
        </div>
        <FooterList title="Shop By" links={SHOP} />
        <FooterList title="Quick Links" links={LINKS} />
      </div>
      <div className="max-w-7xl mx-auto text-center text-sm text-gray-500 mt-10 border-t border-gray-700 pt-5">
        &copy; {new Date().getFullYear()} Daily Deals. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
