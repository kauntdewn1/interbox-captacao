export default function Footer() {
  return (
    <footer className="bg-gradient-to-t from-gray-900 via-gray-950 to-black border-t border-pink-500/20">
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Logos alinhados */}
        <div className="flex justify-center items-center gap-6 mb-6">
          <img
            src="/logos/FLOWPAY_trans.png"
            alt="FlowPay"
            className="h-8"
          />
          <img
            src="/logos/nome_hrz.png"
            alt="INTERBØX"
            className="h-6"
          />
        </div>

        {/* Texto */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <p className="text-gray-300 text-sm">
            © 2025 INTERBØX — Todos os direitos reservados.
          </p>
          <p className="text-gray-400 text-xs leading-tight">
            Plataforma oficial de captação, inscrições e credenciamento do maior campeonato de times de CrossFit da América Latina.
          </p>
          <p className="text-blue-400 text-xs font-medium">
            ↳ Desenvolvido por NΞØ Protocol
          </p>
        </div>
      </div>
    </footer>
  );
}
