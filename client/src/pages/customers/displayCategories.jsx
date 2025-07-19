import CategoryCard from "./categoriesCard";

const DisplayCategories = () => {
  const dressStyles = [
    { id: 1, name: "Casual", image: "/images/casual.jpg" },
    { id: 2, name: "Formal", image: "/images/formal.jpg" },
    { id: 3, name: "Gym", image: "/images/gym.jpg" },
    { id: 4, name: "Party", image: "/images/party.jpg" },
  ];

  return (
    <div className="w-full flex flex-wrap justify-center gap-4 py-6">
      {dressStyles.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
};

export default DisplayCategories;