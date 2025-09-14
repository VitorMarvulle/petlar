import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white border-b-2 border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
             <Link to="/" className="bg-pink-100 border-2 border-gray-800 px-6 py-2 rounded-lg text-gray-800 font-bold">
                LOGO
             </Link>
          </div>
          
          {/* Navigation/Login Button */}
          <div>
            <Link to="/signup" className="bg-pink-100 border-2 border-gray-800 px-6 py-3 rounded-lg text-gray-800 font-semibold hover:bg-pink-200 transition-colors">
              Criar conta/Login
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;