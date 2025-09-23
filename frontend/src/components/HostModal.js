import React from 'react';

// Função para renderizar as estrelas de avaliação
const renderStars = (rating) => {
    let stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-gray-300'}>
                ★
            </span>
        );
    }
    return stars;
};

const HostModal = ({ host, onClose }) => {
    if (!host) return null;

    // Previne que o clique dentro do conteúdo feche o modal
    const handleContentClick = (e) => e.stopPropagation();

    // Garante que 'reviews' seja sempre um array para evitar erros
    const reviews = host.reviews || [];

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col transition-transform duration-300 transform scale-100"
                onClick={handleContentClick}
            >
                <div className="p-8 overflow-y-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Coluna Esquerda: Informações do Anfitrião */}
                        <div className="md:col-span-1 text-center">
                            <img className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-200" src={host.imageUrl} alt={`Foto de ${host.name}`} />
                            <h2 className="text-2xl font-bold text-gray-800">{host.name}</h2>
                            <p className="text-gray-600">{host.location}</p>
                            <div className="flex justify-center mt-2 text-2xl">{renderStars(host.rating)}</div>
                            <div className="mt-4 text-4xl flex justify-center space-x-2">{host.pets.map((p, i) => <span key={i}>{p}</span>)}</div>
                            <p className="text-3xl font-bold text-red-500 mt-4">
                                R${host.price}
                                <span className="text-lg font-normal text-gray-600">/dia</span>
                            </p>
                        </div>

                        {/* Coluna Direita: Detalhes */}
                        <div className="md:col-span-2">
                            <h3 className="text-xl font-semibold border-b pb-2 mb-4">Sobre {host.name.split(' ')[0]}</h3>
                            <p className="text-gray-700 mb-6">{host.description || 'Nenhuma descrição fornecida.'}</p>
                            
                            <h3 className="text-xl font-semibold border-b pb-2 mb-4">Avaliações ({reviews.length})</h3>
                            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 mb-6">
                                {reviews.length > 0 ? (
                                    reviews.map((review, index) => (
                                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold">{review.author}</span>
                                                <div className="flex text-md">{renderStars(review.rating)}</div>
                                            </div>
                                            <p className="text-gray-600 mt-2">{review.comment}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">Este anfitrião ainda não possui avaliações.</p>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Seção de Contato */}
                    <div className="mt-6 border-t pt-6">
                        <h3 className="text-xl font-semibold mb-4 text-center md:text-left">Entre em Contato com {host.name.split(' ')[0]}</h3>
                        <textarea className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:outline-none" rows="4" placeholder="Escreva sua mensagem aqui..."></textarea>
                        <div className="flex justify-end mt-2">
                            <button className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 transition-colors font-semibold">Enviar Mensagem</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostModal;

