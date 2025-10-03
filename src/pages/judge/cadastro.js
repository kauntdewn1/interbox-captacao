import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import Header from '../../components/header';
import Footer from '../../components/Footer';
import SEOHead from '../../components/SEOHead';
import { useAnalytics } from '../../hooks/useAnalytics';
export default function JudgeCadastroPage() {
    const { trackPage } = useAnalytics();
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        whatsapp: '',
        cpf: '',
        certificacoes: '',
        experiencia: '',
        disponibilidade: '',
        motivacao: ''
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
            // Preparar dados da inscrição
            const inscricaoData = {
                nome: formData.nome,
                email: formData.email,
                whatsapp: formData.whatsapp,
                cpf: formData.cpf,
                tipo: 'judge',
                valor: 0, // Gratuito
                status: 'cadastrado',
                data_criacao: new Date().toISOString(),
                certificacoes: formData.certificacoes,
                experiencia: formData.experiencia,
                disponibilidade: formData.disponibilidade,
                motivacao: formData.motivacao
            };
            // Salvar no servidor via API
            const response = await fetch('https://interbox-captacao.netlify.app/.netlify/functions/save-inscricao', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer interbox2025'
                },
                body: JSON.stringify(inscricaoData)
            });
            if (!response.ok) {
                throw new Error('Erro ao salvar no servidor');
            }
            const result = await response.json();
            console.log('✅ Cadastro judge salvo no servidor:', result);
            // Também salvar no localStorage como backup
            const inscricoesExistentes = JSON.parse(localStorage.getItem('interbox_inscricoes') || '[]');
            inscricoesExistentes.push({
                ...inscricaoData,
                id: result.inscricao.id
            });
            localStorage.setItem('interbox_inscricoes', JSON.stringify(inscricoesExistentes));
            setIsSubmitted(true);
        }
        catch (error) {
            console.error('❌ Erro ao salvar cadastro:', error);
            // Fallback: salvar apenas no localStorage
            const inscricaoData = {
                id: `judge_insc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                nome: formData.nome,
                email: formData.email,
                whatsapp: formData.whatsapp,
                cpf: formData.cpf,
                tipo: 'judge',
                valor: 0,
                status: 'cadastrado',
                data_criacao: new Date().toISOString(),
                certificacoes: formData.certificacoes,
                experiencia: formData.experiencia,
                disponibilidade: formData.disponibilidade,
                motivacao: formData.motivacao
            };
            const inscricoesExistentes = JSON.parse(localStorage.getItem('interbox_inscricoes') || '[]');
            inscricoesExistentes.push(inscricaoData);
            localStorage.setItem('interbox_inscricoes', JSON.stringify(inscricoesExistentes));
            setIsSubmitted(true);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    if (isSubmitted) {
        return (_jsxs(_Fragment, { children: [_jsx(SEOHead, { title: "Cerrado INTERB\u00D8X 25 - Cadastro JUDGE Confirmado", description: "Seu cadastro como Judge foi realizado com sucesso na INTERB\u00D8X.", type: "website" }), _jsxs("div", { className: "min-h-screen bg-neutral-950", children: [_jsx(Header, {}), _jsx("main", { className: "pt-24 pb-16 px-4", children: _jsxs("div", { className: "max-w-2xl mx-auto text-center", children: [_jsxs("div", { className: "bg-green-900/20 border border-green-500/30 rounded-3xl p-8 mb-8", children: [_jsx("div", { className: "text-6xl mb-4", children: "\u2705" }), _jsx("h1", { className: "text-3xl font-bold text-green-400 mb-4", children: "Cadastro Confirmado!" }), _jsx("p", { className: "text-gray-300 text-lg mb-6", children: "Seu cadastro como Judge foi realizado com sucesso. Nossa equipe entrar\u00E1 em contato em breve para pr\u00F3ximos passos." }), _jsx("div", { className: "bg-green-800/20 rounded-2xl p-4", children: _jsx("p", { className: "text-green-300 font-medium", children: "\uD83D\uDCE7 Verifique seu email para confirma\u00E7\u00E3o" }) })] }), _jsx("button", { onClick: () => window.location.href = '/', className: "px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-2xl font-semibold transition-all duration-200", children: "Voltar ao In\u00EDcio" })] }) }), _jsx(Footer, {})] })] }));
    }
    return (_jsxs(_Fragment, { children: [_jsx(SEOHead, { title: "Cerrado INTERB\u00D8X 25 - Cadastro JUDGE", description: "Cadastre-se como Judge na INTERB\u00D8X. Seja respons\u00E1vel pela avalia\u00E7\u00E3o t\u00E9cnica e fair play.", type: "website" }), _jsxs("div", { className: "min-h-screen bg-neutral-950", children: [_jsx(Header, {}), _jsx("main", { className: "pt-24 pb-16 px-4", children: _jsxs("div", { className: "max-w-2xl mx-auto", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent mb-4", children: "\uD83C\uDFAF CADASTRO JUDGE" }), _jsx("p", { className: "text-xl text-gray-300", children: "Seja respons\u00E1vel pela avalia\u00E7\u00E3o t\u00E9cnica, garantindo fair play e excel\u00EAncia competitiva na INTERB\u00D8X" })] }), _jsx("div", { className: "bg-neutral-900/50 border border-pink-500/20 rounded-3xl p-8", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "nome", className: "block text-sm font-medium text-gray-300 mb-2", children: "Nome Completo *" }), _jsx("input", { type: "text", id: "nome", name: "nome", required: true, value: formData.nome, onChange: handleInputChange, className: "w-full px-4 py-3 bg-neutral-800 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200", placeholder: "Digite seu nome completo" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-300 mb-2", children: "Email *" }), _jsx("input", { type: "email", id: "email", name: "email", required: true, value: formData.email, onChange: handleInputChange, className: "w-full px-4 py-3 bg-neutral-800 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200", placeholder: "seu@email.com" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "whatsapp", className: "block text-sm font-medium text-gray-300 mb-2", children: "WhatsApp *" }), _jsx("input", { type: "tel", id: "whatsapp", name: "whatsapp", required: true, value: formData.whatsapp, onChange: handleInputChange, className: "w-full px-4 py-3 bg-neutral-800 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200", placeholder: "(62) 99999-9999" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "cpf", className: "block text-sm font-medium text-gray-300 mb-2", children: "CPF *" }), _jsx("input", { type: "text", id: "cpf", name: "cpf", required: true, value: formData.cpf, onChange: handleInputChange, className: "w-full px-4 py-3 bg-neutral-800 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200", placeholder: "000.000.000-00" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "certificacoes", className: "block text-sm font-medium text-gray-300 mb-2", children: "Certifica\u00E7\u00F5es e Credenciais" }), _jsx("textarea", { id: "certificacoes", name: "certificacoes", rows: 3, value: formData.certificacoes, onChange: handleInputChange, className: "w-full px-4 py-3 bg-neutral-800 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200", placeholder: "Liste suas certifica\u00E7\u00F5es, credenciais e qualifica\u00E7\u00F5es..." })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "experiencia", className: "block text-sm font-medium text-gray-300 mb-2", children: "Experi\u00EAncia como Judge" }), _jsx("textarea", { id: "experiencia", name: "experiencia", rows: 3, value: formData.experiencia, onChange: handleInputChange, className: "w-full px-4 py-3 bg-neutral-800 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200", placeholder: "Conte sobre sua experi\u00EAncia como judge em competi\u00E7\u00F5es..." })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "disponibilidade", className: "block text-sm font-medium text-gray-300 mb-2", children: "Disponibilidade *" }), _jsxs("select", { id: "disponibilidade", name: "disponibilidade", required: true, value: formData.disponibilidade, onChange: handleInputChange, className: "w-full px-4 py-3 bg-neutral-800 border border-gray-600 rounded-2xl text-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200", children: [_jsx("option", { value: "", children: "Selecione sua disponibilidade" }), _jsx("option", { value: "integral", children: "Integral (sexta, s\u00E1bado e domingo)" }), _jsx("option", { value: "sexta", children: "Apenas sexta-feira" }), _jsx("option", { value: "sabado", children: "Apenas s\u00E1bado" }), _jsx("option", { value: "domingo", children: "Apenas domingo" }), _jsx("option", { value: "sexta-sabado", children: "Sexta e s\u00E1bado" }), _jsx("option", { value: "sabado-domingo", children: "S\u00E1bado e domingo" })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "motivacao", className: "block text-sm font-medium text-gray-300 mb-2", children: "Por que quer ser Judge? *" }), _jsx("textarea", { id: "motivacao", name: "motivacao", rows: 3, required: true, value: formData.motivacao, onChange: handleInputChange, className: "w-full px-4 py-3 bg-neutral-800 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200", placeholder: "Conte sua motiva\u00E7\u00E3o para participar como Judge..." })] }), _jsx("button", { type: "submit", disabled: isSubmitting, className: "w-full px-6 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 rounded-2xl font-semibold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3 inline" }), "Enviando..."] })) : ('📝 Enviar Cadastro') })] }) })] }) }), _jsx(Footer, {})] })] }));
}
