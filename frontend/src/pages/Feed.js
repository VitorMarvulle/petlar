import React, { useState } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import { Link } from 'react-router-dom';

const Feed = () => {
  const [email, setEmail] = useState('anamaria@gmail.comaaaaaaaaaaaaaaaa');
  const [password, setPassword] = useState('********');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica de login aqui
    console.log({ email, password });
    alert('Login submetido! (Verifique o console)');
  };

  return (
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
          <Button type="submit">Entrar</Button>
        </form>
         <p className="text-center text-sm text-gray-600 mt-6">
          Não tem uma conta?{' '}
          <Link to="/signup" className="font-medium text-red-500 hover:text-red-600">
            Crie uma aqui
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Feed;