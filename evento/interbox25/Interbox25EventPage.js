import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { createCharge } from '../../src/config/openpix-config';
import Footer from '../../src/components/Footer';
import SEOHead from '../../src/components/SEOHead';
const Interbox25EventPage = () => {
    const [loading, setLoading] = useState(false);
    const handlePurchase = async (type) => {
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
            const url = (result?.charge && typeof result.charge === 'object' && 'paymentUrl' in result.charge ? result.charge.paymentUrl : undefined) ||
                result?.paymentLinkUrl ||
                result?.link ||
                null;
            if (typeof url === 'string' && url.length > 0) {
                window.location.href = url;
            }
            else {
                console.error('URL de pagamento não encontrada no retorno:', result);
                alert('Não foi possível redirecionar para o pagamento.');
            }
        }
        catch (err) {
            console.error('Erro inesperado:', err);
            alert('Erro inesperado. Verifique sua conexão.');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-100 text-gray-800", children: [_jsx(SEOHead, { title: "Ingressos INTERB\u00D8X 2025", description: "Garanta j\u00E1 seu ingresso para o INTERB\u00D8X 2025, o maior campeonato de times da Am\u00E9rica Latina. Compre ingresso unit\u00E1rio ou combo para os dois dias de evento." }), _jsxs("div", { className: "max-w-4xl mx-auto py-12 px-4 text-center", children: [_jsx("img", { src: "/logos/nome_hrz.png", alt: "INTERB\u00D8X", className: "h-10 mx-auto mb-6" }), _jsx("h1", { className: "text-3xl font-bold mb-2", children: "\uD83C\uDF9F\uFE0F Ingressos - INTERB\u00D8X 2025" }), _jsx("p", { className: "text-lg text-gray-600 mb-8", children: "Garanta seu acesso ao maior campeonato de times da Am\u00E9rica Latina!" }), _jsxs("div", { className: "grid md:grid-cols-2 gap-6 mb-12", children: [_jsxs("div", { className: "bg-white shadow-lg rounded-lg p-6 border border-gray-200", children: [_jsx("h2", { className: "text-xl font-bold text-purple-600 mb-2", children: "Ingresso 1 Dia" }), _jsx("p", { className: "text-sm text-gray-500 mb-4", children: "V\u00E1lido para qualquer um dos dias" }), _jsx("div", { className: "text-3xl font-bold text-gray-900 mb-4", children: "R$ 90,00" }), _jsx("button", { disabled: loading, onClick: () => handlePurchase('unit'), className: "w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition", children: "Comprar Agora" })] }), _jsxs("div", { className: "bg-white shadow-lg rounded-lg p-6 border border-gray-200", children: [_jsx("h2", { className: "text-xl font-bold text-purple-600 mb-2", children: "Ingresso Combo" }), _jsx("p", { className: "text-sm text-gray-500 mb-4", children: "Acesso aos dois dias de evento" }), _jsx("div", { className: "text-3xl font-bold text-gray-900 mb-4", children: "R$ 180,00" }), _jsx("button", { disabled: loading, onClick: () => handlePurchase('combo'), className: "w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition", children: "Comprar Agora" })] })] }), _jsx("p", { className: "text-sm text-gray-400", children: "O pagamento ser\u00E1 processado via FlowPay (OpenPix)." })] }), _jsx(Footer, {})] }));
};
export default Interbox25EventPage;
