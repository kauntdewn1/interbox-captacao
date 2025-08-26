export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-pink-500/20">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
              INTERBØX
            </h1>
            <span className="text-sm text-gray-400">Captação</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/" className="text-gray-300 hover:text-pink-400 transition-colors">
              Home
            </a>
            <a href="/audiovisual" className="text-gray-300 hover:text-pink-400 transition-colors">
              Audiovisual
            </a>
            <a href="/captacao/judge-staff" className="text-gray-300 hover:text-pink-400 transition-colors">
              Judge & Staff
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
