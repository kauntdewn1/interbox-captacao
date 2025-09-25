import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProdutoCard from '../../components/ProdutoCard';
import SEOHead from '../../components/SEOHead';

type Produto = {
  id: string;
  nome: string;
  preco: number;
  imagem: string;
  imagemFallback?: string;
  slug: string;
  cores: Array<{
    nome: string;
    hex: string;
    badge: string;
  }>;
  tamanhos: string[];
  categoria: string;
  destaque: boolean;
  novo: boolean;
  xp_bonus: number;
  box_bonus: number;
  status: string;
};

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        // Tentar primeiro a função Netlify
        const response = await fetch('/.netlify/functions/get-products');
        if (!response.ok) {
          throw new Error('Erro ao carregar produtos');
        }
        const data = await response.json();
        setProdutos(data);
      } catch (err: any) {
        // Fallback: usar dados estáticos se a função não estiver disponível
        console.log('Usando dados estáticos como fallback');
        const produtosEstaticos: Produto[] = [
          {
            id: "cropped-oversized-interbox-feminina",
            nome: "Cropped Oversized CERRADO INTERBØX Feminina",
            preco: 139.90,
            cores: [
              { nome: "Preto", hex: "#000000", badge: "/products/cropped-interbox-feminina/colors/preto-40x40.png" },
              { nome: "Mocha Mousse", hex: "#D4C4A8", badge: "/products/cropped-interbox-feminina/colors/mocha-mousse-40x40.png" },
              { nome: "Amora", hex: "#8B4B8C", badge: "/products/cropped-interbox-feminina/colors/amora-40x40.png" }
            ],
            tamanhos: ["P", "M", "G", "GG", "XG"],
            imagem: "/products/cropped-interbox-feminina/hero-800x800.webp",
            imagemFallback: "/products/cropped-interbox-feminina/hero-800x800.jpg",
            slug: "cropped-interbox",
            categoria: "vestuario",
            destaque: true,
            novo: true,
            xp_bonus: 500,
            box_bonus: 0,
            status: "ativo"
          },
          {
            id: "camiseta-oversized-interbox-masculina",
            nome: "Camiseta Oversized CERRADO INTERBØX Masculina",
            preco: 139.90,
            cores: [
              { nome: "Preto", hex: "#000000", badge: "/products/camiseta-interbox-masculina/colors/preto-40x40.png" },
              { nome: "Mocha Mousse", hex: "#D4C4A8", badge: "/products/camiseta-interbox-masculina/colors/mocha-mousse-40x40.png" },
              { nome: "Amora", hex: "#8B4B8C", badge: "/products/camiseta-interbox-masculina/colors/amora-40x40.png" }
            ],
            tamanhos: ["P", "M", "G", "GG", "XG"],
            imagem: "/products/camiseta-interbox-masculina/hero-800x800.webp",
            imagemFallback: "/products/camiseta-interbox-masculina/hero-800x800.jpg",
            slug: "camiseta-interbox",
            categoria: "vestuario",
            destaque: true,
            novo: true,
            xp_bonus: 500,
            box_bonus: 0,
            status: "ativo"
          }
        ];
        setProdutos(produtosEstaticos);
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, []);

  if (loading) {
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
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Erro: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-pink-600 hover:bg-pink-500 rounded"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

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
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 transition-all duration-300"
            >
              ← Voltar para Home
            </Link>
          </div>

          {/* Grid de Produtos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {produtos.map((produto) => (
              <ProdutoCard key={produto.id} produto={produto} />
            ))}
          </div>

          {/* Footer Info */}
          <div className="text-center mt-16">
            <p className="text-gray-400 mb-4">
              Todos os direitos reservados © INTERBØX 2025
            </p>
            <div className="flex justify-center space-x-6">
              <Link to="/admin" className="text-blue-400 hover:text-blue-300 transition-colors">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
