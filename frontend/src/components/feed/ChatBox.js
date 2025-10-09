import React from 'react';

const ChatBox = ({ messages }) => {
  return (
<div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-300 h-100 sticky top-[380px] flex flex-col">      <div className="flex items-center pb-3 border-b-2 border-gray-200">
        <img src="https://placehold.co/40x40/A7D2CB/5C5552?text=EM" alt="Eduarda M." className="w-10 h-10 rounded-full mr-3" />
        <h3 className="font-bold text-gray-800">Eduarda M.</h3>
      </div>
      
      <div className="flex-grow my-4 space-y-4 overflow-y-auto pr-2">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.type === 'sent' ? 'bg-blue-100 text-gray-800' : 'bg-green-100 text-gray-800'}`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-3 border-t-2 border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Digite sua mensagem..."
            className="w-full pr-10 p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <button className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-gray-500 hover:text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
