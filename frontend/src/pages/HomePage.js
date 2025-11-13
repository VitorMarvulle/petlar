import SearchBar from '../components/common/SearchBar';

const HomePage = () => {
  return (
    <div className="py-5">
      <SearchBar />

      <section className="mt-[30px] text-center">
        <h2 className="text-3xl font-bold text-gray-700 mb-10">Como funciona:</h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          {/* Placeholder Card 1 */}

          <div className="bg-[#addb8a] w-64 h-80 rounded-2xl shadow-lg border-2 border-gray-300"></div>
          
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 transform md:rotate-0 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          
          {/* Placeholder Card 2 */}
          <div className="bg-[#addb8a] w-64 h-80 rounded-2xl shadow-lg border-2 border-gray-300"></div>
          
           <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 transform md:rotate-0 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>

          {/* Placeholder Card 3 */}
          <div className="bg-[#addb8a] w-64 h-80 rounded-2xl shadow-lg border-2 border-gray-300"></div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
