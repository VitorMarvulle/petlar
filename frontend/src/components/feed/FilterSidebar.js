import React, { useState, useContext, useEffect } from 'react';
import { SearchContext } from '../../context/SearchContext';

const FilterSidebar = ({ onFiltersChange }) => {
  const { searchFilters } = useContext(SearchContext);
  const [selectedEspecies, setSelectedEspecies] = useState([]);
  const [selectedTamanho, setSelectedTamanho] = useState([]);

  const petTypes = [
    { value: 'cachorro', label: 'Cachorro', emoji: '🐶' },
    { value: 'gato', label: 'Gato', emoji: '🐱' },
    { value: 'passaro', label: 'Pássaro', emoji: '🐦' },
    { value: 'silvestre', label: 'Silvestre', emoji: '🦎' },
  ];

  const tamanhosPet = [
    { value: 'pequeno', label: 'Pequeno', emoji: '🐭' },
    { value: 'medio', label: 'Médio', emoji: '🐕' },
    { value: 'grande', label: 'Grande', emoji: '🐘' },
  ];

  // Initialize species from search context if a pet type is selected via SearchBar
  useEffect(() => {
    if (searchFilters.especie && !selectedEspecies.includes(searchFilters.especie)) {
      setSelectedEspecies([searchFilters.especie]);
      onFiltersChange({ especies: [searchFilters.especie], tamanhos: selectedTamanho });
    }
  }, [searchFilters.especie]);

  const toggleEspecie = (especie) => {
    const updated = selectedEspecies.includes(especie)
      ? selectedEspecies.filter((e) => e !== especie)
      : [...selectedEspecies, especie];
    setSelectedEspecies(updated);
    onFiltersChange({ especies: updated, tamanhos: selectedTamanho });
  };

  const toggleTamanho = (tamanho) => {
    const updated = selectedTamanho.includes(tamanho)
      ? selectedTamanho.filter((t) => t !== tamanho)
      : [...selectedTamanho, tamanho];
    setSelectedTamanho(updated);
    onFiltersChange({ especies: selectedEspecies, tamanhos: updated });
  };

  const clearFilters = () => {
    setSelectedEspecies([]);
    setSelectedTamanho([]);
    onFiltersChange({ especies: [], tamanhos: [] });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-300 sticky top-20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Filtros:</h3>
        {(selectedEspecies.length > 0 || selectedTamanho.length > 0) && (
          <button
            onClick={clearFilters}
            className="text-xs font-semibold text-red-500 hover:text-red-700 underline"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Filtro por Espécie */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-3">Espécie:</h4>
        <div className="space-y-2">
          {petTypes.map((pet) => (
            <label
              key={pet.value}
              className="flex items-center p-2 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedEspecies.includes(pet.value)}
                onChange={() => toggleEspecie(pet.value)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2"
              />
              <span className="text-lg ml-2">{pet.emoji}</span>
              <span className="text-sm text-gray-700 ml-2">{pet.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Filtro por Tamanho do Pet */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-3">Tamanho do Pet:</h4>
        <div className="space-y-2">
          {tamanhosPet.map((tamanho) => (
            <label
              key={tamanho.value}
              className="flex items-center p-2 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedTamanho.includes(tamanho.value)}
                onChange={() => toggleTamanho(tamanho.value)}
                className="w-4 h-4 text-green-600 rounded focus:ring-2"
              />
              <span className="text-lg ml-2">{tamanho.emoji}</span>
              <span className="text-sm text-gray-700 ml-2">{tamanho.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
