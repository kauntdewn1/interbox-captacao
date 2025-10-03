import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { FaStar, FaEye, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getEstoqueTotal } from '../utils/estoque';
export default function ProdutoCard({ produto, onViewDetails }) {
    const navigate = useNavigate();
    const [corSelecionada, setCorSelecionada] = useState(produto.cores[0] ?? null);
    const [tamanhoSelecionado, setTamanhoSelecionado] = useState(produto.tamanhos[0] ?? null);
    const [isLoading, setIsLoading] = useState(false);
    const [showSavedIndicator, setShowSavedIndicator] = useState(false);
    const sessionKey = `produto_session_${produto.id}`;
    const saveSession = useCallback((session) => {
        try {
            localStorage.setItem(sessionKey, JSON.stringify(session));
        }
        catch (error) {
            console.error('Erro ao salvar sessão:', error);
        }
    }, [sessionKey]);
    const loadSession = useCallback(() => {
        try {
            const saved = localStorage.getItem(sessionKey);
            return saved ? JSON.parse(saved) : null;
        }
        catch (error) {
            console.error('Erro ao carregar sessão:', error);
            return null;
        }
    }, [sessionKey]);
    useEffect(() => {
        const savedSession = loadSession();
        if (savedSession) {
            if (savedSession.corSelecionada) {
                const cor = produto.cores.find(c => c.nome === savedSession.corSelecionada);
                if (cor)
                    setCorSelecionada(cor);
            }
            if (savedSession.tamanhoSelecionado) {
                const tamanho = produto.tamanhos.find(t => t.nome === savedSession.tamanhoSelecionado);
                if (tamanho)
                    setTamanhoSelecionado(tamanho);
            }
        }
    }, [produto.id, produto.cores, produto.tamanhos, loadSession]);
    useEffect(() => {
        const session = {
            corSelecionada: corSelecionada?.nome || null,
            tamanhoSelecionado: tamanhoSelecionado?.nome || null,
        };
        saveSession(session);
        if (!corSelecionada && !tamanhoSelecionado) {
            return;
        }
        setShowSavedIndicator(true);
        const timeoutId = window.setTimeout(() => setShowSavedIndicator(false), 2000);
        return () => window.clearTimeout(timeoutId);
    }, [corSelecionada, tamanhoSelecionado, saveSession]);
    const renderStars = (media) => (Array.from({ length: 5 }, (_, i) => (_jsx(FaStar, { className: `text-sm ${i < Math.floor(media) ? 'text-yellow-400' : 'text-gray-400'}` }, i))));
    const handleBuyClick = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            navigate(`/produto/${produto.slug}`);
        }
        catch (error) {
            console.error('Erro ao navegar:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("div", { className: "group relative bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl max-w-sm w-full mx-auto", children: [_jsxs("div", { className: "absolute top-4 left-4 z-10 flex flex-col gap-2", children: [produto.novo && (_jsx("span", { className: "bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold", children: "NOVO" })), produto.destaque && (_jsx("span", { className: "bg-blue-800 text-white px-2 py-1 rounded-full text-xs font-semibold", children: "EXCLUSIVO" })), showSavedIndicator && (_jsx("span", { className: "bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold animate-pulse", children: "SALVO" }))] }), _jsxs("div", { className: "relative aspect-square overflow-hidden", children: [_jsx("img", { src: produto.imagens[0] || produto.imagemFallback, alt: produto.nome, className: "w-full h-full object-cover group-hover:scale-110 transition-transform duration-500", loading: "lazy", onError: (e) => {
                            const target = e.target;
                            if (target.src !== produto.imagemFallback) {
                                target.src = produto.imagemFallback || '/images/placeholder-product.png';
                            }
                        } }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300", children: _jsx("div", { className: "flex gap-2", children: _jsx("button", { onClick: () => onViewDetails?.(produto), className: "p-3 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition-colors", children: _jsx(FaEye, { className: "text-white text-lg" }) }) }) })] }), _jsxs("div", { className: "p-6", children: [_jsx("div", { className: "text-pink-400 text-sm font-medium mb-1", children: produto.marca }), _jsx("h3", { className: "text-white font-bold text-lg mb-2 line-clamp-2", children: produto.nome }), _jsx("p", { className: "text-gray-300 text-sm mb-3 line-clamp-2", children: produto.descricao }), _jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx("div", { className: "flex items-center gap-1", children: renderStars(produto.avaliacoes.media) }), _jsxs("span", { className: "text-gray-400 text-sm", children: ["(", produto.avaliacoes.total, ")"] })] }), _jsxs("div", { className: "mb-3", children: [_jsx("div", { className: "text-gray-300 text-sm mb-2", children: "Cores:" }), _jsxs("div", { className: "flex gap-4 flex-wrap", children: [produto.cores.slice(0, 3).map((cor) => (_jsxs("div", { className: "flex flex-col items-center gap-1 w-9", children: [_jsx("button", { onClick: () => setCorSelecionada(cor), className: `w-9 h-9 rounded-full border-2 transition-all ${corSelecionada?.nome === cor.nome
                                                    ? 'border-white scale-110'
                                                    : 'border-gray-400 hover:border-white'}`, style: { backgroundColor: cor.hex }, title: cor.nome }), _jsx("span", { className: `text-[10px] text-center leading-tight ${corSelecionada?.nome === cor.nome ? 'text-white font-medium' : 'text-gray-300'}`, children: cor.nome })] }, cor.nome))), produto.cores.length > 3 && (_jsxs("div", { className: "w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs", children: ["+", produto.cores.length - 3] }))] })] }), _jsxs("div", { className: "mb-4", children: [_jsx("div", { className: "text-gray-300 text-sm mb-2", children: "Tamanhos:" }), _jsx("div", { className: "flex gap-2 flex-wrap", children: produto.tamanhos.slice(0, 4).map((tamanho) => (_jsx("button", { onClick: () => setTamanhoSelecionado(tamanho), className: `px-3 py-1 rounded text-sm transition-all ${tamanhoSelecionado?.nome === tamanho.nome
                                        ? 'bg-pink-600 text-white'
                                        : 'bg-white/10 text-gray-300 hover:bg-white/20'}`, children: tamanho.nome }, tamanho.nome))) })] }), _jsx("div", { className: "flex items-center gap-3 mb-4", children: _jsxs("span", { className: "text-2xl font-bold text-white", children: ["R$ ", produto.preco.toFixed(2).replace('.', ',')] }) }), _jsx("div", { className: "text-gray-400 text-sm mb-4", children: (() => {
                            const estoqueTotal = getEstoqueTotal(produto);
                            return estoqueTotal > 0 ? (_jsxs("span", { className: "text-green-400", children: ["\u2713 ", estoqueTotal, " em estoque"] })) : (_jsx("span", { className: "text-red-400", children: "\u2717 Fora de estoque" }));
                        })() }), _jsx("button", { onClick: handleBuyClick, disabled: isLoading || getEstoqueTotal(produto) === 0, className: `w-full py-3 px-4 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${isLoading || getEstoqueTotal(produto) === 0
                            ? 'bg-gray-600 cursor-not-allowed opacity-50'
                            : 'bg-pink-600 hover:bg-pink-500'}`, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(FaSpinner, { className: "animate-spin" }), "Carregando..."] })) : (_jsxs(_Fragment, { children: [_jsx(FaEye, {}), "Ver Produto"] })) })] })] }));
}
