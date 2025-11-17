import React, { useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchContext } from '../../context/SearchContext';

const petOptions = [
  { name: 'cachorro', value: 'cachorro', icon: '🐶' },
  { name: 'gato', value: 'gato', icon: '🐱' },
  { name: 'pássaro', value: 'passaro', icon: '🐦' },
  { name: 'silvestre', value: 'silvestre', icon: '🦎' },
];

const SearchBar = () => {
  const navigate = useNavigate();
  const { searchFilters, updateSearchFilters } = useContext(SearchContext);

  const [showPetOptions, setShowPetOptions] = useState(false);
  const [destinationInput, setDestinationInput] = useState(searchFilters.cidade || '');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Debounce timer for API calls
  let suggestionTimer = null;

  const handleDestinationChange = useCallback(async (value) => {
    setDestinationInput(value);

    if (value.length < 1) {
      setCitySuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Clear previous timer
    clearTimeout(suggestionTimer);

    setLoadingSuggestions(true);
    suggestionTimer = setTimeout(async () => {
      try {
        // Mock city suggestions - filter by city name or state
        const brazilianCities = [
          { cidade: 'São Paulo', estado: 'SP', display: 'São Paulo, SP' },
          { cidade: 'Rio de Janeiro', estado: 'RJ', display: 'Rio de Janeiro, RJ' },
          { cidade: 'Brasília', estado: 'DF', display: 'Brasília, DF' },
          { cidade: 'Londrina', estado: 'PR', display: 'Londrina, PR' },
          { cidade: 'Campinas', estado: 'SP', display: 'Campinas, SP' },
          { cidade: 'Praia Grande', estado: 'SP', display: 'Praia Grande, SP' },
          { cidade: 'Santos', estado: 'SP', display: 'Santos, SP' },
        ];

        const filtered = brazilianCities.filter((city) =>
          city.cidade.toLowerCase().includes(value.toLowerCase()) ||
          city.estado.toLowerCase().includes(value.toLowerCase())
        );

        setCitySuggestions(filtered);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Erro ao buscar cidades:', error);
        setCitySuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);
  }, []);

  const handleSelectCity = (city) => {
    const displayName = `${city.cidade}, ${city.estado}`;
    setDestinationInput(displayName);
    updateSearchFilters({ cidade: city.cidade });
    setCitySuggestions([]);
    setShowSuggestions(false);
  };

  const handleSelectPet = (pet) => {
    updateSearchFilters({ especie: pet.value });
    setShowPetOptions(false);
  };

  const handleSearch = () => {
    // Navigate to feed if not already there
    if (window.location.pathname !== '/feed') {
      navigate('/feed');
    }
  };

  const selectedPet = petOptions.find((p) => p.value === searchFilters.especie);

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-300 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-10 gap-2 items-center">
      {/* Destination Search with City Suggestions */}
      <div className="md:col-span-3 relative">
        <label htmlFor="destination" className="block text-sm font-medium text-gray-500">
          Onde
        </label>
        <input
          type="text"
          id="destination"
          placeholder="Buscar destinos"
          value={destinationInput}
          onChange={(e) => handleDestinationChange(e.target.value)}
          className="w-full border-none p-0 focus:ring-0"
        />
        {showSuggestions && citySuggestions.length > 0 && (
          <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-lg shadow-xl border z-10 max-h-48 overflow-y-auto">
            {loadingSuggestions && (
              <div className="p-3 text-sm text-gray-500">Carregando sugestões...</div>
            )}
            {citySuggestions.map((city, index) => (
              <div
                key={index}
                onClick={() => handleSelectCity(city)}
                className="p-3 hover:bg-gray-100 cursor-pointer text-sm flex items-center space-x-2"
              >
                <span>📍</span>
                <span>{city.display}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Check-in */}
      <div className="border-l border-gray-200 pl-4 md:col-span-2">
        <label htmlFor="checkin" className="block text-sm font-medium text-gray-500">
          Check-in
        </label>
        <input
          type="date"
          id="checkin"
          className="w-full border-none p-0 focus:ring-0"
          value={searchFilters.checkin}
          onChange={(e) => {
            const newCheckin = e.target.value;
            updateSearchFilters({ checkin: newCheckin });
            // If checkout is before new checkin, clear checkout
            if (searchFilters.checkout && newCheckin && searchFilters.checkout < newCheckin) {
              updateSearchFilters({ checkout: '' });
            }
          }}
        />
      </div>

      {/* Check-out */}
      <div className="border-l border-gray-200 pl-4 md:col-span-2">
        <label htmlFor="checkout" className="block text-sm font-medium text-gray-500">
          Checkout
        </label>
        <input
          type="date"
          id="checkout"
          className="w-full border-none p-0 focus:ring-0"
          value={searchFilters.checkout}
          onChange={(e) => updateSearchFilters({ checkout: e.target.value })}
          min={searchFilters.checkin || undefined}
        />
      </div>

      {/* Pet Type Selection */}
      <div className="relative border-l border-gray-200 pl-4 md:col-span-2">
        <label htmlFor="pets" className="block text-sm font-medium text-gray-500">
          Quem
        </label>
        <button
          onClick={() => setShowPetOptions(!showPetOptions)}
          className="w-full text-left p-0 hover:text-red-500 transition-colors"
        >
          {selectedPet ? `${selectedPet.icon} ${selectedPet.name}` : 'Hóspedes?'}
        </button>
        {showPetOptions && (
          <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-lg shadow-xl border z-10">
            {petOptions.map((pet) => (
              <div
                key={pet.value}
                onClick={() => handleSelectPet(pet)}
                className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
              >
                <span className="text-2xl mr-3">{pet.icon}</span>
                <span className="capitalize">{pet.name}</span>
              </div>
            ))}
            <div
              onClick={() => {
                updateSearchFilters({ especie: '' });
                setShowPetOptions(false);
              }}
              className="flex items-center p-3 hover:bg-gray-100 cursor-pointer border-t"
            >
              <span className="text-2xl mr-3">❌</span>
              <span className="capitalize text-gray-500">Limpar seleção</span>
            </div>
          </div>
        )}
      </div>

      {/* Search Button */}
      <div className="md:col-span-1 flex justify-end">
        <button
          onClick={handleSearch}
          className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SearchBar;