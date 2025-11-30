const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Create a new reservation
 * @param {Object} reservaData - Data for the reservation
 * @returns {Promise<Object>} - Created reservation
 */
export const createReserva = async (reservaData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/reservas/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reservaData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Erro ao criar reserva');
        }

        return await response.json();
    } catch (error) {
        throw new Error(error.message || 'Erro ao criar reserva');
    }
};

/**
 * Get all reservations (for availability checking)
 * @returns {Promise<Array>} - List of all reservations
 */
export const getAllReservations = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/reservas/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar todas as reservas');
        }

        return await response.json();
    } catch (error) {
        throw new Error(error.message || 'Erro ao buscar todas as reservas');
    }
};

/**
 * Get reservations for a specific tutor
 * @param {number} tutorId - Tutor ID
 * @returns {Promise<Array>} - List of reservations
 */
export const getReservasByTutor = async (tutorId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/reservas/tutor/${tutorId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar reservas');
        }

        return await response.json();
    } catch (error) {
        throw new Error(error.message || 'Erro ao buscar reservas');
    }
};

/**
 * Get reservations for a specific host
 * @param {number} hostId - Host ID
 * @returns {Promise<Array>} - List of reservations
 */
export const getReservasByHost = async (hostId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/reservas/anfitriao/${hostId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar reservas do anfitrião');
        }

        return await response.json();
    } catch (error) {
        throw new Error(error.message || 'Erro ao buscar reservas do anfitrião');
    }
};
