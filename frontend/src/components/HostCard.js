import React from 'react';

const renderStars = (rating) => {
  let stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    );
  }
  return stars;
};

const HostCard = ({ host, onClick }) => {
  return (
    <div 
        className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-300 flex items-center space-x-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        onClick={() => onClick(host)}
    >
      <div className="flex-shrink-0">
        <img src={host.imageUrl} alt={host.name} className="w-20 h-20 rounded-full border-2 border-gray-200" />
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{host.name}</h3>
            <p className="text-sm text-gray-500">{host.distance} - {host.location}</p>
            <div className="mt-1 flex items-center space-x-2">
              {host.pets.map((pet, index) => (
                <span key={index} className="text-xl">{pet}</span>
              ))}
            </div>
          </div>
          <div className="text-lg flex items-center">{renderStars(host.rating)}</div>
        </div>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold text-gray-800">R${host.price},00<span className="text-sm font-normal text-gray-500">/dia</span></p>
      </div>
    </div>
  );
};

export default HostCard;

