import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { getCurrentUser } from '../services/authService';
import { createPet, uploadPetPhotos } from '../services/petService';

const AddPetPage = () => {
    const navigate = useNavigate();
    const currentUser = getCurrentUser();

    const [loading, setLoading] = useState(false);
    const [petData, setPetData] = useState({
        nome: '',
        especie: 'Gato',
        idade: '',
        idadeUnidade: 'ano',
        peso: '',
        unidade: 'kg',
        especificacoes: '',
    });
    const [photos, setPhotos] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPetData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + photos.length > 10) {
            alert('Máximo de 10 fotos permitidas');
            return;
        }

        setPhotos(prev => [...prev, ...files]);

        // Create preview URLs
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...newPreviews]);
    };

    const removePhoto = (index) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            alert('Você precisa estar logado para adicionar um pet.');
            navigate('/login');
            return;
        }

        if (!petData.nome || !petData.idade || !petData.peso) {
            alert('Preencha os campos obrigatórios!');
            return;
        }

        if (photos.length < 3) {
            alert('Adicione pelo menos 3 fotos do seu pet!');
            return;
        }

        setLoading(true);
        try {
            // 1. Create Pet
            const createdPet = await createPet({
                id_tutor: currentUser.id_usuario || currentUser.id,
                nome: petData.nome,
                especie: petData.especie,
                idade: parseInt(petData.idade),
                idade_unidade: petData.idadeUnidade,
                peso: parseFloat(petData.peso),
                peso_unidade: petData.unidade,
                observacoes: petData.especificacoes || null,
            });

            // 2. Upload Photos
            if (photos.length > 0) {
                await uploadPetPhotos(createdPet.id_pet, photos);
            }

            alert('Pet cadastrado com sucesso!');
            navigate('/profile');
        } catch (error) {
            console.error('Erro ao cadastrar pet:', error);
            alert(error.message || 'Erro ao cadastrar pet. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const speciesOptions = [
        { value: 'Gato', label: 'Gato 🐱' },
        { value: 'Cachorro', label: 'Cachorro 🐶' },
        { value: 'Pássaro', label: 'Pássaro 🐦' },
        { value: 'Exótico', label: 'Exótico 🦎' }
    ];

    return (
        <div className="flex items-center justify-center py-12">
            <div className="w-full max-w-2xl bg-blue-50 border-2 border-gray-300 rounded-2xl p-8 shadow-lg">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Cadastro do seu Pet</h2>
                <p className="text-center text-gray-600 mb-8">Adicione as informações do seu companheiro!</p>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Espécie */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Qual a espécie do seu pet?
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {speciesOptions.map((option) => (
                                <label
                                    key={option.value}
                                    className={`flex items-center p-2 border rounded-md cursor-pointer transition-colors ${petData.especie === option.value
                                        ? 'bg-blue-100 border-blue-500'
                                        : 'bg-white border-gray-300 hover:border-blue-300'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="especie"
                                        value={option.value}
                                        checked={petData.especie === option.value}
                                        onChange={handleChange}
                                        className="mr-2"
                                    />
                                    {option.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Nome */}
                    <Input
                        label="Nome do pet:"
                        type="text"
                        id="nome"
                        name="nome"
                        value={petData.nome}
                        onChange={handleChange}
                        placeholder="Ex: Rex"
                    />

                    {/* Idade */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Idade:"
                            type="number"
                            id="idade"
                            name="idade"
                            value={petData.idade}
                            onChange={handleChange}
                            min="0"
                            placeholder="Ex: 2"
                        />
                        <div>
                            <label htmlFor="idadeUnidade" className="block text-sm font-medium text-gray-700 mb-1">
                                Unidade:
                            </label>
                            <select
                                id="idadeUnidade"
                                name="idadeUnidade"
                                value={petData.idadeUnidade}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 focus:outline-none"
                            >
                                <option value="ano">Anos</option>
                                <option value="mês">Meses</option>
                            </select>
                        </div>
                    </div>

                    {/* Peso */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Peso:"
                            type="number"
                            id="peso"
                            name="peso"
                            value={petData.peso}
                            onChange={handleChange}
                            min="0"
                            step="0.1"
                            placeholder="Ex: 5.5"
                        />
                        <div>
                            <label htmlFor="unidade" className="block text-sm font-medium text-gray-700 mb-1">
                                Unidade de Peso:
                            </label>
                            <select
                                id="unidade"
                                name="unidade"
                                value={petData.unidade}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 focus:outline-none"
                            >
                                <option value="kg">Kg</option>
                                <option value="g">g</option>
                            </select>
                        </div>
                    </div>

                    {/* Especificações */}
                    <div>
                        <label htmlFor="especificacoes" className="block text-sm font-medium text-gray-700 mb-1">
                            Especificações (opcional):
                        </label>
                        <textarea
                            id="especificacoes"
                            name="especificacoes"
                            value={petData.especificacoes}
                            onChange={handleChange}
                            placeholder="Conte mais sobre o comportamento, necessidades especiais, etc..."
                            className="w-full px-4 py-3 bg-white border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 focus:outline-none"
                            rows="4"
                        />
                    </div>

                    {/* Photos Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fotos do seu pet (Mín. 3):
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center relative bg-gray-50 hover:bg-gray-100 transition-colors">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                disabled={photos.length >= 10}
                            />

                            {previewUrls.length > 0 ? (
                                <div className="flex gap-2 overflow-x-auto w-full py-2 z-20 pointer-events-none px-2">
                                    {previewUrls.map((url, index) => (
                                        <div key={index} className="relative flex-shrink-0 w-20 h-20 pointer-events-auto">
                                            <img
                                                src={url}
                                                alt={`Preview ${index}`}
                                                className="w-full h-full object-cover rounded-lg border border-gray-300"
                                            />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    removePhoto(index);
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md hover:bg-red-600"
                                            >
                                                X
                                            </button>
                                        </div>
                                    ))}
                                    {photos.length < 10 && (
                                        <div className="flex-shrink-0 w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 bg-white">
                                            +
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center pointer-events-none py-4">
                                    <span className="text-2xl block mb-1">📸</span>
                                    <span className="text-gray-500 text-sm">Clique para adicionar fotos</span>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Mostre como seu pet é fofo!</p>
                    </div>

                    {/* Botão Salvar */}
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar Pet'}
                    </Button>

                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Quer voltar?{' '}
                    <button
                        onClick={() => navigate('/profile')}
                        className="font-medium text-red-500 hover:text-red-600"
                    >
                        Voltar para o perfil
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AddPetPage;
