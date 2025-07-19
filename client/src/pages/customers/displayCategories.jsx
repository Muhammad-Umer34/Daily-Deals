import CategoryCard from "./categoriesCard";

const DisplayCategories = ({name}) => {
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
    { id: 4, name: "Acessories", image: "/images/kids.jpg" },
  ]
  let array = [];
  if(name === "Dress Styles")
  {
    array = dressStyles;
  }
  else{
    array = Gender;
  }
  return (
    <div className="w-full flex flex-wrap justify-center gap-4 py-6">
      {array.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
};

export default DisplayCategories;