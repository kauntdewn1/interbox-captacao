import { useState, useEffect, useCallback } from 'react';

interface Seguro {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: string;
  email: string;
  telefone: string;
  nomeTime: string;
  observacoes?: string;
  tipo: 'seguro';
  valor: number;
  status: 'pendente_comprovante' | 'comprovante_enviado' | 'pago_confirmado';
  data_criacao: string;
  data_atualizacao?: string;
}

interface Estatisticas {
  total_seguros: number;
  pendentes: number;
  comprovantes_enviados: number;
  pagos_confirmados: number;
  valor_total: number;
}

interface Filtros {
  status: string;
  data_inicio: string;
  data_fim: string;
  cpf: string;
}

export default function AdminSeguro() {
  const [seguros, setSeguros] = useState<Seguro[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [filtros, setFiltros] = useState<Filtros>({
    status: '',
    data_inicio: '',
    data_fim: '',
    cpf: ''
  });

  // Função para aplicar filtros
  const aplicarFiltros = useCallback((seguros: Seguro[], filtros: Filtros): Seguro[] => {
    let segurosFiltrados = [...seguros];
    
    if (filtros.status) {
      segurosFiltrados = segurosFiltrados.filter(s => s.status === filtros.status);
    }
    
    if (filtros.cpf) {
      segurosFiltrados = segurosFiltrados.filter(s => 
        s.cpf.toLowerCase().includes(filtros.cpf.toLowerCase())
      );
    }
    
    if (filtros.data_inicio) {
      segurosFiltrados = segurosFiltrados.filter(s => {
        const dataSeguro = new Date(s.data_criacao);
        const dataInicio = new Date(filtros.data_inicio);
        return dataSeguro >= dataInicio;
      });
    }
    
    if (filtros.data_fim) {
      segurosFiltrados = segurosFiltrados.filter(s => {
        const dataSeguro = new Date(s.data_criacao);
        const dataFim = new Date(filtros.data_fim);
        return dataSeguro <= dataFim;
      });
    }
    
    return segurosFiltrados;
  }, []);

  // Função para sincronizar dados
  const sincronizarDados = async () => {
    if (!apiKey) {
      alert('Digite a API Key primeiro');
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch('https://interbox-captacao.netlify.app/.netlify/functions/admin-seguros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro na sincronização');
      }

      const data = await response.json();
      setSeguros(data.seguros || []);
      setEstatisticas(data.estatisticas || null);
      
      // Salvar no localStorage como backup
      localStorage.setItem('interbox_seguros', JSON.stringify(data.seguros || []));
      
      alert('✅ Dados sincronizados com sucesso!');
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      alert('❌ Erro na sincronização. Verifique a API Key.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Função para atualizar status
  const atualizarStatus = async (seguroId: string, novoStatus: Seguro['status']) => {
    if (!apiKey) {
      alert('Digite a API Key primeiro');
      return;
    }

    try {
      const response = await fetch('https://interbox-captacao.netlify.app/.netlify/functions/update-seguro-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          seguroId,
          status: novoStatus
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status');
      }

      // Atualizar estado local
      setSeguros(prev => prev.map(s => 
        s.id === seguroId 
          ? { ...s, status: novoStatus, data_atualizacao: new Date().toISOString() }
          : s
      ));

      alert('✅ Status atualizado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      alert('❌ Erro ao atualizar status.');
    }
  };

  // Função para exportar dados
  const exportarCSV = () => {
    const segurosFiltrados = aplicarFiltros(seguros, filtros);
    
    if (segurosFiltrados.length === 0) {
      alert('Nenhum dado para exportar');
      return;
    }

    const headers = [
      'ID', 'Nome', 'CPF', 'Data Nascimento', 'Sexo', 'Email', 'Telefone', 
      'Nome do Time', 'Observações', 'Valor', 'Status', 'Data Criação', 'Data Atualização'
    ];

    const csvContent = [
      headers.join(','),
      ...segurosFiltrados.map(s => [
        s.id,
        `"${s.nome}"`,
        s.cpf,
        s.dataNascimento,
        s.sexo,
        `"${s.email}"`,
        s.telefone,
        `"${s.nomeTime}"`,
        `"${s.observacoes || ''}"`,
        s.valor,
        s.status,
        s.data_criacao,
        s.data_atualizacao || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `seguros_interbox_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Carregar dados iniciais
  useEffect(() => {
    const segurosSalvos = localStorage.getItem('interbox_seguros');
    if (segurosSalvos) {
      try {
        const segurosData = JSON.parse(segurosSalvos);
        setSeguros(segurosData);
        
        // Calcular estatísticas
        const stats: Estatisticas = {
          total_seguros: segurosData.length,
          pendentes: segurosData.filter((s: Seguro) => s.status === 'pendente_comprovante').length,
          comprovantes_enviados: segurosData.filter((s: Seguro) => s.status === 'comprovante_enviado').length,
          pagos_confirmados: segurosData.filter((s: Seguro) => s.status === 'pago_confirmado').length,
          valor_total: segurosData.reduce((acc: number, s: Seguro) => acc + s.valor, 0)
        };
        setEstatisticas(stats);
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
      }
    }
    setLoading(false);
  }, []);

  // Calcular estatísticas quando seguros mudam
  useEffect(() => {
    if (seguros.length > 0) {
      const stats: Estatisticas = {
        total_seguros: seguros.length,
        pendentes: seguros.filter(s => s.status === 'pendente_comprovante').length,
        comprovantes_enviados: seguros.filter(s => s.status === 'comprovante_enviado').length,
        pagos_confirmados: seguros.filter(s => s.status === 'pago_confirmado').length,
        valor_total: seguros.reduce((acc, s) => acc + s.valor, 0)
      };
      setEstatisticas(stats);
    }
  }, [seguros]);

  const segurosFiltrados = aplicarFiltros(seguros, filtros);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-400 mb-2">🛡️ Admin Seguros INTERBØX</h1>
              <p className="text-gray-400">Gerencie todos os seguros contratados</p>
            </div>
            <div className="bg-gray-800 rounded-2xl p-3 shadow-xl border border-gray-600">
              <img 
                src="/logos/saga_seguros.png" 
                alt="Saga Corretora de Seguros" 
                className="h-12 object-contain"
              />
            </div>
          </div>
        </div>

        {/* API Key */}
        <div className="bg-[#1a1b2f] rounded-2xl p-6 border border-blue-500/20 mb-8">
          <div className="flex items-center space-x-4">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Digite a API Key do parceiro Saga"
              className="flex-1 px-4 py-2 bg-[#0f0f23] border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              onClick={sincronizarDados}
              disabled={isSyncing || !apiKey}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl transition-colors"
            >
              {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        {estatisticas && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-[#1a1b2f] rounded-2xl p-6 border border-blue-500/20 text-center">
              <div className="text-2xl font-bold text-blue-400">{estatisticas.total_seguros}</div>
              <div className="text-sm text-gray-400">Total</div>
            </div>
            <div className="bg-[#1a1b2f] rounded-2xl p-6 border border-yellow-500/20 text-center">
              <div className="text-2xl font-bold text-yellow-400">{estatisticas.pendentes}</div>
              <div className="text-sm text-gray-400">Pendentes</div>
            </div>
            <div className="bg-[#1a1b2f] rounded-2xl p-6 border border-orange-500/20 text-center">
              <div className="text-2xl font-bold text-orange-400">{estatisticas.comprovantes_enviados}</div>
              <div className="text-sm text-gray-400">Comprovantes</div>
            </div>
            <div className="bg-[#1a1b2f] rounded-2xl p-6 border border-green-500/20 text-center">
              <div className="text-2xl font-bold text-green-400">{estatisticas.pagos_confirmados}</div>
              <div className="text-sm text-gray-400">Pagos</div>
            </div>
            <div className="bg-[#1a1b2f] rounded-2xl p-6 border border-purple-500/20 text-center">
              <div className="text-2xl font-bold text-purple-400">R$ {estatisticas.valor_total.toFixed(2)}</div>
              <div className="text-sm text-gray-400">Valor Total</div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-[#1a1b2f] rounded-2xl p-6 border border-blue-500/20 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">🔍 Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filtros.status}
              onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
              className="px-4 py-2 bg-[#0f0f23] border border-gray-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Todos os Status</option>
              <option value="pendente_comprovante">Pendente Comprovante</option>
              <option value="comprovante_enviado">Comprovante Enviado</option>
              <option value="pago_confirmado">Pago e Confirmado</option>
            </select>
            
            <input
              type="date"
              value={filtros.data_inicio}
              onChange={(e) => setFiltros(prev => ({ ...prev, data_inicio: e.target.value }))}
              className="px-4 py-2 bg-[#0f0f23] border border-gray-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Data Início"
            />
            
            <input
              type="date"
              value={filtros.data_fim}
              onChange={(e) => setFiltros(prev => ({ ...prev, data_fim: e.target.value }))}
              className="px-4 py-2 bg-[#0f0f23] border border-gray-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Data Fim"
            />
            
            <input
              type="text"
              value={filtros.cpf}
              onChange={(e) => setFiltros(prev => ({ ...prev, cpf: e.target.value }))}
              className="px-4 py-2 bg-[#0f0f23] border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Buscar por CPF"
            />
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-blue-400">
            📋 Seguros ({segurosFiltrados.length})
          </h2>
          <button
            onClick={exportarCSV}
            disabled={segurosFiltrados.length === 0}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl transition-colors"
          >
            📊 Exportar CSV
          </button>
        </div>

        {/* Tabela */}
        <div className="bg-[#1a1b2f] rounded-2xl border border-blue-500/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0f0f23] border-b border-blue-500/20">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-400">Nome</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-400">CPF</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-400">Time</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-400">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-400">Data</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-400">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-500/10">
                {segurosFiltrados.map((seguro) => (
                  <tr key={seguro.id} className="hover:bg-[#0f0f23] transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-white">{seguro.nome}</div>
                        <div className="text-sm text-gray-400">{seguro.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{seguro.cpf}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{seguro.nomeTime}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        seguro.status === 'pendente_comprovante' ? 'bg-yellow-500/20 text-yellow-400' :
                        seguro.status === 'comprovante_enviado' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {seguro.status === 'pendente_comprovante' ? 'Pendente' :
                         seguro.status === 'comprovante_enviado' ? 'Comprovante' :
                         'Pago'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(seguro.data_criacao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <select
                          value={seguro.status}
                          onChange={(e) => atualizarStatus(seguro.id, e.target.value as Seguro['status'])}
                          className="px-2 py-1 bg-[#0f0f23] border border-gray-600 rounded text-xs text-white focus:border-blue-500"
                        >
                          <option value="pendente_comprovante">Pendente</option>
                          <option value="comprovante_enviado">Comprovante</option>
                          <option value="pago_confirmado">Pago</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {segurosFiltrados.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              Nenhum seguro encontrado com os filtros aplicados
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
