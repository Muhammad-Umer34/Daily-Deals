import { useState, useEffect } from "react";
import { AiFillStar } from "react-icons/ai";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { postReview, getAllReviews } from "../../features/customer/customerApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const StarRating = ({ rating, setRating }) => (
  <div className="flex mb-3" role={setRating ? "radiogroup" : undefined} aria-label={setRating ? "Rating" : `${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) =>
      setRating ? (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={rating === star}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          onClick={() => setRating(star)}
          className="cursor-pointer"
        >
          <AiFillStar size={28} className={rating >= star ? "text-oxblood" : "text-bark/50"} />
        </button>
      ) : (
        <AiFillStar key={star} size={18} aria-hidden="true" className={rating >= star ? "text-oxblood" : "text-bark/50"} />
      )
    )}
  </div>
);

const ReviewBox = ({ product }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    getAllReviews(product._id, accessToken, user?.id)
      .then((r) => setReviews(r || []))
      .catch(() => setReviews([]));
  }, [refresh, product._id, accessToken, user?.id]);

  const handleWriteReview = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setShowForm(true);
  };

  const handleSubmit = async () => {
    setError("");
    try {
      await postReview(product._id, { rating, comment }, accessToken);
      setRating(0);
      setComment("");
      setShowForm(false);
      setRefresh((n) => n + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't submit your review. Please try again.");
    }
  };

  return (
    <section className="mt-12 border-t border-hairline pt-8">
      <p className="note mb-1">In their words</p>
      <h2 className="font-display font-semibold tracking-[-0.02em] text-3xl text-ink mb-5">Customer reviews</h2>
      {reviews.length === 0 ? (
        <p className="text-bark">No reviews yet. Be the first to share your thoughts.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="border border-hairline p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Avatar className="mr-2">
                  <AvatarImage src={review.userProfilePhoto} />
                  <AvatarFallback>{review.userName?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <span className="font-semibold">{review.userName}</span>
              </div>
              <StarRating rating={review.rating} />
              <p className="text-ink">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={handleWriteReview}
        className="mt-6 px-5 py-3 border border-hairline hover:border-ink font-meta text-xs text-ink transition-colors active:translate-y-px cursor-pointer"
      >
        {user ? "Write a review" : "Log in to write a review"}
      </button>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-ink/40 flex items-start justify-center pt-24 px-4" role="dialog" aria-modal="true" aria-label="Write a review">
          <div className="bg-paper p-6 rounded-xl w-full max-w-sm">
            <h3 className="font-display font-semibold tracking-[-0.02em] text-2xl text-ink mb-4">Write a review</h3>
            <StarRating rating={rating} setRating={setRating} />
            <label htmlFor="review-comment" className="sr-only">Your review</label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you think?"
              rows="4"
              className="w-full border border-hairline p-2 rounded-md mb-3"
            />
            {error && <p className="text-sm text-oxblood mb-3">{error}</p>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-parchment cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!rating}
                className="px-4 py-2 text-sm bg-ink text-paper rounded-md hover:opacity-80 disabled:opacity-50 cursor-pointer"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ReviewBox;
