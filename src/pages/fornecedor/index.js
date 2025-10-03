import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Painel do Fornecedor - INTERBØX 2025
 * Dashboard em tempo real para fornecedores (PlayK)
 */
import { useState, useEffect } from 'react';
// ============================================================================
// Componente Principal
// ============================================================================
export default function FornecedorDashboard() {
    const [salesData, setSalesData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        gender: '',
        startDate: '',
        endDate: '',
    });
    const [autoRefresh, setAutoRefresh] = useState(true);
    /**
     * Carrega dados de vendas
     */
    const loadSalesData = async () => {
        try {
            const params = new URLSearchParams({
                supplier: 'playk',
                ...(filters.status && { status: filters.status }),
                ...(filters.gender && { gender: filters.gender }),
                ...(filters.startDate && { startDate: filters.startDate }),
                ...(filters.endDate && { endDate: filters.endDate }),
            });
            const response = await fetch(`/.netlify/functions/get-supplier-sales?${params}`);
            if (!response.ok) {
                throw new Error(`Erro ao carregar vendas: ${response.status}`);
            }
            const data = await response.json();
            setSalesData(data);
            setError(null);
        }
        catch (err) {
            console.error('Erro ao carregar vendas:', err);
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        }
        finally {
            setLoading(false);
        }
    };
    /**
     * Carrega dados ao montar e quando filtros mudarem
     */
    useEffect(() => {
        loadSalesData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);
    /**
     * Auto-refresh a cada 30 segundos
     */
    useEffect(() => {
        if (!autoRefresh)
            return;
        const interval = setInterval(() => {
            loadSalesData();
        }, 30000); // 30 segundos
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoRefresh, filters]);
    /**
     * Formata data
     */
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    /**
     * Badge de status
     */
    const StatusBadge = ({ status }) => {
        const colors = {
            paid: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            failed: 'bg-red-100 text-red-800',
        };
        const labels = {
            paid: 'Pago',
            pending: 'Pendente',
            failed: 'Falhou',
        };
        return (_jsx("span", { className: `px-2 py-1 rounded-full text-xs font-semibold ${colors[status] ?? 'bg-gray-100 text-gray-800'}`, children: labels[status] ?? status }));
    };
    // ============================================================================
    // Render
    // ============================================================================
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" }), _jsx("p", { className: "mt-4 text-gray-600", children: "Carregando vendas..." })] }) }));
    }
    if (error) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-6 max-w-md", children: [_jsx("h2", { className: "text-red-800 font-bold text-lg mb-2", children: "Erro ao carregar dados" }), _jsx("p", { className: "text-red-600", children: error }), _jsx("button", { onClick: () => loadSalesData(), className: "mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700", children: "Tentar Novamente" })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg", children: _jsxs("div", { className: "container mx-auto px-4 py-6", children: [_jsx("img", { src: "https://res.cloudinary.com/duifkkhm6/image/upload/v1757360942/interbox/logos/n12ystccvxwzppvi2yaz.png", alt: "PlayK Logo", className: "h-12 mb-4" }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "Dashboard PlayK" }), _jsx("p", { className: "text-purple-200 mt-1", children: "Vendas INTERB\u00D8X 2025 em Tempo Real" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("label", { className: "flex items-center gap-2 text-sm", children: [_jsx("input", { type: "checkbox", checked: autoRefresh, onChange: (e) => setAutoRefresh(e.target.checked), className: "rounded" }), "Auto-refresh (30s)"] }), _jsx("button", { onClick: () => loadSalesData(), className: "px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 font-semibold", children: "\uD83D\uDD04 Atualizar" })] })] })] }) }), _jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-8", children: [_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("div", { className: "text-gray-500 text-sm font-semibold mb-1", children: "Total de Vendas" }), _jsx("div", { className: "text-3xl font-bold text-purple-600", children: salesData?.stats.total_orders || 0 })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("div", { className: "text-gray-500 text-sm font-semibold mb-1", children: "Pagamentos Confirmados" }), _jsx("div", { className: "text-3xl font-bold text-green-600", children: salesData?.stats.paid_orders || 0 })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("div", { className: "text-gray-500 text-sm font-semibold mb-1", children: "Pendentes" }), _jsx("div", { className: "text-3xl font-bold text-yellow-600", children: salesData?.stats.pending_orders || 0 })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("div", { className: "text-gray-500 text-sm font-semibold mb-1", children: "Faturamento Total" }), _jsxs("div", { className: "text-3xl font-bold text-purple-600", children: ["R$ ", salesData?.stats.total_revenue_brl || '0.00'] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-8", children: [_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h2", { className: "text-lg font-bold text-gray-800 mb-4", children: "\uD83D\uDCCA Vendas por G\u00EAnero" }), _jsx("div", { className: "space-y-3", children: salesData?.stats.by_gender.map((item) => (_jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded", children: [_jsxs("div", { children: [_jsx("div", { className: "font-semibold text-gray-800", children: item.gender }), _jsxs("div", { className: "text-sm text-gray-500", children: [item.count, " vendas"] })] }), _jsx("div", { className: "text-right", children: _jsxs("div", { className: "font-bold text-purple-600", children: ["R$ ", item.total_brl] }) })] }, item.gender))) })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h2", { className: "text-lg font-bold text-gray-800 mb-4", children: "\uD83C\uDFC6 Produtos Mais Vendidos" }), _jsx("div", { className: "space-y-3", children: salesData?.stats.by_product.slice(0, 5).map((item, index) => (_jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold", children: index + 1 }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-gray-800 text-sm", children: item.name }), _jsxs("div", { className: "text-xs text-gray-500", children: [item.count, " vendas"] })] })] }), _jsxs("div", { className: "font-bold text-purple-600", children: ["R$ ", (item.total / 100).toFixed(2)] })] }, item.id))) })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6 mb-6", children: [_jsx("h2", { className: "text-lg font-bold text-gray-800 mb-4", children: "\uD83D\uDD0D Filtros" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Status" }), _jsxs("select", { value: filters.status, onChange: (e) => setFilters({ ...filters, status: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500", children: [_jsx("option", { value: "", children: "Todos" }), _jsx("option", { value: "paid", children: "Pago" }), _jsx("option", { value: "pending", children: "Pendente" }), _jsx("option", { value: "failed", children: "Falhou" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "G\u00EAnero" }), _jsxs("select", { value: filters.gender, onChange: (e) => setFilters({ ...filters, gender: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500", children: [_jsx("option", { value: "", children: "Todos" }), _jsx("option", { value: "Masculino", children: "Masculino" }), _jsx("option", { value: "Feminino", children: "Feminino" }), _jsx("option", { value: "Unissex", children: "Unissex" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Data In\u00EDcio" }), _jsx("input", { type: "date", value: filters.startDate, onChange: (e) => setFilters({ ...filters, startDate: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Data Fim" }), _jsx("input", { type: "date", value: filters.endDate, onChange: (e) => setFilters({ ...filters, endDate: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" })] })] }), _jsx("button", { onClick: () => setFilters({ status: '', gender: '', startDate: '', endDate: '' }), className: "mt-4 text-sm text-purple-600 hover:text-purple-800 font-semibold", children: "Limpar Filtros" })] }), _jsxs("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: [_jsxs("div", { className: "px-6 py-4 border-b border-gray-200", children: [_jsx("h2", { className: "text-lg font-bold text-gray-800", children: "\uD83D\uDCE6 Hist\u00F3rico de Pedidos" }), _jsxs("p", { className: "text-sm text-gray-500 mt-1", children: [salesData?.pagination.total || 0, " pedidos encontrados"] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase", children: "Data" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase", children: "Produto" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase", children: "G\u00EAnero" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase", children: "Cliente" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase", children: "Valor" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase", children: "Status" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200", children: salesData?.orders.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "px-6 py-8 text-center text-gray-500", children: "Nenhum pedido encontrado" }) })) : (salesData?.orders.map((order) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: formatDate(order.dates.paid || order.dates.created) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [order.product.image && (_jsx("img", { src: order.product.image, alt: order.product.name, className: "w-10 h-10 rounded object-cover" })), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-gray-800 text-sm", children: order.product.name }), _jsx("div", { className: "text-xs text-gray-500", children: order.correlationID })] })] }) }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: order.product.gender }), _jsxs("td", { className: "px-6 py-4", children: [_jsx("div", { className: "text-sm text-gray-800", children: order.customer.name }), _jsx("div", { className: "text-xs text-gray-500", children: order.customer.email })] }), _jsxs("td", { className: "px-6 py-4 text-sm font-semibold text-purple-600", children: ["R$ ", order.amount_brl] }), _jsx("td", { className: "px-6 py-4", children: _jsx(StatusBadge, { status: order.status }) })] }, order.id)))) })] }) })] }), _jsxs("div", { className: "mt-8 text-center text-sm text-gray-500", children: [_jsx("img", { src: "/logos/FLOWPAY_trans.png", alt: "FlowPay Logo", className: "h-8 mx-auto mb-2" }), _jsx("p", { children: "INTERB\u00D8X 2025 - Painel do Fornecedor PlayK" }), _jsxs("p", { className: "mt-1", children: ["\u00DAltima atualiza\u00E7\u00E3o: ", new Date().toLocaleTimeString('pt-BR')] })] }), _jsx("div", { className: "mt-4 text-center", children: _jsx("img", { src: "/logos/nome_hrz.png", alt: "Powered by Nome", className: "h-5 mx-auto opacity-60" }) })] })] }));
}
