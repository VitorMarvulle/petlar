import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReviewCard from '../components/host/ReviewCard';
import QuestionAnswerCard from '../components/host/QuestionAnswerCard';
import HireModal from '../components/host/HireModal';
import { getHostById } from '../services/anfitriaoService';
import { getPerguntasByAnfitriao, createPergunta, createResposta } from '../services/perguntasService';
import { getAvaliacoesByHost } from '../services/avaliacaoService';
import { getCurrentUser } from '../services/authService';

const HostPage = () => {
  const { hostId } = useParams();

  const [host, setHost] = useState(null);
  const [isHireModalOpen, setHireModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('avaliacoes');
  const [perguntas, setPerguntas] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [loadingPerguntas, setLoadingPerguntas] = useState(false);
  const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(false);
  const [loadingFotos, setLoadingFotos] = useState(false);
  const [loadingHost, setLoadingHost] = useState(true);
  const [errorHost, setErrorHost] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  // New Question State
  const [newQuestion, setNewQuestion] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const currentUser = getCurrentUser();

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
      // Removed incorrect setLoadingFotos(false)
    }
  };

  const fetchFotos = async (hostData) => {
    setLoadingFotos(true);
    try {
      // Extract fotos from host data
      const fotosList = hostData.fotos || hostData.foto || hostData.fotos_anfitriao || [];
      setFotos(Array.isArray(fotosList) ? fotosList : []);
    } catch (error) {
      console.error('Erro ao buscar fotos:', error);
      setFotos([]);
    } finally {
      setLoadingFotos(false);
    }
  };

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

        // Buscar fotos do host
        await fetchFotos(hostData);
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

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    if (!currentUser) {
      alert('Você precisa estar logado para fazer uma pergunta.');
      return;
    }

    setSubmittingQuestion(true);
    try {
      await createPergunta({
        id_tutor: currentUser.id_usuario || currentUser.id,
        id_anfitriao: host.id_anfitriao,
        pergunta: newQuestion
      });

      setNewQuestion('');
      await fetchPerguntas(host.id_anfitriao);
      alert('Pergunta enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar pergunta:', error);
      alert('Erro ao enviar pergunta. Tente novamente.');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleAnswerSubmit = async (questionId, answerText) => {
    try {
      await createResposta({
        id_pergunta: questionId,
        id_anfitriao: host.id_anfitriao,
        resposta: answerText
      });
      await fetchPerguntas(host.id_anfitriao);
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      alert('Erro ao enviar resposta. Tente novamente.');
      throw error;
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
            </div>
          </div>

          {/* Coluna Direita (Scrollável) */}
          <div className="lg:col-span-8">
            {/* Tabs */}
            <div className="flex space-x-4 mb-6 border-b-2 border-gray-300">
              <button
                onClick={() => setActiveTab('avaliacoes')}
                className={`pb-3 px-4 font-semibold text-lg transition-colors ${activeTab === 'avaliacoes'
                  ? 'text-red-500 border-b-4 border-red-500'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                Avaliações ({avaliacoes?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('perguntas')}
                className={`pb-3 px-4 font-semibold text-lg transition-colors ${activeTab === 'perguntas'
                  ? 'text-red-500 border-b-4 border-red-500'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                Perguntas Frequentes ({perguntas.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('fotos')}
                className={`pb-3 px-4 font-semibold text-lg transition-colors ${activeTab === 'fotos'
                  ? 'text-red-500 border-b-4 border-red-500'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                Fotos ({fotos?.length || 0})
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

                  {/* Formulário de Nova Pergunta */}
                  {currentUser && (!host || (currentUser.id_usuario !== host.id_anfitriao && currentUser.id !== host.id_anfitriao)) && (
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                      <h4 className="text-lg font-semibold text-gray-700 mb-2">Faça uma pergunta ao anfitrião</h4>
                      <form onSubmit={handleQuestionSubmit}>
                        <textarea
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                          rows="3"
                          placeholder="Escreva sua dúvida aqui..."
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          disabled={submittingQuestion}
                        ></textarea>
                        <div className="flex justify-end mt-2">
                          <button
                            type="submit"
                            disabled={submittingQuestion || !newQuestion.trim()}
                            className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors ${submittingQuestion || !newQuestion.trim()
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-green-500 hover:bg-green-600'
                              }`}
                          >
                            {submittingQuestion ? 'Enviando...' : 'Enviar Pergunta'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {loadingPerguntas ? (
                    <p className="text-gray-600 text-center py-8">Carregando perguntas...</p>
                  ) : perguntas && perguntas.length > 0 ? (
                    perguntas.map((pergunta) => (
                      <QuestionAnswerCard
                        key={pergunta.id_pergunta}
                        question={pergunta.pergunta}
                        answer={pergunta.resposta?.resposta || ''}
                        isHost={currentUser && (currentUser.id_usuario === host.id_anfitriao || currentUser.id === host.id_anfitriao)}
                        onAnswerSubmit={(answerText) => handleAnswerSubmit(pergunta.id_pergunta, answerText)}
                      />
                    ))
                  ) : (
                    <p className="text-gray-600 text-center py-8">Sem perguntas e respostas</p>
                  )}
                </>
              )}

              {/* Aba de Fotos */}
              {activeTab === 'fotos' && (
                <>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Fotos</h3>
                  {loadingFotos ? (
                    <p className="text-gray-600 text-center py-8">Carregando fotos...</p>
                  ) : fotos && fotos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {fotos.map((foto, index) => (
                        <div key={index} className="rounded-lg overflow-hidden shadow-md border-2 border-gray-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedImage(foto)}>
                          <img
                            src={typeof foto === 'string' ? foto : foto.url || foto.foto_url}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-48 object-cover hover:scale-105 transition-transform"
                            onError={(e) => {
                              console.error('Error loading image:', e.target.src);
                              e.target.src = 'https://via.placeholder.com/400x300?text=Erro+na+Imagem';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">Sem fotos adicionadas</p>
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

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl font-bold hover:text-gray-300 z-50"
            onClick={() => setSelectedImage(null)}
          >
            &times;
          </button>
          <img
            src={typeof selectedImage === 'string' ? selectedImage : selectedImage.url || selectedImage.foto_url}
            alt="Full size"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default HostPage;