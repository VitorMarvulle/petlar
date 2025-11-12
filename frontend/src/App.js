import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import SignUp from './pages/Signup';
import Feed from './pages/Feed';
import BecomeHost from './pages/BecomeHost';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HostPage from './pages/HostPage';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[gray-50]">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/become-host" element={<BecomeHost />} />
            <Route path="/host/:hostId" element={<HostPage />} /> {/* Rota dinâmica para cada anfitrião */}
            
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;