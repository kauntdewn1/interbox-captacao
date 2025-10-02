/**
 * Painel do Fornecedor - INTERBØX 2025
 * Dashboard em tempo real para fornecedores (PlayK)
 */

import { useState, useEffect } from 'react';

// ============================================================================
// Types
// ============================================================================

interface Order {
  id: string;
  correlationID: string;
  status: 'pending' | 'paid' | 'failed';
  amount_cents: number;
  amount_brl: string;
  product: {
    id: string;
    name: string;
    category: string;
    gender: string;
    image: string;
  };
  customer: {
    name: string;
    email: string;
  };
  dates: {
    created: string;
    paid?: string;
  };
}

interface Stats {
  total_orders: number;
  paid_orders: number;
  pending_orders: number;
  total_revenue_cents: number;
  total_revenue_brl: string;
  by_gender: Array<{
    gender: string;
    count: number;
    total_cents: number;
    total_brl: string;
  }>;
  by_product: Array<{
    id: string;
    name: string;
    count: number;
    total: number;
  }>;
}

interface SalesData {
  success: boolean;
  supplier: string;
  stats: Stats;
  orders: Order[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// ============================================================================
// Componente Principal
// ============================================================================

export default function FornecedorDashboard() {
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    gender: '',
    startDate: '',
    endDate: '',
  });
  const [autoRefresh, setAutoRefresh] = useState(true);

  /**
   * Carrega dados de vendas
   */
  const loadSalesData = async () => {
    try {
      const params = new URLSearchParams({
        supplier: 'playk',
        ...(filters.status && { status: filters.status }),
        ...(filters.gender && { gender: filters.gender }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      });

      const response = await fetch(`/.netlify/functions/get-supplier-sales?${params}`);

      if (!response.ok) {
        throw new Error(`Erro ao carregar vendas: ${response.status}`);
      }

      const data: SalesData = await response.json();
      setSalesData(data);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar vendas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carrega dados ao montar e quando filtros mudarem
   */
  useEffect(() => {
    loadSalesData();
  }, [filters]);

  /**
   * Auto-refresh a cada 30 segundos
   */
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadSalesData();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [autoRefresh, filters]);

  /**
   * Formata data
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Badge de status
   */
  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    };

    const labels = {
      paid: 'Pago',
      pending: 'Pendente',
      failed: 'Falhou',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  // ============================================================================
  // Render
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Carregando vendas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-bold text-lg mb-2">Erro ao carregar dados</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => loadSalesData()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Dashboard PlayK</h1>
              <p className="text-purple-200 mt-1">Vendas INTERBØX 2025 em Tempo Real</p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                Auto-refresh (30s)
              </label>
              <button
                onClick={() => loadSalesData()}
                className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 font-semibold"
              >
                🔄 Atualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm font-semibold mb-1">Total de Vendas</div>
            <div className="text-3xl font-bold text-purple-600">{salesData?.stats.total_orders || 0}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm font-semibold mb-1">Pagamentos Confirmados</div>
            <div className="text-3xl font-bold text-green-600">{salesData?.stats.paid_orders || 0}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm font-semibold mb-1">Pendentes</div>
            <div className="text-3xl font-bold text-yellow-600">{salesData?.stats.pending_orders || 0}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm font-semibold mb-1">Faturamento Total</div>
            <div className="text-3xl font-bold text-purple-600">R$ {salesData?.stats.total_revenue_brl || '0.00'}</div>
          </div>
        </div>

        {/* Vendas por Gênero */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">📊 Vendas por Gênero</h2>
            <div className="space-y-3">
              {salesData?.stats.by_gender.map((item) => (
                <div key={item.gender} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-semibold text-gray-800">{item.gender}</div>
                    <div className="text-sm text-gray-500">{item.count} vendas</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-600">R$ {item.total_brl}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">🏆 Produtos Mais Vendidos</h2>
            <div className="space-y-3">
              {salesData?.stats.by_product.slice(0, 5).map((item, index) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.count} vendas</div>
                    </div>
                  </div>
                  <div className="font-bold text-purple-600">R$ {(item.total / 100).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">🔍 Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Todos</option>
                <option value="paid">Pago</option>
                <option value="pending">Pendente</option>
                <option value="failed">Falhou</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gênero</label>
              <select
                value={filters.gender}
                onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Todos</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Unissex">Unissex</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Data Início</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Data Fim</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <button
            onClick={() => setFilters({ status: '', gender: '', startDate: '', endDate: '' })}
            className="mt-4 text-sm text-purple-600 hover:text-purple-800 font-semibold"
          >
            Limpar Filtros
          </button>
        </div>

        {/* Tabela de Pedidos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">📦 Histórico de Pedidos</h2>
            <p className="text-sm text-gray-500 mt-1">
              {salesData?.pagination.total || 0} pedidos encontrados
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Produto</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Gênero</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {salesData?.orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Nenhum pedido encontrado
                    </td>
                  </tr>
                ) : (
                  salesData?.orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(order.dates.paid || order.dates.created)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {order.product.image && (
                            <img
                              src={order.product.image}
                              alt={order.product.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <div>
                            <div className="font-semibold text-gray-800 text-sm">{order.product.name}</div>
                            <div className="text-xs text-gray-500">{order.correlationID}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.product.gender}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-800">{order.customer.name}</div>
                        <div className="text-xs text-gray-500">{order.customer.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-purple-600">R$ {order.amount_brl}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>INTERBØX 2025 - Painel do Fornecedor PlayK</p>
          <p className="mt-1">Última atualização: {new Date().toLocaleTimeString('pt-BR')}</p>
        </div>
      </div>
    </div>
  );
}
