import { Link } from 'react-router-dom';
const Header = () => {
    const publicUrl = process.env.PUBLIC_URL;

  return (
    <header className="bg-[#f4ffeb] border-b-2 border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
            
              <img 
                src={`${publicUrl}/assets/logo_petlar.png`} 
                alt="Logo do Instagram" 
                className="h-20 w-20 hover:opacity-75 transition-opacity" 
              />
            </Link>             
          </div>
          
          {/* Navigation/Login Button */}
          <div>
            <Link to="/signup" className="bg-[#addb8a] border-2 border-gray-800 px-6 py-3 rounded-lg text-gray-800 font-semibold hover:bg-pink-200 transition-colors">
              Criar conta/Login
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;