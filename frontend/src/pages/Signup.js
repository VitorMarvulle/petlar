import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';
import { signup } from '../services/authService';
import { fetchAddressByCEP } from '../services/cepService';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [complemento, setComplemento] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const navigate = useNavigate();

  // Handle CEP input and auto-fill address
  const handleCepChange = async (e) => {
    const value = e.target.value;
    setCep(value);

    // Auto-fill when user enters 8 digits
    if (value.replace(/\D/g, '').length === 8) {
      setCepLoading(true);
      try {
        const addressData = await fetchAddressByCEP(value);
        setLogradouro(addressData.logradouro);
        setBairro(addressData.bairro);
        setCidade(addressData.cidade);
        setUf(addressData.uf);
      } catch (err) {
        setError(err.message);
      } finally {
        setCepLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Nome, email e senha são obrigatórios');
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem!");
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await signup({
        nome: name,
        email,
        senha_hash: password,
        telefone: telefone || null,
        cep: cep || null,
        logradouro: logradouro || null,
        numero: numero || null,
        bairro: bairro || null,
        cidade: cidade || null,
        uf: uf || null,
        complemento: complemento || null,
      });
      alert('Conta criada com sucesso!');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-2xl bg-blue-50 border-2 border-gray-300 rounded-2xl p-8 shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Criar Conta</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nome:" type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Email:" type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Senha:" type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Input label="Confirme sua senha:" type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>

          {/* Contact & CEP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Telefone:" type="tel" id="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 9999-9999" />
            <div>
              <label htmlFor="cep" className="block text-sm font-medium text-gray-700">CEP:</label>
              <input
                type="text"
                id="cep"
                value={cep}
                onChange={handleCepChange}
                placeholder="11703-520"
                disabled={cepLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {cepLoading && <p className="text-sm text-blue-500 mt-1">Buscando CEP...</p>}
            </div>
          </div>

          {/* Address Fields */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Logradouro:" type="text" id="logradouro" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} disabled={cepLoading} />
              <Input label="Número:" type="text" id="numero" value={numero} onChange={(e) => setNumero(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input label="Bairro:" type="text" id="bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} disabled={cepLoading} />
              <Input label="Cidade:" type="text" id="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} disabled={cepLoading} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input label="UF:" type="text" id="uf" value={uf} onChange={(e) => setUf(e.target.value)} maxLength="2" disabled={cepLoading} />
              <Input label="Complemento:" type="text" id="complemento" value={complemento} onChange={(e) => setComplemento(e.target.value)} />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" disabled={loading}>{loading ? 'Criando...' : 'Criar conta'}</Button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-6">
          Já tem uma conta?{' '}
          <Link to="/login" className="font-medium text-red-500 hover:text-red-600">
            Faça o login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;