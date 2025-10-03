import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import SEOHead from '../../components/SEOHead';
export default function ProdutoDetalhes() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [produto, setProduto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadingCompra, setLoadingCompra] = useState(false);
    const [errorCompra, setErrorCompra] = useState(null);
    const [pix, setPix] = useState(null);
    const [corSelecionada, setCorSelecionada] = useState(null);
    const [tamanhoSelecionado, setTamanhoSelecionado] = useState(null);
    const [imagemAtual, setImagemAtual] = useState(0);
    useEffect(() => {
        const fetchProduto = async () => {
            try {
                const response = await fetch(`/.netlify/functions/get-product?id=${slug}`);
                if (!response.ok) {
                    throw new Error('Produto não encontrado');
                }
                const data = await response.json();
                setProduto(data);
                // Selecionar primeira cor e tamanho disponíveis
                if (data.cores && data.cores.length > 0) {
                    setCorSelecionada(data.cores[0]);
                }
                if (data.tamanhos && data.tamanhos.length > 0) {
                    setTamanhoSelecionado(data.tamanhos[0]);
                }
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao carregar produto');
            }
            finally {
                setLoading(false);
            }
        };
        if (slug) {
            fetchProduto();
        }
    }, [slug]);
    const handleComprar = async () => {
        if (!produto || !corSelecionada || !tamanhoSelecionado) {
            setErrorCompra('Selecione cor e tamanho');
            return;
        }
        setLoadingCompra(true);
        setErrorCompra(null);
        setPix(null);
        try {
            const response = await fetch('/.netlify/functions/create-charge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: produto.id,
                    customerData: {
                        name: 'Cliente INTERBØX',
                        email: 'cliente@example.com',
                        phone: '',
                        cpf: ''
                    },
                    variantes: {
                        cor: corSelecionada.nome,
                        tamanho: tamanhoSelecionado.nome
                    }
                })
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
            }
            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            }
            catch {
                throw new Error('Resposta inválida do servidor');
            }
            if (!data.success) {
                throw new Error(data?.message || 'Falha ao criar charge');
            }
            setPix({
                qrCode: data.charge?.qrCodeImage || data.qrCode,
                pixCopyPaste: data.charge?.brCode || data.pixCopyPaste
            });
            // Log do pedido no localStorage
            try {
                const orderLog = {
                    id: produto.id,
                    slug: produto.slug,
                    cor: corSelecionada.nome,
                    tamanho: tamanhoSelecionado.nome,
                    data: new Date().toISOString(),
                    valor: produto.preco
                };
                // Buscar histórico existente
                const existingOrders = JSON.parse(localStorage.getItem('interbox_last_orders') || '[]');
                // Adicionar novo pedido no início
                const updatedOrders = [orderLog, ...existingOrders];
                // Manter apenas os últimos 5 pedidos
                const limitedOrders = updatedOrders.slice(0, 5);
                // Salvar no localStorage
                localStorage.setItem('interbox_last_orders', JSON.stringify(limitedOrders));
                console.log('📝 Pedido registrado:', orderLog);
            }
            catch (logError) {
                console.warn('⚠️ Erro ao registrar pedido no localStorage:', logError);
                // Não interrompe o fluxo de compra se o log falhar
            }
        }
        catch (e) {
            setErrorCompra(e instanceof Error ? e.message : 'Erro ao processar compra');
        }
        finally {
            setLoadingCompra(false);
        }
    };
    const renderStars = (media) => {
        return Array.from({ length: 5 }, (_, i) => (_jsx(FaStar, { className: `text-lg ${i < Math.floor(media) ? 'text-yellow-400' : 'text-gray-400'}` }, i)));
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-black text-white flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4" }), _jsx("p", { children: "Carregando produto..." })] }) }));
    }
    if (error || !produto) {
        return (_jsx("div", { className: "min-h-screen bg-black text-white flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsxs("p", { className: "text-red-400 mb-4", children: ["Erro: ", error] }), _jsx("button", { onClick: () => navigate('/produtos'), className: "px-4 py-2 bg-pink-600 hover:bg-pink-500 rounded", children: "Voltar para Produtos" })] }) }));
    }
    return (_jsxs(_Fragment, { children: [_jsx(SEOHead, { title: `${produto.nome} - INTERBØX 2025`, description: produto.descricao }), _jsxs("div", { className: "min-h-screen text-white relative", style: {
                    backgroundImage: 'url(/images/bg_grunge.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }, children: [_jsx("div", { className: "absolute inset-0 bg-black/40" }), _jsxs("div", { className: "container mx-auto px-4 py-8 relative z-10", children: [_jsx("div", { className: "mb-6", children: _jsxs(Link, { to: "/produtos", className: "inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 transition-all duration-300", children: [_jsx(FaArrowLeft, {}), "Voltar para Produtos"] }) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "aspect-square overflow-hidden rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10", children: _jsx("img", { src: produto.imagens[imagemAtual] || produto.imagemFallback, alt: produto.nome, className: "w-full h-full object-cover", loading: "lazy" }) }), produto.imagens.length > 1 && (_jsx("div", { className: "flex gap-2", children: produto.imagens.map((imagem, index) => (_jsx("button", { onClick: () => setImagemAtual(index), className: `w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${imagemAtual === index ? 'border-pink-500' : 'border-white/20'}`, children: _jsx("img", { src: imagem, alt: `${produto.nome} ${index + 1}`, className: "w-full h-full object-cover" }) }, index))) }))] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex gap-2", children: [produto.novo && (_jsx("span", { className: "bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold", children: "NOVO" })), produto.destaque && (_jsx("span", { className: "bg-blue-800 text-white px-3 py-1 rounded-full text-sm font-semibold", children: "EXCLUSIVO" }))] }), _jsx("div", { className: "text-pink-400 text-lg font-medium", children: produto.marca }), _jsx("h1", { className: "text-3xl font-bold text-white", children: produto.nome }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex items-center gap-1", children: renderStars(produto.avaliacoes.media) }), _jsxs("span", { className: "text-gray-400", children: [produto.avaliacoes.media, "/5 (", produto.avaliacoes.total, " avalia\u00E7\u00F5es)"] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-gray-300", children: produto.descricao }), produto.descricaoCompleta && (_jsx("p", { className: "text-gray-400 text-sm", children: produto.descricaoCompleta }))] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("span", { className: "text-4xl font-bold text-white", children: ["R$ ", produto.preco.toFixed(2).replace('.', ',')] }), produto.precoOriginal && (_jsxs("span", { className: "text-xl text-gray-400 line-through", children: ["R$ ", produto.precoOriginal.toFixed(2).replace('.', ',')] })), produto.desconto && (_jsxs("span", { className: "bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold", children: ["-", produto.desconto, "%"] }))] }), _jsxs("div", { children: [_jsx("div", { className: "text-gray-300 text-lg mb-3", children: "Cores:" }), _jsx("div", { className: "flex gap-3", children: produto.cores.map((cor) => (_jsx("button", { onClick: () => setCorSelecionada(cor), className: `w-12 h-12 rounded-full border-2 transition-all ${corSelecionada?.nome === cor.nome
                                                                ? 'border-white scale-110'
                                                                : 'border-gray-400 hover:border-white'}`, style: { backgroundColor: cor.hex }, title: cor.nome }, cor.nome))) })] }), _jsxs("div", { children: [_jsx("div", { className: "text-gray-300 text-lg mb-3", children: "Tamanhos:" }), _jsx("div", { className: "flex gap-3 flex-wrap", children: produto.tamanhos.map((tamanho) => (_jsx("button", { onClick: () => setTamanhoSelecionado(tamanho), className: `px-4 py-2 rounded text-lg transition-all ${tamanhoSelecionado?.nome === tamanho.nome
                                                                ? 'bg-pink-600 text-white'
                                                                : 'bg-white/10 text-gray-300 hover:bg-white/20'}`, children: tamanho.nome }, tamanho.nome))) })] }), _jsx("div", { className: "text-gray-400", children: produto.estoque > 0 ? (_jsxs("span", { className: "text-green-400", children: ["\u2713 ", produto.estoque, " em estoque"] })) : (_jsx("span", { className: "text-red-400", children: "\u2717 Fora de estoque" })) }), _jsx("button", { onClick: handleComprar, disabled: loadingCompra || produto.estoque === 0 || !corSelecionada || !tamanhoSelecionado, className: "w-full py-4 px-6 bg-pink-600 hover:bg-pink-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg", children: loadingCompra ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white" }), "Gerando PIX..."] })) : (_jsxs(_Fragment, { children: [_jsx(FaShoppingCart, {}), "Comprar Agora"] })) }), errorCompra && (_jsx("div", { className: "text-red-400 text-center", children: errorCompra })), pix && (_jsxs("div", { className: "mt-6 p-6 bg-green-900/20 border border-green-500/30 rounded-xl", children: [_jsx("div", { className: "text-green-400 text-lg font-semibold mb-4 text-center", children: "PIX Gerado!" }), pix.qrCode && (_jsx("div", { className: "text-center mb-4", children: _jsx("img", { src: pix.qrCode, alt: "QR Code PIX", className: "w-48 h-48 mx-auto" }) })), pix.pixCopyPaste && (_jsxs("div", { className: "text-sm text-gray-300 break-all bg-black/20 p-3 rounded", children: [_jsx("div", { className: "text-green-400 mb-2 font-semibold", children: "C\u00F3digo PIX:" }), pix.pixCopyPaste] }))] })), _jsxs("div", { className: "space-y-4 pt-6 border-t border-white/20", children: [produto.material && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-400", children: "Material: " }), _jsx("span", { className: "text-white", children: produto.material })] })), produto.cuidados && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-400", children: "Cuidados: " }), _jsx("span", { className: "text-white", children: produto.cuidados })] })), produto.garantia && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-400", children: "Garantia: " }), _jsx("span", { className: "text-white", children: produto.garantia })] }))] })] })] })] })] })] }));
}
