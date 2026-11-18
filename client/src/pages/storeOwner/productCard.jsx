import { FaEdit, FaTrash, FaEye, FaStar } from "react-icons/fa";
import { formatPrice } from "@/lib/utils";

const ProductCard = ({ product, deleteProduct, editProduct, onEdit }) => {

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (editProduct && typeof editProduct === 'function') {
      editProduct(product._id);
    } else {
      console.error("editProduct is not a function:", editProduct);
    }
    
    if (onEdit && typeof onEdit === 'function') {
      onEdit();
    } else {
      console.error("onEdit is not a function:", onEdit);
    }
  };

  return (
    <div className="group relative bg-paper border border-hairline hover:border-ink/40 transition-colors duration-300 w-72 p-4 flex flex-col">
      <div className="relative h-44 overflow-hidden bg-parchment mb-3">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <span
          className={`absolute top-2 left-2 px-2 py-0.5 note ${
 product.stock > 10
 ?"bg-ink text-paper"
 : product.stock > 0
 ?"border border-ink/40 text-ink bg-paper"
 :"border border-oxblood/40 text-oxblood bg-paper"
 }`}
        >
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-medium text-ink text-sm line-clamp-2 mb-1">
            {product.name}
          </h3>

          <div className="flex items-center justify-between">
            <span className="font-display font-semibold tracking-[-0.02em] text-xl text-ink">
              {formatPrice(product.price)}
            </span>

            {product.totalPurchased > 0 && (
              <div className="flex items-center gap-1 text-oxblood note">
                <FaStar className="w-3 h-3" />
                <span>{product.totalPurchased}</span>
              </div>
            )}
          </div>

          {product.views > 0 && (
            <div className="flex items-center gap-1 text-bark note mt-1">
              <FaEye className="w-3 h-3" />
              <span>{product.views} views</span>
            </div>
          )}

          {product.size?.length > 0 && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {product.size.slice(0, 3).map((size, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-parchment text-bark note border border-hairline"
                >
                  {size}
                </span>
              ))}
              {product.size.length > 3 && (
                <span className="note text-bark">
                  +{product.size.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <button
          type="button"
          onClick={handleEditClick}
          className="flex-1 flex items-center justify-center gap-2 btn-ink !px-3 !py-2"
          style={{ pointerEvents: 'auto' }}
        >
          <FaEdit className="w-3 h-3" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => {
            console.log("Delete button clicked");
            deleteProduct(product._id);
          }}
          className="p-2.5 border border-hairline text-bark hover:border-ink hover:text-ink transition-colors cursor-pointer"
        >
          <FaTrash className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;