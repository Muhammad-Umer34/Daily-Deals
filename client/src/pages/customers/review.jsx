import { useState, useEffect } from "react";
import { AiFillStar } from "react-icons/ai";
import { useSelector } from "react-redux";
import { postReview, getAllReviews } from "../../features/customer/customerApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

const StarRating = ({ rating, setRating }) => {
  return (
    <div className="flex mb-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <AiFillStar
          key={star}
          size={28}
          className={`cursor-pointer ${rating >= star ? "text-yellow-400" : "text-gray-300"}`}
          onClick={() => setRating && setRating(star)}
        />
      ))}
    </div>
  );
};

const ReviewBox = ({ product }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await getAllReviews(product._id, accessToken, user?.id);
        setReviews(response || []);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      }
    };

    if (product?._id) {
      fetchReviews();
    }
  }, [reviewSubmitted, product._id, accessToken, user?.id]);

  const handleWriteReview = () => {
    if (!user || !user.id) {
      alert("Please login first to write a review.");
      navigate("/login");
      return;
    }
    setShowForm(true);
  };

  const handleSubmit = async () => {
    try {
      await postReview(product._id, { rating, comment, user }, accessToken);
      setRating(0);
      setComment("");
      setShowForm(false);
      setReviewSubmitted(!reviewSubmitted);
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("Failed to submit review. Please try again.");
    }
  };

  return (
    <div className="mt-10">
      <h3 className="text-lg font-semibold mb-2">Customer Reviews</h3>

      {reviews.length === 0 ? (
        <p className="text-gray-400">No reviews yet.</p>
      ) : (
        <div>
          {reviews.map((review) => (
            <div key={review._id} className="border p-4 mb-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Avatar className="mr-2">
                  <AvatarImage src={review.userProfilePhoto} />
                  <AvatarFallback>{review.userName[0]}</AvatarFallback>
                </Avatar>
                <span className="font-semibold">{review.userName}</span>
              </div>
              <StarRating rating={review.rating} />
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleWriteReview}
        className="mt-4 px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
      >
        Write a Review
      </button>

      {showForm && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white shadow-lg p-6 rounded-xl w-96 relative">
            <h2 className="text-lg font-semibold mb-4">Write a Review</h2>

            <StarRating rating={rating} setRating={setRating} />

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your review..."
              rows="4"
              className="w-full border p-2 rounded mb-4"
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewBox;
