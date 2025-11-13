import React, { useState } from 'react';

const petOptions = [
  { name: 'cachorro', icon: '🐶' },
  { name: 'gato', icon: '🐱' },
  { name: 'pássaro', icon: '🐦' },
  { name: 'silvestre', icon: '🦎' },
];

const SearchBar = () => {
  const [showPetOptions, setShowPetOptions] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-300 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-10 gap-2 items-center">
      <div className="md:col-span-3">
        <label htmlFor="destination" className="block text-sm font-medium text-gray-500">Onde</label>
        <input type="text" id="destination" placeholder="Buscar destinos" className="w-full border-none p-0 focus:ring-0" />
      </div>

      <div className="border-l border-gray-200 pl-4 md:col-span-2">
        <label htmlFor="checkin" className="block text-sm font-medium text-gray-500">Check-in</label>
        <input
          type="date"
          id="checkin"
          className="w-full border-none p-0 focus:ring-0"
          value={checkin}
          onChange={(e) => {
            setCheckin(e.target.value);
            // If checkout is before new checkin, clear checkout
            if (checkout && e.target.value && checkout < e.target.value) {
              setCheckout('');
            }
          }}
        />
      </div>

      <div className="border-l border-gray-200 pl-4 md:col-span-2">
        <label htmlFor="checkout" className="block text-sm font-medium text-gray-500">Checkout</label>
        <input
          type="date"
          id="checkout"
          className="w-full border-none p-0 focus:ring-0"
          value={checkout}
          onChange={(e) => setCheckout(e.target.value)}
          min={checkin || undefined}
        />
      </div>

      <div className="relative border-l border-gray-200 pl-4 md:col-span-2">
        <label htmlFor="pets" className="block text-sm font-medium text-gray-500">Quem</label>
        <button onClick={() => setShowPetOptions(!showPetOptions)} className="w-full text-left p-0">
          {selectedPet ? `${selectedPet.icon} ${selectedPet.name}` : 'Hóspedes?'}
        </button>
        {showPetOptions && (
          <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-lg shadow-xl border z-10">
            {petOptions.map((pet) => (
              <div 
                key={pet.name} 
                onClick={() => {
                  setSelectedPet(pet);
                  setShowPetOptions(false);
                }}
                className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
              >
                <span className="text-2xl mr-3">{pet.icon}</span>
                <span className="capitalize">{pet.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="md:col-span-1 flex justify-end">
        <button className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SearchBar;