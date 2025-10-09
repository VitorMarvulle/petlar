import React from 'react';

const HostSummaryCard = ({ host, onAboutClick, onHireClick }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-300 text-center">
      <img src={host.imageUrl} alt={host.name} className="w-24 h-24 rounded-full border-4 border-gray-200 mx-auto" />
      <h3 className="text-2xl font-bold text-gray-800 mt-4">{host.name}</h3>
      <p className="text-sm text-gray-500">{host.distance} - {host.location}</p>
      <div className="mt-2 flex justify-center space-x-2">
        {host.pets.map((pet, index) => (
          <span key={index} className="text-3xl">{pet}</span>
        ))}
      </div>
      <p className="text-3xl font-bold text-gray-800 my-4">R${host.price},00<span className="text-base font-normal text-gray-500">/dia</span></p>
      <button 
        onClick={onAboutClick}
        className="w-full bg-blue-100 text-blue-800 py-2 rounded-lg border-2 border-blue-300 hover:bg-blue-200 transition-colors"
      >
        Sobre {host.name.split(' ')[0]}
      </button>
      <button 
        onClick={onHireClick}
        className="w-full mt-4 bg-red-500 text-white font-bold py-3 px-4 rounded-lg border-2 border-gray-800 hover:bg-red-600 transition-colors"
      >
        Contratar
      </button>
    </div>
  );
};
export default HostSummaryCard;