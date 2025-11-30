import SearchBar from '../components/common/SearchBar';
import { MapPin, PawPrint, CalendarCheck } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="py-5">
      <SearchBar />

      <section className="mt-[30px] text-center">
        <h2 className="text-3xl font-bold text-gray-700 mb-10">Como funciona:</h2>

        <div className="flex flex-col md:flex-row justify-center items-center gap-8">

          {/* Card 1 */}
          <div
            data-aos="flip-left"
            data-aos-easing="ease-out-cubic"
            data-aos-duration="1600"
            data-aos-delay="200"
            className="bg-[#addb8a] w-64 h-80 rounded-2xl shadow-lg border-2 border-gray-300 p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-center mb-3 -mt-4">
                <MapPin size={48} className="text-gray-800" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Encontre o anfitrião ideal</h3>
              <p className="mt-8 text-gray-700 text-sm leading-tight">
                Busque anfitriões próximos a você filtrando por data, espécie e tamanho do seu pet!
                Encontre quem combina com as necessidades
                do seu amiguinho :)
              </p>
            </div>


          </div>

          {/* Arrow */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-400 transform md:rotate-0 rotate-90"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>

          {/* Card 2 */}
          <div
            data-aos="flip-left"
            data-aos-easing="ease-out-cubic"
            data-aos-duration="1800"
            data-aos-delay="400"
            className="bg-[#addb8a] w-64 h-80 rounded-2xl shadow-lg border-2 border-gray-300 p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-center mb-3 -mt-4">
                <PawPrint size={48} className="text-gray-800" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Avalie o perfil</h3>
              <p className="text-gray-700 text-sm leading-tight">
                Veja avaliações de outros tutores, fotos reais do ambiente,
                comentários e as Perguntas e Respostas do anfitrião antes de decidir.
              </p>
            </div>

            <ul className="text-left text-gray-600 text-sm mb-8">
              <li>✔ Fotos do espaço</li>
              <li>✔ Comentários detalhados</li>
              <li>✔ Avaliações reais de tutores</li>
            </ul>
          </div>

          {/* Arrow */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-400 transform md:rotate-0 rotate-90"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>

          {/* Card 3 */}
          <div
            data-aos="flip-left"
            data-aos-easing="ease-out-cubic"
            data-aos-duration="2000"
            data-aos-delay="600"
            className="bg-[#addb8a] w-64 h-80 rounded-2xl shadow-lg border-2 border-gray-300 p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-center mb-3 -mt-4">
                <CalendarCheck size={48} className="text-gray-800" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Reserve com segurança</h3>
              <p className="text-gray-700 text-sm leading-tight">
                Escolha as datas, confirme a disponibilidade e finalize sua reserva.
                Tudo rápido, seguro e transparente.
              </p>
            </div>

            <ul className="text-left text-gray-600 text-sm mt-3">
              <li>✔ Confirmação rápida</li>
              <li>✔ Processo seguro</li>
              <li>✔ Combine detalhes com o anfitrião</li>
            </ul>
          </div>

        </div>
      </section>
    </div>
  );
};

export default HomePage;
