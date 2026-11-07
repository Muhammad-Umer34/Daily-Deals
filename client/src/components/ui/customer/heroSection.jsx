import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="pt-24 pb-10 md:pt-28 md:pb-16 w-full bg-white flex flex-col md:flex-row items-center justify-between gap-8 px-6 md:px-16">
      <div className="w-full md:w-1/2 text-center md:text-left space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
          Elevate Your <br /> Style This Season
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto md:mx-0">
          Discover premium fashion essentials designed to keep you stylish and
          comfortable. From statement pieces to everyday basics – redefine your
          wardrobe with confidence and flair.
        </p>
        <Link
          to="/home/all"
          className="inline-block px-6 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-colors duration-300"
        >
          Shop the Collection
        </Link>
      </div>
      <div className="w-full md:w-1/2 flex justify-center items-center">
        <img
          src="/images/hero_image.png"
          alt="Model wearing a green overshirt and dark jeans"
          className="max-w-[440px] w-full h-auto object-contain max-h-[70vh]"
        />
      </div>
    </section>
  );
}
