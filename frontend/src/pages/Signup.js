import React, { useState } from 'react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';

const SignUp = () => {
  const [name, setName] = useState('Ana Maria Almeida');
  const [email, setEmail] = useState('anamaria@gmail.com');
  const [password, setPassword] = useState('********');
  const [confirmPassword, setConfirmPassword] = useState('********');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }
    console.log({ name, email, password });
    alert('Conta criada com sucesso! (Verifique o console)');
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-md bg-blue-50 border-2 border-gray-300 rounded-2xl p-8 shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Criar Conta</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Nome:" type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email:" type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Senha:" type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Input label="Confirme sua senha:" type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <Button type="submit">Criar conta</Button>
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