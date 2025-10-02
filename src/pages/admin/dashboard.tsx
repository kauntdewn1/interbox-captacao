import { useState, useEffect, useCallback } from 'react';

// Interfaces para tipagem
interface SalesStats {
  geral: {
    total_vendas: number;
    total_faturamento: number;
    faturamento_medio: number;
    vendas_ultimos_30_dias: number;
  };
  por_produto: Record<string, {
    total: number;
    faturamento: number;
    cores: Record<string, number>;
    tamanhos: Record<string, number>;
  }>;
  vendas_por_dia: Record<string, number>;
  top_clientes: Array<{
    email: string;
    compras: number;
  }>;
  ultima_atualizacao: string;
}

interface Review {
  id: string;
  produto_id: string;
  nota: number;
  comentario: string;
  data: string;
  cliente_inicial: string;
}

interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
  stats?: {
    media: number;
    total: number;
    distribuicao: Record<number, number>;
  };
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [salesStats, setSalesStats] = useState<SalesStats | null>(null);
  const [reviews, setReviews] = useState<ReviewsResponse | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>('');

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
    } else {
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
      } else {
        console.error('Erro ao carregar estatísticas:', data.error);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar avaliações
  const loadReviews = useCallback(async (produtoId?: string) => {
    try {
      setLoading(true);
      const url = produtoId 
        ? `/.netlify/functions/get-reviews?produto_id=${produtoId}&limit=50`
        : `/.netlify/functions/get-reviews?limit=50`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data);
      } else {
        console.error('Erro ao carregar avaliações:', data.error);
      }
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
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
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        color: '#fff',
        fontFamily: 'monospace',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px'
      }}>
        <div style={{
          border: '3px solid #fff',
          padding: '20px',
          background: '#000',
          maxWidth: '400px',
          width: '100%'
        }}>
          <h1 style={{
            fontSize: 'clamp(18px, 5vw, 24px)',
            fontWeight: 'bold',
            marginBottom: '20px',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            ADMIN DASHBOARD
          </h1>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              API KEY:
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #fff',
                background: '#000',
                color: '#fff',
                fontSize: '14px',
                fontFamily: 'monospace',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              placeholder="Digite a API Key"
            />
          </div>
          
          <button
            onClick={handleAuth}
            style={{
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
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#000';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#fff';
              e.currentTarget.style.color = '#000';
            }}
          >
            ACESSAR
          </button>
        </div>
      </div>
    );
  }

  // Dashboard principal
  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      fontFamily: 'monospace',
      padding: '10px'
    }}>
      {/* Header */}
      <div style={{
        border: '3px solid #fff',
        padding: '15px',
        marginBottom: '15px',
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <h1 style={{
          fontSize: 'clamp(16px, 4vw, 24px)',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          margin: 0,
          textAlign: 'center'
        }}>
          DASHBOARD ADMINISTRATIVO
        </h1>
        
        <button
          onClick={handleLogout}
          style={{
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
          }}
        >
          SAIR
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{
          border: '3px solid #fff',
          padding: '15px',
          textAlign: 'center',
          marginBottom: '15px',
          background: '#000'
        }}>
          <div style={{ fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 'bold' }}>CARREGANDO...</div>
        </div>
      )}

      {/* Estatísticas de Vendas */}
      {salesStats && (
        <div style={{
          border: '3px solid #fff',
          padding: '15px',
          marginBottom: '15px',
          background: '#000'
        }}>
          <h2 style={{
            fontSize: 'clamp(16px, 4vw, 20px)',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            marginBottom: '15px',
            letterSpacing: '1px',
            textAlign: 'center'
          }}>
            📊 ESTATÍSTICAS DE VENDAS
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '10px',
            marginBottom: '15px'
          }}>
            <div style={{
              border: '2px solid #fff',
              padding: '10px',
              background: '#000',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '5px' }}>
                TOTAL VENDAS
              </div>
              <div style={{ fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 'bold' }}>
                {salesStats.geral.total_vendas}
              </div>
            </div>
            
            <div style={{
              border: '2px solid #fff',
              padding: '10px',
              background: '#000',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '5px' }}>
                FATURAMENTO
              </div>
              <div style={{ fontSize: 'clamp(12px, 3vw, 16px)', fontWeight: 'bold' }}>
                R$ {salesStats.geral.total_faturamento.toLocaleString('pt-BR')}
              </div>
            </div>
            
            <div style={{
              border: '2px solid #fff',
              padding: '10px',
              background: '#000',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '5px' }}>
                TICKET MÉDIO
              </div>
              <div style={{ fontSize: 'clamp(12px, 3vw, 16px)', fontWeight: 'bold' }}>
                R$ {salesStats.geral.faturamento_medio.toLocaleString('pt-BR')}
              </div>
            </div>
            
            <div style={{
              border: '2px solid #fff',
              padding: '10px',
              background: '#000',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '5px' }}>
                30 DIAS
              </div>
              <div style={{ fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 'bold' }}>
                {salesStats.geral.vendas_ultimos_30_dias}
              </div>
            </div>
          </div>

          {/* Vendas por Produto */}
          <div style={{ marginBottom: '15px' }}>
            <h3 style={{
              fontSize: 'clamp(12px, 3vw, 16px)',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              marginBottom: '10px',
              textAlign: 'center'
            }}>
              VENDAS POR PRODUTO
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '10px'
            }}>
              {Object.entries(salesStats.por_produto).map(([produtoId, stats]) => (
                <div key={produtoId} style={{
                  border: '2px solid #fff',
                  padding: '10px',
                  background: '#000'
                }}>
                  <div style={{
                    fontSize: 'clamp(10px, 2.5vw, 12px)',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    textAlign: 'center'
                  }}>
                    PRODUTO {produtoId}
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '8px', marginBottom: '2px' }}>VENDAS</div>
                      <div style={{ fontSize: 'clamp(12px, 3vw, 16px)', fontWeight: 'bold' }}>
                        {stats.total}
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '8px', marginBottom: '2px' }}>FATURAMENTO</div>
                      <div style={{ fontSize: 'clamp(10px, 2.5vw, 12px)', fontWeight: 'bold' }}>
                        R$ {stats.faturamento.toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  
                  {/* Cores mais vendidas */}
                  {Object.keys(stats.cores).length > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ fontSize: '8px', marginBottom: '3px', textAlign: 'center' }}>CORES:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', justifyContent: 'center' }}>
                        {Object.entries(stats.cores)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 3)
                          .map(([cor, qtd]) => (
                            <div key={cor} style={{ 
                              fontSize: '7px', 
                              padding: '2px 4px',
                              border: '1px solid #fff',
                              background: '#000'
                            }}>
                              {cor}: {qtd}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Tamanhos mais vendidos */}
                  {Object.keys(stats.tamanhos).length > 0 && (
                    <div>
                      <div style={{ fontSize: '8px', marginBottom: '3px', textAlign: 'center' }}>TAMANHOS:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', justifyContent: 'center' }}>
                        {Object.entries(stats.tamanhos)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 3)
                          .map(([tamanho, qtd]) => (
                            <div key={tamanho} style={{ 
                              fontSize: '7px', 
                              padding: '2px 4px',
                              border: '1px solid #fff',
                              background: '#000'
                            }}>
                              {tamanho}: {qtd}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Top Clientes */}
          {salesStats.top_clientes.length > 0 && (
            <div>
              <h3 style={{
                fontSize: 'clamp(12px, 3vw, 16px)',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                marginBottom: '10px',
                textAlign: 'center'
              }}>
                TOP CLIENTES
              </h3>
              
              <div style={{
                border: '2px solid #fff',
                padding: '10px',
                background: '#000'
              }}>
                {salesStats.top_clientes.slice(0, 5).map((cliente, index) => (
                  <div key={cliente.email} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '3px 0',
                    borderBottom: index < 4 ? '1px solid #333' : 'none',
                    fontSize: 'clamp(8px, 2vw, 10px)'
                  }}>
                    <span style={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '60%'
                    }}>
                      {cliente.email}
                    </span>
                    <span style={{ fontWeight: 'bold' }}>
                      {cliente.compras}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Avaliações */}
      {reviews && (
        <div style={{
          border: '3px solid #fff',
          padding: '15px',
          background: '#000'
        }}>
          <h2 style={{
            fontSize: 'clamp(16px, 4vw, 20px)',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            marginBottom: '15px',
            letterSpacing: '1px',
            textAlign: 'center'
          }}>
            ⭐ AVALIAÇÕES
          </h2>

          {/* Filtro por produto */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              fontSize: 'clamp(10px, 2.5vw, 12px)',
              fontWeight: 'bold',
              marginBottom: '8px',
              textTransform: 'uppercase',
              textAlign: 'center'
            }}>
              FILTRAR POR PRODUTO:
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => {
                setSelectedProduct(e.target.value);
                loadReviews(e.target.value || undefined);
              }}
              style={{
                width: '100%',
                padding: '8px',
                border: '2px solid #fff',
                background: '#000',
                color: '#fff',
                fontSize: 'clamp(10px, 2.5vw, 12px)',
                fontFamily: 'monospace',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              <option value="">TODOS OS PRODUTOS</option>
              {salesStats && Object.keys(salesStats.por_produto).map(produtoId => (
                <option key={produtoId} value={produtoId}>
                  PRODUTO {produtoId}
                </option>
              ))}
            </select>
          </div>

          {/* Estatísticas das avaliações */}
          {reviews.stats && (
            <div style={{
              border: '2px solid #fff',
              padding: '10px',
              marginBottom: '15px',
              background: '#000'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'clamp(8px, 2vw, 10px)', fontWeight: 'bold', marginBottom: '5px' }}>
                    MÉDIA GERAL
                  </div>
                  <div style={{ fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 'bold' }}>
                    {reviews.stats.media}/5
                  </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'clamp(8px, 2vw, 10px)', fontWeight: 'bold', marginBottom: '5px' }}>
                    TOTAL AVALIAÇÕES
                  </div>
                  <div style={{ fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 'bold' }}>
                    {reviews.stats.total}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lista de avaliações */}
          <div>
            <h3 style={{
              fontSize: 'clamp(12px, 3vw, 16px)',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              marginBottom: '10px',
              textAlign: 'center'
            }}>
              ÚLTIMAS AVALIAÇÕES
            </h3>
            
            {reviews.reviews.length === 0 ? (
              <div style={{
                border: '2px solid #fff',
                padding: '15px',
                textAlign: 'center',
                background: '#000'
              }}>
                <div style={{ fontSize: 'clamp(10px, 2.5vw, 12px)' }}>NENHUMA AVALIAÇÃO ENCONTRADA</div>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gap: '8px'
              }}>
                {reviews.reviews.map((review) => (
                  <div key={review.id} style={{
                    border: '2px solid #fff',
                    padding: '10px',
                    background: '#000'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        fontSize: 'clamp(10px, 2.5vw, 12px)',
                        fontWeight: 'bold'
                      }}>
                        PRODUTO {review.produto_id}
                      </div>
                      <div style={{
                        fontSize: 'clamp(10px, 2.5vw, 12px)',
                        fontWeight: 'bold'
                      }}>
                        {review.nota}/5 ⭐
                      </div>
                    </div>
                    
                    {review.comentario && (
                      <div style={{
                        fontSize: 'clamp(9px, 2vw, 10px)',
                        marginBottom: '8px',
                        lineHeight: '1.3',
                        wordBreak: 'break-word'
                      }}>
                        "{review.comentario}"
                      </div>
                    )}
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 'clamp(8px, 2vw, 9px)',
                      color: '#ccc'
                    }}>
                      <span>{review.cliente_inicial}</span>
                      <span>{new Date(review.data).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}