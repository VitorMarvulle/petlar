import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReviewCard from '../components/host/ReviewCard';
import QuestionAnswerCard from '../components/host/QuestionAnswerCard';
import HireModal from '../components/host/HireModal';
import { getHostById } from '../services/anfitriaoService';
import { getPerguntasByAnfitriao } from '../services/perguntasService';
import { getAvaliacoesByHost, getAverageRating } from '../services/avaliacaoService';

const HostPage = () => {
  const { hostId } = useParams();
  
  const [host, setHost] = useState(null);
  const [isHireModalOpen, setHireModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('avaliacoes');
  const [perguntas, setPerguntas] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loadingPerguntas, setLoadingPerguntas] = useState(false);
  const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(false);
  const [loadingHost, setLoadingHost] = useState(true);
  const [errorHost, setErrorHost] = useState('');

  // Buscar dados do host e perguntas quando a página carrega
  useEffect(() => {
    const fetchData = async () => {
      setLoadingHost(true);
      setErrorHost('');
      try {
        const hostData = await getHostById(parseInt(hostId));
        setHost(hostData);
        
        // Buscar perguntas do host
        await fetchPerguntas(hostData.id_anfitriao);
        
        // Buscar avaliações do host (usar id_anfitriao que é id_usuario do host)
        await fetchAvaliacoes(hostData.id_anfitriao);
      } catch (error) {
        console.error('Erro ao buscar dados do host:', error);
        setErrorHost(error.message || 'Erro ao carregar anfitrião');
      } finally {
        setLoadingHost(false);
      }
    };
    
    if (hostId) {
      fetchData();
    }
  }, [hostId]);

  const fetchPerguntas = async (id_anfitriao) => {
    setLoadingPerguntas(true);
    try {
      const data = await getPerguntasByAnfitriao(id_anfitriao);
      setPerguntas(data || []);
    } catch (error) {
      console.error('Erro ao buscar perguntas:', error);
      setPerguntas([]);
    } finally {
      setLoadingPerguntas(false);
    }
  };

  const fetchAvaliacoes = async (id_avaliado) => {
    setLoadingAvaliacoes(true);
    try {
      const data = await getAvaliacoesByHost(id_avaliado);
      setAvaliacoes(data || []);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      setAvaliacoes([]);
    } finally {
      setLoadingAvaliacoes(false);
    }
  };

  if (loadingHost) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600 text-lg">Carregando anfitrião...</p>
      </div>
    );
  }

  if (errorHost || !host) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 text-lg">{errorHost || 'Anfitrião não encontrado!'}</p>
      </div>
    );
  }

  // Duplicar avaliações para garantir o scroll
  const scrollableReviews = avaliacoes && avaliacoes.length > 0 
    ? [...avaliacoes, ...avaliacoes, ...avaliacoes] 
    : [];

  return (
    <>
      <div className="py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Conheça seu Host:</h2>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
          
          {/* Coluna Esquerda (Fixa) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Card Principal com Informações do Host */}
              <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-300">
                <img src={host.imageUrl} alt={host.name} className="w-24 h-24 rounded-full border-4 border-gray-200 mx-auto" />
                <h3 className="text-2xl font-bold text-gray-800 mt-4 text-center">{host.name}</h3>
                <p className="text-sm text-gray-500 text-center">{host.distance} - {host.location}</p>
                
                {/* Pets */}
                <div className="mt-4 flex justify-center space-x-2">
                  {host.pets && host.pets.map((pet, index) => (
                    <span key={index} className="text-3xl">{pet}</span>
                  ))}
                </div>

                {/* Preço */}
                <p className="text-3xl font-bold text-gray-800 my-4 text-center">R${host.price},00<span className="text-base font-normal text-gray-500">/dia</span></p>

                {/* Rating */}
                <div className="text-center mb-4">
                  <span className="text-yellow-400 flex justify-center">
                    {'★'.repeat(host.rating)}
                    {'☆'.repeat(5 - host.rating)}
                  </span>
                </div>

                {/* Descrição do Host */}
                <div className="mt-6 pt-6 border-t-2 border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Sobre {host.name.split(' ')[0]}</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{host.description}</p>
                </div>

                {/* Botão de Contratar */}
                <button 
                  onClick={() => setHireModalOpen(true)}
                  className="w-full mt-6 bg-red-500 text-white font-bold py-3 px-4 rounded-lg border-2 border-gray-800 hover:bg-red-600 transition-colors"
                >
                  Contratar
                </button>
              </div>

              {/* Secção de fotos placeholder */}
              <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-300 space-y-4">
                 <div className="bg-gray-200 h-40 rounded-lg flex items-center justify-center text-gray-500">Foto 1</div>
                 <div className="bg-gray-200 h-40 rounded-lg flex items-center justify-center text-gray-500">Foto 2</div>
              </div>
            </div>
          </div>

          {/* Coluna Direita (Scrollável) */}
          <div className="lg:col-span-8">
            {/* Tabs */}
            <div className="flex space-x-4 mb-6 border-b-2 border-gray-300">
              <button
                onClick={() => setActiveTab('avaliacoes')}
                className={`pb-3 px-4 font-semibold text-lg transition-colors ${
                  activeTab === 'avaliacoes'
                    ? 'text-red-500 border-b-4 border-red-500'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Avaliações ({avaliacoes?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('perguntas')}
                className={`pb-3 px-4 font-semibold text-lg transition-colors ${
                  activeTab === 'perguntas'
                    ? 'text-red-500 border-b-4 border-red-500'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Perguntas Frequentes ({perguntas.length || 0})
              </button>
            </div>

            {/* Conteúdo das Abas */}
            <div className="space-y-6 max-h-[100vh] overflow-y-auto pr-2">
              {/* Aba de Avaliações */}
              {activeTab === 'avaliacoes' && (
                <>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    Avaliações 
                    <span className="ml-2 text-yellow-400 flex">
                      {'★'.repeat(host.rating)}
                      {'☆'.repeat(5 - host.rating)}
                    </span>
                  </h3>
                  {loadingAvaliacoes ? (
                    <p className="text-gray-600 text-center py-8">Carregando avaliações...</p>
                  ) : scrollableReviews.length > 0 ? (
                    scrollableReviews.map((review, index) => (
                      <ReviewCard key={index} review={review} />
                    ))
                  ) : (
                    <p className="text-gray-600 text-center py-8">Nenhuma avaliação ainda.</p>
                  )}
                </>
              )}

              {/* Aba de Perguntas Frequentes */}
              {activeTab === 'perguntas' && (
                <>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Perguntas Frequentes</h3>
                  {loadingPerguntas ? (
                    <p className="text-gray-600 text-center py-8">Carregando perguntas...</p>
                  ) : perguntas && perguntas.length > 0 ? (
                    perguntas.map((pergunta) => (
                      <QuestionAnswerCard
                        key={pergunta.id_pergunta}
                        question={pergunta.pergunta}
                        answer={pergunta.resposta?.resposta || ''}
                      />
                    ))
                  ) : (
                    <p className="text-gray-600 text-center py-8">Sem perguntas e respostas</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de Contratação */}
      <HireModal 
        isOpen={isHireModalOpen} 
        onClose={() => setHireModalOpen(false)} 
        host={host} 
      />
    </>
  );
};

export default HostPage;