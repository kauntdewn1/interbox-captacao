import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
export default function AdminSeguro() {
    const [seguros, setSeguros] = useState([]);
    const [estatisticas, setEstatisticas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [filtros, setFiltros] = useState({
        status: '',
        data_inicio: '',
        data_fim: '',
        cpf: ''
    });
    // Função para aplicar filtros
    const aplicarFiltros = useCallback((seguros, filtros) => {
        let segurosFiltrados = [...seguros];
        if (filtros.status) {
            segurosFiltrados = segurosFiltrados.filter(s => s.status === filtros.status);
        }
        if (filtros.cpf) {
            segurosFiltrados = segurosFiltrados.filter(s => s.cpf.toLowerCase().includes(filtros.cpf.toLowerCase()));
        }
        if (filtros.data_inicio) {
            segurosFiltrados = segurosFiltrados.filter(s => {
                const dataSeguro = new Date(s.data_criacao);
                const dataInicio = new Date(filtros.data_inicio);
                return dataSeguro >= dataInicio;
            });
        }
        if (filtros.data_fim) {
            segurosFiltrados = segurosFiltrados.filter(s => {
                const dataSeguro = new Date(s.data_criacao);
                const dataFim = new Date(filtros.data_fim);
                return dataSeguro <= dataFim;
            });
        }
        return segurosFiltrados;
    }, []);
    // Função para sincronizar dados
    const sincronizarDados = async () => {
        if (!apiKey) {
            alert('Digite a API Key primeiro');
            return;
        }
        setIsSyncing(true);
        try {
            const response = await fetch('https://interbox-captacao.netlify.app/.netlify/functions/admin-seguros', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                }
            });
            if (!response.ok) {
                throw new Error('Erro na sincronização');
            }
            const data = await response.json();
            setSeguros(data.seguros || []);
            setEstatisticas(data.estatisticas || null);
            // Salvar no localStorage como backup
            localStorage.setItem('interbox_seguros', JSON.stringify(data.seguros || []));
            alert('✅ Dados sincronizados com sucesso!');
        }
        catch (error) {
            console.error('❌ Erro na sincronização:', error);
            alert('❌ Erro na sincronização. Verifique a API Key.');
        }
        finally {
            setIsSyncing(false);
        }
    };
    // Função para atualizar status
    const atualizarStatus = async (seguroId, novoStatus) => {
        if (!apiKey) {
            alert('Digite a API Key primeiro');
            return;
        }
        try {
            const response = await fetch('https://interbox-captacao.netlify.app/.netlify/functions/update-seguro-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    seguroId,
                    status: novoStatus
                })
            });
            if (!response.ok) {
                throw new Error('Erro ao atualizar status');
            }
            // Atualizar estado local
            setSeguros(prev => prev.map(s => s.id === seguroId
                ? { ...s, status: novoStatus, data_atualizacao: new Date().toISOString() }
                : s));
            alert('✅ Status atualizado com sucesso!');
        }
        catch (error) {
            console.error('❌ Erro ao atualizar status:', error);
            alert('❌ Erro ao atualizar status.');
        }
    };
    // Função para exportar dados
    const exportarCSV = () => {
        const segurosFiltrados = aplicarFiltros(seguros, filtros);
        if (segurosFiltrados.length === 0) {
            alert('Nenhum dado para exportar');
            return;
        }
        const headers = [
            'ID', 'Nome', 'CPF', 'Data Nascimento', 'Sexo', 'Email', 'Telefone',
            'Nome do Time', 'Observações', 'Valor', 'Status', 'Data Criação', 'Data Atualização'
        ];
        const csvContent = [
            headers.join(','),
            ...segurosFiltrados.map(s => [
                s.id,
                `"${s.nome}"`,
                s.cpf,
                s.dataNascimento,
                s.sexo,
                `"${s.email}"`,
                s.telefone,
                `"${s.nomeTime}"`,
                `"${s.observacoes || ''}"`,
                s.valor,
                s.status,
                s.data_criacao,
                s.data_atualizacao || ''
            ].join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `seguros_interbox_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    // Carregar dados iniciais
    useEffect(() => {
        const segurosSalvos = localStorage.getItem('interbox_seguros');
        if (segurosSalvos) {
            try {
                const segurosData = JSON.parse(segurosSalvos);
                setSeguros(segurosData);
                // Calcular estatísticas
                const stats = {
                    total_seguros: segurosData.length,
                    pendentes: segurosData.filter((s) => s.status === 'pendente_comprovante').length,
                    comprovantes_enviados: segurosData.filter((s) => s.status === 'comprovante_enviado').length,
                    pagos_confirmados: segurosData.filter((s) => s.status === 'pago_confirmado').length,
                    valor_total: segurosData.reduce((acc, s) => acc + s.valor, 0)
                };
                setEstatisticas(stats);
            }
            catch (error) {
                console.error('Erro ao carregar dados salvos:', error);
            }
        }
        setLoading(false);
    }, []);
    // Calcular estatísticas quando seguros mudam
    useEffect(() => {
        if (seguros.length > 0) {
            const stats = {
                total_seguros: seguros.length,
                pendentes: seguros.filter(s => s.status === 'pendente_comprovante').length,
                comprovantes_enviados: seguros.filter(s => s.status === 'comprovante_enviado').length,
                pagos_confirmados: seguros.filter(s => s.status === 'pago_confirmado').length,
                valor_total: seguros.reduce((acc, s) => acc + s.valor, 0)
            };
            setEstatisticas(stats);
        }
    }, [seguros]);
    const segurosFiltrados = aplicarFiltros(seguros, filtros);
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-gray-900 text-white flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" }), _jsx("p", { children: "Carregando..." })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gray-900 text-white p-6", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsx("div", { className: "mb-8", children: _jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-blue-400 mb-2", children: "\uD83D\uDEE1\uFE0F Admin Seguros INTERB\u00D8X" }), _jsx("p", { className: "text-gray-400", children: "Gerencie todos os seguros contratados" })] }), _jsx("div", { className: "bg-gray-800 rounded-2xl p-3 shadow-xl border border-gray-600", children: _jsx("img", { src: "/logos/saga_seguros.png", alt: "Saga Corretora de Seguros", className: "h-12 object-contain" }) })] }) }), _jsx("div", { className: "bg-[#1a1b2f] rounded-2xl p-6 border border-blue-500/20 mb-8", children: _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("input", { type: "password", id: "saga-api-key", name: "apiKey", value: apiKey, onChange: (e) => setApiKey(e.target.value), placeholder: "Digite a API Key do parceiro Saga", autoComplete: "off", className: "flex-1 px-4 py-2 bg-[#0f0f23] border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" }), _jsx("button", { onClick: sincronizarDados, disabled: isSyncing || !apiKey, className: "px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl transition-colors", children: isSyncing ? 'Sincronizando...' : 'Sincronizar' })] }) }), estatisticas && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-4 mb-8", children: [_jsxs("div", { className: "bg-[#1a1b2f] rounded-2xl p-6 border border-blue-500/20 text-center", children: [_jsx("div", { className: "text-2xl font-bold text-blue-400", children: estatisticas.total_seguros }), _jsx("div", { className: "text-sm text-gray-400", children: "Total" })] }), _jsxs("div", { className: "bg-[#1a1b2f] rounded-2xl p-6 border border-yellow-500/20 text-center", children: [_jsx("div", { className: "text-2xl font-bold text-yellow-400", children: estatisticas.pendentes }), _jsx("div", { className: "text-sm text-gray-400", children: "Pendentes" })] }), _jsxs("div", { className: "bg-[#1a1b2f] rounded-2xl p-6 border border-orange-500/20 text-center", children: [_jsx("div", { className: "text-2xl font-bold text-orange-400", children: estatisticas.comprovantes_enviados }), _jsx("div", { className: "text-sm text-gray-400", children: "Comprovantes" })] }), _jsxs("div", { className: "bg-[#1a1b2f] rounded-2xl p-6 border border-green-500/20 text-center", children: [_jsx("div", { className: "text-2xl font-bold text-green-400", children: estatisticas.pagos_confirmados }), _jsx("div", { className: "text-sm text-gray-400", children: "Pagos" })] }), _jsxs("div", { className: "bg-[#1a1b2f] rounded-2xl p-6 border border-purple-500/20 text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-purple-400", children: ["R$ ", estatisticas.valor_total.toFixed(2)] }), _jsx("div", { className: "text-sm text-gray-400", children: "Valor Total" })] })] })), _jsxs("div", { className: "bg-[#1a1b2f] rounded-2xl p-6 border border-blue-500/20 mb-8", children: [_jsx("h2", { className: "text-xl font-semibold mb-4 text-blue-400", children: "\uD83D\uDD0D Filtros" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("select", { id: "seguro-status-filter", name: "status", value: filtros.status, onChange: (e) => setFiltros(prev => ({ ...prev, status: e.target.value })), className: "px-4 py-2 bg-[#0f0f23] border border-gray-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20", children: [_jsx("option", { value: "", children: "Todos os Status" }), _jsx("option", { value: "pendente_comprovante", children: "Pendente Comprovante" }), _jsx("option", { value: "comprovante_enviado", children: "Comprovante Enviado" }), _jsx("option", { value: "pago_confirmado", children: "Pago e Confirmado" })] }), _jsx("input", { type: "date", id: "seguro-data-inicio", name: "data_inicio", value: filtros.data_inicio, onChange: (e) => setFiltros(prev => ({ ...prev, data_inicio: e.target.value })), className: "px-4 py-2 bg-[#0f0f23] border border-gray-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20", placeholder: "Data In\u00EDcio" }), _jsx("input", { type: "date", id: "seguro-data-fim", name: "data_fim", value: filtros.data_fim, onChange: (e) => setFiltros(prev => ({ ...prev, data_fim: e.target.value })), className: "px-4 py-2 bg-[#0f0f23] border border-gray-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20", placeholder: "Data Fim" }), _jsx("input", { type: "text", id: "seguro-cpf-filter", name: "cpf", value: filtros.cpf, onChange: (e) => setFiltros(prev => ({ ...prev, cpf: e.target.value })), className: "px-4 py-2 bg-[#0f0f23] border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20", placeholder: "Buscar por CPF", autoComplete: "off" })] })] }), _jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsxs("h2", { className: "text-xl font-semibold text-blue-400", children: ["\uD83D\uDCCB Seguros (", segurosFiltrados.length, ")"] }), _jsx("button", { onClick: exportarCSV, disabled: segurosFiltrados.length === 0, className: "px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl transition-colors", children: "\uD83D\uDCCA Exportar CSV" })] }), _jsxs("div", { className: "bg-[#1a1b2f] rounded-2xl border border-blue-500/20 overflow-hidden", children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-[#0f0f23] border-b border-blue-500/20", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-4 text-left text-sm font-semibold text-blue-400", children: "Nome" }), _jsx("th", { className: "px-6 py-4 text-left text-sm font-semibold text-blue-400", children: "CPF" }), _jsx("th", { className: "px-6 py-4 text-left text-sm font-semibold text-blue-400", children: "Time" }), _jsx("th", { className: "px-6 py-4 text-left text-sm font-semibold text-blue-400", children: "Status" }), _jsx("th", { className: "px-6 py-4 text-left text-sm font-semibold text-blue-400", children: "Data" }), _jsx("th", { className: "px-6 py-4 text-left text-sm font-semibold text-blue-400", children: "A\u00E7\u00F5es" })] }) }), _jsx("tbody", { className: "divide-y divide-blue-500/10", children: segurosFiltrados.map((seguro) => (_jsxs("tr", { className: "hover:bg-[#0f0f23] transition-colors", children: [_jsx("td", { className: "px-6 py-4", children: _jsxs("div", { children: [_jsx("div", { className: "font-medium text-white", children: seguro.nome }), _jsx("div", { className: "text-sm text-gray-400", children: seguro.email })] }) }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-300", children: seguro.cpf }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-300", children: seguro.nomeTime }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${seguro.status === 'pendente_comprovante' ? 'bg-yellow-500/20 text-yellow-400' :
                                                            seguro.status === 'comprovante_enviado' ? 'bg-orange-500/20 text-orange-400' :
                                                                'bg-green-500/20 text-green-400'}`, children: seguro.status === 'pendente_comprovante' ? 'Pendente' :
                                                            seguro.status === 'comprovante_enviado' ? 'Comprovante' :
                                                                'Pago' }) }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-400", children: new Date(seguro.data_criacao).toLocaleDateString('pt-BR') }), _jsx("td", { className: "px-6 py-4", children: _jsx("div", { className: "flex space-x-2", children: _jsxs("select", { value: seguro.status, onChange: (e) => atualizarStatus(seguro.id, e.target.value), className: "px-2 py-1 bg-[#0f0f23] border border-gray-600 rounded text-xs text-white focus:border-blue-500", children: [_jsx("option", { value: "pendente_comprovante", children: "Pendente" }), _jsx("option", { value: "comprovante_enviado", children: "Comprovante" }), _jsx("option", { value: "pago_confirmado", children: "Pago" })] }) }) })] }, seguro.id))) })] }) }), segurosFiltrados.length === 0 && (_jsx("div", { className: "text-center py-12 text-gray-400", children: "Nenhum seguro encontrado com os filtros aplicados" }))] })] }) }));
}
