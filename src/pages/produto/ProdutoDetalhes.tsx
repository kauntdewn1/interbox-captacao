import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import SEOHead from '../../components/SEOHead';
import { saveOrderToHistory } from '../../utils/orderHistory';
import Footer from '../../components/Footer';

type Cor = {
  nome: string;
  hex: string;
  badge: string;
  disponivel: boolean;
};

type Tamanho = {
  nome: string;
  medidas: string;
  disponivel: boolean;
};

type Produto = {
  id: string;
  nome: string;
  descricao: string;
  descricaoCompleta?: string;
  preco: number;
  precoOriginal?: number;
  desconto?: number;
  cores: Cor[];
  tamanhos: Tamanho[];
  imagens: string[];
  imagemFallback?: string;
  slug: string;
  marca: string;
  material: string;
  avaliacoes: {
    media: number;
    total: number;
    distribuicao?: Record<string, number>;
  };
  estoque: number;
  novo: boolean;
  destaque: boolean;
  categoria?: string;
  subcategoria?: string;
  cuidados?: string;
  origem?: string;
  garantia?: string;
  tags?: string[];
};

export default function ProdutoDetalhes() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingCompra, setLoadingCompra] = useState(false);
  const [errorCompra, setErrorCompra] = useState<string | null>(null);
  const [pix, setPix] = useState<{ qrCode?: string; pixCopyPaste?: string } | null>(null);
  const [statusPix, setStatusPix] = useState<'pending' | 'paid' | 'expired' | null>(null);
  const [corSelecionada, setCorSelecionada] = useState<Cor | null>(null);
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<Tamanho | null>(null);
  const [imagemAtual, setImagemAtual] = useState(0);

  // Chave única para localStorage baseada no ID do produto
  const getSessionKey = () => `produto_session_${produto?.id || slug}`;

  // Função para salvar sessão no localStorage
  const saveSession = (session: { corSelecionada: string | null; tamanhoSelecionado: string | null }) => {
    try {
      localStorage.setItem(getSessionKey(), JSON.stringify(session));
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
    }
  };

  // Função para carregar sessão do localStorage
  const loadSession = (): { corSelecionada: string | null; tamanhoSelecionado: string | null } | null => {
    try {
      const saved = localStorage.getItem(getSessionKey());
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
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
            const cor = data.cores.find((c: Cor) => c.nome === savedSession.corSelecionada);
            if (cor) {
              setCorSelecionada(cor);
            } else {
              // Se a cor salva não existir mais, usar a primeira disponível
              setCorSelecionada(data.cores[0]);
            }
          } else {
            setCorSelecionada(data.cores[0]);
          }

          // Restaurar tamanho selecionado
          if (savedSession.tamanhoSelecionado) {
            const tamanho = data.tamanhos.find((t: Tamanho) => t.nome === savedSession.tamanhoSelecionado);
            if (tamanho) {
              setTamanhoSelecionado(tamanho);
            } else {
              // Se o tamanho salvo não existir mais, usar o primeiro disponível
              setTamanhoSelecionado(data.tamanhos[0]);
            }
          } else {
            setTamanhoSelecionado(data.tamanhos[0]);
          }
        } else {
          // Selecionar primeira cor e tamanho disponíveis se não houver sessão salva
          if (data.cores && data.cores.length > 0) {
            setCorSelecionada(data.cores[0]);
          }
          if (data.tamanhos && data.tamanhos.length > 0) {
            setTamanhoSelecionado(data.tamanhos[0]);
          }
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar produto');
      } finally {
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
          customerData: {
            name: 'Cliente INTERBØX',
            email: 'cliente@example.com',
            phone: '',
            cpf: ''
          },
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

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error('Resposta inválida do servidor');
      }

      if (!data.success) {
        throw new Error(data?.message || 'Falha ao criar charge');
      }
      
      setPix({ 
        qrCode: data.charge?.qrCodeImage || data.qrCode, 
        pixCopyPaste: data.charge?.brCode || data.pixCopyPaste 
      });

      // Iniciar polling para verificar status do pagamento
      const identifier = data?.charge?.charge?.identifier || data?.charge?.identifier;
      const correlationID = data?.charge?.correlationID || data?.correlationID;

      if (identifier || correlationID) {
        setStatusPix('pending');
        const start = Date.now();
        const interval = setInterval(async () => {
          if (Date.now() - start > 5 * 60 * 1000) { // 5min timeout
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
            }
          } catch (e) {
            console.warn('Erro ao verificar status:', e);
          }
        }, 5000);
      }

      // Salvar no histórico de compras após sucesso
      saveOrderToHistory({
        produtoId: produto.id,
        slug: produto.slug,
        nome: produto.nome,
        cor: corSelecionada.nome,
        tamanho: tamanhoSelecionado.nome,
        valor: produto.preco
      });

    } catch (e: unknown) {
      setErrorCompra(e instanceof Error ? e.message : 'Erro ao processar compra');
    } finally {
      setLoadingCompra(false);
    }
  };

  const renderStars = (media: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar 
        key={i} 
        className={`text-lg ${i < Math.floor(media) ? 'text-yellow-400' : 'text-gray-400'}`} 
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p>Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (error || !produto) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Erro: {error}</p>
          <button 
            onClick={() => navigate('/produtos')} 
            className="px-4 py-2 bg-pink-600 hover:bg-pink-500 rounded"
          >
            Voltar para Produtos
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${produto.nome} - INTERBØX 2025`}
        description={produto.descricao}
      />
      
      <div 
        className="min-h-screen text-white relative"
        style={{ 
          backgroundImage: 'url(/images/bg_1.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay escuro */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Botão voltar */}
          <div className="mb-6">
            <Link 
              to="/produtos" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 transition-all duration-300"
            >
              <FaArrowLeft />
              Voltar para Produtos
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Galeria de Imagens */}
            <div className="space-y-4">
              {/* Imagem Principal */}
              <div className="aspect-square overflow-hidden rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10">
                <img 
                  src={produto.imagens[imagemAtual] || produto.imagemFallback} 
                  alt={produto.nome}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              
              {/* Thumbnails */}
              {produto.imagens.length > 1 && (
                <div className="flex gap-2">
                  {produto.imagens.map((imagem, index) => (
                    <button
                      key={index}
                      onClick={() => setImagemAtual(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        imagemAtual === index ? 'border-pink-500' : 'border-white/20'
                      }`}
                    >
                      <img 
                        src={imagem} 
                        alt={`${produto.nome} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informações do Produto */}
            <div className="space-y-6">
              {/* Badges */}
              <div className="flex gap-2">
                {produto.novo && (
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    NOVO
                  </span>
                )}
                {produto.destaque && (
                  <span className="bg-blue-800 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    EXCLUSIVO
                  </span>
                )}
              </div>

              {/* Marca */}
              <div className="text-pink-400 text-lg font-medium">{produto.marca}</div>
              
              {/* Nome */}
              <h1 className="text-3xl font-bold text-white">{produto.nome}</h1>
              
              {/* Avaliações */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {renderStars(produto.avaliacoes.media)}
                </div>
                <span className="text-gray-400">
                  {produto.avaliacoes.media}/5 ({produto.avaliacoes.total} avaliações)
                </span>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <p className="text-gray-300">{produto.descricao}</p>
                {produto.descricaoCompleta && (
                  <p className="text-gray-400 text-sm">{produto.descricaoCompleta}</p>
                )}
              </div>

              {/* Preço */}
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-white">
                  R$ {produto.preco.toFixed(2).replace('.', ',')}
                </span>
                {produto.precoOriginal && (
                  <span className="text-xl text-gray-400 line-through">
                    R$ {produto.precoOriginal.toFixed(2).replace('.', ',')}
                  </span>
                )}
                {produto.desconto && (
                  <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold">
                    -{produto.desconto}%
                  </span>
                )}
              </div>

              {/* Seleção de Cores */}
              <div>
                <div className="text-gray-300 text-lg mb-3">Cores:</div>
                <div className="flex gap-3">
                  {produto.cores.map((cor) => (
                    <button
                      key={cor.nome}
                      onClick={() => setCorSelecionada(cor)}
                      className={`w-12 h-12 rounded-full border-2 transition-all ${
                        corSelecionada?.nome === cor.nome 
                          ? 'border-white scale-110' 
                          : 'border-gray-400 hover:border-white'
                      }`}
                      style={{ backgroundColor: cor.hex }}
                      title={cor.nome}
                    />
                  ))}
                </div>
              </div>

              {/* Seleção de Tamanhos */}
              <div>
                <div className="text-gray-300 text-lg mb-3">Tamanhos:</div>
                <div className="flex gap-3 flex-wrap">
                  {produto.tamanhos.map((tamanho) => (
                    <button
                      key={tamanho.nome}
                      onClick={() => setTamanhoSelecionado(tamanho)}
                      className={`px-4 py-2 rounded text-lg transition-all ${
                        tamanhoSelecionado?.nome === tamanho.nome
                          ? 'bg-pink-600 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {tamanho.nome}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estoque */}
              <div className="text-gray-400">
                {produto.estoque > 0 ? (
                  <span className="text-green-400">✓ {produto.estoque} em estoque</span>
                ) : (
                  <span className="text-red-400">✗ Fora de estoque</span>
                )}
              </div>

              {/* Botão Comprar */}
              <button
                onClick={handleComprar}
                disabled={loadingCompra || produto.estoque === 0 || !corSelecionada || !tamanhoSelecionado}
                className="w-full py-4 px-6 bg-pink-600 hover:bg-pink-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg"
              >
                {loadingCompra ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Gerando PIX...
                  </>
                ) : (
                  <>
                    <FaShoppingCart />
                    Comprar Agora
                  </>
                )}
              </button>

              {/* Erro de Compra */}
              {errorCompra && (
                <div className="text-red-400 text-center">{errorCompra}</div>
              )}

              {/* PIX Info */}
              {pix && (
                <div className="mt-6 p-6 bg-green-900/20 border border-green-500/30 rounded-xl">
                  <div className="text-green-400 text-lg font-semibold mb-4 text-center">PIX Gerado!</div>
                  {pix.qrCode && (
                    <div className="text-center mb-4">
                      <img src={pix.qrCode} alt="QR Code PIX" className="w-48 h-48 mx-auto" />
                    </div>
                  )}
                  {pix.pixCopyPaste && (
                    <div className="text-sm text-gray-300 break-all bg-black/20 p-3 rounded">
                      <div className="text-green-400 mb-2 font-semibold">Código PIX:</div>
                      {pix.pixCopyPaste}
                    </div>
                  )}
                  
                  {/* Status do Pagamento */}
                  {statusPix === 'pending' && (
                    <div className="text-yellow-400 mt-4 text-center">
                      <div className="animate-pulse">⏳ Aguardando pagamento PIX...</div>
                    </div>
                  )}
                  {statusPix === 'paid' && (
                    <div className="text-green-400 mt-4 text-center">
                      <div className="text-xl font-bold">✅ Pagamento confirmado! 🔥</div>
                    </div>
                  )}
                  {statusPix === 'expired' && (
                    <div className="text-red-400 mt-4 text-center">
                      <div>⏰ Pagamento expirado. Gere um novo PIX.</div>
                    </div>
                  )}
                </div>
              )}

              {/* Informações Adicionais */}
              <div className="space-y-4 pt-6 border-t border-white/20">
                {produto.material && (
                  <div>
                    <span className="text-gray-400">Material: </span>
                    <span className="text-white">{produto.material}</span>
                  </div>
                )}
                {produto.cuidados && (
                  <div>
                    <span className="text-gray-400">Cuidados: </span>
                    <span className="text-white">{produto.cuidados}</span>
                  </div>
                )}
                {produto.garantia && (
                  <div>
                    <span className="text-gray-400">Garantia: </span>
                    <span className="text-white">{produto.garantia}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
