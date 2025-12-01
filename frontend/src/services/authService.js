// authService.js - Handle authentication API calls and local session management

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Sign up a new user
 * @param {Object} userData - User data including nome, email, senha_hash, and optional address fields
 * @returns {Promise<Object>} - Response from backend
 */
export const signup = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome: userData.nome,
        email: userData.email,
        senha_hash: userData.senha_hash,
        telefone: userData.telefone,
        cep: userData.cep,
        logradouro: userData.logradouro,
        numero: userData.numero,
        bairro: userData.bairro,
        cidade: userData.cidade,
        uf: userData.uf,
        complemento: userData.complemento,
        tipo: 'tutor', // default type
        data_cadastro: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Signup error response:', errorData);
      // Extract validation error details if available
      if (errorData.detail && Array.isArray(errorData.detail)) {
        const errors = errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
        throw new Error(errors);
      }
      throw new Error(errorData.detail || 'Erro ao criar conta');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error.message || 'Erro de rede ao criar conta');
  }
};

/**
 * Login a user (authenticate and retrieve user data)
 * @param {string} email - User email
 * @param {string} senha_hash - User password (plain text - will be hashed by backend)
 * @returns {Promise<Object>} - User data if credentials match
 */
export const login = async (email, senha) => {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, senha }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Email ou senha inválidos');
    }

    const usuario = await response.json();
    console.log(usuario);
    // Check if user is also an anfitriao
    try {
      const hostsResponse = await fetch(`${API_BASE_URL}/anfitrioes/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (hostsResponse.ok) {
        const hosts = await hostsResponse.json();
        const isHost = hosts.some(h => h.id_anfitriao === usuario.id_usuario || h.id_anfitriao === usuario.id);

        if (isHost) {
          usuario.tipo = 'anfitriao';
        }
      }
    } catch (err) {
      console.error('Error checking host status:', err);
      // Continue login even if host check fails, defaulting to existing type
    }

    // Store user data in localStorage
    localStorage.setItem('currentUser', JSON.stringify(usuario));
    localStorage.setItem('userToken', usuario.id_usuario || usuario.id); // Use ID as a simple token

    return usuario;
  } catch (error) {
    throw new Error(error.message || 'Erro ao fazer login');
  }
};

/**
 * Logout the current user
 */
export const logout = () => {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('userToken');
};

/**
 * Get the currently logged-in user from localStorage
 * @returns {Object|null} - User data or null if not logged in
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Check if a user is logged in
 * @returns {boolean}
 */
export const isLoggedIn = () => {
  return localStorage.getItem('userToken') !== null;
};

/**
 * Get all users
 * @returns {Promise<Array>} - List of all users
 */
export const getAllUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar usuários');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Erro ao buscar usuários');
  }
};
