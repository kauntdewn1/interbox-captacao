import { useState } from 'react';
import { createCharge } from '../../src/config/openpix-config';
import Footer from '../../src/components/Footer';
import SEOHead from '../../src/components/SEOHead';

const Interbox25EventPage = () => {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (type: 'unit' | 'combo') => {
    const amount = type === 'unit' ? 9000 : 18000; // em centavos
    const description = type === 'unit'
      ? 'Ingresso Interbox25 - 1 Dia'
      : 'Ingresso Interbox25 - Combo 2 Dias';

    const paymentData = {
      correlationID: `ingresso-${type}-${Date.now()}`,
      value: amount,
      comment: description,
      customer: {
        name: 'Visitante',
        email: 'ingresso@interbox.com.br'
      }
    };
    try {
      setLoading(true);

      const result = await createCharge(paymentData);
      const url =
        (result?.charge && typeof result.charge === 'object' && 'paymentUrl' in result.charge ? (result.charge as { paymentUrl?: string }).paymentUrl : undefined) ||
        result?.paymentLinkUrl ||
        result?.link ||
        null;
      if (typeof url === 'string' && url.length > 0) {
        window.location.href = url;
      } else {
        console.error('URL de pagamento não encontrada no retorno:', result);
        alert('Não foi possível redirecionar para o pagamento.');
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      alert('Erro inesperado. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <SEOHead 
        title="Ingressos INTERBØX 2025" 
        description="Garanta já seu ingresso para o INTERBØX 2025, o maior campeonato de times da América Latina. Compre ingresso unitário ou combo para os dois dias de evento."
      />
      
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <img src="/logos/nome_hrz.png" alt="INTERBØX" className="h-10 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-2">🎟️ Ingressos - INTERBØX 2025</h1>
        <p className="text-lg text-gray-600 mb-8">Garanta seu acesso ao maior campeonato de times da América Latina!</p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Ingresso Unitário */}
          <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-purple-600 mb-2">Ingresso 1 Dia</h2>
            <p className="text-sm text-gray-500 mb-4">Válido para qualquer um dos dias</p>
            <div className="text-3xl font-bold text-gray-900 mb-4">R$ 90,00</div>
            <button
              disabled={loading}
              onClick={() => handlePurchase('unit')}
              className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition"
            >
              Comprar Agora
            </button>
          </div>

          {/* Ingresso Combo */}
          <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-purple-600 mb-2">Ingresso Combo</h2>
            <p className="text-sm text-gray-500 mb-4">Acesso aos dois dias de evento</p>
            <div className="text-3xl font-bold text-gray-900 mb-4">R$ 180,00</div>
            <button
              disabled={loading}
              onClick={() => handlePurchase('combo')}
              className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition"
            >
              Comprar Agora
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-400">O pagamento será processado via FlowPay (OpenPix).</p>
      </div>

      <Footer />
    </div>
  );
};

export default Interbox25EventPage;
