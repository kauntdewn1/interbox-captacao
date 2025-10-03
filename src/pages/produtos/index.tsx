import { useEffect, useState } from 'react';
import ProdutoCard from '../../components/ProdutoCard';
import CheckoutFormModal, { type CheckoutFormData } from '../../components/CheckoutFormModal';
import SEOHead from '../../components/SEOHead';
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
  };
  estoque: number;
  novo: boolean;
  destaque: boolean;
  categoria?: string;
  xp_bonus?: number;
  box_bonus?: number;
  status?: string;
};

export default function ProdutosPage() {
  console.log('🚀 [PRODUTOS PAGE] Componente ProdutosPage inicializado');
  
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado do Checkout Modal (precisa estar antes de qualquer return condicional)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
  const [loadingCompra, setLoadingCompra] = useState(false);
  const [, setErrorCompra] = useState<string | null>(null);

  const openCheckout = (produto: Produto) => {
    setSelectedProduct(produto);
    setShowCheckoutModal(true);
  };

  const handleCheckoutSubmit = async (form: CheckoutFormData) => {
    if (!selectedProduct) return;
    try {
      setLoadingCompra(true);
      setErrorCompra(null);
      const res = await fetch('/.netlify/functions/create-charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          productSlug: selectedProduct.slug,
          customerData: { name: form.nome, email: form.email, phone: form.telefone, cpf: form.cpf },
          address: form.endereco,
          tag: `produto-${selectedProduct.slug}`,
          origin: '/produtos'
        })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (!data.success) throw new Error(data?.message || 'Falha ao criar charge');
      window.location.href = `/produto/${selectedProduct.slug}`;
    } catch (e) {
      setErrorCompra(e instanceof Error ? e.message : 'Erro ao processar compra');
    } finally {
      setLoadingCompra(false);
      setShowCheckoutModal(false);
    }
  };

  console.log('📊 [PRODUTOS PAGE] Estados iniciais:', {
    produtos: produtos.length,
    loading,
    error
  });

  useEffect(() => {
    console.log('🔄 [PRODUTOS PAGE] useEffect executado - iniciando fetchProdutos');
    
    const fetchProdutos = async () => {
      console.log('🌐 [PRODUTOS PAGE] Iniciando requisição para API Netlify');
      
      try {
        // Tentar primeiro a função Netlify
        const url = new URL('/.netlify/functions/get-products', window.location.origin).href;
        const response = await fetch(url);
        console.log('📡 [PRODUTOS PAGE] Resposta da API recebida:', {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText,
          contentType: response.headers.get('content-type'),
          url
        });
        
        if (!response.ok) {
          throw new Error(`Erro ao carregar produtos: ${response.status} ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error(`Resposta não é JSON (content-type: ${contentType})`);
        }
        
        const data = await response.json();
        console.log('✅ [PRODUTOS PAGE] Dados da API carregados com sucesso:', {
          quantidade: Array.isArray(data) ? data.length : 'não é array',
          tipo: typeof data,
          dados: data
        });
        
        setProdutos(data);
        console.log('💾 [PRODUTOS PAGE] Estado produtos atualizado com dados da API');
        
      } catch (err: unknown) {
        // Fallback: usar dados estáticos se a função não estiver disponível
        console.log('⚠️ [PRODUTOS PAGE] Erro na API, usando dados estáticos como fallback:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar produtos');
        const produtosEstaticos: Array<Produto> = [
          {
            id: "cropped-oversized-interbox-feminina",
            nome: "Cropped Oversized CERRADO INTERBØX Feminina",
            descricao: "Cropped oversized com design exclusivo do INTERBØX 2025. Modelo confortável e estiloso, perfeito para treinos e momentos de lazer.",
            preco: 139.90,
            precoOriginal: 179.90,
            desconto: 22,
            cores: [
              { nome: "Preto", hex: "#000000", badge: "/products/cropped-interbox-feminina/colors/preto-40x40.png", disponivel: true },
              { nome: "Mocha Mousse", hex: "#D4C4A8", badge: "/products/cropped-interbox-feminina/colors/mocha-mousse-40x40.png", disponivel: true },
              { nome: "Amora", hex: "#8B4B8C", badge: "/products/cropped-interbox-feminina/colors/amora-40x40.png", disponivel: true }
            ],
            tamanhos: [
              { nome: "P", medidas: "Busto: 88cm", disponivel: true },
              { nome: "M", medidas: "Busto: 92cm", disponivel: true },
              { nome: "G", medidas: "Busto: 96cm", disponivel: true },
              { nome: "GG", medidas: "Busto: 100cm", disponivel: true },
              { nome: "XG", medidas: "Busto: 104cm", disponivel: true }
            ],
            imagens: [
              "/products/cropped-interbox-feminina/hero-800x800.webp",
              "/products/cropped-interbox-feminina/detail-1-800x800.webp",
              "/products/cropped-interbox-feminina/detail-2-800x800.webp"
            ],
            imagemFallback: "/products/cropped-interbox-feminina/hero-800x800.webp",
            slug: "cropped-interbox",
            marca: "INTERBØX",
            material: "100% Algodão Premium",
            avaliacoes: { media: 0.3, total: 6 },
            estoque: 50,
            destaque: true,
            novo: true,
            xp_bonus: 500,
            box_bonus: 0,
            status: "ativo"
          },
          {
            id: "camiseta-oversized-interbox-masculina",
            nome: "Camiseta Oversized CERRADO INTERBØX Masculina",
            descricao: "Camiseta oversized masculina com design exclusivo do INTERBØX 2025. Conforto e estilo para o homem moderno.",
            preco: 139.90,
            precoOriginal: 179.90,
            desconto: 22,
            cores: [
              { nome: "Preto", hex: "#000000", badge: "/products/camiseta-interbox-masculina/colors/preto-40x40.png", disponivel: true },
              { nome: "Mocha Mousse", hex: "#D4C4A8", badge: "/products/camiseta-interbox-masculina/colors/mocha-mousse-40x40.png", disponivel: true },
              { nome: "Amora", hex: "#8B4B8C", badge: "/products/camiseta-interbox-masculina/colors/amora-40x40.png", disponivel: true }
            ],
            tamanhos: [
              { nome: "P", medidas: "Peito: 100cm", disponivel: true },
              { nome: "M", medidas: "Peito: 104cm", disponivel: true },
              { nome: "G", medidas: "Peito: 108cm", disponivel: true },
              { nome: "GG", medidas: "Peito: 112cm", disponivel: true },
              { nome: "XG", medidas: "Peito: 116cm", disponivel: true }
            ],
            imagens: [
              "/products/camiseta-interbox-masculina/hero-800x800.webp",
              "/products/camiseta-interbox-masculina/detail-1-800x800.webp",
              "/products/camiseta-interbox-masculina/detail-2-800x800.webp"
            ],
            imagemFallback: "/products/camiseta-interbox-masculina/hero-800x800.webp",
            slug: "camiseta-interbox",
            marca: "INTERBØX",
            material: "100% Algodão Premium",
            avaliacoes: { media: 0.3, total: 6 },
            estoque: 75,
            destaque: true,
            novo: true,
            xp_bonus: 500,
            box_bonus: 0,
            status: "ativo"
          }
        ];
        console.log('📦 [PRODUTOS PAGE] Dados estáticos carregados:', {
          quantidade: produtosEstaticos.length,
          produtos: produtosEstaticos.map((p: Produto) => ({ id: p.id, nome: p.nome }))
        });
        
        setProdutos(produtosEstaticos);
        console.log('💾 [PRODUTOS PAGE] Estado produtos atualizado com dados estáticos');
        
      } finally {
        console.log('🏁 [PRODUTOS PAGE] Finalizando carregamento - setLoading(false)');
        setLoading(false);
      }
    };

    console.log('▶️ [PRODUTOS PAGE] Executando fetchProdutos()');
    fetchProdutos();
  }, []);

  if (loading) {
    console.log('⏳ [PRODUTOS PAGE] Renderizando tela de loading');
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p>Carregando produtos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('❌ [PRODUTOS PAGE] Renderizando tela de erro:', error);
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Erro: {error}</p>
          <button 
            onClick={() => {
              console.log('🔄 [PRODUTOS PAGE] Usuário clicou em "Tentar novamente"');
              window.location.reload();
            }} 
            className="px-4 py-2 bg-pink-600 hover:bg-pink-500 rounded"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  console.log('🎨 [PRODUTOS PAGE] Renderizando página principal com produtos:', {
    quantidade: produtos.length,
    produtos: produtos.map(p => ({ id: p.id, nome: p.nome, preco: p.preco }))
  });

  console.log('✅ [PRODUTOS PAGE] Componente ProdutosPage pronto para renderização');

  return (
    <>
      <SEOHead
        title="Produtos | INTERBØX 2025"
        description="Produtos oficiais do INTERBØX 2025. Camisetas, croppeds e muito mais para você representar o maior evento fitness de times da América Latina."
      />

      <header className="fixed top-0 left-0 right-0 z-40">
        <div className="mx-auto max-w-4xl px-6 py-3">
          <div className="flex h-16 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md shadow-lg shadow-pink-500/10">
            <img
              src="/logos/nome_hrz.png"
              alt="INTERBØX Logo"
              className="h-10 w-auto max-w-xs drop-shadow-2xl"
            />
          </div>
        </div>
      </header>
      
      <div 
        className="min-h-screen text-white relative"
        style={{ 
          backgroundImage: 'url(/images/bg_1.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay escuro para melhorar legibilidade */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Conteúdo principal */}
        <div className="container mx-auto px-4 py-8 pt-36 relative z-10">
          <div className="text-center mb-10">
            <p className="text-lg text-white/90 mb-6 drop-shadow-lg">
              Produtos oficiais do INTERBØX 2025
            </p>
          </div>

          {/* Filtros e Ordenação */}
          <div className="max-w-6xl mx-auto mb-8">
            <div className="flex flex-wrap gap-4 justify-between items-center bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
              <div className="flex gap-4">
                <select 
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  onChange={(e) => console.log('🔍 [PRODUTOS PAGE] Filtro de categoria alterado:', e.target.value)}
                >
                  <option value="">Todas as categorias</option>
                  <option value="vestuario">Vestuário</option>
                </select>
                <select 
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  onChange={(e) => console.log('📊 [PRODUTOS PAGE] Ordenação alterada:', e.target.value)}
                >
                  <option value="">Ordenar por</option>
                  <option value="preco-asc">Menor preço</option>
                  <option value="preco-desc">Maior preço</option>
                  <option value="nome">Nome</option>
                  <option value="avaliacoes">Avaliações</option>
                </select>
              </div>
              <div className="text-white/80 text-sm">
                {produtos.length} produto{produtos.length !== 1 ? 's' : ''} encontrado{produtos.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Grid de Produtos */}
          <div className="flex justify-center w-full">
            <div className="grid w-full max-w-7xl grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
              {produtos.map((produto: Produto, index: number) => {
              console.log(`🛍️ [PRODUTOS PAGE] Renderizando ProdutoCard ${index + 1}/${produtos.length}:`, {
                id: produto.id,
                nome: produto.nome,
                preco: produto.preco,
                cores: produto.cores.length,
                tamanhos: produto.tamanhos.length
              });
              
              return (
                <ProdutoCard 
                  key={produto.id} 
                  produto={produto}
                  onViewDetails={(produto: Produto) => {
                    console.log('👁️ [PRODUTOS PAGE] ProdutoCard solicitou visualizar detalhes:', {
                      id: produto.id,
                      nome: produto.nome
                    });
                    openCheckout(produto);
                  }}
                />
              );
              })}
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center mt-16" />
        </div>
      </div>

      <div className="relative z-10">
        <Footer />
      </div>

      {/* Modal de Checkout */}
      <CheckoutFormModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        onSubmit={handleCheckoutSubmit}
        productName={selectedProduct?.nome || 'Produto'}
        productPrice={Math.round((selectedProduct?.preco || 0) * 100)}
        loading={loadingCompra}
      />
    </>
  );
}
