import React, { useState } from 'react';

const QuestionAnswerCard = ({ question, answer, isHost, onAnswerSubmit }) => {
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answerText.trim()) return;

    setIsSubmitting(true);
    try {
      await onAnswerSubmit(answerText);
      setAnswerText('');
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <div className="flex-1">
          {answer ? (
            <p className="text-gray-700">{answer}</p>
          ) : isHost ? (
            <form onSubmit={handleSubmit} className="mt-2">
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Escreva sua resposta..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                rows="3"
                disabled={isSubmitting}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !answerText.trim()}
                  className={`px-3 py-1 rounded text-sm font-semibold text-white transition-colors ${isSubmitting || !answerText.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                >
                  {isSubmitting ? 'Enviando...' : 'Responder'}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-gray-500 italic">Aguardando resposta do anfitrião...</p>
          )}
        </div>
      </div>

    </div>
  );
};


export default QuestionAnswerCard;
