import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';
import { login } from '../services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email e senha são obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      alert(`Bem-vindo, ${user.nome}!`);
      navigate('/feed');
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-aos="zoom-in">
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-md bg-blue-50 border-2 border-gray-300 rounded-2xl p-8 shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Email:" 
            type="email" 
            id="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <Input 
            label="Senha:" 
            type="password" 
            id="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</Button>
        </form>
         <p className="text-center text-sm text-gray-600 mt-6">
          Não tem uma conta?{' '}
          <Link to="/signup" className="font-medium text-red-500 hover:text-red-600">
            Crie uma aqui
          </Link>
        </p>
      </div>
    </div>
    </div>
  );
};

export default Login;