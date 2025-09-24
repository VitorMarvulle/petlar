import React from 'react';

const renderStars = (rating) => {
  let stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
    );
  }
  return stars;
};

const ReviewCard = ({ review }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-300 flex space-x-4">
      <img src={`https://placehold.co/64x64/E0E0E0/000000?text=${review.author.charAt(0)}`} alt={review.author} className="w-16 h-16 rounded-full border-2 border-gray-200" />
      <div>
        <div className="flex items-center justify-between">
            <h4 className="font-bold text-lg text-gray-800">{review.author}</h4>
            <div className="flex text-lg">{renderStars(review.rating)}</div>
        </div>
        <p className="text-gray-600 mt-1">{review.comment}</p>
      </div>
    </div>
  );
};

export default ReviewCard;