import CategoryCard from "./categoriesCard";

const DRESS_STYLES = [
  { name: "Casual", image: "/images/casual.jpg" },
  { name: "Formal", image: "/images/formal.jpg" },
  { name: "Gym", image: "/images/gym.jpg" },
  { name: "Party", image: null },
];
const GENDERS = [
  { name: "Men", image: null },
  { name: "Women", image: null },
  { name: "Kids", image: "/images/kids.jpg" },
  { name: "Accessories", image: null },
];

const DisplayCategories = ({ name, allProducts = [] }) => {
  const isDressStyle = name === "Dress Styles";
  const cards = isDressStyle ? DRESS_STYLES : GENDERS;

  // Dress styles live in `category` (e.g. "casual"); genders live in `genre`.
  const matches = (p, term) =>
    isDressStyle ? p.category?.toLowerCase() === term : p.genre?.toLowerCase() === term;

  return (
    <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 px-4 sm:px-8 py-4">
      {cards.map((card) => {
        const products = allProducts.filter((p) => matches(p, card.name.toLowerCase()));
        // No dedicated photo: use one of the category's own products (the card shows a plain tile if none).
        const image = card.image || products[0]?.images?.[0];
        return (
          <CategoryCard key={card.name} category={{ ...card, image }} productCount={products.length} />
        );
      })}
    </div>
  );
};

export default DisplayCategories;
