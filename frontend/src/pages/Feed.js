import React from 'react';
import SearchBar from '../components/common/SearchBar';
import FilterSidebar from '../components/feed/FilterSidebar';
import HostCard from '../components/host/HostCard';
import ChatBox from '../components/feed/ChatBox';
import { hosts, chatMessages } from '../data/mockData';

const FeedPage = () => {
  const scrollableHosts = [...hosts, ...hosts]; // Duplicar para ter conteúdo para scroll

  return (
    <div className="py-8">
      <SearchBar />
      <div className="flex justify-center mt-4 space-x-8 text-gray-600">
        <button className="hover:text-red-500">Como funciona?</button>
        <p className="text-gray-400">|</p>
        <button className="hover:text-red-500 font-semibold">Quero ser host</button>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3">
          <FilterSidebar />
        </div>
        <div className="lg:col-span-6 space-y-6">
          {scrollableHosts.map((host, index) => (
            <HostCard key={`${host.id}-${index}`} host={host} />
          ))}
        </div>
        <div className="lg:col-span-3">
          <ChatBox messages={chatMessages} />
        </div>
      </div>
    </div>
  );
};

export default FeedPage;