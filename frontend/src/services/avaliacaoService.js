// avaliacaoService.js - Fetch reviews (avaliacoes) from backend

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Get all reviews for a specific host
 * @param {number} id_avaliado - Host ID (id_usuario)
 * @returns {Promise<Array>} - List of reviews
 */
export const getAvaliacoesByHost = async (id_avaliado) => {
  try {
    const response = await fetch(`${API_BASE_URL}/avaliacoes/avaliado/${id_avaliado}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar avaliações');
    }

    const avaliacoes = await response.json();
    
    // Transform to ReviewCard format
    return avaliacoes.map((avaliacao) => ({
      author: avaliacao.autor_nome || 'Usuário anônimo',
      rating: avaliacao.estrelas || 5,
      comment: avaliacao.comentario || '',
    }));
  } catch (error) {
    throw new Error(error.message || 'Erro ao buscar avaliações');
  }
};

/**
 * Get average rating for a host
 * @param {number} id_avaliado - Host ID
 * @returns {Promise<number>} - Average rating (1-5)
 */
export const getAverageRating = async (id_avaliado) => {
  try {
    const avaliacoes = await getAvaliacoesByHost(id_avaliado);
    
    if (avaliacoes.length === 0) {
      return 5; // Default to 5 if no reviews
    }
    
    const sum = avaliacoes.reduce((acc, curr) => acc + curr.rating, 0);
    return Math.round((sum / avaliacoes.length) * 10) / 10; // Round to 1 decimal
  } catch (error) {
    console.error('Erro ao calcular rating:', error);
    return 5;
  }
};
