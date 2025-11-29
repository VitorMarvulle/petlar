// petService.js - Service for Pet related operations

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Get all pets for a specific tutor
 * @param {number} tutorId - Tutor ID (id_tutor)
 * @returns {Promise<Array>} - List of pets
 */
export const getPetsByTutor = async (tutorId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/pets/tutor/${tutorId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar pets');
        }

        return await response.json();
    } catch (error) {
        throw new Error(error.message || 'Erro ao buscar pets');
    }
};

/**
 * Create a new pet
 * @param {Object} petData - Pet data
 * @returns {Promise<Object>} - Created pet
 */
export const createPet = async (petData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/pets/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(petData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Erro ao criar pet');
        }

        const createdPet = await response.json();
        // Supabase might return an array
        return Array.isArray(createdPet) ? createdPet[0] : createdPet;
    } catch (error) {
        throw new Error(error.message || 'Erro ao criar pet');
    }
};


