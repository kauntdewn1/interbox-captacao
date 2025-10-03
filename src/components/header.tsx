import { useState } from 'react';
import { HiMenu, HiX } from 'react-icons/hi';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-sm border-b border-pink-500/20">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo e Título */}
          <div className="flex items-center space-x-4">
            <img
              src="/logos/FLOWPAY_trans.png"
              alt="FlowPay"
              className="h-6"
            />
            <div>
              <h1 className="text-xl font-bold text-white">FlowPay | INTERBØX 2025</h1>
              <span className="text-xs text-gray-400">Captação, Inscrições e Pagamentos Oficiais</span>
            </div>
          </div>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/" className="text-gray-300 hover:text-pink-400 transition-colors">Home</a>
            <a href="/audiovisual" className="text-gray-300 hover:text-pink-400 transition-colors">Audiovisual</a>
            <a href="/captacao/judge-staff" className="text-gray-300 hover:text-pink-400 transition-colors">Judge & Staff</a>
          </nav>

          {/* Botão Mobile */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-300 hover:text-pink-400 focus:outline-none text-2xl"
            aria-label="Menu"
          >
            {isMenuOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </div>

      {/* Menu Mobile Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-pink-500/10 px-4 pb-4">
          <nav className="flex flex-col space-y-3 mt-2 text-sm">
            <a href="/" className="text-gray-300 hover:text-pink-400">Home</a>
            <a href="/audiovisual" className="text-gray-300 hover:text-pink-400">Audiovisual</a>
            <a href="/captacao/judge-staff" className="text-gray-300 hover:text-pink-400">Judge & Staff</a>
          </nav>
        </div>
      )}
    </header>
  );
}
