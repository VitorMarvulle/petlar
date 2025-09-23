import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { hosts } from '../data/mockData';
import HostSummaryCard from '../components/HostSummaryCard';
import ReviewCard from '../components/ReviewCard';
import AboutModal from '../components/AboutModal';
import HireModal from '../components/HireModal';

const HostPage = () => {
  const { hostId } = useParams();
  const host = hosts.find(h => h.id === parseInt(hostId));

  const [isAboutModalOpen, setAboutModalOpen] = useState(false);
  const [isHireModalOpen, setHireModalOpen] = useState(false);

  if (!host) {
    return <div className="text-center py-10">Anfitrião não encontrado!</div>;
  }

  // Duplicar avaliações para garantir o scroll
  const scrollableReviews = [...host.reviews, ...host.reviews, ...host.reviews];

  return (
    <>
      <div className="py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Conheça seu Host:</h2>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
          
          {/* Coluna Esquerda (Fixa) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <HostSummaryCard 
                host={host} 
                onAboutClick={() => setAboutModalOpen(true)}
                onHireClick={() => setHireModalOpen(true)}
              />
              {/* Secção de fotos placeholder */}
              <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-300 space-y-4">
                 <div className="bg-gray-200 h-40 rounded-lg flex items-center justify-center text-gray-500">Foto 1</div>
                 <div className="bg-gray-200 h-40 rounded-lg flex items-center justify-center text-gray-500">Foto 2</div>
              </div>
            </div>
          </div>

          {/* Coluna Direita (Scrollável) */}
          <div className="lg:col-span-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              Avaliações 
              <span className="ml-2 text-yellow-400 flex">
                {'★'.repeat(host.rating)}
                {'☆'.repeat(5 - host.rating)}
              </span>
            </h3>
            <div className="space-y-6 max-h-[100vh] overflow-y-auto pr-2">
              {scrollableReviews.map((review, index) => (
                <ReviewCard key={index} review={review} />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modais */}
      <AboutModal 
        isOpen={isAboutModalOpen} 
        onClose={() => setAboutModalOpen(false)} 
        host={host} 
      />
      <HireModal 
        isOpen={isHireModalOpen} 
        onClose={() => setHireModalOpen(false)} 
        host={host} 
      />
    </>
  );
};

export default HostPage;