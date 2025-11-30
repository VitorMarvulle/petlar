import React, { useState, useEffect, useMemo } from 'react';
import { getCurrentUser } from '../../services/authService';
import { getPetsByTutor } from '../../services/petService';
import { createReserva } from '../../services/reservationService';
import { useNavigate } from 'react-router-dom';

const HireModal = ({ isOpen, onClose, host }) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [userPets, setUserPets] = useState([]);
  const [selectedPets, setSelectedPets] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPets, setLoadingPets] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchUserPets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentUser?.id_usuario, currentUser?.id]);

  const fetchUserPets = async () => {
    setLoadingPets(true);
    try {
      const pets = await getPetsByTutor(currentUser.id_usuario || currentUser.id);
      setUserPets(Array.isArray(pets) ? pets : []);
    } catch (error) {
      console.error('Erro ao buscar pets:', error);
      alert('Erro ao carregar seus pets.');
    } finally {
      setLoadingPets(false);
    }
  };

  const handlePetToggle = (petId) => {
    setSelectedPets(prev => {
      if (prev.includes(petId)) {
        return prev.filter(id => id !== petId);
      } else {
        if (prev.length >= 3) { // Max 3 pets hardcoded for now, or use host limit if available
          alert('Máximo de 3 pets permitidos.');
          return prev;
        }
        return [...prev, petId];
      }
    });
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);
    const diffTime = Math.abs(endDateObj - startDateObj);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysCount = useMemo(() => calculateDays(startDate, endDate), [startDate, endDate]);
  const petsCount = selectedPets.length;
  const pricePerDay = host?.price || 0;
  const totalValue = daysCount * petsCount * pricePerDay;

  const handleSubmit = async () => {
    if (!currentUser) {
      alert('Você precisa estar logado para fazer uma reserva.');
      navigate('/login');
      return;
    }

    if (petsCount === 0) {
      alert('Selecione pelo menos um pet.');
      return;
    }

    if (daysCount === 0) {
      alert('Selecione datas válidas (entrada e saída).');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      alert('A data de saída deve ser posterior à data de entrada.');
      return;
    }

    setLoading(true);
    try {
      const reservaData = {
        id_tutor: currentUser.id_usuario || currentUser.id,
        id_anfitriao: host.id_anfitriao || host.id, // Ensure we have the correct ID
        data_inicio: startDate,
        data_fim: endDate,
        status: 'pendente',
        pets_tutor: selectedPets,
        valor_diaria: pricePerDay,
        qtd_pets: petsCount,
        qtd_dias: daysCount,
        valor_total_reserva: totalValue
      };

      await createReserva(reservaData);
      alert('Solicitação de reserva enviada com sucesso!');
      onClose();
      // Reset form
      setSelectedPets([]);
      setStartDate('');
      setEndDate('');
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      alert(error.message || 'Erro ao criar reserva.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Solicitar Reserva</h2>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Selecione seus Pets (Máx: 3)</h3>
          {loadingPets ? (
            <p className="text-gray-500">Carregando pets...</p>
          ) : userPets.length > 0 ? (
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border p-2 rounded-lg">
              {userPets.map(pet => (
                <label key={pet.id_pet} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${selectedPets.includes(pet.id_pet) ? 'bg-green-50 border-green-500' : 'hover:bg-gray-50'}`}>
                  <input
                    type="checkbox"
                    checked={selectedPets.includes(pet.id_pet)}
                    onChange={() => handlePetToggle(pet.id_pet)}
                    className="mr-3 h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{pet.nome}</p>
                    <p className="text-xs text-gray-500">{pet.especie}</p>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-yellow-700 mb-2">Você não tem pets cadastrados.</p>
              <button onClick={() => { onClose(); navigate('/adicionar-pet'); }} className="text-sm font-bold text-yellow-800 underline">Cadastrar Pet</button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entrada</label>
            <input
              type="date"
              value={startDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Saída</label>
            <input
              type="date"
              value={endDate}
              min={startDate || new Date().toISOString().split('T')[0]}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Resumo de Preço */}
        {daysCount > 0 && petsCount > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <h4 className="font-bold text-green-800 mb-2 text-center">Resumo da Reserva</h4>
            <div className="flex justify-between text-sm text-green-700 mb-1">
              <span>Diária (1 Pet):</span>
              <span>R$ {pricePerDay.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-green-700 mb-1">
              <span>Pets:</span>
              <span>{petsCount}</span>
            </div>
            <div className="flex justify-between text-sm text-green-700 mb-1">
              <span>Dias:</span>
              <span>{daysCount}</span>
            </div>
            <div className="border-t border-green-200 my-2"></div>
            <div className="flex justify-between font-bold text-lg text-green-900">
              <span>Total:</span>
              <span>R$ {totalValue.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || petsCount === 0 || daysCount === 0}
            className={`px-6 py-3 rounded-xl font-bold text-white transition-colors ${loading || petsCount === 0 || daysCount === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 shadow-lg'
              }`}
          >
            {loading ? 'Enviando...' : 'Confirmar Reserva'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HireModal;