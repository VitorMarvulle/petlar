// perguntasService.js - Fetch Q&A (perguntas e respostas) from backend

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Get all questions and answers for a specific host
 * @param {number} hostId - Host ID (id_anfitriao)
 * @returns {Promise<Array>} - List of questions with their answers
 */
export const getPerguntasByAnfitriao = async (hostId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/perguntas/anfitriao/${hostId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar perguntas');
    }

    const perguntas = await response.json();
    return perguntas;
  } catch (error) {
    throw new Error(error.message || 'Erro ao buscar perguntas');
  }
};

/**
 * Get a single question with its answer
 * @param {number} perguntaId - Question ID
 * @returns {Promise<Object>} - Question with answer data
 */
export const getPerguntaById = async (perguntaId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/perguntas/${perguntaId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar pergunta');
    }

    const pergunta = await response.json();
    return pergunta;
  } catch (error) {
    throw new Error(error.message || 'Erro ao buscar pergunta');
  }
};

/**
 * Create a new question
 * @param {Object} data - { id_tutor, id_anfitriao, pergunta }
 * @returns {Promise<Object>} - Created question data
 */
export const createPergunta = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/perguntas/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erro ao criar pergunta');
    }

    const pergunta = await response.json();
    return pergunta;
  } catch (error) {
    throw new Error(error.message || 'Erro ao criar pergunta');
  }
};

/**
 * Create a response to a question
 * @param {Object} data - { id_pergunta, id_anfitriao, resposta }
 * @returns {Promise<Object>} - Created response data
 */
export const createResposta = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/respostas/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erro ao criar resposta');
    }

    const resposta = await response.json();
    return resposta;
  } catch (error) {
    throw new Error(error.message || 'Erro ao criar resposta');
  }
};
