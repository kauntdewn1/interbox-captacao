import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import Header from '../../components/header';
import Footer from '../../components/Footer';
import SEOHead from '../../components/SEOHead';
import { useAnalytics } from '../../hooks/useAnalytics';
export default function SeguroPage() {
    const { trackPage } = useAnalytics();
    const [formData, setFormData] = useState({
        nome: '',
        cpf: '',
        dataNascimento: '',
        sexo: '',
        email: '',
        telefone: '',
        nomeTime: '',
        observacoes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    // Track page view
    useEffect(() => {
        trackPage();
    }, [trackPage]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Preparar dados do seguro
            const seguroData = {
                nome: formData.nome,
                cpf: formData.cpf,
                dataNascimento: formData.dataNascimento,
                sexo: formData.sexo,
                email: formData.email,
                telefone: formData.telefone,
                nomeTime: formData.nomeTime,
                observacoes: formData.observacoes,
                tipo: 'seguro',
                valor: 39.90,
                status: 'pendente_comprovante',
                data_criacao: new Date().toISOString()
            };
            // Salvar no servidor via API
            const response = await fetch('https://interbox-captacao.netlify.app/.netlify/functions/save-seguro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer interbox2025'
                },
                body: JSON.stringify(seguroData)
            });
            if (!response.ok) {
                throw new Error('Erro ao salvar no servidor');
            }
            const result = await response.json();
            console.log('✅ Seguro salvo no servidor:', result);
            // Também salvar no localStorage como backup
            const segurosExistentes = JSON.parse(localStorage.getItem('interbox_seguros') || '[]');
            segurosExistentes.push({
                ...seguroData,
                id: result.seguro.id
            });
            localStorage.setItem('interbox_seguros', JSON.stringify(segurosExistentes));
            setIsSubmitted(true);
        }
        catch (error) {
            console.error('❌ Erro ao salvar seguro:', error);
            // Fallback: salvar apenas no localStorage
            const seguroData = {
                id: `seguro_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                nome: formData.nome,
                cpf: formData.cpf,
                dataNascimento: formData.dataNascimento,
                sexo: formData.sexo,
                email: formData.email,
                telefone: formData.telefone,
                nomeTime: formData.nomeTime,
                observacoes: formData.observacoes,
                tipo: 'seguro',
                valor: 39.90,
                status: 'pendente_comprovante',
                data_criacao: new Date().toISOString()
            };
            const segurosExistentes = JSON.parse(localStorage.getItem('interbox_seguros') || '[]');
            segurosExistentes.push(seguroData);
            localStorage.setItem('interbox_seguros', JSON.stringify(segurosExistentes));
            setIsSubmitted(true);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    if (isSubmitted) {
        return (_jsxs(_Fragment, { children: [_jsx(SEOHead, { title: "Seguro Confirmado - INTERB\u00D8X 2025", description: "Seu seguro foi registrado com sucesso! Envie o comprovante para finalizar.", image: "/images/og-interbox.png", type: "website" }), _jsxs("div", { className: "min-h-screen bg-gray-900 text-white", children: [_jsx(Header, {}), _jsx("main", { className: "pt-24 pb-16 px-4", children: _jsxs("div", { className: "max-w-4xl mx-auto text-center", children: [_jsxs("div", { className: "bg-[#1a1b2f] rounded-3xl p-8 border border-green-500/20 shadow-xl mb-8", children: [_jsx("div", { className: "text-6xl mb-6", children: "\uD83C\uDF89" }), _jsx("h1", { className: "text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-6", children: "Seguro Registrado!" }), _jsx("p", { className: "text-xl text-gray-300 mb-8", children: "Seu seguro foi registrado com sucesso. Agora \u00E9 s\u00F3 enviar o comprovante para finalizar." }), _jsx("div", { className: "flex justify-center", children: _jsx("div", { className: "bg-gray-800 rounded-2xl p-4 shadow-xl border border-gray-600", children: _jsx("img", { src: "/logos/saga_seguros.png", alt: "Saga Corretora de Seguros", className: "h-12 object-contain" }) }) })] }), _jsxs("div", { className: "bg-[#0f0f23] rounded-3xl p-8 border border-blue-500/20 shadow-xl", children: [_jsx("h2", { className: "text-2xl font-bold text-blue-400 mb-6", children: "\uD83D\uDCCB Pr\u00F3ximos Passos" }), _jsxs("div", { className: "space-y-6 text-left max-w-2xl mx-auto", children: [_jsxs("div", { className: "flex items-start space-x-4", children: [_jsx("div", { className: "bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1", children: "1" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-white mb-2", children: "Fa\u00E7a o PIX" }), _jsxs("p", { className: "text-gray-300", children: ["Valor: ", _jsx("span", { className: "font-bold text-green-400", children: "R$ 39,90" })] }), _jsxs("p", { className: "text-gray-300", children: ["Chave: ", _jsx("span", { className: "font-mono bg-gray-800 px-2 py-1 rounded", children: "00.283.283/0001-26" })] }), _jsx("p", { className: "text-gray-400 text-sm", children: "Saga Corretora de Seguros" })] })] }), _jsxs("div", { className: "flex items-start space-x-4", children: [_jsx("div", { className: "bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1", children: "2" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-white mb-2", children: "Envie o Comprovante" }), _jsxs("p", { className: "text-gray-300", children: ["Email: ", _jsx("span", { className: "font-mono bg-gray-800 px-2 py-1 rounded", children: "financeirocorretora@gruposaga.com.br" })] }), _jsx("p", { className: "text-gray-400 text-sm", children: "Inclua seu CPF no assunto" })] })] }), _jsxs("div", { className: "flex items-start space-x-4", children: [_jsx("div", { className: "bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1", children: "3" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-white mb-2", children: "Aguarde Confirma\u00E7\u00E3o" }), _jsx("p", { className: "text-gray-300", children: "Sua ap\u00F3lice ser\u00E1 ativada ap\u00F3s confirma\u00E7\u00E3o do pagamento" })] })] })] }), _jsxs("div", { className: "mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl", children: [_jsx("p", { className: "text-yellow-400 font-semibold", children: "\u26A0\uFE0F Importante" }), _jsx("p", { className: "text-gray-300 text-sm", children: "1 CPF = 1 seguro. N\u00E3o \u00E9 poss\u00EDvel contratar m\u00FAltiplos seguros com o mesmo CPF." })] })] })] }) }), _jsx(Footer, {})] })] }));
    }
    return (_jsxs(_Fragment, { children: [_jsx(SEOHead, { title: "Seguro INTERB\u00D8X 2025 - Prote\u00E7\u00E3o Completa", description: "Contrate seu seguro INTERB\u00D8X 2025 por apenas R$ 39,90. Prote\u00E7\u00E3o completa para sua participa\u00E7\u00E3o no maior evento fitness de times da Am\u00E9rica Latina.", image: "/images/og-interbox.png", type: "website" }), _jsxs("div", { className: "min-h-screen bg-gray-900 text-white", children: [_jsx(Header, {}), _jsx("main", { className: "pt-24 pb-16 px-4", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h1", { className: "text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-6", children: "\uD83D\uDEE1\uFE0F SEGURO INTERB\u00D8X" }), _jsxs("p", { className: "text-xl text-gray-300 max-w-3xl mx-auto mb-8", children: ["Prote\u00E7\u00E3o completa para sua participa\u00E7\u00E3o no maior evento fitness de times da Am\u00E9rica Latina. Por apenas ", _jsx("span", { className: "font-bold text-green-400", children: "R$ 39,90" }), "."] }), _jsx("div", { className: "flex justify-center mb-8", children: _jsx("div", { className: "bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-600", children: _jsx("img", { src: "/logos/saga_seguros.png", alt: "Saga Corretora de Seguros", className: "h-16 md:h-20 object-contain" }) }) })] }), _jsxs("div", { className: "bg-[#1a1b2f] rounded-3xl p-8 border border-blue-500/20 shadow-xl", children: [_jsxs("div", { className: "bg-[#0f0f23] rounded-3xl p-6 mb-8 border border-blue-500/10", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-2xl font-semibold text-blue-400", children: "\uD83D\uDCCB Informa\u00E7\u00F5es do Seguro" }), _jsx("div", { className: "bg-gray-800 rounded-xl p-2 border border-gray-600", children: _jsx("img", { src: "/logos/saga_seguros.png", alt: "Saga Corretora", className: "h-8 object-contain" }) })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-400", children: "Valor:" }), _jsx("span", { className: "font-bold text-green-400", children: "R$ 39,90" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-400", children: "Forma de Pagamento:" }), _jsx("span", { className: "font-bold text-white", children: "PIX" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-400", children: "Chave PIX:" }), _jsx("span", { className: "font-mono bg-gray-800 px-2 py-1 rounded text-xs", children: "00.283.283/0001-26" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-400", children: "Benefici\u00E1rio:" }), _jsx("span", { className: "font-bold text-white", children: "Saga Corretora de Seguros" })] })] })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "nome", className: "block text-sm font-medium text-gray-300 mb-2", children: "Nome Completo *" }), _jsx("input", { type: "text", id: "nome", name: "nome", value: formData.nome, onChange: handleInputChange, required: true, className: "w-full px-4 py-3 bg-[#0f0f23] border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200", placeholder: "Digite seu nome completo" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "cpf", className: "block text-sm font-medium text-gray-300 mb-2", children: "CPF *" }), _jsx("input", { type: "text", id: "cpf", name: "cpf", value: formData.cpf, onChange: handleInputChange, required: true, maxLength: 14, className: "w-full px-4 py-3 bg-[#0f0f23] border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200", placeholder: "000.000.000-00" })] })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "dataNascimento", className: "block text-sm font-medium text-gray-300 mb-2", children: "Data de Nascimento *" }), _jsx("input", { type: "date", id: "dataNascimento", name: "dataNascimento", value: formData.dataNascimento, onChange: handleInputChange, required: true, className: "w-full px-4 py-3 bg-[#0f0f23] border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "sexo", className: "block text-sm font-medium text-gray-300 mb-2", children: "Sexo *" }), _jsxs("select", { id: "sexo", name: "sexo", value: formData.sexo, onChange: handleInputChange, required: true, className: "w-full px-4 py-3 bg-[#0f0f23] border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200", children: [_jsx("option", { value: "", children: "Selecione..." }), _jsx("option", { value: "masculino", children: "Masculino" }), _jsx("option", { value: "feminino", children: "Feminino" }), _jsx("option", { value: "outro", children: "Outro" })] })] })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-300 mb-2", children: "Email *" }), _jsx("input", { type: "email", id: "email", name: "email", value: formData.email, onChange: handleInputChange, required: true, className: "w-full px-4 py-3 bg-[#0f0f23] border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200", placeholder: "seu@email.com" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "telefone", className: "block text-sm font-medium text-gray-300 mb-2", children: "Telefone *" }), _jsx("input", { type: "tel", id: "telefone", name: "telefone", value: formData.telefone, onChange: handleInputChange, required: true, className: "w-full px-4 py-3 bg-[#0f0f23] border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200", placeholder: "(00) 00000-0000" })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "nomeTime", className: "block text-sm font-medium text-gray-300 mb-2", children: "Nome de seu Time *" }), _jsx("input", { type: "text", id: "nomeTime", name: "nomeTime", value: formData.nomeTime, onChange: handleInputChange, required: true, className: "w-full px-4 py-3 bg-[#0f0f23] border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200", placeholder: "Digite o nome do seu time" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "observacoes", className: "block text-sm font-medium text-gray-300 mb-2", children: "Observa\u00E7\u00F5es" }), _jsx("textarea", { id: "observacoes", name: "observacoes", value: formData.observacoes, onChange: handleInputChange, rows: 4, className: "w-full px-4 py-3 bg-[#0f0f23] border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none", placeholder: "Informa\u00E7\u00F5es adicionais, alergias, condi\u00E7\u00F5es especiais..." })] }), _jsx("div", { className: "text-center pt-4", children: _jsx("button", { type: "submit", disabled: isSubmitting, className: "group relative inline-flex items-center justify-center w-full px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-lg shadow-blue-500/20 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" }), "Processando..."] })) : (_jsxs(_Fragment, { children: [_jsx("span", { className: "mr-2", children: "\uD83D\uDEE1\uFE0F" }), "Contratar Seguro", _jsx("span", { className: "ml-2 group-hover:translate-x-1 transition-transform", children: "\u2192" })] })) }) })] })] }), _jsxs("div", { className: "mt-8 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-center", children: [_jsx("p", { className: "text-yellow-400 font-semibold mb-2", children: "\u26A0\uFE0F Aviso Importante" }), _jsx("p", { className: "text-gray-300", children: "1 CPF = 1 seguro. N\u00E3o \u00E9 poss\u00EDvel contratar m\u00FAltiplos seguros com o mesmo CPF." })] })] }) }), _jsx(Footer, {})] })] }));
}
