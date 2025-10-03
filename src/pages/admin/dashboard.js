import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [salesStats, setSalesStats] = useState(null);
    const [reviews, setReviews] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState('');
    // Verificar autenticação ao carregar
    useEffect(() => {
        const savedApiKey = localStorage.getItem('admin_api_key');
        if (savedApiKey === 'interbox2025') {
            setIsAuthenticated(true);
            setApiKey(savedApiKey);
        }
    }, []);
    // Função para autenticar
    const handleAuth = useCallback(() => {
        if (apiKey === 'interbox2025') {
            localStorage.setItem('admin_api_key', apiKey);
            setIsAuthenticated(true);
        }
        else {
            alert('❌ API Key inválida');
        }
    }, [apiKey]);
    // Função para logout
    const handleLogout = useCallback(() => {
        localStorage.removeItem('admin_api_key');
        setIsAuthenticated(false);
        setApiKey('');
        setSalesStats(null);
        setReviews(null);
    }, []);
    // Carregar estatísticas de vendas
    const loadSalesStats = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/.netlify/functions/get-sales-stats');
            const data = await response.json();
            if (data.success) {
                setSalesStats(data.stats);
            }
            else {
                console.error('Erro ao carregar estatísticas:', data.error);
            }
        }
        catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
        finally {
            setLoading(false);
        }
    }, []);
    // Carregar avaliações
    const loadReviews = useCallback(async (produtoId) => {
        try {
            setLoading(true);
            const url = produtoId
                ? `/.netlify/functions/get-reviews?produto_id=${produtoId}&limit=50`
                : `/.netlify/functions/get-reviews?limit=50`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setReviews(data);
            }
            else {
                console.error('Erro ao carregar avaliações:', data.error);
            }
        }
        catch (error) {
            console.error('Erro ao carregar avaliações:', error);
        }
        finally {
            setLoading(false);
        }
    }, []);
    // Carregar dados quando autenticado
    useEffect(() => {
        if (isAuthenticated) {
            loadSalesStats();
            loadReviews();
        }
    }, [isAuthenticated, loadSalesStats, loadReviews]);
    // Se não autenticado, mostrar tela de login
    if (!isAuthenticated) {
        return (_jsx("div", { style: {
                minHeight: '100vh',
                background: '#000',
                color: '#fff',
                fontFamily: 'monospace',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px'
            }, children: _jsxs("div", { style: {
                    border: '3px solid #fff',
                    padding: '20px',
                    background: '#000',
                    maxWidth: '400px',
                    width: '100%'
                }, children: [_jsx("h1", { style: {
                            fontSize: 'clamp(18px, 5vw, 24px)',
                            fontWeight: 'bold',
                            marginBottom: '20px',
                            textAlign: 'center',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }, children: "ADMIN DASHBOARD" }), _jsxs("div", { style: { marginBottom: '15px' }, children: [_jsx("label", { style: {
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase'
                                }, children: "API KEY:" }), _jsx("input", { type: "password", value: apiKey, onChange: (e) => setApiKey(e.target.value), onKeyPress: (e) => e.key === 'Enter' && handleAuth(), style: {
                                    width: '100%',
                                    padding: '12px',
                                    border: '2px solid #fff',
                                    background: '#000',
                                    color: '#fff',
                                    fontSize: '14px',
                                    fontFamily: 'monospace',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }, placeholder: "Digite a API Key" })] }), _jsx("button", { onClick: handleAuth, style: {
                            width: '100%',
                            padding: '12px',
                            border: '2px solid #fff',
                            background: '#fff',
                            color: '#000',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            fontFamily: 'monospace',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }, onMouseOver: (e) => {
                            e.currentTarget.style.background = '#000';
                            e.currentTarget.style.color = '#fff';
                        }, onMouseOut: (e) => {
                            e.currentTarget.style.background = '#fff';
                            e.currentTarget.style.color = '#000';
                        }, children: "ACESSAR" })] }) }));
    }
    // Dashboard principal
    return (_jsxs("div", { style: {
            minHeight: '100vh',
            background: '#000',
            color: '#fff',
            fontFamily: 'monospace',
            padding: '10px'
        }, children: [_jsxs("div", { style: {
                    border: '3px solid #fff',
                    padding: '15px',
                    marginBottom: '15px',
                    background: '#000',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                }, children: [_jsx("h1", { style: {
                            fontSize: 'clamp(16px, 4vw, 24px)',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            margin: 0,
                            textAlign: 'center'
                        }, children: "DASHBOARD ADMINISTRATIVO" }), _jsx("button", { onClick: handleLogout, style: {
                            padding: '8px 16px',
                            border: '2px solid #fff',
                            background: '#000',
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            fontFamily: 'monospace',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            alignSelf: 'center'
                        }, children: "SAIR" })] }), loading && (_jsx("div", { style: {
                    border: '3px solid #fff',
                    padding: '15px',
                    textAlign: 'center',
                    marginBottom: '15px',
                    background: '#000'
                }, children: _jsx("div", { style: { fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 'bold' }, children: "CARREGANDO..." }) })), salesStats && (_jsxs("div", { style: {
                    border: '3px solid #fff',
                    padding: '15px',
                    marginBottom: '15px',
                    background: '#000'
                }, children: [_jsx("h2", { style: {
                            fontSize: 'clamp(16px, 4vw, 20px)',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            marginBottom: '15px',
                            letterSpacing: '1px',
                            textAlign: 'center'
                        }, children: "\uD83D\uDCCA ESTAT\u00CDSTICAS DE VENDAS" }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                            gap: '10px',
                            marginBottom: '15px'
                        }, children: [_jsxs("div", { style: {
                                    border: '2px solid #fff',
                                    padding: '10px',
                                    background: '#000',
                                    textAlign: 'center'
                                }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold', marginBottom: '5px' }, children: "TOTAL VENDAS" }), _jsx("div", { style: { fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 'bold' }, children: salesStats.geral.total_vendas })] }), _jsxs("div", { style: {
                                    border: '2px solid #fff',
                                    padding: '10px',
                                    background: '#000',
                                    textAlign: 'center'
                                }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold', marginBottom: '5px' }, children: "FATURAMENTO" }), _jsxs("div", { style: { fontSize: 'clamp(12px, 3vw, 16px)', fontWeight: 'bold' }, children: ["R$ ", salesStats.geral.total_faturamento.toLocaleString('pt-BR')] })] }), _jsxs("div", { style: {
                                    border: '2px solid #fff',
                                    padding: '10px',
                                    background: '#000',
                                    textAlign: 'center'
                                }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold', marginBottom: '5px' }, children: "TICKET M\u00C9DIO" }), _jsxs("div", { style: { fontSize: 'clamp(12px, 3vw, 16px)', fontWeight: 'bold' }, children: ["R$ ", salesStats.geral.faturamento_medio.toLocaleString('pt-BR')] })] }), _jsxs("div", { style: {
                                    border: '2px solid #fff',
                                    padding: '10px',
                                    background: '#000',
                                    textAlign: 'center'
                                }, children: [_jsx("div", { style: { fontSize: '10px', fontWeight: 'bold', marginBottom: '5px' }, children: "30 DIAS" }), _jsx("div", { style: { fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 'bold' }, children: salesStats.geral.vendas_ultimos_30_dias })] })] }), _jsxs("div", { style: { marginBottom: '15px' }, children: [_jsx("h3", { style: {
                                    fontSize: 'clamp(12px, 3vw, 16px)',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    marginBottom: '10px',
                                    textAlign: 'center'
                                }, children: "VENDAS POR PRODUTO" }), _jsx("div", { style: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                    gap: '10px'
                                }, children: Object.entries(salesStats.por_produto).map(([produtoId, stats]) => (_jsxs("div", { style: {
                                        border: '2px solid #fff',
                                        padding: '10px',
                                        background: '#000'
                                    }, children: [_jsxs("div", { style: {
                                                fontSize: 'clamp(10px, 2.5vw, 12px)',
                                                fontWeight: 'bold',
                                                marginBottom: '8px',
                                                textTransform: 'uppercase',
                                                textAlign: 'center'
                                            }, children: ["PRODUTO ", produtoId] }), _jsxs("div", { style: {
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr',
                                                gap: '8px',
                                                marginBottom: '8px'
                                            }, children: [_jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: '8px', marginBottom: '2px' }, children: "VENDAS" }), _jsx("div", { style: { fontSize: 'clamp(12px, 3vw, 16px)', fontWeight: 'bold' }, children: stats.total })] }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: '8px', marginBottom: '2px' }, children: "FATURAMENTO" }), _jsxs("div", { style: { fontSize: 'clamp(10px, 2.5vw, 12px)', fontWeight: 'bold' }, children: ["R$ ", stats.faturamento.toLocaleString('pt-BR')] })] })] }), Object.keys(stats.cores).length > 0 && (_jsxs("div", { style: { marginBottom: '8px' }, children: [_jsx("div", { style: { fontSize: '8px', marginBottom: '3px', textAlign: 'center' }, children: "CORES:" }), _jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '3px', justifyContent: 'center' }, children: Object.entries(stats.cores)
                                                        .sort(([, a], [, b]) => b - a)
                                                        .slice(0, 3)
                                                        .map(([cor, qtd]) => (_jsxs("div", { style: {
                                                            fontSize: '7px',
                                                            padding: '2px 4px',
                                                            border: '1px solid #fff',
                                                            background: '#000'
                                                        }, children: [cor, ": ", qtd] }, cor))) })] })), Object.keys(stats.tamanhos).length > 0 && (_jsxs("div", { children: [_jsx("div", { style: { fontSize: '8px', marginBottom: '3px', textAlign: 'center' }, children: "TAMANHOS:" }), _jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '3px', justifyContent: 'center' }, children: Object.entries(stats.tamanhos)
                                                        .sort(([, a], [, b]) => b - a)
                                                        .slice(0, 3)
                                                        .map(([tamanho, qtd]) => (_jsxs("div", { style: {
                                                            fontSize: '7px',
                                                            padding: '2px 4px',
                                                            border: '1px solid #fff',
                                                            background: '#000'
                                                        }, children: [tamanho, ": ", qtd] }, tamanho))) })] }))] }, produtoId))) })] }), salesStats.top_clientes.length > 0 && (_jsxs("div", { children: [_jsx("h3", { style: {
                                    fontSize: 'clamp(12px, 3vw, 16px)',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    marginBottom: '10px',
                                    textAlign: 'center'
                                }, children: "TOP CLIENTES" }), _jsx("div", { style: {
                                    border: '2px solid #fff',
                                    padding: '10px',
                                    background: '#000'
                                }, children: salesStats.top_clientes.slice(0, 5).map((cliente, index) => (_jsxs("div", { style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '3px 0',
                                        borderBottom: index < 4 ? '1px solid #333' : 'none',
                                        fontSize: 'clamp(8px, 2vw, 10px)'
                                    }, children: [_jsx("span", { style: {
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                maxWidth: '60%'
                                            }, children: cliente.email }), _jsx("span", { style: { fontWeight: 'bold' }, children: cliente.compras })] }, cliente.email))) })] }))] })), reviews && (_jsxs("div", { style: {
                    border: '3px solid #fff',
                    padding: '15px',
                    background: '#000'
                }, children: [_jsx("h2", { style: {
                            fontSize: 'clamp(16px, 4vw, 20px)',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            marginBottom: '15px',
                            letterSpacing: '1px',
                            textAlign: 'center'
                        }, children: "\u2B50 AVALIA\u00C7\u00D5ES" }), _jsxs("div", { style: { marginBottom: '15px' }, children: [_jsx("label", { style: {
                                    display: 'block',
                                    fontSize: 'clamp(10px, 2.5vw, 12px)',
                                    fontWeight: 'bold',
                                    marginBottom: '8px',
                                    textTransform: 'uppercase',
                                    textAlign: 'center'
                                }, children: "FILTRAR POR PRODUTO:" }), _jsxs("select", { value: selectedProduct, onChange: (e) => {
                                    setSelectedProduct(e.target.value);
                                    loadReviews(e.target.value || undefined);
                                }, style: {
                                    width: '100%',
                                    padding: '8px',
                                    border: '2px solid #fff',
                                    background: '#000',
                                    color: '#fff',
                                    fontSize: 'clamp(10px, 2.5vw, 12px)',
                                    fontFamily: 'monospace',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }, children: [_jsx("option", { value: "", children: "TODOS OS PRODUTOS" }), salesStats && Object.keys(salesStats.por_produto).map(produtoId => (_jsxs("option", { value: produtoId, children: ["PRODUTO ", produtoId] }, produtoId)))] })] }), reviews.stats && (_jsx("div", { style: {
                            border: '2px solid #fff',
                            padding: '10px',
                            marginBottom: '15px',
                            background: '#000'
                        }, children: _jsxs("div", { style: {
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '10px'
                            }, children: [_jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: 'clamp(8px, 2vw, 10px)', fontWeight: 'bold', marginBottom: '5px' }, children: "M\u00C9DIA GERAL" }), _jsxs("div", { style: { fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 'bold' }, children: [reviews.stats.media, "/5"] })] }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: 'clamp(8px, 2vw, 10px)', fontWeight: 'bold', marginBottom: '5px' }, children: "TOTAL AVALIA\u00C7\u00D5ES" }), _jsx("div", { style: { fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 'bold' }, children: reviews.stats.total })] })] }) })), _jsxs("div", { children: [_jsx("h3", { style: {
                                    fontSize: 'clamp(12px, 3vw, 16px)',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    marginBottom: '10px',
                                    textAlign: 'center'
                                }, children: "\u00DALTIMAS AVALIA\u00C7\u00D5ES" }), reviews.reviews.length === 0 ? (_jsx("div", { style: {
                                    border: '2px solid #fff',
                                    padding: '15px',
                                    textAlign: 'center',
                                    background: '#000'
                                }, children: _jsx("div", { style: { fontSize: 'clamp(10px, 2.5vw, 12px)' }, children: "NENHUMA AVALIA\u00C7\u00C3O ENCONTRADA" }) })) : (_jsx("div", { style: {
                                    display: 'grid',
                                    gap: '8px'
                                }, children: reviews.reviews.map((review) => (_jsxs("div", { style: {
                                        border: '2px solid #fff',
                                        padding: '10px',
                                        background: '#000'
                                    }, children: [_jsxs("div", { style: {
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '8px'
                                            }, children: [_jsxs("div", { style: {
                                                        fontSize: 'clamp(10px, 2.5vw, 12px)',
                                                        fontWeight: 'bold'
                                                    }, children: ["PRODUTO ", review.produto_id] }), _jsxs("div", { style: {
                                                        fontSize: 'clamp(10px, 2.5vw, 12px)',
                                                        fontWeight: 'bold'
                                                    }, children: [review.nota, "/5 \u2B50"] })] }), review.comentario && (_jsxs("div", { style: {
                                                fontSize: 'clamp(9px, 2vw, 10px)',
                                                marginBottom: '8px',
                                                lineHeight: '1.3',
                                                wordBreak: 'break-word'
                                            }, children: ["\"", review.comentario, "\""] })), _jsxs("div", { style: {
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                fontSize: 'clamp(8px, 2vw, 9px)',
                                                color: '#ccc'
                                            }, children: [_jsx("span", { children: review.cliente_inicial }), _jsx("span", { children: new Date(review.data).toLocaleDateString('pt-BR') })] })] }, review.id))) }))] })] }))] }));
}
