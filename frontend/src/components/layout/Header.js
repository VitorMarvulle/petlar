import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, logout } from '../../services/authService';

const Header = () => {
  const publicUrl = process.env.PUBLIC_URL;
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check user every time location changes (including after login)
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, [location]);

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    navigate('/');
  };

  // Don't show greeting on homepage
  const isHomePage = location.pathname === '/';
  const shouldShowGreeting = currentUser && !isHomePage;

  return (
    <header className="bg-[#f4ffeb] border-b-2 border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img
                src={`${publicUrl}/assets/logo_petlar.png`}
                alt="Logo Petlar"
                className="h-20 w-20 hover:opacity-75 transition-opacity"
              />
            </Link>
          </div>

          {/* Navigation/Auth Section */}
          <div className="flex items-center space-x-4">
            {!currentUser ? (
              // Login Button with modern icon
              <Link
                to="/login"
                className="flex items-center space-x-2 bg-[#addb8a] border-gray-800 px-6 py-3 rounded-lg text-gray-800 font-semibold hover:bg-[#95c872] transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Login</span>
              </Link>
            ) : (
              // User greeting with logout
              <div className="flex items-center space-x-4">
                {shouldShowGreeting && (
                  <>
                    <Link to="/reservas" className="text-gray-600 hover:text-green-600 font-semibold mr-4 transition-colors">
                      Minhas Reservas
                    </Link>
                    <Link to="/profile" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#addb8a] to-[#95c872] rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {currentUser.nome?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-800 font-medium hidden sm:inline">
                        Bem vindo, <span className="font-bold text-red-500">{currentUser.nome}</span>! 😊
                      </span>
                      <span className="text-gray-800 font-medium sm:hidden">
                        Olá, <span className="font-bold text-red-500">{currentUser.nome?.split(' ')[0]}</span>!
                      </span>
                    </Link>
                  </>
                )}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  title="Fazer logout"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;