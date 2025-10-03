import { useEffect, useState, useCallback } from 'react';

type TipoInscricao = 'judge' | 'staff';

type Inscricao = {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  tipo: TipoInscricao;
  valor: number;
  status: string;
  data_criacao: string;
};

type Seguro = {
  nome: string;
  email: string;
  whatsapp: string;
  status: string;
  created_at?: string;
};

const API_BASE_URL = 'https://interbox-captacao.netlify.app/.netlify/functions';
const API_KEY = 'interbox2025';

function Login({ onLogin }: { onLogin: (key: string) => void }) {
  const [key, setKey] = useState('');
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
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onLogin(key);
                }
              }}
              placeholder="Digite sua API Key"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <button
            onClick={() => onLogin(key)}
            className="w-full px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-xl font-medium transition-colors"
          >
            🔑 Acessar Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('admin_api_key') || '');
  const isAuthenticated = apiKey === API_KEY;

  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [seguros, setSeguros] = useState<Seguro[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resIns, resSeg] = await Promise.all([
        fetch(`${API_BASE_URL}/save-inscricao`, { headers: { Authorization: `Bearer ${API_KEY}` } }),
        fetch(`${API_BASE_URL}/admin-seguros`, { headers: { Authorization: `Bearer ${API_KEY}` } })
      ]);

      if (resIns.ok) {
        const data = await resIns.json();
        setInscricoes(Array.isArray(data.inscricoes) ? data.inscricoes : []);
      }
      if (resSeg.ok) {
        const data = await resSeg.json();
        setSeguros(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Erro ao carregar dados', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated, loadData]);

  const handleLogin = (key: string) => {
    if (key === API_KEY) {
      localStorage.setItem('admin_api_key', key);
      setApiKey(key);
    } else {
      alert('API Key inválida');
    }
  };

  if (!isAuthenticated) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl lg:text-4xl font-bold mb-2">📊 Dashboard INTERBØX 2025</h1>
            <p className="text-white/80">Gerencie inscrições, seguros e exporte dados</p>
          </div>
          <div className="grid grid-cols-2 lg:flex gap-2 lg:gap-4 w-full lg:w-auto">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-3 lg:px-6 py-2 lg:py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-xl font-medium transition-colors text-sm lg:text-base"
            >
              {loading ? '🔄 Carregando...' : '🔄 Recarregar'}
            </button>
            <button
              onClick={() => {
                if (!inscricoes.length) return alert('Sem dados para exportar');
                const headers = Object.keys(inscricoes[0]).join(',');
                const rows = inscricoes.map((r) => Object.values(r).map((v) => `"${v}"`).join(',')).join('\n');
                const csv = [headers, rows].join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `inscricoes_${new Date().toISOString().split('T')[0]}.csv`;
                link.click();
              }}
              className="px-3 lg:px-6 py-2 lg:py-3 bg-green-600 hover:bg-green-700 rounded-xl font-medium transition-colors text-sm lg:text-base"
            >
              📊 Exportar CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-4">👥 Inscrições (Judge & Staff)</h3>
            {loading ? (
              <p className="text-white/80">Carregando...</p>
            ) : inscricoes.length === 0 ? (
              <p className="text-white/80">Nenhuma inscrição encontrada.</p>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full min-w-[600px] sm:min-w-0">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-2 px-4">Nome</th>
                      <th className="text-left py-2 px-4">Email</th>
                      <th className="text-left py-2 px-4">WhatsApp</th>
                      <th className="text-left py-2 px-4">Tipo</th>
                      <th className="text-left py-2 px-4">Criado em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inscricoes
                      .filter((i) => i.tipo === 'judge' || i.tipo === 'staff')
                      .map((i) => (
                        <tr key={i.id} className="border-b border-white/10 hover:bg-white/5">
                          <td className="py-2 px-4">{i.nome}</td>
                          <td className="py-2 px-4">{i.email}</td>
                          <td className="py-2 px-4">{i.whatsapp}</td>
                          <td className="py-2 px-4">{i.tipo}</td>
                          <td className="py-2 px-4">{new Date(i.data_criacao).toLocaleDateString('pt-BR')}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-4">🛡️ Seguros ({seguros.length})</h3>
            {seguros.length === 0 ? (
              <p className="text-white/80">Nenhuma solicitação.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="text-left text-white/70">
                      <th className="py-2 px-4">Nome</th>
                      <th className="py-2 px-4">Email</th>
                      <th className="py-2 px-4">WhatsApp</th>
                      <th className="py-2 px-4">Status</th>
                      <th className="py-2 px-4">Criado em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seguros.map((s, idx) => (
                      <tr key={idx} className="border-t border-white/10">
                        <td className="py-2 px-4">{s.nome}</td>
                        <td className="py-2 px-4">{s.email}</td>
                        <td className="py-2 px-4">{s.whatsapp}</td>
                        <td className="py-2 px-4">{s.status}</td>
                        <td className="py-2 px-4">{s.created_at ? new Date(s.created_at).toLocaleDateString('pt-BR') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
