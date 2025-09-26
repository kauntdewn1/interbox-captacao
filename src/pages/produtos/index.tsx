import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProdutoCard from '../../components/ProdutoCard';
import SEOHead from '../../components/SEOHead';

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
        const response = await fetch('/.netlify/functions/get-products');
        console.log('📡 [PRODUTOS PAGE] Resposta da API recebida:', {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
        });
        
        if (!response.ok) {
          throw new Error(`Erro ao carregar produtos: ${response.status} ${response.statusText}`);
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
        const produtosEstaticos: Produto[] = [
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
            avaliacoes: { media: 4.8, total: 127 },
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
            avaliacoes: { media: 4.9, total: 203 },
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
          produtos: produtosEstaticos.map(p => ({ id: p.id, nome: p.nome }))
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

  return (
    <>
      <SEOHead
        title="Loja INTERBØX - Produtos Oficiais 2025"
        description="Produtos oficiais do INTERBØX 2025. Camisetas, croppeds e muito mais para você representar o maior evento fitness de times da América Latina."
      />
      
      <div 
        className="min-h-screen text-white relative"
        style={{ 
          backgroundImage: 'url(/images/bg_grunge.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay escuro para melhorar legibilidade */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Header */}
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="text-center mb-12">
            {/* Logo no topo */}
            <img 
              src="/logos/nome_hrz.png" 
              alt="INTERBØX Logo" 
              className="mx-auto mb-8 max-w-md lg:max-w-lg drop-shadow-2xl"
            />
            
            <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              Loja INTERBØX
            </h1>
            <p className="text-xl text-white/90 mb-8 drop-shadow-lg">
              Produtos oficiais do INTERBØX 2025
            </p>
            
            {/* Botão voltar */}
            <Link 
              to="/" 
              onClick={() => console.log('🏠 [PRODUTOS PAGE] Usuário clicou em "Voltar para Home"')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 transition-all duration-300"
            >
              ← Voltar para Home
            </Link>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {produtos.map((produto, index) => {
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
                  onViewDetails={(produto) => {
                    console.log('👁️ [PRODUTOS PAGE] ProdutoCard solicitou visualizar detalhes:', {
                      id: produto.id,
                      nome: produto.nome
                    });
                  }}
                />
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="text-center mt-16">
            <p className="text-gray-400 mb-4">
              Todos os direitos reservados © INTERBØX 2025
            </p>
            <div className="flex justify-center space-x-6">
              <Link 
                to="/admin" 
                onClick={() => console.log('🔧 [PRODUTOS PAGE] Usuário clicou em "Admin"')}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

console.log('✅ [PRODUTOS PAGE] Componente ProdutosPage renderizado com sucesso');
