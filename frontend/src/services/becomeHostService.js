// becomeHostService.js - Service to create anfitriao

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Upload image to S3 via backend endpoint
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} - URL of uploaded image
 */
export const uploadImageToS3 = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Erro ao fazer upload da imagem');
    }

    const data = await response.json();
    return data.image_url;
  } catch (error) {
    throw new Error(error.message || 'Erro ao fazer upload da imagem');
  }
};

/**
 * Create a new anfitriao (host) for the current user
 * @param {Object} data - { id_anfitriao, descricao, capacidade_maxima, especie, tamanho, preco, imagem_anfitriao }
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
        tamanho_pet: data.tamanho_pet, // Size of pet
        preco: data.preco, // Daily price
        imagem_anfitriao: data.imagem_anfitriao || null, // Image URL from S3
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
