import React, { useState } from 'react';
import { FaStar, FaHeart, FaShoppingCart, FaEye } from 'react-icons/fa';
import ProductSocialProof from './ProductSocialProof';

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
};

type Props = {
  produto: Produto;
  onViewDetails?: (produto: Produto) => void;
};

export default function ProdutoCard({ produto, onViewDetails }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pix, setPix] = useState<{ qrCode?: string; pixCopyPaste?: string } | null>(null);
  const [corSelecionada, setCorSelecionada] = useState<Cor | null>(produto.cores[0] || null);
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<Tamanho | null>(produto.tamanhos[0] || null);
  const [favorito, setFavorito] = useState(false);

  const handleComprar = async () => {
    if (!corSelecionada || !tamanhoSelecionado) {
      setError('Selecione cor e tamanho');
      return;
    }

    setLoading(true);
    setError(null);
    setPix(null);
    
    try {
      const response = await fetch('https://interbox-captacao.netlify.app/.netlify/functions/create-charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productSlug: produto.slug,
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
      
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data?.message || 'Falha ao criar charge');
      }
      
      setPix({ 
        qrCode: data.qrCode || data.charge?.qrCodeImage, 
        pixCopyPaste: data.pixCopyPaste || data.charge?.brCode 
      });
    } catch (e: any) {
      setError(e.message || 'Erro ao processar compra');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (media: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar 
        key={i} 
        className={`text-sm ${i < Math.floor(media) ? 'text-yellow-400' : 'text-gray-400'}`} 
      />
    ));
  };

  return (
    <div className="group relative bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {produto.novo && (
          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            NOVO
          </span>
        )}
        {produto.destaque && (
          <span className="bg-blue-800 text-white px-2 py-1 rounded-full text-xs font-semibold">
            EXCLUSIVO
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={() => setFavorito(!favorito)}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <FaHeart className={`text-sm ${favorito ? 'text-red-500' : 'text-white'}`} />
      </button>

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={produto.imagens[0] || produto.imagemFallback} 
          alt={produto.nome}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== produto.imagemFallback) {
              target.src = produto.imagemFallback || '/images/placeholder-product.png';
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Quick Actions */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex gap-2">
            <button
              onClick={() => onViewDetails?.(produto)}
              className="p-3 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition-colors"
            >
              <FaEye className="text-white text-lg" />
            </button>
            <button
              onClick={handleComprar}
              className="p-3 bg-pink-600 hover:bg-pink-500 rounded-full transition-colors"
            >
              <FaShoppingCart className="text-white text-lg" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        {/* Brand */}
        <div className="text-pink-400 text-sm font-medium mb-1">{produto.marca}</div>
        
        {/* Name */}
        <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">{produto.nome}</h3>
        
        {/* Description */}
        <p className="text-gray-300 text-sm mb-3 line-clamp-2">{produto.descricao}</p>
        
        {/* Social Proof */}
        <ProductSocialProof produtoId={produto.id} className="mb-3" />

        {/* Colors */}
        <div className="mb-3">
          <div className="text-gray-300 text-sm mb-2">Cores:</div>
          <div className="flex gap-2">
            {produto.cores.slice(0, 3).map((cor) => (
              <button
                key={cor.nome}
                onClick={() => setCorSelecionada(cor)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  corSelecionada?.nome === cor.nome 
                    ? 'border-white scale-110' 
                    : 'border-gray-400 hover:border-white'
                }`}
                style={{ backgroundColor: cor.hex }}
                title={cor.nome}
              />
            ))}
            {produto.cores.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs">
                +{produto.cores.length - 3}
              </div>
            )}
          </div>
        </div>

        {/* Sizes */}
        <div className="mb-4">
          <div className="text-gray-300 text-sm mb-2">Tamanhos:</div>
          <div className="flex gap-2 flex-wrap">
            {produto.tamanhos.slice(0, 4).map((tamanho) => (
              <button
                key={tamanho.nome}
                onClick={() => setTamanhoSelecionado(tamanho)}
                className={`px-3 py-1 rounded text-sm transition-all ${
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

        {/* Price */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl font-bold text-white">
            R$ {produto.preco.toFixed(2).replace('.', ',')}
          </span>
        </div>

        {/* Stock */}
        <div className="text-gray-400 text-sm mb-4">
          {produto.estoque > 0 ? (
            <span className="text-green-400">✓ {produto.estoque} em estoque</span>
          ) : (
            <span className="text-red-400">✗ Fora de estoque</span>
          )}
        </div>

        {/* Buy Button */}
        <button
          onClick={handleComprar}
          disabled={loading || produto.estoque === 0 || !corSelecionada || !tamanhoSelecionado}
          className="w-full py-3 px-4 bg-pink-600 hover:bg-pink-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Gerando PIX...
            </>
          ) : (
            <>
              <FaShoppingCart />
              Comprar Agora
            </>
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="mt-3 text-red-400 text-sm text-center">{error}</div>
        )}

        {/* PIX Info */}
        {pix && (
          <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
            <div className="text-green-400 text-sm font-semibold mb-2">PIX Gerado!</div>
            {pix.qrCode && (
              <img src={pix.qrCode} alt="QR Code PIX" className="w-32 h-32 mx-auto mb-2" />
            )}
            {pix.pixCopyPaste && (
              <div className="text-xs text-gray-300 break-all bg-black/20 p-2 rounded">
                {pix.pixCopyPaste}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


