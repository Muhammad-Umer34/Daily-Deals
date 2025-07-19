const Separator = ({ name }) => {
  return (
    <div className="bg-white w-full flex items-center justify-between px-8 py-2 my-4">
      <h1 className={`${name === "Shop By Category" ? "text-3xl" : "text-2xl"} text-black font-extrabold`}>
        {name}
      </h1>
      {name !== "Shop By Category" && name !== "Dress Styles"  && name !== "Shop By Gender"  ? (
        <button className="text-gray-700 hover:text-blue-600 transition cursor-pointer">View All</button>
      ) : null}
    </div>
  );
};

export default Separator;