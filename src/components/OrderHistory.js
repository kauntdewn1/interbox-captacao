import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { FaHistory, FaTrash, FaDownload, FaUpload, FaShoppingBag } from 'react-icons/fa';
import { getOrderHistory, clearOrderHistory, getOrderHistoryStats, exportOrderHistory, importOrderHistory } from '../utils/orderHistory';
export default function OrderHistory({ isOpen, onClose }) {
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState(null);
    const [showImport, setShowImport] = useState(false);
    useEffect(() => {
        if (isOpen) {
            loadHistory();
        }
    }, [isOpen]);
    const loadHistory = () => {
        const orderHistory = getOrderHistory();
        const orderStats = getOrderHistoryStats();
        setHistory(orderHistory);
        setStats(orderStats);
    };
    const handleClearHistory = () => {
        if (confirm('Tem certeza que deseja limpar todo o histórico de compras?')) {
            clearOrderHistory();
            loadHistory();
        }
    };
    const handleExport = () => {
        const jsonData = exportOrderHistory();
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `interbox-order-history-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };
    const handleImport = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const jsonData = e.target?.result;
                if (importOrderHistory(jsonData)) {
                    loadHistory();
                    setShowImport(false);
                    alert('Histórico importado com sucesso!');
                }
                else {
                    alert('Erro ao importar histórico. Verifique o formato do arquivo.');
                }
            };
            reader.readAsText(file);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-white/20", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(FaHistory, { className: "text-pink-500 text-xl" }), _jsx("h2", { className: "text-white text-xl font-bold", children: "Hist\u00F3rico de Compras" })] }), _jsx("button", { onClick: onClose, className: "text-white/60 hover:text-white transition-colors", children: "\u2715" })] }), stats && (_jsx("div", { className: "p-6 border-b border-white/20", children: _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-pink-500", children: stats.totalOrders }), _jsx("div", { className: "text-white/60 text-sm", children: "Total de Pedidos" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-green-500", children: ["R$ ", stats.totalValue.toFixed(2).replace('.', ',')] }), _jsx("div", { className: "text-white/60 text-sm", children: "Valor Total" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-blue-500", children: stats.uniqueProducts }), _jsx("div", { className: "text-white/60 text-sm", children: "Produtos \u00DAnicos" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-yellow-500", children: stats.mostPopularColor || 'N/A' }), _jsx("div", { className: "text-white/60 text-sm", children: "Cor Popular" })] })] }) })), _jsxs("div", { className: "p-6 border-b border-white/20", children: [_jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsxs("button", { onClick: handleExport, className: "flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors", children: [_jsx(FaDownload, {}), "Exportar"] }), _jsxs("button", { onClick: () => setShowImport(!showImport), className: "flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors", children: [_jsx(FaUpload, {}), "Importar"] }), _jsxs("button", { onClick: handleClearHistory, className: "flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors", children: [_jsx(FaTrash, {}), "Limpar Hist\u00F3rico"] })] }), showImport && (_jsx("div", { className: "mt-4", children: _jsx("input", { type: "file", id: "order-history-import", name: "orderHistoryImport", accept: ".json", onChange: handleImport, className: "w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" }) }))] }), _jsx("div", { className: "p-6 overflow-y-auto max-h-96", children: history.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(FaShoppingBag, { className: "text-white/40 text-4xl mx-auto mb-4" }), _jsx("p", { className: "text-white/60", children: "Nenhuma compra registrada ainda" })] })) : (_jsx("div", { className: "space-y-4", children: history.map((order, index) => (_jsx("div", { className: "bg-white/5 rounded-lg p-4 border border-white/10", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-white font-semibold mb-1", children: order.nome }), _jsxs("div", { className: "text-white/60 text-sm space-y-1", children: [_jsxs("div", { children: ["Cor: ", _jsx("span", { className: "text-white", children: order.cor })] }), _jsxs("div", { children: ["Tamanho: ", _jsx("span", { className: "text-white", children: order.tamanho })] }), _jsxs("div", { children: ["Valor: ", _jsxs("span", { className: "text-green-400 font-semibold", children: ["R$ ", order.valor.toFixed(2).replace('.', ',')] })] }), _jsxs("div", { children: ["Data: ", _jsx("span", { className: "text-white", children: new Date(order.data).toLocaleDateString('pt-BR', {
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                }) })] })] })] }), _jsx("div", { className: "text-right", children: _jsxs("div", { className: "text-white/40 text-xs", children: ["#", order.produtoId] }) })] }) }, `${order.produtoId}-${order.data}-${index}`))) })) })] }) }));
}
