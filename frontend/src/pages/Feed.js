import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SearchBar from '../components/common/SearchBar';
import FilterSidebar from '../components/feed/FilterSidebar';
import HostCard from '../components/host/HostCard';
import { getAllHosts } from '../services/anfitriaoService';
import { getCurrentUser } from '../services/authService';
import { getAllReservations } from '../services/reservationService';
import { SearchContext } from '../context/SearchContext';

const FeedPage = () => {
  const { searchFilters, updateSearchFilters } = useContext(SearchContext);
  const [searchParams] = useSearchParams();

  const [hosts, setHosts] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [filteredHosts, setFilteredHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isUserHost, setIsUserHost] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ especies: [], tamanhos: [] });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();

    // Check if current user is a host
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsUserHost(user.tipo === 'anfitriao');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync URL params with context on mount/update
  useEffect(() => {
    const cityParam = searchParams.get('cidade');
    const checkinParam = searchParams.get('checkin');
    const checkoutParam = searchParams.get('checkout');
    const especieParam = searchParams.get('especie');

    if (cityParam || checkinParam || checkoutParam || especieParam) {
      updateSearchFilters({
        cidade: cityParam || '',
        checkin: checkinParam || '',
        checkout: checkoutParam || '',
        especie: especieParam || ''
      });
    }
  }, [searchParams, updateSearchFilters]);

  // Apply filters whenever hosts, filters, or search params change
  useEffect(() => {
    if (!loading) {
      applyFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hosts, reservations, activeFilters, searchFilters, loading]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [anfitrioes, allReservations] = await Promise.all([
        getAllHosts(),
        getAllReservations()
      ]);
      setHosts(anfitrioes);
      setReservations(Array.isArray(allReservations) ? allReservations : []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar dados');
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const isDateRangeOverlapping = (start1, end1, start2, end2) => {
    const s1 = new Date(start1);
    const e1 = new Date(end1);
    const s2 = new Date(start2);
    const e2 = new Date(end2);
    return s1 < e2 && s2 < e1;
  };

  const applyFilters = () => {
    let filtered = [...hosts];

    // Filter by city (from search bar)
    if (searchFilters.cidade) {
      filtered = filtered.filter((host) =>
        host.location.toLowerCase().includes(searchFilters.cidade.toLowerCase())
      );
    }

    // Filter by availability (dates)
    if (searchFilters.checkin && searchFilters.checkout) {
      filtered = filtered.filter(host => {
        // Find reservations for this host that are confirmed or pending
        const hostReservations = reservations.filter(res =>
          (res.id_anfitriao === host.id_anfitriao || res.id_anfitriao === host.id) &&
          (res.status === 'confirmada' || res.status === 'pendente')
        );

        // Check if any reservation overlaps with selected dates
        const hasOverlap = hostReservations.some(res =>
          isDateRangeOverlapping(searchFilters.checkin, searchFilters.checkout, res.data_inicio, res.data_fim)
        );

        return !hasOverlap;
      });
    }

    // Filter by especie (pet type) - from search bar OR sidebar
    const especie = searchFilters.especie;
    const sidebarEspecies = activeFilters.especies;
    const especiesToFilter = especie ? [especie] : sidebarEspecies;

    if (especiesToFilter.length > 0) {
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
          const petEspecie = especieMap[pet];
          return especiesToFilter.includes(petEspecie);
        });
      });
    }

    // Filter by tamanho_pet (pet size) - only from sidebar
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
        {!isUserHost && (
          <>
            <p className="text-gray-400">|</p>
            <button
              onClick={handleBecomeHost}
              className="hover:text-red-500 font-semibold text-red-500"
            >
              Quero ser host
            </button>
          </>
        )}
      </div>


      <div className="mt-8 grid grid-cols-1 lg:grid-cols-8 gap-8">
        <div className="lg:col-span-2">
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
              <button
                onClick={fetchData}
                className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
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
        <div className="lg:col-span-3"></div>
      </div>
    </div>
  );
};

export default FeedPage;