import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';
import { getPetsByTutor } from '../services/petService';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setUser(currentUser);
        fetchPets(currentUser.id_usuario || currentUser.id);
    }, [navigate]);

    const fetchPets = async (userId) => {
        try {
            const data = await getPetsByTutor(userId);
            setPets(data || []);
        } catch (error) {
            console.error('Erro ao buscar pets:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-xl text-gray-600">Carregando perfil...</p>
            </div>
        );
    }
console.log(user)
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Header do Perfil */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-100">
                    <div className="bg-gradient-to-r from-[#addb8a] to-[#95c872] h-32"></div>
                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-12 mb-6">
                            <div className="flex items-end">
                                <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md overflow-hidden">
                                    <img
                                        src={user?.imagem_usuario || `https://avatar.iran.liara.run/public?username=${user?.id_usuario || user?.id}`}
                                        alt={user?.nome}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                </div>
                                <div className="ml-4 mb-1">
                                    <h1 className="text-3xl font-bold text-gray-800">{user?.nome}</h1>
                                    <p className="text-gray-600">{user?.email}</p>
                                </div>
                            </div>
                            <button
                                className="bg-white border-2 border-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                                onClick={() => alert('Funcionalidade de editar perfil em desenvolvimento')}
                            >
                                Editar Perfil
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-gray-500 text-sm uppercase tracking-wide font-semibold mb-2">Informações Pessoais</h3>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                    <div>
                                        <span className="text-gray-500 text-sm block">Telefone</span>
                                        <span className="text-gray-800 font-medium">{user?.telefone || 'Não informado'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-sm block">Endereço</span>
                                        <span className="text-gray-800 font-medium">
                                            {user?.endereco ||
                                                (user?.logradouro ? `${user.logradouro}, ${user.numero || ''} - ${user.bairro || ''}, ${user.cidade || ''} - ${user.uf || ''}` : 'Não informado')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Seção de Pets */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Meus Pets</h2>
                        <Link
                            to="/adicionar-pet"
                            className="bg-[#7AB24E] hover:bg-[#6a9c43] text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors flex items-center"
                        >
                            <span className="text-xl mr-2">+</span> Adicionar Pet
                        </Link>
                    </div>

                    {pets.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pets.map((pet) => (
                                <div key={pet.id_pet} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
                                    <div className="h-48 bg-gray-100 relative">
                                        {pet.fotos_urls && pet.fotos_urls.length > 0 ? (
                                            <img
                                                src={pet.fotos_urls[0]}
                                                alt={pet.nome}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-[#FFF6E2]">
                                                <span className="text-4xl">🐾</span>
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-md text-xs font-bold text-gray-600 shadow-sm uppercase">
                                            {pet.especie}
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="text-xl font-bold text-gray-800 mb-1">{pet.nome}</h3>
                                        <div className="flex items-center text-gray-600 text-sm mb-3">
                                            <span className="mr-3">{pet.idade} {pet.idade_unidade}</span>
                                            <span>•</span>
                                            <span className="ml-3">{pet.peso} {pet.peso_unidade}</span>
                                        </div>
                                        {pet.observacoes && (
                                            <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                                                {pet.observacoes}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <div className="w-20 h-20 bg-[#FFF6E2] rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-4xl">🐶</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Você ainda não tem pets cadastrados</h3>
                            <p className="text-gray-500 mb-6">Cadastre seus pets para encontrar o anfitrião perfeito para eles.</p>
                            <Link
                                to="/adicionar-pet"
                                className="text-[#7AB24E] font-bold hover:underline"
                            >
                                Cadastrar meu primeiro pet
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
