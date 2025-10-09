const Footer = () => {
  // Usamos process.env.PUBLIC_URL para garantir que o caminho funcione
  // tanto em desenvolvimento quanto após o build da aplicação.
  const publicUrl = process.env.PUBLIC_URL;

  return (
    <footer className="bg-white border-t-2 border-gray-200 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 text-sm text-gray-600">
          <p className="text-xs md:text-sm">Footer - PetLarDoceLar - DSM - Todos direitos Reservados</p>
          <div className="flex items-center space-x-4">
            {/* Instagram */}
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <img 
                src={`${publicUrl}/assets/logo_insta.png`} 
                alt="Logo do Instagram" 
                className="h-6 w-6 hover:opacity-75 transition-opacity" 
              />
            </a>
            {/* Facebook */}
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <img 
                src={`${publicUrl}/assets/logo_facebook.png`} 
                alt="Logo do Facebook" 
                className="h-6 w-6 hover:opacity-75 transition-opacity" 
              />
            </a>
            {/* LinkedIn */}
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <img 
                src={`${publicUrl}/assets/logo_linkedin.png`} 
                alt="Logo do LinkedIn" 
                className="h-6 w-6 hover:opacity-75 transition-opacity" 
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
