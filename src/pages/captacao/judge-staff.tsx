import { useState, useEffect } from 'react';
import Header from '../../components/header';
import Footer from '../../components/Footer'; 
import SEOHead from '../../components/SEOHead';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useNavigate } from 'react-router-dom';

export default function JudgeStaffCaptacao() {
  const { trackPage } = useAnalytics();
  const [isLoadingJudge, setIsLoadingJudge] = useState(false);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const navigate = useNavigate();
  // Track page view
  useEffect(() => {
    trackPage();
  }, [trackPage]);

  const handleJudgePayment = () => {
    setIsLoadingJudge(true);
    // ✅ CORRIGIDO: Redirecionar para checkout próprio
    navigate('/judge/pagar');
    setIsLoadingJudge(false);
  };

  const handleStaffPayment = () => {
    setIsLoadingStaff(true);
    // ✅ CORRIGIDO: Redirecionar para checkout próprio
    navigate('/staff/pagar');
    setIsLoadingStaff(false);
  };

  return (
    <>
      <SEOHead
        title="Judge & Staff - INTERBØX 2025"
        description="Seja Judge ou Staff no maior evento fitness de times da América Latina. Participe da organização e ajude a fazer história!"
        image="/images/og-interbox.png"
        type="website"
      />
      
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            
            {/* Header da página */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent mb-6">
                🎯 JUDGE & STAFF
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Você no comando da experiência INTERBØX.
                Seja JUDGE ou STAFF e faça parte da força que garante que o maior evento fitness de times da América Latina aconteça com excelência, energia e propósito.</p>
            </div>

            {/* Grid com duas opções */}
            <div className="grid lg:grid-cols-2 gap-8 mb-16">
              
              {/* Judge */}
              <div className="bg-[#1a1b2f] rounded-3xl p-8 border border-pink-500/20 shadow-xl">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-pink-400 mb-4">Judge</h2>
                  <p className="text-gray-300 text-lg">
                  Dentro da arena, você é a referência. Avalie performances, aplique os critérios oficiais e ajude a escrever a história da competição.
                  </p>
                </div>

                {/* Explicação do papel */}
                <div className="bg-[#0f0f23] rounded-3xl p-6 mb-8 border border-pink-500/10">
                  <h3 className="text-xl font-semibold mb-4 text-pink-400">🎯 Seu papel:</h3>
                  <ul className="space-y-3 text-[#e1e1ff]">
                    <li>• Garantir a aplicação precisa dos padrões oficiais</li>
                    <li>• Acompanhar e pontuar as performances técnicas</li>
                    <li>• Atuar com imparcialidade e integridade em cada decisão</li>
                    <li>• Representar o INTERBØX com seriedade e profissionalismo</li>
                  </ul>
                </div>



                {/* Botão de pagamento */}
                <div className="text-center">
                  <button
                    onClick={handleJudgePayment}
                    disabled={isLoadingJudge}
                    className="group relative inline-flex items-center justify-center w-full px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-pink-500 to-pink-600 rounded-3xl shadow-lg shadow-pink-500/20 hover:from-pink-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingJudge ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Processando...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">•</span>
                        Inscrever-se como Judge
                        <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Staff */}
              <div className="bg-[#1a1b2f] rounded-3xl p-8 border border-purple-500/20 shadow-xl">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-purple-400 mb-4">Staff</h2>
                  <p className="text-gray-300 text-lg">
                  Nos bastidores, você faz a engrenagem girar. Com ritmo, organização e espírito de comunidade, garante que cada detalhe do INTERBØX aconteça sem falhas.
                  </p>
                </div>

                {/* Explicação do papel */}
                <div className="bg-[#0f0f23] rounded-3xl p-6 mb-8 border border-purple-500/10">
                  <h3 className="text-xl font-semibold mb-4 text-purple-400">🎯 Seu papel:</h3>
                  <ul className="space-y-3 text-[#e1e1ff]">
                    <li>• Dar suporte logístico e operacional durante os jogos</li>
                    <li>• Apoiar diretamente organizadores e judges</li>
                    <li>• Manter a arena organizada e em pleno funcionamento</li>
                    <li>• Contribuir para a melhor experiência de atletas e público</li>
                  </ul>
                </div>



                {/* Botão de pagamento */}
                <div className="text-center">
                  <button
                    onClick={handleStaffPayment}
                    disabled={isLoadingStaff}
                    className="group relative inline-flex items-center justify-center w-full px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl shadow-lg shadow-purple-500/20 hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingStaff ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Processando...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">•</span>
                        Inscrever-se como STAFF
                        <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Informações comuns */}
            <div className="bg-[#1a1b2f] rounded-3xl p-8 border border-gray-700 shadow-xl">
              <h3 className="text-2xl font-semibold mb-6 text-center">
                🎁 Benefícios Reais
              </h3>
              
              <div className="text-[#e1e1ff] space-y-6">
                <div className="text-center">
                  <div className="text-3xl mb-3">👊</div>
                  <h4 className="font-medium mb-2">Família, deixa eu alinhar com vocês:</h4>
                  <p className="text-sm">Esse ano o INTERBØX tá em outro nível. Nossa plataforma de judges e staffs veio pra profissionalizar de vez essa parte.</p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm mb-4">A inscrição existe porque temos custo operacional real (plataforma, organização, suporte), mas também porque vamos entregar uma estrutura que nenhum outro campeonato oferece:</p>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-left text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-green-400">✅</span>
                      <span>Curso de arbitragem com os melhores judges do país</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400">✅</span>
                      <span>Alimentação completa durante o evento</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400">✅</span>
                      <span>Camiseta oficial INTERBØX 🎽</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400">✅</span>
                      <span>Área exclusiva para descanso + banheiros dedicados</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400">✅</span>
                      <span>Credencial Oficial com acesso VIP a todas as áreas</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400">✅</span>
                      <span>Grupo Exclusivo de networking com outros profissionais</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400">✅</span>
                      <span>Reconhecimento oficial no maior campeonato de times da América Latina</span>
                    </div>
                  </div>
                  
                  <p className="text-sm mt-4 text-center italic">(vale como banco de horas pra estágio e treinamento técnico)</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl mb-3">🎯</div>
                  <h4 className="font-medium mb-2">Ou seja:</h4>
                  <p className="text-sm">o valor da inscrição não é sobre "pagar pra trabalhar" é sobre garantir suporte, formação e valorização à altura do que o INTERBØX exige.</p>
                </div>
              </div>
            </div>

            {/* Informações adicionais */}
            <div className="mt-12 text-center text-gray-400">
              <p className="text-sm">
                Dúvidas sobre Judge ou Staff? Entre em contato conosco através das redes sociais
              </p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
} 