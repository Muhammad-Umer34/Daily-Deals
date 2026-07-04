import CategoryCard from "./categoriesCard";

const DisplayCategories = ({ name, allProducts = [] }) => {
  const dressStyles = [
    { id: 1, name: "Casual", image: "/images/casual.jpg" },
    { id: 2, name: "Formal", image: "/images/formal.jpg" },
    { id: 3, name: "Gym", image: "/images/gym.jpg" },
    { id: 4, name: "Party", image: "/images/party.jpg" },
  ];
  const Gender = [
    { id: 1, name: "Men", image: "/images/kids.jpg" },
    { id: 2, name: "Women", image: "/images/kids.jpg" },
    { id: 3, name: "Kids", image: "/images/kids.jpg" },
    { id: 4, name: "Accessories", image: "/images/kids.jpg" },
  ];

  let array = [];
  const isDressStyle = name === "Dress Styles";
  if (isDressStyle) {
    array = dressStyles;
  } else {
    array = Gender;
  }

  const getProductCount = (categoryName) => {
    const term = categoryName.toLowerCase();
    if (isDressStyle) {
      return allProducts.filter(
        (p) => p.subcategory?.toLowerCase() === term
      ).length;
    } else {
      return allProducts.filter(
        (p) =>
          p.genre?.toLowerCase() === term ||
          p.category?.toLowerCase() === term
      ).length;
    }
  };

  return (
    <div className="w-full flex flex-wrap justify-center gap-4 py-6">
      {array.map((category) => (
        <CategoryCard 
          key={category.id} 
          category={category} 
          productCount={getProductCount(category.name)} 
        />
      ))}
    </div>
  );
};

export default DisplayCategories;