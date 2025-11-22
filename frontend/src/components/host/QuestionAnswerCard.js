import React from 'react';

const QuestionAnswerCard = ({ question, answer }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
      
      {/* PERGUNTA */}
      <div className="flex items-start gap-2 mb-4">
        <h4 className="text-lg font-semibold text-gray-800">Pergunta:</h4>
        <p className="text-gray-700">{question}</p>
      </div>

      {/* RESPOSTA */}
      <div className="flex items-start gap-2">
        <h4 className="text-lg font-semibold text-gray-800">R:</h4>
        <p className="text-gray-700">
          {answer || 'Aguardando resposta do anfitrião...'}
        </p>
      </div>

    </div>
  );
};


export default QuestionAnswerCard;
