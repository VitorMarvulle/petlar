import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { createAnfitriao } from '../services/becomeHostService';
import { getCurrentUser } from '../services/authService';

const BecomeHost = () => {
  const [descricao, setDescricao] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [especie, setEspecie] = useState([]); // Array of selected pet types
  const [tamanho, setTamanho] = useState(''); // Size of space
  const [preco, setPreco] = useState(''); // Daily price
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const petOptions = [
    { value: 'cachorro', label: 'Cachorro 🐶' },
    { value: 'gato', label: 'Gato 🐱' },
    { value: 'passaro', label: 'Pássaro 🐦' },
    { value: 'silvestre', label: 'Silvestre 🦎' },
  ];

  const tamanhoOptions = [
    { value: 'pequeno', label: 'Pequeno' },
    { value: 'medio', label: 'Médio' },
    { value: 'grande', label: 'Grande' },
  ];

  useEffect(() => {
    // Check if user is logged in
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if user is already a host
    if (user.tipo === 'anfitriao') {
      alert('Você já é um host!');
      navigate('/feed');
      return;
    }

    setCurrentUser(user);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!descricao || !capacidade || especie.length === 0 || !tamanho || !preco) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    if (isNaN(capacidade) || capacidade <= 0) {
      setError('A capacidade deve ser um número maior que 0');
      return;
    }

    if (isNaN(preco) || preco <= 0) {
      setError('O preço deve ser um número maior que 0');
      return;
    }

    setLoading(true);
    try {
      // Create anfitriao record with current user ID
      await createAnfitriao({
        id_anfitriao: currentUser.id_usuario,
        descricao: descricao,
        capacidade_maxima: parseInt(capacidade),
        especie: especie, // Array of pet types
        tamanho: tamanho, // Size of space
        preco: parseFloat(preco), // Daily price
      });

      alert('Parabéns! Você agora é um host! 🎉');
      navigate('/feed');
    } catch (err) {
      setError(err.message || 'Erro ao criar perfil de host');
    } finally {
      setLoading(false);
    }
  };

  // Toggle pet type selection
  const togglePetType = (petType) => {
    setEspecie((prev) =>
      prev.includes(petType)
        ? prev.filter((p) => p !== petType)
        : [...prev, petType]
    );
  };

  if (!currentUser) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-2xl bg-blue-50 border-2 border-gray-300 rounded-2xl p-8 shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Quero ser Host</h2>
        <p className="text-center text-gray-600 mb-8">Compartilhe seu espaço e ganhe dinheiro cuidando de pets!</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description */}
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
              Descrição do seu perfil:
            </label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Conte um pouco sobre você, sua experiência com animais, seu espaço, etc..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
            />
          </div>

          {/* Capacity and Pet Types */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Capacidade máxima de pets:"
              type="number"
              id="capacidade"
              value={capacidade}
              onChange={(e) => setCapacidade(e.target.value)}
              min="1"
              max="20"
              placeholder="Ex: 5"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qual tipo de pet você cuida?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {petOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-2 border rounded-md cursor-pointer transition-colors ${
                      especie.includes(option.value)
                        ? 'bg-blue-100 border-blue-500'
                        : 'bg-white border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={option.value}
                      checked={especie.includes(option.value)}
                      onChange={() => togglePetType(option.value)}
                      className="mr-2"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Size and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tamanho" className="block text-sm font-medium text-gray-700">
                Tamanho do seu espaço:
              </label>
              <select
                id="tamanho"
                value={tamanho}
                onChange={(e) => setTamanho(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione...</option>
                {tamanhoOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Preço da diária (R$):"
              type="number"
              id="preco"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              min="1"
              step="0.01"
              placeholder="Ex: 60.00"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Perfil de Host'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Quer voltar?{' '}
          <button
            onClick={() => navigate('/feed')}
            className="font-medium text-red-500 hover:text-red-600"
          >
            Voltar para o feed
          </button>
        </p>
      </div>
    </div>
  );
};

export default BecomeHost;
