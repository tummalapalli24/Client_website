import React from 'react';
import { Star } from 'lucide-react';

interface Review {
    id: number;
    author: string;
    rating: number;
    date: string;
    text: string;
}

interface ProductReviewsProps {
    reviews: Review[];
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ reviews }) => {
    return (
        <div id="reviews" className="reviews-section">
            <h2>Customer Reviews</h2>
            <div className="reviews-list">
                {reviews && reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.id} className="review-card">
                            <div className="stars">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star
                                        key={s}
                                        size={14}
                                        fill={s <= review.rating ? "var(--color-accent)" : "none"}
                                        color="var(--color-accent)"
                                    />
                                ))}
                            </div>
                            <h4 className="review-author">{review.author} <span>- {review.date}</span></h4>
                            <p className="review-text">{review.text}</p>
                        </div>
                    ))
                ) : (
                    <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
                )}
            </div>
        </div>
    );
};

export default ProductReviews;
