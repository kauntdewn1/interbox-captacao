import { useState, useEffect } from 'react';
import { FaHistory, FaTrash, FaDownload, FaUpload, FaShoppingBag } from 'react-icons/fa';
import { 
  getOrderHistory, 
  clearOrderHistory, 
  getOrderHistoryStats, 
  exportOrderHistory,
  importOrderHistory
} from '../utils/orderHistory';
import type { OrderHistoryItem } from '../utils/orderHistory';

interface OrderHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderHistory({ isOpen, onClose }: OrderHistoryProps) {
  const [history, setHistory] = useState<OrderHistoryItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = () => {
    const orderHistory = getOrderHistory();
    const orderStats = getOrderHistoryStats();
    setHistory(orderHistory);
    setStats(orderStats);
  };

  const handleClearHistory = () => {
    if (confirm('Tem certeza que deseja limpar todo o histórico de compras?')) {
      clearOrderHistory();
      loadHistory();
    }
  };

  const handleExport = () => {
    const jsonData = exportOrderHistory();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interbox-order-history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const jsonData = e.target?.result as string;
        if (importOrderHistory(jsonData)) {
          loadHistory();
          setShowImport(false);
          alert('Histórico importado com sucesso!');
        } else {
          alert('Erro ao importar histórico. Verifique o formato do arquivo.');
        }
      };
      reader.readAsText(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <FaHistory className="text-pink-500 text-xl" />
            <h2 className="text-white text-xl font-bold">Histórico de Compras</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="p-6 border-b border-white/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-500">{stats.totalOrders}</div>
                <div className="text-white/60 text-sm">Total de Pedidos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  R$ {stats.totalValue.toFixed(2).replace('.', ',')}
                </div>
                <div className="text-white/60 text-sm">Valor Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{stats.uniqueProducts}</div>
                <div className="text-white/60 text-sm">Produtos Únicos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  {stats.mostPopularColor || 'N/A'}
                </div>
                <div className="text-white/60 text-sm">Cor Popular</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-6 border-b border-white/20">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              <FaDownload />
              Exportar
            </button>
            <button
              onClick={() => setShowImport(!showImport)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
            >
              <FaUpload />
              Importar
            </button>
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
            >
              <FaTrash />
              Limpar Histórico
            </button>
          </div>

          {/* Import Input */}
          {showImport && (
            <div className="mt-4">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
          )}
        </div>

        {/* History List */}
        <div className="p-6 overflow-y-auto max-h-96">
          {history.length === 0 ? (
            <div className="text-center py-8">
              <FaShoppingBag className="text-white/40 text-4xl mx-auto mb-4" />
              <p className="text-white/60">Nenhuma compra registrada ainda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((order, index) => (
                <div
                  key={`${order.produtoId}-${order.data}-${index}`}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{order.nome}</h3>
                      <div className="text-white/60 text-sm space-y-1">
                        <div>Cor: <span className="text-white">{order.cor}</span></div>
                        <div>Tamanho: <span className="text-white">{order.tamanho}</span></div>
                        <div>Valor: <span className="text-green-400 font-semibold">
                          R$ {order.valor.toFixed(2).replace('.', ',')}
                        </span></div>
                        <div>Data: <span className="text-white">
                          {new Date(order.data).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white/40 text-xs">
                        #{order.produtoId}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}