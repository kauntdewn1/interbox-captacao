/**
 * Componente ProductSocialProof
 * Exibe avaliações, vendas e badges sociais para produtos
 * Estilo brutalista com Tailwind CSS
 */

import React, { useState, useEffect } from 'react';
import { FaStar, FaFire, FaCrown, FaShoppingCart } from 'react-icons/fa';

type ReviewData = {
  total: number;
  media: number;
  distribuicao: { [key: number]: number };
};

type SalesData = {
  total: number;
  vendas_por_cor: { [key: string]: number };
  vendas_por_tamanho: { [key: string]: number };
  ultima_venda: string | null;
};

type ProductSocialProofProps = {
  produtoId: string;
  className?: string;
};

export default function ProductSocialProof({ produtoId, className = '' }: ProductSocialProofProps) {
  const [reviews, setReviews] = useState<ReviewData | null>(null);
  const [sales, setSales] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados de avaliações e vendas
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar avaliações e vendas em paralelo
        const [reviewsResponse, salesResponse] = await Promise.all([
          fetch(`https://interbox-captacao.netlify.app/.netlify/functions/get-reviews?produto_id=${produtoId}`),
          fetch(`https://interbox-captacao.netlify.app/.netlify/functions/get-sales?produto_id=${produtoId}`)
        ]);

        // Processar resposta das avaliações
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          setReviews({
            total: reviewsData.total,
            media: reviewsData.media,
            distribuicao: reviewsData.distribuicao
          });
        }

        // Processar resposta das vendas
        if (salesResponse.ok) {
          const salesData = await salesResponse.json();
          setSales({
            total: salesData.total,
            vendas_por_cor: salesData.vendas_por_cor,
            vendas_por_tamanho: salesData.vendas_por_tamanho,
            ultima_venda: salesData.ultima_venda
          });
        }

      } catch (err: any) {
        console.error('Erro ao buscar dados sociais:', err);
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    if (produtoId) {
      fetchData();
    }
  }, [produtoId]);

  // Renderizar estrelas baseado na média
  const renderStars = (media: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar 
        key={i} 
        className={`text-lg ${
          i < Math.floor(media) 
            ? 'text-yellow-400' 
            : i < media 
              ? 'text-yellow-300' 
              : 'text-gray-400'
        }`} 
      />
    ));
  };

  // Determinar badges baseado nos dados
  const getBadges = () => {
    const badges = [];
    
    // Badge NOVO (sempre presente para produtos novos)
    badges.push({
      text: 'NOVO',
      color: 'bg-green-600',
      icon: <FaFire className="text-xs" />
    });

    // Badge EXCLUSIVO (sempre presente)
    badges.push({
      text: 'EXCLUSIVO',
      color: 'bg-blue-800',
      icon: <FaCrown className="text-xs" />
    });

    // Badge de vendas altas
    if (sales && sales.total > 50) {
      badges.push({
        text: 'BESTSELLER',
        color: 'bg-red-600',
        icon: <FaShoppingCart className="text-xs" />
      });
    }

    return badges;
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-600 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-400 text-sm ${className}`}>
        {error}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Badges Sociais */}
      <div className="flex flex-wrap gap-2">
        {getBadges().map((badge, index) => (
          <div
            key={index}
            className={`${badge.color} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg transform hover:scale-105 transition-transform`}
          >
            {badge.icon}
            {badge.text}
          </div>
        ))}
      </div>

      {/* Avaliações */}
      {reviews && reviews.total > 0 && (
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              {renderStars(reviews.media)}
            </div>
            <span className="text-white font-bold text-lg">
              {reviews.media.toFixed(1)}
            </span>
            <span className="text-gray-300 text-sm">
              ({reviews.total} avaliações)
            </span>
          </div>
          
          {/* Distribuição de notas */}
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map(nota => (
              <div key={nota} className="flex items-center gap-2 text-xs">
                <span className="text-gray-300 w-3">{nota}</span>
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${reviews.distribuicao[nota] > 0 ? (reviews.distribuicao[nota] / reviews.total) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="text-gray-400 w-6 text-right">
                  {reviews.distribuicao[nota]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vendas */}
      {sales && sales.total > 0 && (
        <div className="bg-gradient-to-r from-pink-900/20 to-purple-900/20 backdrop-blur-sm rounded-lg p-3 border border-pink-500/20">
          <div className="flex items-center gap-2">
            <FaShoppingCart className="text-pink-400" />
            <span className="text-white font-bold">
              {sales.total} vendido{sales.total !== 1 ? 's' : ''}
            </span>
          </div>
          
          {/* Última venda */}
          {sales.ultima_venda && (
            <div className="text-gray-300 text-xs mt-1">
              Última venda: {new Date(sales.ultima_venda).toLocaleDateString('pt-BR')}
            </div>
          )}
        </div>
      )}

      {/* Sem dados */}
      {(!reviews || reviews.total === 0) && (!sales || sales.total === 0) && (
        <div className="text-gray-400 text-sm text-center py-2">
          Seja o primeiro a avaliar este produto!
        </div>
      )}
    </div>
  );
}
