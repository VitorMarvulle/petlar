import React from 'react';

const HireModal = ({ isOpen, onClose, host }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 text-center" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-2">Confirmação de Contratação</h2>
        <p className="text-gray-600 mb-6">Você está prestes a contratar os serviços de <span className="font-semibold">{host.name}</span>.</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h3 className="font-bold mb-2">Instruções de Pagamento (Fictício)</h3>
            <p className="text-sm text-gray-700">O pagamento será processado de forma segura. Após a confirmação, o anfitrião será notificado e entrará em contato para alinhar os detalhes da estadia do seu pet.</p>
        </div>
        <div className="flex justify-center space-x-4 mt-6">
          <button onClick={onClose} className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
          <button onClick={() => { alert('Serviço contratado!'); onClose(); }} className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 transition-colors font-semibold">Confirmar</button>
        </div>
      </div>
    </div>
  );
};

export default HireModal;