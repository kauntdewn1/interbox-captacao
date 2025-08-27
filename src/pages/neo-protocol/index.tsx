import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function NeoProtocol() {
  const fullText = 'NΞØ Protocol';
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, index + 1));
      index++;
      if (index === fullText.length) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 🧠 HERO */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <img 
              src="/logos/neo_ico.png" 
              alt="NΞØ Protocol" 
              className="w-32 h-32 mx-auto mb-6 animate-pulse"
            />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            {typedText}
          </h1>

          <h2 className="text-2xl md:text-3xl font-medium mb-6 text-gray-300">
            é uma nova forma de existir em rede.
          </h2>

          <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-4xl mx-auto leading-relaxed">
            Quando você vê o selo "Desenvolvido por NΞØ Protocol", está diante de um sistema simbólico e tecnológico que rompe com a lógica centralizada das plataformas tradicionais.
          </p>

          <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-4xl mx-auto leading-relaxed">
            O protocolo é <strong>open source</strong> por princípio e <strong>Web3</strong> por arquitetura. Sua empresa não precisa ficar presa a <strong>Big Techs</strong>. Ela pode se tornar uma <strong>rede própria</strong> — com regras públicas, autonomia digital e soberania simbólica.
          </p>
        </div>
      </section>

      {/* 📰 SEÇÃO 1 — MANIFESTO PÚBLICO */}
      <section className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            📰 MANIFESTO PÚBLICO
          </h2>

          <div className="space-y-6 text-lg leading-relaxed">
            <p>
              Uma <strong>DAO (Organização Autônoma Descentralizada)</strong> não pertence a empresas. Não depende de liderança carismática. É movida por <strong>contratos inteligentes</strong>: regras autoexecutáveis registradas em Blockchain, abertas, auditáveis, imutáveis.
            </p>

            <p>
              <strong>NΞØ Protocol</strong> opera sob essa lógica. Nenhum centro de comando. Nenhuma hierarquia vertical.
            </p>

            <p>
              Cada participante é um <strong>nó com voz</strong>. Cada decisão emerge da <strong>inteligência coletiva da rede</strong>.
            </p>

            <p>
              <strong>NΞØ é uma organização sem dono</strong>. Um organismo vivo que aprende, adapta e evolui com quem o habita.
            </p>

            <p>
              Isso não é uma promessa. Isso já está acontecendo — em sistemas reais, em interações invisíveis, em projetos que escolheram se libertar da dependência estrutural.
            </p>

            <p className="text-xl font-medium text-blue-400">
              O protocolo já está em curso. E quem acessa, transforma.
            </p>
          </div>
        </div>
      </section>

      {/* ⚙️ SEÇÃO 3 — COMO FUNCIONA */}
      <section className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            ⚙️ COMO FUNCIONA
          </h2>

          <h3 className="text-2xl font-medium mb-8 text-center text-gray-300">
            O que significa estar plugado ao NΞØ Protocol?
          </h3>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span>Autonomia simbólica e técnica</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span>Governança descentralizada via DAPP</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span>Integração opcional com o token $NEØ</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span>Rede de validação entre projetos independentes</span>
              </div>
            </div>
          </div>

          <div className="text-center space-y-6">
            <p className="text-lg leading-relaxed">
              A integração pode ser <strong>simbólica</strong>, <strong>técnica</strong> ou <strong>total</strong>. Cada projeto decide seu grau de autonomia. Mas todos compartilham o mesmo código: <strong>liberdade com responsabilidade</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* ⛃ SEÇÃO 4 — SOBRE O TOKEN $NΞØ */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            ⛃ SOBRE O TOKEN $NΞØ
          </h2>

          <h3 className="text-2xl font-medium mb-8 text-center text-gray-300">
            $NΞØ não é investimento. É infraestrutura simbólica.
          </h3>

          <div className="text-center space-y-6">
            <p className="text-lg leading-relaxed max-w-3xl mx-auto">
              O token <strong>$NΞØ</strong> representa participação, não especulação. Ele permite coordenação de decisões, reconhecimento entre pares e validação simbólica da rede.
            </p>

            <p className="text-xl font-medium text-blue-400">
              Não é um ativo. É sua liberdade.
            </p>

            <a 
              href="https://dexscreener.com/base/0x471e78b85b634460c152782667f805310fa66eb850bfda305717836c2ca4f0bb"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-orange-600 hover:bg-orange-700 rounded-xl font-medium transition-colors"
            >
              Saiba mais sobre o token →
            </a>
          </div>
        </div>
      </section>

      {/* 🛰️ FOOTER PADRÃO */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <img 
              src="/logos/neowhite.png" 
              alt="NΞØ Protocol" 
              className="w-20 h-auto mx-auto mb-4"
            />
          </div>

          <p className="text-gray-400 mb-4">
            Este projeto foi desenvolvido sob o <strong>NΞØ Protocol</strong>
          </p>

          <Link 
            to="/"
            className="inline-block px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            ← Voltar ao INTERBØX
          </Link>
        </div>
      </footer>
    </div>
  );
}
