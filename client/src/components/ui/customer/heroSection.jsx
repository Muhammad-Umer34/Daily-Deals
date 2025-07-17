export default function HeroSection() {
  return (
    <section className="pt-[80px] w-full min-h-[calc(100vh-80px)] bg-white flex flex-col md:flex-row items-center justify-between px-6 md:px-16">
      {/* Left Text Section */}
      <div className="w-full md:w-1/2 text-center md:text-left space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
          Elevate Your <br /> Style This Season
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto md:mx-0">
          Discover premium fashion essentials designed to keep you stylish and
          comfortable. From statement pieces to everyday basics – redefine your
          wardrobe with confidence and flair.
        </p>
        <button className="px-6 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-colors duration-300">
          Shop the Collection
        </button>
      </div>

      {/* Right Image Section */}
      <div className="w-full md:w-1/2 flex justify-center items-center mt-10 md:mt-0">
        <img
          src="/images/hero_image.png"
          alt="Fashion Model"
          className="max-w-[500px] w-full h-auto object-contain md:max-h-[calc(100vh-100px)]"
        />
      </div>
    </section>
  );
}
