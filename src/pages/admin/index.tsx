import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface Inscricao {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  tipo: 'judge' | 'audiovisual' | 'staff';
  valor: number;
  status: string;
  data_criacao: string;
  data_confirmacao?: string;
}
interface Estatisticas {
  total_inscricoes: number;
  tipos: {
    judge: number;
    audiovisual: number;
    staff: number;
  };
  valor_total: number;
  inscricoes_por_mes: Record<string, unknown>;
}

export default function AdminDashboard() {
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    tipo: '',
    status: '',
    data_inicio: '',
    data_fim: ''
  });
  const [apiKey, setApiKey] = useState('');
  const navigate = useNavigate();

  const ADMIN_API_BASE = 'https://interbox-captacao.netlify.app/.netlify/functions/admin-inscricoes';

  // 🔑 Verificar autenticação
  useEffect(() => {
    const savedApiKey = localStorage.getItem('interbox_admin_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Carregar inscrições
      const inscricoesResponse = await fetch(`${ADMIN_API_BASE}/inscricoes?${new URLSearchParams(filtros)}`);
      if (inscricoesResponse.ok) {
        const inscricoesData = await inscricoesResponse.json();
        setInscricoes(inscricoesData.data || []);
      }

      // Carregar estatísticas
      const statsResponse = await fetch(`${ADMIN_API_BASE}/estatisticas`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setEstatisticas(statsData.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // 📊 Carregar dados
  useEffect(() => {
    if (apiKey) {
      loadData();
    }
  }, [apiKey, loadData]);

  // 📤 Exportar dados
  const exportData = async (formato: 'csv' | 'excel') => {
    try {
      const response = await fetch(`${ADMIN_API_BASE}/export?formato=${formato}`);
      if (response.ok) {
        const data = await response.text();
        
        // Criar download
        const blob = new Blob([data], { 
          type: formato === 'csv' ? 'text/csv' : 'application/json' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inscricoes_interbox_2025.${formato === 'csv' ? 'csv' : 'json'}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
    }
  };

  // 🔐 Salvar API Key
  const handleSaveApiKey = () => {
    localStorage.setItem('interbox_admin_api_key', apiKey);
    loadData();
  };

  // 🗑️ Remover inscrição
  const deleteInscricao = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta inscrição?')) return;
    
    try {
      const response = await fetch(`${ADMIN_API_BASE}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ id })
      });
      
      if (response.ok) {
        loadData(); // Recarregar dados
      }
    } catch (error) {
      console.error('Erro ao remover inscrição:', error);
    }
  };

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">🔐 ADMIN INTERBØX 2025</h1>
            <p className="text-xl text-white/80">Acesso restrito à organização</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">API Key de Administração</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Digite sua API Key"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            
            <button
              onClick={handleSaveApiKey}
              className="w-full px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-xl font-medium transition-colors"
            >
              🔑 Acessar Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">📊 Dashboard INTERBØX 2025</h1>
            <p className="text-white/80">Gerencie inscrições e visualize estatísticas</p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => exportData('csv')}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-medium transition-colors"
            >
              📊 Exportar CSV
            </button>
            <button
              onClick={() => exportData('excel')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors"
            >
              📈 Exportar Excel
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-medium transition-colors"
            >
              🏠 Voltar ao App
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        {estatisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-pink-400">{estatisticas.total_inscricoes}</div>
              <div className="text-white/80">Total de Inscrições</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-blue-400">{estatisticas.tipos.judge}</div>
              <div className="text-white/80">Judges</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-green-400">{estatisticas.tipos.audiovisual}</div>
              <div className="text-white/80">Audiovisual</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-yellow-400">{estatisticas.tipos.staff}</div>
              <div className="text-white/80">Staff</div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
          <h3 className="text-xl font-semibold mb-4">🔍 Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">Todos os tipos</option>
              <option value="judge">Judge</option>
              <option value="audiovisual">Audiovisual</option>
              <option value="staff">Staff</option>
            </select>
            
            <select
              value={filtros.status}
              onChange={(e) => setFiltros({...filtros, status: e.target.value})}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">Todos os status</option>
              <option value="confirmado">Confirmado</option>
              <option value="pendente">Pendente</option>
            </select>
            
            <input
              type="date"
              value={filtros.data_inicio}
              onChange={(e) => setFiltros({...filtros, data_inicio: e.target.value})}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Data início"
            />
            
            <input
              type="date"
              value={filtros.data_fim}
              onChange={(e) => setFiltros({...filtros, data_fim: e.target.value})}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Data fim"
            />
          </div>
        </div>

        {/* Lista de Inscrições */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">📝 Inscrições ({inscricoes.length})</h3>
            <button
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 rounded-lg font-medium transition-colors"
            >
              {loading ? '🔄 Carregando...' : '🔄 Atualizar'}
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
              <p className="text-white/80">Carregando inscrições...</p>
            </div>
          ) : inscricoes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/80">Nenhuma inscrição encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4">Nome</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">WhatsApp</th>
                    <th className="text-left py-3 px-4">Tipo</th>
                    <th className="text-left py-3 px-4">Valor</th>
                    <th className="text-left py-3 px-4">Data</th>
                    <th className="text-left py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {inscricoes.map((inscricao) => (
                    <tr key={inscricao.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-3 px-4">{inscricao.nome}</td>
                      <td className="py-3 px-4">{inscricao.email}</td>
                      <td className="py-3 px-4">{inscricao.whatsapp}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          inscricao.tipo === 'judge' ? 'bg-blue-500/20 text-blue-300' :
                          inscricao.tipo === 'audiovisual' ? 'bg-green-500/20 text-green-300' :
                          'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {inscricao.tipo}
                        </span>
                      </td>
                      <td className="py-3 px-4">R$ {(inscricao.valor / 100).toFixed(2)}</td>
                      <td className="py-3 px-4">
                        {new Date(inscricao.data_criacao).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => deleteInscricao(inscricao.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-medium transition-colors"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
