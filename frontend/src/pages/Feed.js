import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import FilterSidebar from '../components/FilterSidebar';
import HostCard from '../components/HostCard';
import ChatBox from '../components/ChatBox';
import HostModal from '../components/HostModal'; // Importar o novo modal
import { hosts, chatMessages } from '../data/mockData';

const FeedPage = () => {
  const [selectedHost, setSelectedHost] = useState(null);

  const handleOpenModal = (host) => {
    setSelectedHost(host);
  };

  const handleCloseModal = () => {
    setSelectedHost(null);
  };

  // Efeito para bloquear o scroll do body quando o modal está aberto
  useEffect(() => {
    if (selectedHost) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedHost]);

  // Adicionar mais hosts para forçar o scroll na coluna central
  const scrollableHosts = [...hosts, ...hosts, ...hosts, ...hosts];

  return (
    <>
      <div className="py-8">
        <SearchBar />
        <div className="flex justify-center mt-4 space-x-8 text-gray-600">
          <button className="hover:text-red-500">Como funciona?</button>
          <button className="hover:text-red-500 font-semibold">Quero ser host</button>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
          
          {/* Coluna de Filtros (Fixa) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <FilterSidebar />
            </div>
          </div>

          {/* Coluna de Resultados (Scrollável) */}
          <div className="lg:col-span-6 space-y-6 max-h-[100vh] overflow-y-auto pr-2">
            {scrollableHosts.map((host, index) => (
              <HostCard key={`${host.id}-${index}`} host={host} onClick={handleOpenModal} />
            ))}
          </div>

          {/* Coluna de Chat (Fixa) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
               <ChatBox messages={chatMessages} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Renderizar o Modal condicionalmente */}
      {selectedHost && <HostModal host={selectedHost} onClose={handleCloseModal} />}
    </>
  );
};

export default FeedPage;

