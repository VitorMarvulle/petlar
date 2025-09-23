import React from 'react';

const FilterSidebar = () => {
  const sizes = [
    { label: '< 7kg', icon: '🐾' },
    { label: '7-18kg', icon: '🐾' },
    { label: '18-25kg', icon: '🐾' },
    { label: '25-45kg', icon: '🐾' },
    // { label: '> 45kg', icon: '🐾' },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-300 h-full">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Filtros:</h3>
      <div>
        <h4 className="font-semibold text-gray-700 mb-3">Tamanho:</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4">
          {sizes.map((size, index) => (
            <button key={index} className="text-center p-2 border-2 border-gray-300 rounded-lg hover:border-red-400 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400">
              <div className="text-3xl"> {/* Ícone placeholder */}
                {/* Você pode substituir isso por SVGs mais elaborados se desejar */}
                🐶
              </div>
              <span className="text-xs text-gray-600">{size.label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Adicionar mais filtros aqui no futuro */}
    </div>
  );
};

export default FilterSidebar;
