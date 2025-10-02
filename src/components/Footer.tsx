export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-pink-500/20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center space-y-2">
          {/* Logo da FlowPay */}
          <img
            src="/logos/FLOWPAY_trans.png"
            alt="FlowPay"
            className="h-8 mx-auto mb-4"
          />

          <p className="text-gray-300 text-sm">
            © 2025 INTERBØX — Todos os direitos reservados.
          </p>
          <p className="text-gray-400 text-xs">
            Plataforma oficial de captação, inscrições e credenciamento do maior campeonato de times de CrossFit da América Latina.
          </p>
          <p className="text-blue-400 text-xs font-medium">
            ↳ Desenvolvido por NΞØ Protocol
          </p>

          {/* Logo final pequena (marca d'água) */}
          <div className="mt-3">
            <img
              src="/logos/nome_hrz.png"
              alt="@nome"
              className="h-4 mx-auto opacity-50"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
