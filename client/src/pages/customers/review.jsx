const ReviewBox = ({product})=>
{
  return (
     <div className="mt-10">
        <h3 className="text-lg font-semibold mb-2">Customer Reviews</h3>
        {product.reviewsCount === 0 ? (
          <p className="text-gray-400">No reviews yet.</p>
        ) : (
          <div>{/* TODO: map product.reviews here */}</div>
        )}
        <button className="mt-4 px-4 py-2 border border-gray-300 rounded hover:bg-gray-100">
          Write a Review
        </button>
      </div>
  )
}
export default ReviewBox;