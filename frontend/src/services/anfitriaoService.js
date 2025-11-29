// anfitriaoService.js - Fetch hosts (anfitrioes) from backend

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Map especie (pet type) to emoji
 * @param {string} especie - Pet type
 * @returns {string} - Emoji representation
 */
const especieToEmoji = (especie) => {
  const emojiMap = {
    'cachorro': '🐶',
    'gato': '🐱',
    'passaro': '🐦',
    'silvestre': '🦎',
  };
  return emojiMap[especie] || '🐾';
};

/**
 * Transform Anfitriao database data to HostCard format
 * @param {Object} anfitriao - Raw anfitriao data from backend (with nested usuarios)
 * @returns {Object} - Transformed data for HostCard component
 */
const transformAnfitriaoToHostCard = (anfitriao) => {
  // Extract user data (it's nested as an array from Supabase join)
  const usuario = Array.isArray(anfitriao.usuarios) ? anfitriao.usuarios[0] : anfitriao.usuarios;

  const nome = usuario?.nome || `Host ${anfitriao.id_anfitriao}`;
  const cidade = usuario?.cidade || 'Localização desconhecida';
  const bairro = usuario?.bairro || '';
  const location = bairro ? `${cidade}, ${bairro}` : cidade;

  // Convert especie array to emojis
  const pets = anfitriao.especie && Array.isArray(anfitriao.especie)
    ? anfitriao.especie.map(especieToEmoji)
    : ['🐾'];

  return {
    id: anfitriao.id_anfitriao,
    id_anfitriao: anfitriao.id_anfitriao,
    name: nome,
    description: anfitriao.descricao || 'Sem descrição',
    distance: '1.5km', // TODO: Calculate from user location and host location
    location: location,
    price: anfitriao.preco || 60,
    rating: anfitriao.rating || 5, // TODO: Calculate from reviews
    pets: pets, // Convert especie to emojis
    tamanhoPet: anfitriao.tamanho_pet || 'medio',
    imageUrl: usuario?.imagem_usuario || `https://avatar.iran.liara.run/public?username=${anfitriao.id_anfitriao}`,
    capacidade_maxima: anfitriao.capacidade_maxima,
    status: anfitriao.status,
    reviews: anfitriao.reviews || [],
    usuario: usuario, // Store user data for detailed view
    fotos: typeof anfitriao.fotos_urls === 'string'
      ? JSON.parse(anfitriao.fotos_urls)
      : (anfitriao.fotos_urls || []),
  };
};

/**
 * Get all hosts (anfitrioes)
 * @returns {Promise<Array>} - List of hosts
 */
export const getAllHosts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/anfitrioes/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar anfitriões');
    }

    const anfitrioes = await response.json();

    // Transform data to HostCard format
    const transformedHosts = anfitrioes.map(transformAnfitriaoToHostCard);

    return transformedHosts;
  } catch (error) {
    throw new Error(error.message || 'Erro ao buscar anfitriões');
  }
};

/**
 * Get a single host by ID
 * @param {number} id - Host ID
 * @returns {Promise<Object>} - Host data
 */
export const getHostById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/anfitrioes/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar anfitrião');
    }

    const anfitriao = await response.json();

    // Transform data to HostCard format
    return transformAnfitriaoToHostCard(anfitriao);
  } catch (error) {
    throw new Error(error.message || 'Erro ao buscar anfitrião');
  }
};

/**
 * Get hosts by status
 * @param {string} status - Status filter (pending, active, inactive, banned)
 * @returns {Promise<Array>} - Filtered hosts
 */
export const getHostsByStatus = async (status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/anfitrioes/status/${status}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar anfitriões por status');
    }

    const anfitrioes = await response.json();

    // Transform data to HostCard format
    const transformedHosts = anfitrioes.map(transformAnfitriaoToHostCard);

    return transformedHosts;
  } catch (error) {
    throw new Error(error.message || 'Erro ao buscar anfitriões por status');
  }
};
