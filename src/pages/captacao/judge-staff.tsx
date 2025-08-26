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
        description="Seja Judge ou Staff no maior evento de parkour do Brasil. Participe da organização e ajude a fazer história!"
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
                🎯 Judge & Staff
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Faça parte da força que faz o INTERBØX acontecer.
                Seja como júri técnico ou staff operacional, essa é a chance de entrar no time responsável por garantir que o maior evento de times da América Latina funcione com excelência.
              </p>
            </div>

            {/* Grid com duas opções */}
            <div className="grid lg:grid-cols-2 gap-8 mb-16">
              
              {/* Judge */}
              <div className="bg-[#1a1b2f] rounded-3xl p-8 border border-pink-500/20 shadow-xl">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-pink-400 mb-4">Judge</h2>
                  <p className="text-gray-300 text-lg">
                    Avalie performances, pontue atletas e represente a justiça esportiva dentro da arena.
                  </p>
                </div>

                {/* Explicação do papel */}
                <div className="bg-[#0f0f23] rounded-3xl p-6 mb-8 border border-pink-500/10">
                  <h3 className="text-xl font-semibold mb-4 text-pink-400">🎯 Seu papel:</h3>
                  <ul className="space-y-3 text-[#e1e1ff]">
                    <li>• Aplicar os critérios oficiais com precisão</li>
                    <li>• Acompanhar as performances e atribuir notas técnicas</li>
                    <li>• Atuar com integridade nas decisões de competição</li>
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
                    Trabalhe nos bastidores e mantenha tudo funcionando com eficiência, ritmo e organização.
                  </p>
                </div>

                {/* Explicação do papel */}
                <div className="bg-[#0f0f23] rounded-3xl p-6 mb-8 border border-purple-500/10">
                  <h3 className="text-xl font-semibold mb-4 text-purple-400">🎯 Seu papel:</h3>
                  <ul className="space-y-3 text-[#e1e1ff]">
                    <li>• Suporte logístico e operacional das áreas</li>
                    <li>• Atendimento direto a atletas e equipes</li>
                    <li>• Organização e coordenação das atividades</li>
                    <li>• Garantir segurança, fluxo e experiência</li>
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
                        Inscrever-se como Staff
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
                🎁 Benefícios Comuns
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6 text-[#e1e1ff]">
                <div className="text-center">
                  <div className="text-3xl mb-3">🎫</div>
                  <h4 className="font-medium mb-2">Credencial Oficial</h4>
                  <p className="text-sm">Acesso VIP a todas as áreas do evento</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl mb-3">👥</div>
                  <h4 className="font-medium mb-2">Grupo Exclusivo</h4>
                  <p className="text-sm">Networking com outros profissionais</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl mb-3">🎯</div>
                  <h4 className="font-medium mb-2">Experiência Única</h4>
                  <p className="text-sm">Participe da história da INTERBØX</p>
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