import ProductCard from "./card";

// Renders a product grid; `product` is undefined while the parent is still loading.
const ShowProducts = ({ product }) => {
  if (!product?.length) {
    return <p className="text-center text-gray-500 py-12">No products to show yet.</p>;
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 px-4 sm:px-8 py-4">
      {product.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
};

export default ShowProducts;
