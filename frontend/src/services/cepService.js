/**
 * Fetch address data from viaCEP API
 * @param {string} cep - CEP code (8 digits, e.g., "11703520")
 * @returns {Promise<Object>} - Address data { logradouro, bairro, cidade, uf }
 */
export const fetchAddressByCEP = async (cep) => {
  try {
    // Remove any non-digit characters
    const cleanCEP = cep.replace(/\D/g, '');

    // Validate CEP format (must be 8 digits)
    if (cleanCEP.length !== 8) {
      throw new Error('CEP deve ter 8 dígitos');
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);

    if (!response.ok) {
      throw new Error('Erro ao buscar CEP');
    }

    const data = await response.json();

    // Check if CEP was found
    if (data.erro) {
      throw new Error('CEP não encontrado');
    }

    return {
      logradouro: data.logradouro || '',
      bairro: data.bairro || '',
      cidade: data.localidade || '',
      uf: data.uf || '',
    };
  } catch (error) {
    throw new Error(error.message || 'Erro ao buscar CEP');
  }
};
