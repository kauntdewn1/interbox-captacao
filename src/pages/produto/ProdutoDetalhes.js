import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import SEOHead from '../../components/SEOHead';
import { saveOrderToHistory } from '../../utils/orderHistory';
import Footer from '../../components/Footer';
import CheckoutFormModal from '../../components/CheckoutFormModal';
import { getQuantidadeDisponivel, isCombinacaoDisponivel, getEstoquePorCor, getEstoquePorTamanho } from '../../utils/estoque';
export default function ProdutoDetalhes() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [produto, setProduto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadingCompra, setLoadingCompra] = useState(false);
    const [errorCompra, setErrorCompra] = useState(null);
    const [pix, setPix] = useState(null);
    const [statusPix, setStatusPix] = useState(null);
    const [corSelecionada, setCorSelecionada] = useState(null);
    const [tamanhoSelecionado, setTamanhoSelecionado] = useState(null);
    const [imagemAtual, setImagemAtual] = useState(0);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    // Chave única para localStorage baseada no ID do produto
    const getSessionKey = () => `produto_session_${produto?.id || slug}`;
    // Função para salvar sessão no localStorage
    const saveSession = (session) => {
        try {
            localStorage.setItem(getSessionKey(), JSON.stringify(session));
        }
        catch (error) {
            console.error('Erro ao salvar sessão:', error);
        }
    };
    // Função para carregar sessão do localStorage
    const loadSession = () => {
        try {
            const saved = localStorage.getItem(getSessionKey());
            return saved ? JSON.parse(saved) : null;
        }
        catch (error) {
            console.error('Erro ao carregar sessão:', error);
            return null;
        }
    };
    useEffect(() => {
        const fetchProduto = async () => {
            try {
                const response = await fetch(`/.netlify/functions/get-product?id=${slug}`);
                if (!response.ok) {
                    throw new Error('Produto não encontrado');
                }
                const data = await response.json();
                setProduto(data);
                // Carregar seleções salvas do localStorage
                const savedSession = loadSession();
                console.log('🔄 [PRODUTO DETALHES] Carregando sessão salva:', savedSession);
                if (savedSession) {
                    // Restaurar cor selecionada
                    if (savedSession.corSelecionada) {
                        const cor = data.cores.find((c) => c.nome === savedSession.corSelecionada);
                        if (cor) {
                            setCorSelecionada(cor);
                        }
                        else {
                            // Se a cor salva não existir mais, usar a primeira disponível
                            setCorSelecionada(data.cores[0]);
                        }
                    }
                    else {
                        setCorSelecionada(data.cores[0]);
                    }
                    // Restaurar tamanho selecionado
                    if (savedSession.tamanhoSelecionado) {
                        const tamanho = data.tamanhos.find((t) => t.nome === savedSession.tamanhoSelecionado);
                        if (tamanho) {
                            setTamanhoSelecionado(tamanho);
                        }
                        else {
                            // Se o tamanho salvo não existir mais, usar o primeiro disponível
                            setTamanhoSelecionado(data.tamanhos[0]);
                        }
                    }
                    else {
                        setTamanhoSelecionado(data.tamanhos[0]);
                    }
                }
                else {
                    // Selecionar primeira cor e tamanho disponíveis se não houver sessão salva
                    if (data.cores && data.cores.length > 0) {
                        setCorSelecionada(data.cores[0]);
                    }
                    if (data.tamanhos && data.tamanhos.length > 0) {
                        setTamanhoSelecionado(data.tamanhos[0]);
                    }
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug]);
    // Salvar sessão quando estados mudarem
    useEffect(() => {
        if (produto) {
            const session = {
                corSelecionada: corSelecionada?.nome || null,
                tamanhoSelecionado: tamanhoSelecionado?.nome || null
            };
            console.log('💾 [PRODUTO DETALHES] Salvando sessão:', session);
            saveSession(session);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [corSelecionada, tamanhoSelecionado, produto]);
    const handleComprar = async () => {
        if (!produto || !corSelecionada || !tamanhoSelecionado) {
            setErrorCompra('Selecione cor e tamanho');
            return;
        }
        setErrorCompra(null);
        setShowCheckoutModal(true);
    };
    const handleCheckoutSubmit = async (form) => {
        if (!produto || !corSelecionada || !tamanhoSelecionado) {
            setErrorCompra('Selecione cor e tamanho');
            return;
        }
        setLoadingCompra(true);
        setErrorCompra(null);
        setPix(null);
        setStatusPix(null);
        try {
            const response = await fetch('/.netlify/functions/create-charge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: produto.id,
                    productSlug: produto.slug,
                    customerData: {
                        name: form.nome,
                        email: form.email,
                        phone: form.telefone,
                        cpf: form.cpf
                    },
                    address: form.endereco,
                    variantes: {
                        cor: corSelecionada.nome,
                        tamanho: tamanhoSelecionado.nome
                    },
                    tag: `produto-${produto.slug}`,
                    origin: window.location.pathname || 'site-interbox'
                })
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
            }
            const data = await response.json();
            if (!data.success) {
                throw new Error(data?.message || 'Falha ao criar charge');
            }
            setShowCheckoutModal(false);
            setPix({
                qrCode: data.charge?.qrCodeImage || data.qrCode,
                pixCopyPaste: data.charge?.brCode || data.pixCopyPaste
            });
            // Iniciar polling para verificar status do pagamento e acionar pós-pagamento
            const identifier = data?.charge?.charge?.identifier || data?.charge?.identifier;
            const correlationID = data?.charge?.correlationID || data?.correlationID;
            if (identifier || correlationID) {
                setStatusPix('pending');
                const start = Date.now();
                const interval = setInterval(async () => {
                    if (Date.now() - start > 5 * 60 * 1000) {
                        clearInterval(interval);
                        setStatusPix('expired');
                        return;
                    }
                    const qs = identifier ? `identifier=${identifier}` : `correlationID=${encodeURIComponent(correlationID)}`;
                    try {
                        const st = await fetch(`/.netlify/functions/get-payment-status?${qs}`).then(r => r.json());
                        if (st?.status === 'paid') {
                            clearInterval(interval);
                            setStatusPix('paid');
                            // Enviar emails (fornecedor e cliente)
                            try {
                                await fetch('/.netlify/functions/send-order-email', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        correlationID: correlationID || identifier,
                                        productId: produto.id,
                                        amount: Math.round(produto.preco * 100),
                                        size: tamanhoSelecionado.nome,
                                        color: corSelecionada.nome,
                                        address: form.endereco,
                                        customer: {
                                            name: form.nome,
                                            email: form.email,
                                            phone: form.telefone,
                                            cpf: form.cpf
                                        }
                                    })
                                });
                            }
                            catch (e) {
                                console.warn('Falha ao enviar emails de pedido:', e);
                            }
                            // Registrar pedido (status pago)
                            try {
                                await fetch('/.netlify/functions/save-order', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        produto_id: produto.id,
                                        cliente_email: form.email,
                                        cor: corSelecionada.nome,
                                        tamanho: tamanhoSelecionado.nome,
                                        valor: Math.round(produto.preco * 100),
                                        correlation_id: correlationID || identifier,
                                        charge_id: identifier || null
                                    })
                                });
                            }
                            catch (e) {
                                console.warn('Falha ao registrar pedido:', e);
                            }
                        }
                    }
                    catch (e) {
                        console.warn('Erro ao verificar status:', e);
                    }
                }, 5000);
            }
            // Salvar no histórico local
            saveOrderToHistory({
                produtoId: produto.id,
                slug: produto.slug,
                nome: produto.nome,
                cor: corSelecionada.nome,
                tamanho: tamanhoSelecionado.nome,
                valor: produto.preco
            });
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
                    backgroundImage: 'url(/images/bg_1.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }, children: [_jsx("div", { className: "absolute inset-0 bg-black/40" }), _jsxs("div", { className: "container mx-auto px-4 py-8 relative z-10", children: [_jsx("div", { className: "mb-6", children: _jsxs(Link, { to: "/produtos", className: "inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 transition-all duration-300", children: [_jsx(FaArrowLeft, {}), "Voltar para Produtos"] }) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "aspect-square overflow-hidden rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10", children: _jsx("img", { src: produto.imagens[imagemAtual] || produto.imagemFallback, alt: produto.nome, className: "w-full h-full object-cover", loading: "lazy" }) }), produto.imagens.length > 1 && (_jsx("div", { className: "flex gap-2", children: produto.imagens.map((imagem, index) => (_jsx("button", { onClick: () => setImagemAtual(index), className: `w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${imagemAtual === index ? 'border-pink-500' : 'border-white/20'}`, children: _jsx("img", { src: imagem, alt: `${produto.nome} ${index + 1}`, className: "w-full h-full object-cover" }) }, index))) }))] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex gap-2", children: [produto.novo && (_jsx("span", { className: "bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold", children: "NOVO" })), produto.destaque && (_jsx("span", { className: "bg-blue-800 text-white px-3 py-1 rounded-full text-sm font-semibold", children: "EXCLUSIVO" }))] }), _jsx("div", { className: "text-pink-400 text-lg font-medium", children: produto.marca }), _jsx("h1", { className: "text-3xl font-bold text-white", children: produto.nome }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex items-center gap-1", children: renderStars(produto.avaliacoes.media) }), _jsxs("span", { className: "text-gray-400", children: [produto.avaliacoes.media, "/5 (", produto.avaliacoes.total, " avalia\u00E7\u00F5es)"] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-gray-300", children: produto.descricao }), produto.descricaoCompleta && (_jsx("p", { className: "text-gray-400 text-sm", children: produto.descricaoCompleta }))] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("span", { className: "text-4xl font-bold text-white", children: ["R$ ", produto.preco.toFixed(2).replace('.', ',')] }), produto.precoOriginal && (_jsxs("span", { className: "text-xl text-gray-400 line-through", children: ["R$ ", produto.precoOriginal.toFixed(2).replace('.', ',')] })), produto.desconto && (_jsxs("span", { className: "bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold", children: ["-", produto.desconto, "%"] }))] }), _jsxs("div", { children: [_jsx("div", { className: "text-gray-300 text-lg mb-3", children: "Cores:" }), _jsx("div", { className: "flex gap-4 flex-wrap", children: produto.cores.map((cor) => {
                                                            const estoqueCor = getEstoquePorCor(produto, cor.nome);
                                                            const disponivel = estoqueCor > 0;
                                                            return (_jsxs("div", { className: "flex flex-col items-center gap-1 w-12", children: [_jsx("button", { onClick: () => disponivel && setCorSelecionada(cor), disabled: !disponivel, className: `w-12 h-12 rounded-full border-2 transition-all relative ${corSelecionada?.nome === cor.nome
                                                                            ? 'border-white scale-110'
                                                                            : disponivel
                                                                                ? 'border-gray-400 hover:border-white'
                                                                                : 'border-gray-600 opacity-50 cursor-not-allowed'}`, style: { backgroundColor: cor.hex }, title: `${cor.nome}${disponivel ? ` (${estoqueCor} unidades)` : ' (Fora de estoque)'}`, children: !disponivel && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsx("span", { className: "text-xs text-gray-600 font-bold", children: "\u2717" }) })) }), _jsx("span", { className: `text-xs text-center leading-tight ${corSelecionada?.nome === cor.nome ? 'text-white font-medium' : 'text-gray-300'}`, children: cor.nome })] }, cor.nome));
                                                        }) })] }), _jsxs("div", { children: [_jsx("div", { className: "text-gray-300 text-lg mb-3", children: "Tamanhos:" }), _jsx("div", { className: "flex gap-3 flex-wrap", children: produto.tamanhos.map((tamanho) => {
                                                            const disponivel = corSelecionada
                                                                ? isCombinacaoDisponivel(produto, corSelecionada.nome, tamanho.nome)
                                                                : getEstoquePorTamanho(produto, tamanho.nome) > 0;
                                                            const estoqueTamanho = corSelecionada
                                                                ? getQuantidadeDisponivel(produto, corSelecionada.nome, tamanho.nome)
                                                                : getEstoquePorTamanho(produto, tamanho.nome);
                                                            return (_jsxs("button", { onClick: () => disponivel && setTamanhoSelecionado(tamanho), disabled: !disponivel, className: `px-4 py-2 rounded text-lg transition-all relative ${tamanhoSelecionado?.nome === tamanho.nome
                                                                    ? 'bg-pink-600 text-white'
                                                                    : disponivel
                                                                        ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                                                                        : 'bg-gray-600/20 text-gray-500 cursor-not-allowed'}`, title: `${tamanho.nome}${disponivel ? ` (${estoqueTamanho} unidades)` : ' (Fora de estoque)'}`, children: [tamanho.nome, !disponivel && (_jsx("span", { className: "absolute -top-1 -right-1 text-xs", children: "\u2717" }))] }, tamanho.nome));
                                                        }) })] }), _jsx("div", { className: "text-gray-400", children: (() => {
                                                    if (!corSelecionada || !tamanhoSelecionado) {
                                                        return (_jsx("span", { className: "text-yellow-400", children: "Selecione cor e tamanho para ver o estoque" }));
                                                    }
                                                    const quantidade = getQuantidadeDisponivel(produto, corSelecionada.nome, tamanhoSelecionado.nome);
                                                    const disponivel = isCombinacaoDisponivel(produto, corSelecionada.nome, tamanhoSelecionado.nome);
                                                    if (disponivel) {
                                                        return (_jsxs("span", { className: "text-green-400", children: ["\u2713 ", quantidade, " unidades dispon\u00EDveis (", corSelecionada.nome, " - ", tamanhoSelecionado.nome, ")"] }));
                                                    }
                                                    else {
                                                        return (_jsxs("span", { className: "text-red-400", children: ["\u2717 Fora de estoque (", corSelecionada.nome, " - ", tamanhoSelecionado.nome, ")"] }));
                                                    }
                                                })() }), _jsx("button", { onClick: handleComprar, disabled: loadingCompra || !corSelecionada || !tamanhoSelecionado || !isCombinacaoDisponivel(produto, corSelecionada?.nome || '', tamanhoSelecionado?.nome || ''), className: "w-full py-4 px-6 bg-pink-600 hover:bg-pink-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg", children: loadingCompra ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white" }), "Gerando PIX..."] })) : (_jsxs(_Fragment, { children: [_jsx(FaShoppingCart, {}), "Comprar Agora"] })) }), errorCompra && (_jsx("div", { className: "text-red-400 text-center", children: errorCompra })), pix && (_jsxs("div", { className: "mt-6 p-6 bg-green-900/20 border border-green-500/30 rounded-xl", children: [_jsx("div", { className: "text-green-400 text-lg font-semibold mb-4 text-center", children: "PIX Gerado!" }), pix.qrCode && (_jsx("div", { className: "text-center mb-4", children: _jsx("img", { src: pix.qrCode, alt: "QR Code PIX", className: "w-48 h-48 mx-auto" }) })), pix.pixCopyPaste && (_jsxs("div", { className: "text-sm text-gray-300 break-all bg-black/20 p-3 rounded", children: [_jsx("div", { className: "text-green-400 mb-2 font-semibold", children: "C\u00F3digo PIX:" }), pix.pixCopyPaste] })), statusPix === 'pending' && (_jsx("div", { className: "text-yellow-400 mt-4 text-center", children: _jsx("div", { className: "animate-pulse", children: "\u23F3 Aguardando pagamento PIX..." }) })), statusPix === 'paid' && (_jsx("div", { className: "text-green-400 mt-4 text-center", children: _jsx("div", { className: "text-xl font-bold", children: "\u2705 Pagamento confirmado! \uD83D\uDD25" }) })), statusPix === 'expired' && (_jsx("div", { className: "text-red-400 mt-4 text-center", children: _jsx("div", { children: "\u23F0 Pagamento expirado. Gere um novo PIX." }) }))] })), _jsxs("div", { className: "space-y-4 pt-6 border-t border-white/20", children: [produto.material && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-400", children: "Material: " }), _jsx("span", { className: "text-white", children: produto.material })] })), produto.cuidados && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-400", children: "Cuidados: " }), _jsx("span", { className: "text-white", children: produto.cuidados })] })), produto.garantia && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-400", children: "Garantia: " }), _jsx("span", { className: "text-white", children: produto.garantia })] }))] })] })] })] })] }), _jsx(Footer, {}), _jsx(CheckoutFormModal, { isOpen: showCheckoutModal, onClose: () => setShowCheckoutModal(false), onSubmit: handleCheckoutSubmit, productName: produto.nome, productPrice: Math.round(produto.preco * 100), loading: loadingCompra })] }));
}
