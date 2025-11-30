import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, logout } from '../../services/authService';

const Header = () => {
  const publicUrl = process.env.PUBLIC_URL;
  const [currentUser, setCurrentUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check user every time location changes (including after login)
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setIsDropdownOpen(false);
    navigate('/');
  };

  // Don't show greeting on homepage
  const isHomePage = location.pathname === '/';
  const shouldShowGreeting = currentUser && !isHomePage;

  return (
    <header className="bg-[#f4ffeb] border-b-2 border-gray-200 relative z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to={currentUser ? "/feed" : "/"} className="flex items-center">
              <img
                src={`${publicUrl}/assets/logo_petlar.png`}
                alt="Logo Petlar"
                className="h-20 w-20 hover:opacity-75 transition-opacity"
              />
              <span className="ml-2 text-2xl font-bold" style={{ color: '#7ab24e' }}>LarDocePet</span>
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
              // User greeting and Dropdown
              <div className="flex items-center space-x-4">
                {shouldShowGreeting && (
                  <>
                    <Link to="/reservas" className="text-gray-600 hover:text-green-600 font-semibold mr-4 transition-colors">
                      Minhas Reservas
                    </Link>
                    <div className="flex items-center space-x-2">
                      <p style={{ color: "gray", fontSize: "1.3rem" }}>|</p>
                      <span className="text-gray-800 font-medium hidden sm:inline">
                        Bem vindo, <span className="font-bold text-red-500">{currentUser.nome}</span>! 😊
                      </span>
                      <span className="text-gray-800 font-medium sm:hidden">
                        Olá, <span className="font-bold text-red-500">{currentUser.nome?.split(' ')[0]}</span>!
                      </span>
                    </div>
                  </>
                )}

                {/* Dropdown Menu */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
                    title="Menu do Usuário"
                  >
                    {/* Lucide CircleUserRound Icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-700"
                    >
                      <path d="M18 20a6 6 0 0 0-12 0" />
                      <circle cx="12" cy="10" r="4" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fade-in-down">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Conta
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;