import React from 'react';

const AboutModal = ({ isOpen, onClose, host }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4">Sobre {host.name.split(' ')[0]}</h2>
        <p className="text-gray-700">{host.description}</p>
        <div className="text-right mt-6">
          <button onClick={onClose} className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">Fechar</button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;