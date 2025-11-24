import React, { createContext, useState, useCallback } from 'react';

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchFilters, setSearchFilters] = useState({
    cidade: '',
    checkin: '',
    checkout: '',
    especie: '', // 'cachorro', 'gato', 'passaro', 'silvestre'
  });

  const updateSearchFilters = useCallback((filters) => {
    setSearchFilters((prev) => ({
      ...prev,
      ...filters,
    }));
  }, []);

  const clearSearchFilters = useCallback(() => {
    setSearchFilters({
      cidade: '',
      checkin: '',
      checkout: '',
      especie: '',
    });
  }, []);

  return (
    <SearchContext.Provider value={{ searchFilters, updateSearchFilters, clearSearchFilters }}>
      {children}
    </SearchContext.Provider>
  );
};
