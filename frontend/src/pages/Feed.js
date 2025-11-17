import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/common/SearchBar';
import FilterSidebar from '../components/feed/FilterSidebar';
import HostCard from '../components/host/HostCard';
import { getAllHosts } from '../services/anfitriaoService';
import { getCurrentUser } from '../services/authService';

const FeedPage = () => {
  const [hosts, setHosts] = useState([]);
  const [filteredHosts, setFilteredHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isUserHost, setIsUserHost] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ especies: [], tamanhos: [] });
  const navigate = useNavigate();

  useEffect(() => {
    fetchHosts();
    
    // Check if current user is a host
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsUserHost(user.tipo === 'anfitriao');
    }
  }, []);

  // Apply filters whenever hosts or filters change
  useEffect(() => {
    applyFilters();
  }, [hosts, activeFilters]);

  const fetchHosts = async () => {
    setLoading(true);
    setError('');
    try {
      const anfitrioes = await getAllHosts();
      setHosts(anfitrioes);
    } catch (err) {
      setError(err.message || 'Erro ao carregar anfitriões');
      console.error('Erro ao buscar hosts:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...hosts];

    // Filter by especie (pet type)
    if (activeFilters.especies.length > 0) {
      filtered = filtered.filter((host) => {
        // Check if host has any of the selected species
        return host.pets.some((pet) => {
          // Map emoji back to especie value
          const especieMap = {
            '🐶': 'cachorro',
            '🐱': 'gato',
            '🐦': 'passaro',
            '🦎': 'silvestre',
          };
          const especie = especieMap[pet];
          return activeFilters.especies.includes(especie);
        });
      });
    }

    // Filter by tamanho_pet (pet size)
    if (activeFilters.tamanhos.length > 0) {
      filtered = filtered.filter((host) =>
        activeFilters.tamanhos.includes(host.tamanhoPet)
      );
    }

    setFilteredHosts(filtered);
  };

  const handleFiltersChange = (filters) => {
    setActiveFilters(filters);
  };

  const handleBecomeHost = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    navigate('/become-host');
  };

  return (
    <div className="py-8">
      <SearchBar />
      <div className="flex justify-center mt-4 space-x-8 text-gray-600">
        <button className="hover:text-red-500">Como funciona?</button>
        <p className="text-gray-400">|</p>
        {!isUserHost && (
          <button 
            onClick={handleBecomeHost}
            className="hover:text-red-500 font-semibold text-red-500"
          >
            Quero ser host
          </button>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3">
          <FilterSidebar onFiltersChange={handleFiltersChange} />
        </div>
        <div className="lg:col-span-6 space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-600 text-lg">Carregando anfitriões...</p>
            </div>
          )}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <p>{error}</p>
              <button onClick={fetchHosts} className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                Tentar Novamente
              </button>
            </div>
          )}
          {!loading && filteredHosts.length === 0 && !error && (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-600 text-lg">
                {hosts.length === 0 
                  ? 'Nenhum anfitrião disponível no momento.'
                  : 'Nenhum anfitrião corresponde aos filtros selecionados.'}
              </p>
            </div>
          )}
          {filteredHosts.map((host) => (
            <HostCard key={host.id_anfitriao || host.id} host={host} />
          ))}
        </div>
        <div className="lg:col-span-3">
        </div>
      </div>
    </div>
  );
};

export default FeedPage;