import { Link } from "react-router-dom";

const Separator = ({ name, viewAll }) => {
  return (
    <div className="bg-white w-full flex items-center justify-between px-4 sm:px-8 pt-8 pb-2">
      <h2 className="text-2xl md:text-3xl text-black font-extrabold">{name}</h2>
      {viewAll && (
        <Link to={viewAll} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">
          View All →
        </Link>
      )}
    </div>
  );
};

export default Separator;
