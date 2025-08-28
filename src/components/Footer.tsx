

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-pink-500/20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            © 2025 INTERBØX. Todos os direitos reservados. 
          </p>
          <p className="text-gray-500 text-xs mt-2">
          INTERBØX 2025 é mais que evento. É comunidade.
          </p>
          <p className="text-blue-400 text-xs mt-1 font-medium">
            Desenvolvido por{' '} NEØ Protocol
            {/* Temporariamente desativado - será reativado futuramente
            <a href="/neo-protocol" className="hover:text-blue-300 transition-colors underline">
              NEØ Protocol
            </a>
            */}
          </p>
        </div>
      </div>
    </footer>
  );
}
