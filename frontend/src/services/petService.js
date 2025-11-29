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


/**
 * Upload photos for a pet
 * @param {number} petId - Pet ID
 * @param {Array<File>} photos - Array of photo files
 * @returns {Promise<Array<string>>} - Array of uploaded photo URLs
 */
export const uploadPetPhotos = async (petId, photos) => {
    if (!photos || photos.length === 0) return [];

    try {
        const formData = new FormData();
        photos.forEach((photo) => {
            formData.append('arquivos', photo);
        });

        const response = await fetch(`${API_BASE_URL}/pets/${petId}/fotos`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Erro ao enviar fotos do pet');
        }

        const data = await response.json();
        return data.fotos_urls;
    } catch (error) {
        throw new Error(error.message || 'Erro ao fazer upload das fotos do pet');
    }
};
