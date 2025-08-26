import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '../../../components/header';
import Footer from '../../../components/Footer';
import SEOHead from '../../../components/SEOHead';
import { useAnalytics } from '../../../hooks/useAnalytics';

export default function StaffSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<{
    correlationID: string;
    amount: string;
    description: string;
    status: string;
    paidAt: string;
  } | null>(null);
  const [error, setError] = useState('');
  const { trackPage } = useAnalytics();

  useEffect(() => {
    trackPage();

    // 🆕 NOVO: Receber dados via state do React Router
    if (location.state) {
      const { correlationID, amount, description } = location.state;
      
      if (correlationID && amount) {
        setPaymentData({
          correlationID,
          amount: (parseInt(amount) / 100).toFixed(2).replace('.', ','), // Converter centavos para reais
          description,
          status: 'paid',
          paidAt: new Date().toLocaleString('pt-BR'),
        });
        setLoading(false);
        return;
      }
    }

    // Fallback: tentar parâmetros de URL (para compatibilidade)
    const orderId = searchParams.get('order_id');
    const status = searchParams.get('status');

    if (!orderId || !status || status !== 'paid') {
      setError('Dados de pagamento inválidos ou pagamento não confirmado');
      setLoading(false);
      return;
    }

    // Se temos dados válidos, simular os dados do pagamento
    setPaymentData({
      correlationID: orderId,
      status,
      amount: '19,90',
      description: 'Taxa de Inscrição - STAFF INTERBØX 2025',
      paidAt: new Date().toLocaleString('pt-BR'),
    });

    setLoading(false);
  }, [searchParams, location.state, trackPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando pagamento...</p>
        </div>
      </div>
    );
  }

  // Se há erro, mostrar página de erro
  if (error) {
    return (
      <>
        <SEOHead
          title="Erro - INTERBØX 2025"
          description="Erro ao verificar pagamento."
          image="/images/og-interbox.png"
          type="website"
        />
        <div className="min-h-screen bg-white">
          <Header />
          <main className="pt-24 pb-16 px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="text-red-600 text-6xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Erro na Verificação</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => navigate('/captacao/judge-staff')}
                className="bg-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-pink-700 transition-all duration-200"
              >
                Voltar ao Formulário
              </button>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Pagamento Confirmado - INTERBØX 2025"
        description="Sua inscrição como STAFF foi confirmada com sucesso! Bem-vindo ao time INTERBØX 2025."
        image="/images/og-interbox.png"
        type="website"
      />
      <div className="min-h-screen bg-white relative overflow-hidden">
        <Header />

        {/* Background com textura */}
        <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
          <div className="w-full h-full bg-[url('/images/bg_grunge.png')] bg-repeat opacity-20 mix-blend-multiply"></div>
        </div>

        <main className="pt-24 pb-16 px-4">
          <div className="max-w-2xl mx-auto relative z-10">
            {/* Header da página */}
            <div className="text-center mb-8">
              <img
                src="/logos/nome_hrz.png"
                alt="CERRADO INTERBØX Logo"
                width={320}
                height={90}
                className="mx-auto mb-6 logo-grunge"
                style={{
                  filter: 'brightness(0) invert(0)',
                  WebkitFilter: 'brightness(0) invert(0)', // Fallback para Safari
                  maxWidth: '90vw',
                  height: 'auto',
                  width: 'auto',
                }}
              />
            </div>

            {/* Card de sucesso */}
            <div className="bg-gray-50 border border-green-300 rounded-2xl shadow-[0_8px_32px_0_rgba(34,197,94,0.25)] p-8 text-center relative grunge-card">
              <div className="text-green-600 text-8xl mb-6">🎉</div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                Pagamento Confirmado!
              </h1>

              <p className="text-gray-600 mb-8 text-lg">
                Seu pagamento foi processado com sucesso.
                Bem-vindo ao time de <span className="font-bold text-blue-600">STAFF</span> da <span className="font-bold text-pink-600">INTERBØX 2025</span>!
              </p>

              {/* Detalhes do pagamento */}
              {paymentData && (
                <div className="bg-white border border-green-200 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Detalhes da Transação
                  </h3>
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-semibold text-green-600">Pago</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor:</span>
                      <span className="font-semibold">R$ {paymentData.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data:</span>
                      <span className="font-semibold">{paymentData.paidAt}</span>
                    </div>
                    {paymentData && 'correlationID' in paymentData  && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID da Transação:</span>
                        <span className="font-mono text-sm text-gray-500">{paymentData.correlationID}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Próximos passos */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">
                  📋 Próximos Passos
                </h3>
                <ul className="text-blue-800 space-y-2 text-left">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>Você receberá um email de confirmação em breve</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>Nossa equipe entrará em contato para agendar o treinamento</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>Aguarde informações sobre seu uniforme e credencial</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>Prepare-se para fazer parte do maior evento!</span>
                  </li>
                </ul>
              </div>

              {/* Informações importantes */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-yellow-900 mb-4">
                  ⚠️ Informações Importantes
                </h3>
                <ul className="text-yellow-800 space-y-2 text-left">
                  <li>• Guarde o comprovante de pagamento</li>
                  <li>• Verifique sua caixa de spam para o email de confirmação</li>
                  <li>• Mantenha seus dados de contato atualizados</li>
                  <li>• Em caso de dúvidas, entre em contato conosco</li>
                </ul>
              </div>

              {/* Botões de ação */}
              <div className="space-y-4">
                <a
                  href="/home"
                  className="inline-block bg-pink-600 text-white py-4 px-8 rounded-lg font-semibold hover:bg-pink-700 focus:ring-4 focus:ring-pink-200 transition-all duration-200 text-lg"
                >
                                      Voltar ao Dashboard
                </a>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/perfil"
                    className="inline-block bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-all duration-200"
                  >
                    Ver Perfil
                  </a>
                  <a
                    href="/comunidade"
                    className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
                  >
                    Comunidade
                  </a>
                </div>
              </div>
            </div>

            {/* Mensagem de agradecimento */}
            <div className="text-center mt-8">
              <p className="text-gray-500 text-sm">
                Obrigado por fazer parte da <span className="font-semibold">CERRADO INTERBØX 2025</span>!
                Juntos vamos fazer o melhor evento de todos os tempos! 🏆
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}