const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 px-4 mt-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h2 className="text-white text-2xl font-bold mb-4">MonoFit</h2>
          <p className="text-sm">
            Discover a wide range of products at the best prices. Shop smart, live better.
          </p>
        </div>
        <div>
          <h3 className="text-white text-lg font-semibold mb-3">Shop By</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">Men</a></li>
            <li><a href="#" className="hover:text-white">Women</a></li>
            <li><a href="#" className="hover:text-white">Kids</a></li>
            <li><a href="#" className="hover:text-white">Accessories</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">Home</a></li>
            <li><a href="#" className="hover:text-white">Shop</a></li>
            <li><a href="#" className="hover:text-white">Cart</a></li>
            <li><a href="#" className="hover:text-white">Contact Us</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white text-lg font-semibold mb-3">Newsletter</h3>
          <p className="text-sm mb-3">Subscribe to get updates on our latest offers.</p>
          <form className="flex">
            <input
              type="email"
              placeholder="Email address"
              className="px-3 py-2 w-full rounded-l-md focus:outline-none"
            />
            <button className="bg-blue-600 hover:bg-blue-700 px-4 rounded-r-md text-white">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 mt-10 border-t pt-5">
        &copy; {new Date().getFullYear()} MonoFit. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
