import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
const API_BASE_URL = 'https://interbox-captacao.netlify.app/.netlify/functions';
const API_KEY = 'interbox2025';
function Login({ onLogin }) {
    const [key, setKey] = useState('');
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-8", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-4xl font-bold mb-4", children: "\uD83D\uDD10 ADMIN INTERB\u00D8X 2025" }), _jsx("p", { className: "text-xl text-white/80", children: "Acesso restrito \u00E0 organiza\u00E7\u00E3o" })] }), _jsxs("div", { className: "bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20", children: [_jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "API Key de Administra\u00E7\u00E3o" }), _jsx("input", { type: "password", value: key, onChange: (e) => setKey(e.target.value), onKeyDown: (e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            onLogin(key);
                                        }
                                    }, placeholder: "Digite sua API Key", className: "w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500" })] }), _jsx("button", { onClick: () => onLogin(key), className: "w-full px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-xl font-medium transition-colors", children: "\uD83D\uDD11 Acessar Dashboard" })] })] }) }));
}
export default function AdminDashboard() {
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('admin_api_key') || '');
    const isAuthenticated = apiKey === API_KEY;
    const [inscricoes, setInscricoes] = useState([]);
    const [seguros, setSeguros] = useState([]);
    const [loading, setLoading] = useState(false);
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [resIns, resSeg] = await Promise.all([
                fetch(`${API_BASE_URL}/save-inscricao`, { headers: { Authorization: `Bearer ${API_KEY}` } }),
                fetch(`${API_BASE_URL}/admin-seguros`, { headers: { Authorization: `Bearer ${API_KEY}` } })
            ]);
            if (resIns.ok) {
                const data = await resIns.json();
                setInscricoes(Array.isArray(data.inscricoes) ? data.inscricoes : []);
            }
            if (resSeg.ok) {
                const data = await resSeg.json();
                setSeguros(Array.isArray(data) ? data : []);
            }
        }
        catch (e) {
            console.error('Erro ao carregar dados', e);
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        if (isAuthenticated)
            loadData();
    }, [isAuthenticated, loadData]);
    const handleLogin = (key) => {
        if (key === API_KEY) {
            localStorage.setItem('admin_api_key', key);
            setApiKey(key);
        }
        else {
            alert('API Key inválida');
        }
    };
    if (!isAuthenticated)
        return _jsx(Login, { onLogin: handleLogin });
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-8", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl lg:text-4xl font-bold mb-2", children: "\uD83D\uDCCA Dashboard INTERB\u00D8X 2025" }), _jsx("p", { className: "text-white/80", children: "Gerencie inscri\u00E7\u00F5es, seguros e exporte dados" })] }), _jsxs("div", { className: "grid grid-cols-2 lg:flex gap-2 lg:gap-4 w-full lg:w-auto", children: [_jsx("button", { onClick: loadData, disabled: loading, className: "px-3 lg:px-6 py-2 lg:py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-xl font-medium transition-colors text-sm lg:text-base", children: loading ? '🔄 Carregando...' : '🔄 Recarregar' }), _jsx("button", { onClick: () => {
                                        if (!inscricoes.length)
                                            return alert('Sem dados para exportar');
                                        const headers = Object.keys(inscricoes[0]).join(',');
                                        const rows = inscricoes.map((r) => Object.values(r).map((v) => `"${v}"`).join(',')).join('\n');
                                        const csv = [headers, rows].join('\n');
                                        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                                        const link = document.createElement('a');
                                        link.href = URL.createObjectURL(blob);
                                        link.download = `inscricoes_${new Date().toISOString().split('T')[0]}.csv`;
                                        link.click();
                                    }, className: "px-3 lg:px-6 py-2 lg:py-3 bg-green-600 hover:bg-green-700 rounded-xl font-medium transition-colors text-sm lg:text-base", children: "\uD83D\uDCCA Exportar CSV" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-8", children: [_jsxs("div", { className: "bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20", children: [_jsx("h3", { className: "text-xl font-semibold mb-4", children: "\uD83D\uDC65 Inscri\u00E7\u00F5es (Judge & Staff)" }), loading ? (_jsx("p", { className: "text-white/80", children: "Carregando..." })) : inscricoes.length === 0 ? (_jsx("p", { className: "text-white/80", children: "Nenhuma inscri\u00E7\u00E3o encontrada." })) : (_jsx("div", { className: "overflow-x-auto -mx-4 sm:mx-0", children: _jsxs("table", { className: "w-full min-w-[600px] sm:min-w-0", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-white/20", children: [_jsx("th", { className: "text-left py-2 px-4", children: "Nome" }), _jsx("th", { className: "text-left py-2 px-4", children: "Email" }), _jsx("th", { className: "text-left py-2 px-4", children: "WhatsApp" }), _jsx("th", { className: "text-left py-2 px-4", children: "Tipo" }), _jsx("th", { className: "text-left py-2 px-4", children: "Criado em" })] }) }), _jsx("tbody", { children: inscricoes
                                                    .filter((i) => i.tipo === 'judge' || i.tipo === 'staff')
                                                    .map((i) => (_jsxs("tr", { className: "border-b border-white/10 hover:bg-white/5", children: [_jsx("td", { className: "py-2 px-4", children: i.nome }), _jsx("td", { className: "py-2 px-4", children: i.email }), _jsx("td", { className: "py-2 px-4", children: i.whatsapp }), _jsx("td", { className: "py-2 px-4", children: i.tipo }), _jsx("td", { className: "py-2 px-4", children: new Date(i.data_criacao).toLocaleDateString('pt-BR') })] }, i.id))) })] }) }))] }), _jsxs("div", { className: "bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20", children: [_jsxs("h3", { className: "text-xl font-semibold mb-4", children: ["\uD83D\uDEE1\uFE0F Seguros (", seguros.length, ")"] }), seguros.length === 0 ? (_jsx("p", { className: "text-white/80", children: "Nenhuma solicita\u00E7\u00E3o." })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left text-white/70", children: [_jsx("th", { className: "py-2 px-4", children: "Nome" }), _jsx("th", { className: "py-2 px-4", children: "Email" }), _jsx("th", { className: "py-2 px-4", children: "WhatsApp" }), _jsx("th", { className: "py-2 px-4", children: "Status" }), _jsx("th", { className: "py-2 px-4", children: "Criado em" })] }) }), _jsx("tbody", { children: seguros.map((s, idx) => (_jsxs("tr", { className: "border-t border-white/10", children: [_jsx("td", { className: "py-2 px-4", children: s.nome }), _jsx("td", { className: "py-2 px-4", children: s.email }), _jsx("td", { className: "py-2 px-4", children: s.whatsapp }), _jsx("td", { className: "py-2 px-4", children: s.status }), _jsx("td", { className: "py-2 px-4", children: s.created_at ? new Date(s.created_at).toLocaleDateString('pt-BR') : '—' })] }, idx))) })] }) }))] })] })] }) }));
}
