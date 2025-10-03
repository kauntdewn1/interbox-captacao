import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { FaStar, FaEye, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getEstoqueTotal, type TamanhoComQuantidade } from '../utils/estoque';

type Cor = {
  nome: string;
  hex: string;
  badge: string;
  disponivel: boolean;
};

type Tamanho = TamanhoComQuantidade;

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

type ProdutoSession = {
  corSelecionada: string | null;
  tamanhoSelecionado: string | null;
};

export default function ProdutoCard({ produto, onViewDetails }: Props): ReactElement {
  const navigate = useNavigate();
  const [corSelecionada, setCorSelecionada] = useState<Cor | null>(produto.cores[0] ?? null);
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<Tamanho | null>(produto.tamanhos[0] ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);

  const sessionKey = `produto_session_${produto.id}`;

  const saveSession = useCallback((session: ProdutoSession) => {
    try {
      localStorage.setItem(sessionKey, JSON.stringify(session));
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
    }
  }, [sessionKey]);

  const loadSession = useCallback((): ProdutoSession | null => {
    try {
      const saved = localStorage.getItem(sessionKey);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Erro ao carregar sessão:', error);
      return null;
    }
  }, [sessionKey]);

  useEffect(() => {
    const savedSession = loadSession();
    if (savedSession) {
      if (savedSession.corSelecionada) {
        const cor = produto.cores.find(c => c.nome === savedSession.corSelecionada);
        if (cor) setCorSelecionada(cor);
      }
      if (savedSession.tamanhoSelecionado) {
        const tamanho = produto.tamanhos.find(t => t.nome === savedSession.tamanhoSelecionado);
        if (tamanho) setTamanhoSelecionado(tamanho);
      }
    }
  }, [produto.id, produto.cores, produto.tamanhos, loadSession]);

  useEffect(() => {
    const session: ProdutoSession = {
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

  const renderStars = (media: number) => (
    Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`text-sm ${i < Math.floor(media) ? 'text-yellow-400' : 'text-gray-400'}`}
      />
    ))
  );

  const handleBuyClick = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate(`/produto/${produto.slug}`);
    } catch (error) {
      console.error('Erro ao navegar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="group relative bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl max-w-sm w-full mx-auto">
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
        {showSavedIndicator && (
          <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold animate-pulse">
            SALVO
          </span>
        )}
      </div>

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
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <div className="text-pink-400 text-sm font-medium mb-1">{produto.marca}</div>
        <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">{produto.nome}</h3>
        <p className="text-gray-300 text-sm mb-3 line-clamp-2">{produto.descricao}</p>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            {renderStars(produto.avaliacoes.media)}
          </div>
          <span className="text-gray-400 text-sm">({produto.avaliacoes.total})</span>
        </div>

        {/* Colors */}
        <div className="mb-3">
          <div className="text-gray-300 text-sm mb-2">Cores:</div>
          <div className="flex gap-4 flex-wrap">
            {produto.cores.slice(0, 3).map((cor) => (
              <div key={cor.nome} className="flex flex-col items-center gap-1 w-9">
                <button
                  onClick={() => setCorSelecionada(cor)}
                  className={`w-9 h-9 rounded-full border-2 transition-all ${
                    corSelecionada?.nome === cor.nome
                      ? 'border-white scale-110'
                      : 'border-gray-400 hover:border-white'
                  }`}
                  style={{ backgroundColor: cor.hex }}
                  title={cor.nome}
                />
                <span className={`text-[10px] text-center leading-tight ${corSelecionada?.nome === cor.nome ? 'text-white font-medium' : 'text-gray-300'}`}>
                  {cor.nome}
                </span>
              </div>
            ))}
            {produto.cores.length > 3 && (
              <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs">
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
          {(() => {
            const estoqueTotal = getEstoqueTotal(produto);
            return estoqueTotal > 0 ? (
              <span className="text-green-400">✓ {estoqueTotal} em estoque</span>
            ) : (
              <span className="text-red-400">✗ Fora de estoque</span>
            );
          })()}
        </div>

        {/* Buy Button */}
        <button
          onClick={handleBuyClick}
          disabled={isLoading || getEstoqueTotal(produto) === 0}
          className={`w-full py-3 px-4 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
            isLoading || getEstoqueTotal(produto) === 0
              ? 'bg-gray-600 cursor-not-allowed opacity-50'
              : 'bg-pink-600 hover:bg-pink-500'
          }`}
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin" />
              Carregando...
            </>
          ) : (
            <>
              <FaEye />
              Ver Produto
            </>
          )}
        </button>
      </div>
    </div>
  );
}
