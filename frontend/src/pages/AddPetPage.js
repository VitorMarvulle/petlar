import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';
import { createPet, uploadFotosPet } from '../services/petService';

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
    const [fotos, setFotos] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPetData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + fotos.length > 10) {
            alert('Máximo de 10 fotos permitidas');
            return;
        }

        setFotos(prev => [...prev, ...files]);

        // Create preview URLs
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...newPreviews]);
    };

    const removePhoto = (index) => {
        setFotos(prev => prev.filter((_, i) => i !== index));
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

        if (fotos.length < 3) {
            alert('Adicione pelo menos 3 fotos do seu pet!');
            return;
        }

        setLoading(true);
        try {
            // 1. Create Pet
            const newPet = await createPet({
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
            if (fotos.length > 0) {
                await uploadFotosPet(newPet.id_pet, fotos);
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

    const speciesOptions = ['Gato', 'Cachorro', 'Pássaro', 'Exótico'];

    return (
        <div className="min-h-screen bg-[#B3D18C] py-8 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-[40px] shadow-xl overflow-hidden">
                <h1 className="text-3xl font-bold text-[#7AB24E] text-center mb-8">Cadastro do seu Pet</h1>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Espécie */}
                    <div className="flex justify-between gap-2 mb-6">
                        {speciesOptions.map(specie => (
                            <button
                                key={specie}
                                type="button"
                                onClick={() => setPetData(prev => ({ ...prev, especie: specie }))}
                                className={`flex-1 py-2 px-1 rounded-xl border-2 font-semibold text-sm transition-all ${petData.especie === specie
                                    ? 'bg-[#7AB24E] border-[#7AB24E] text-[#FFF6E2]'
                                    : 'bg-[#FFF6E2] border-[#B3D18C] text-[#7AB24E] hover:bg-[#e6ddc8]'
                                    }`}
                            >
                                {specie}
                            </button>
                        ))}
                    </div>

                    {/* Nome */}
                    <div>
                        <input
                            type="text"
                            name="nome"
                            placeholder="Nome do pet"
                            value={petData.nome}
                            onChange={handleChange}
                            className="w-full h-14 px-4 bg-[#FFF6E2] border-2 border-[#B3D18C] rounded-2xl text-[#556A44] placeholder-[#7AB24E80] focus:outline-none focus:border-[#7AB24E] transition-colors"
                        />
                    </div>

                    {/* Idade */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <input
                                type="number"
                                name="idade"
                                placeholder="Idade"
                                value={petData.idade}
                                onChange={handleChange}
                                className="w-full h-14 px-4 bg-[#FFF6E2] border-2 border-[#B3D18C] rounded-2xl text-[#556A44] placeholder-[#7AB24E80] focus:outline-none focus:border-[#7AB24E] transition-colors"
                            />
                        </div>
                        <div className="flex gap-2">
                            {['ano', 'mês'].map(u => (
                                <button
                                    key={u}
                                    type="button"
                                    onClick={() => setPetData(prev => ({ ...prev, idadeUnidade: u }))}
                                    className={`h-14 w-20 rounded-2xl border-2 font-semibold transition-all ${petData.idadeUnidade === u
                                        ? 'bg-[#7AB24E] border-[#7AB24E] text-[#FFF6E2]'
                                        : 'bg-[#FFF6E2] border-[#B3D18C] text-[#7AB24E]'
                                        }`}
                                >
                                    {u}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Peso */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <input
                                type="number"
                                name="peso"
                                placeholder="Peso"
                                value={petData.peso}
                                onChange={handleChange}
                                className="w-full h-14 px-4 bg-[#FFF6E2] border-2 border-[#B3D18C] rounded-2xl text-[#556A44] placeholder-[#7AB24E80] focus:outline-none focus:border-[#7AB24E] transition-colors"
                            />
                        </div>
                        <div className="flex gap-2">
                            {['kg', 'g'].map(u => (
                                <button
                                    key={u}
                                    type="button"
                                    onClick={() => setPetData(prev => ({ ...prev, unidade: u }))}
                                    className={`h-14 w-20 rounded-2xl border-2 font-semibold transition-all ${petData.unidade === u
                                        ? 'bg-[#7AB24E] border-[#7AB24E] text-[#FFF6E2]'
                                        : 'bg-[#FFF6E2] border-[#B3D18C] text-[#7AB24E]'
                                        }`}
                                >
                                    {u}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Especificações */}
                    <div>
                        <textarea
                            name="especificacoes"
                            placeholder="Especificações (opcional)"
                            value={petData.especificacoes}
                            onChange={handleChange}
                            rows="4"
                            className="w-full p-4 bg-[#FFF6E2] border-2 border-[#B3D18C] rounded-2xl text-[#556A44] placeholder-[#7AB24E80] focus:outline-none focus:border-[#7AB24E] transition-colors resize-none"
                        />
                    </div>

                    {/* Fotos */}
                    <div>
                        <label className="block text-[#7AB24E] font-semibold mb-2">Galeria de fotos do seu pet</label>
                        <div className="border-3 border-dashed border-[#B3D18C] bg-[#FFF6E2] rounded-2xl p-4 min-h-[130px] flex flex-col items-center justify-center relative">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />

                            {previewUrls.length > 0 ? (
                                <div className="flex gap-2 overflow-x-auto w-full py-2 z-20 pointer-events-none">
                                    {previewUrls.map((url, index) => (
                                        <div key={index} className="relative flex-shrink-0 w-24 h-24 pointer-events-auto">
                                            <img
                                                src={url}
                                                alt={`Preview ${index}`}
                                                className="w-full h-full object-cover rounded-xl border-2 border-[#B3D18C]"
                                            />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    removePhoto(index);
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md hover:bg-red-600"
                                            >
                                                X
                                            </button>
                                        </div>
                                    ))}
                                    <div className="flex-shrink-0 w-24 h-24 border-2 border-dashed border-[#B3D18C] rounded-xl flex items-center justify-center text-[#7AB24E] bg-white/50">
                                        +
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center pointer-events-none">
                                    <span className="text-2xl block mb-1">📸</span>
                                    <span className="text-[#7AB24E] font-medium">Adicionar fotos</span>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-[#7AB24E] mt-1 ml-1">* Mínimo de 3 fotos</p>
                    </div>

                    {/* Botão Salvar */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full h-14 rounded-2xl font-bold text-lg shadow-md transition-all ${loading
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-[#7AB24E] text-[#FFF6E2] border-2 border-[#B3D18C] hover:bg-[#6a9c43] hover:scale-[1.01]'
                            }`}
                    >
                        {loading ? 'Salvando...' : 'Salvar Pet'}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default AddPetPage;
