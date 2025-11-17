// becomeHostService.js - Service to create anfitriao

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Create a new anfitriao (host) for the current user
 * @param {Object} data - { id_anfitriao, descricao, capacidade_maxima, especie, tamanho, preco, status }
 * @returns {Promise<Object>} - Created anfitriao data
 */
export const createAnfitriao = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/anfitrioes/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_anfitriao: data.id_anfitriao,
        descricao: data.descricao,
        capacidade_maxima: data.capacidade_maxima,
        especie: data.especie || [], // Array of pet types
        tamanho: data.tamanho, // Size of space
        preco: data.preco, // Daily price
        status: 'ativo', // New hosts start as active
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Create anfitriao error:', errorData);
      
      if (errorData.detail && Array.isArray(errorData.detail)) {
        const errors = errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
        throw new Error(errors);
      }
      throw new Error(errorData.detail || 'Erro ao criar perfil de host');
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw new Error(error.message || 'Erro ao criar perfil de host');
  }
};
