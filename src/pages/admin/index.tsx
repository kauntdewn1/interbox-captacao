import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface Inscricao {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  cpf?: string;
  tipo: 'judge' | 'audiovisual' | 'staff';
  valor: number;
  status: string;
  data_criacao: string;
  data_confirmacao?: string;
  correlationID?: string;
  correlation_id?: string;
  charge_id?: string;
  data_atualizacao?: string;
  // Campos específicos por tipo
  portfolio?: string;
  experiencia?: string;
  disponibilidade?: string;
  motivacao?: string;
  certificacoes?: string;
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

interface Filtros {
  tipo: string;
  status: string;
  data_inicio: string;
  data_fim: string;
}

interface Charge {
  identifier: string;
  status: string;
  value: number;
  comment?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    taxID?: {
      taxID?: string;
    };
  };
  createdAt?: string;
}

export default function AdminDashboard() {
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const navigate = useNavigate();
  const [filtros, setFiltros] = useState<Filtros>({
    tipo: '',
    status: '',
    data_inicio: '',
    data_fim: ''
  });

  // Função para aplicar filtros
  const aplicarFiltros = useCallback((inscricoes: Inscricao[], filtros: Filtros): Inscricao[] => {
    let inscricoesFiltradas = [...inscricoes];
    
    if (filtros.tipo) {
      inscricoesFiltradas = inscricoesFiltradas.filter(i => i.tipo === filtros.tipo);
    }
    
    if (filtros.status) {
      inscricoesFiltradas = inscricoesFiltradas.filter(i => i.status === filtros.status);
    }
    
    if (filtros.data_inicio) {
      inscricoesFiltradas = inscricoesFiltradas.filter(i => {
        const dataInscricao = new Date(i.data_criacao);
        const dataInicio = new Date(filtros.data_inicio);
        return dataInscricao >= dataInicio;
      });
    }
    
    if (filtros.data_fim) {
      inscricoesFiltradas = inscricoesFiltradas.filter(i => {
        const dataInscricao = new Date(i.data_criacao);
        const dataFim = new Date(filtros.data_fim);
        return dataInscricao <= dataFim;
      });
    }
    
    return inscricoesFiltradas;
  }, []);

  // 🆕 Função simplificada para normalizar dados do Supabase
  const normalizarDados = useCallback((inscricoes: Inscricao[]): Inscricao[] => {
    try {
      console.log('Normalizando dados do Supabase...');
      
      // Apenas normalizar campos que podem estar undefined
      const inscricoesNormalizadas = inscricoes.map(inscricao => ({
        ...inscricao,
        cpf: inscricao.cpf || 'Não informado',
        portfolio: inscricao.portfolio || undefined,
        experiencia: inscricao.experiencia || 'Não informada',
        disponibilidade: inscricao.disponibilidade || 'Não informada',
        motivacao: inscricao.motivacao || 'Não informada',
        certificacoes: inscricao.certificacoes || 'Não informadas'
      }));
      
      console.log(`✅ Dados normalizados: ${inscricoes.length} inscrições`);
      return inscricoesNormalizadas;
      
    } catch (error) {
      console.error('Erro na normalização:', error);
      return inscricoes;
    }
  }, []);

  // Função principal para carregar dados
  const loadData = useCallback(async (skipHistoricalSync = false) => {
    setLoading(true);
    try {
      // 🆕 Dados vêm diretamente do Supabase
      const todasInscricoes: Inscricao[] = [];

      // 🆕 Buscar dados diretamente do Supabase
      try {
        const response = await fetch('https://interbox-captacao.netlify.app/.netlify/functions/save-inscricao', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer interbox2025'
          }
        });
        
        if (response.ok) {
          const serverData = await response.json();
          console.log('✅ Dados do Supabase carregados:', serverData.inscricoes?.length || 0);
          
          // Usar dados do Supabase como fonte principal
          if (serverData.inscricoes?.length > 0) {
            todasInscricoes.length = 0; // Limpar array
            todasInscricoes.push(...serverData.inscricoes);
          }
        } else {
          console.error('❌ Erro ao carregar dados do Supabase:', response.status);
        }
      } catch (error) {
        console.error('❌ Erro ao conectar com Supabase:', error);
      }

      // 🆕 SINCRONIZAÇÃO HISTÓRICA AUTOMÁTICA (apenas se tiver poucos dados)
      if (!skipHistoricalSync && todasInscricoes.length < 10) {
        try {
          console.log('🔄 Executando sincronização histórica automática...');
          const historicalResponse = await fetch('https://interbox-captacao.netlify.app/.netlify/functions/sync-historical-data', {
            method: 'GET',
            headers: {
              'Authorization': 'Bearer interbox2025'
            }
          });
          
          if (historicalResponse.ok) {
            const historicalData = await historicalResponse.json();
            console.log('✅ Sincronização histórica concluída:', historicalData);
            
            // Se foram criadas/atualizadas inscrições, recarregar dados
            if (historicalData.synced > 0) {
              console.log('🔄 Recarregando dados após sincronização histórica...');
              return await loadData(true); // Evitar loop infinito
            }
          }
        } catch (error) {
          console.error('❌ Erro na sincronização histórica automática:', error);
          // Continuar mesmo com erro na sincronização histórica
        }
      }

      // Aplicar normalização
      const inscricoesNormalizados = normalizarDados(todasInscricoes);
      
      // Aplicar filtros
      const inscricoesFiltradas = aplicarFiltros(inscricoesNormalizados, filtros);
      setInscricoes(inscricoesFiltradas);
      
      // 🆕 Não precisamos mais do localStorage - dados vêm do Supabase
      
      // Calcular estatísticas
      const stats: Estatisticas = {
        total_inscricoes: inscricoesNormalizados.length,
        tipos: {
          judge: inscricoesNormalizados.filter(i => i.tipo === 'judge').length,
          audiovisual: inscricoesNormalizados.filter(i => i.tipo === 'audiovisual').length,
          staff: inscricoesNormalizados.filter(i => i.tipo === 'staff').length
        },
        valor_total: inscricoesNormalizados.reduce((total, i) => total + (i.valor || 0), 0),
        inscricoes_por_mes: {}
      };
      
      setEstatisticas(stats);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [filtros, aplicarFiltros, normalizarDados]);

  // Carregar dados quando componente monta ou filtros mudam
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Verificar autenticação
  useEffect(() => {
    const savedApiKey = localStorage.getItem('admin_api_key');
    if (savedApiKey === 'interbox2025') {
      setApiKey(savedApiKey);
    }
  }, []);

  // Função para exportar dados
  const exportarDados = useCallback(() => {
    if (!inscricoes.length) {
      alert('Não há dados para exportar');
      return;
    }
    
    const dados = inscricoes.map(i => ({
      ...i,
      data_criacao: new Date(i.data_criacao).toLocaleDateString('pt-BR'),
      data_atualizacao: i.data_atualizacao ? new Date(i.data_atualizacao).toLocaleDateString('pt-BR') : 'N/A'
    }));
    
    const headers = Object.keys(dados[0]).join(',');
    const rows = dados.map(row => Object.values(row).map(value => `"${value}"`).join(','));
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inscricoes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }, [inscricoes]);

  // Salvar API Key
  const handleSaveApiKey = useCallback(() => {
    if (apiKey === 'interbox2025') {
      localStorage.setItem('admin_api_key', apiKey);
      alert('Acesso autorizado!');
    } else {
      alert('API Key inválida');
    }
  }, [apiKey]);

  // Remover inscrição
  const deleteInscricao = useCallback((id: string) => {
    if (confirm('Tem certeza que deseja remover esta inscrição?')) {
      const novasInscricoes = inscricoes.filter(i => i.id !== id);
      setInscricoes(novasInscricoes);
      // Atualizar localStorage também
      const todasInscricoes = JSON.parse(localStorage.getItem('interbox_inscricoes') || '[]');
      const inscricoesAtualizadas = todasInscricoes.filter((i: Inscricao) => i.id !== id);
      localStorage.setItem('interbox_inscricoes', JSON.stringify(inscricoesAtualizadas));
    }
  }, [inscricoes]);

  // Verificar status do pagamento
  const checkPaymentStatus = useCallback(async (correlationID: string) => {
    try {
      const response = await fetch(`https://interbox-captacao.netlify.app/.netlify/functions/check-charge?chargeId=${correlationID}`);
      if (response.ok) {
        const data = await response.json();
        const charge = data.charge?.charge || data.charge;
        alert(`Status: ${charge?.status || 'Desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      alert('Erro ao verificar status do pagamento. Tente novamente.');
    }
  }, []);


  // Sincronizar com FlowPay
  const syncWithWoovi = useCallback(async () => {
    setIsSyncing(true);
    try {
      console.log('🔄 Iniciando sincronização com OpenPix/Woovi...');
      
      // 1. Primeiro, listar todas as charges do OpenPix
      const listResponse = await fetch('https://interbox-captacao.netlify.app/.netlify/functions/list-charges');
      
      if (!listResponse.ok) {
        throw new Error('Erro ao listar charges do OpenPix');
      }
      
      const listData = await listResponse.json();
      console.log('📋 Charges encontradas:', listData.total);
      
      if (!listData.success || !listData.charges || listData.charges.length === 0) {
        alert('Nenhuma charge encontrada no OpenPix/Woovi');
        return;
      }
      
      // 2. Filtrar charges relacionadas ao INTERBØX
      const interboxCharges = listData.charges.filter((charge: Charge) => 
        charge.comment?.includes('INTERBØX') || 
        charge.comment?.includes('interbox') ||
        charge.customer?.name?.includes('INTERBØX') ||
        charge.identifier?.includes('interbox')
      );
      
      console.log('🎯 Charges do INTERBØX:', interboxCharges.length);
      
      if (interboxCharges.length === 0) {
        alert('Nenhuma charge do INTERBØX encontrada no OpenPix/Woovi');
        return;
      }
      
      // 3. Processar cada charge encontrada
      let inscricoesAtualizadas = 0;
      let inscricoesNovas = 0;
      
      for (const charge of interboxCharges) {
        try {
          console.log('🔄 Processando charge:', charge.identifier);
          
          // Verificar se já existe no Supabase
          const response = await fetch('https://interbox-captacao.netlify.app/.netlify/functions/save-inscricao', {
            method: 'GET',
            headers: {
              'Authorization': 'Bearer interbox2025'
            }
          });
          
          if (response.ok) {
            const serverData = await response.json();
            const inscricoesExistentes = serverData.inscricoes || [];
            
            const existeInscricao = inscricoesExistentes.find((i: Inscricao) => 
              i.correlation_id === charge.identifier || i.charge_id === charge.identifier
            );
            
            if (!existeInscricao && charge.status === 'CONFIRMED') {
              // Criar nova inscrição no Supabase
              const novaInscricao = {
                nome: charge.customer?.name || 'Cliente OpenPix',
                email: charge.customer?.email || 'email@openpix.com',
                whatsapp: charge.customer?.phone || 'WhatsApp não informado',
                cpf: charge.customer?.taxID?.taxID || null,
                tipo: charge.comment?.includes('audiovisual') ? 'audiovisual' : 
                      charge.comment?.includes('judge') ? 'judge' : 'staff',
                valor: charge.value || 0,
                status: 'pago',
                correlation_id: charge.identifier,
                charge_id: charge.identifier,
                data_criacao: charge.createdAt || new Date().toISOString()
              };
              
              // Salvar no Supabase
              const saveResponse = await fetch('https://interbox-captacao.netlify.app/.netlify/functions/save-inscricao', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer interbox2025'
                },
                body: JSON.stringify(novaInscricao)
              });
              
              if (saveResponse.ok) {
                inscricoesNovas++;
                console.log('✅ Nova inscrição criada:', novaInscricao.nome);
              }
            } else if (existeInscricao && charge.status === 'CONFIRMED') {
              // Atualizar status se necessário
              inscricoesAtualizadas++;
              console.log('🔄 Inscrição atualizada:', existeInscricao.nome);
            }
          }
          
          // Delay entre requisições
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Erro ao processar charge ${charge.identifier}:`, error);
        }
      }
      
      // Recarregar dados
      await loadData();
      
      alert(`Sincronização concluída!\n${inscricoesAtualizadas} atualizadas, ${inscricoesNovas} novas inscrições.`);
      
    } catch (error) {
      console.error('Erro na sincronização:', error);
      alert('Erro durante a sincronização: ' + (error instanceof Error ? error.message : String(error)));
    } finally { 
      setIsSyncing(false);
    }
  }, [loadData]);

  // Função wrapper para recarregar dados
  const handleReload = useCallback(() => {
    loadData();
  }, [loadData]);

  // Renderização condicional para autenticação
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
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl lg:text-4xl font-bold mb-2">📊 Dashboard INTERBØX 2025</h1>
            <p className="text-white/80">Gerencie inscrições e visualize estatísticas</p>
          </div>
          
          <div className="grid grid-cols-2 lg:flex gap-2 lg:gap-4 w-full lg:w-auto">
            <button
              onClick={handleReload}
              disabled={loading}
              className="px-3 lg:px-6 py-2 lg:py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-xl font-medium transition-colors text-sm lg:text-base"
            >
              {loading ? '🔄 Carregando...' : '🔄 Sincronizar'}
            </button>
            <button
              onClick={syncWithWoovi}
              disabled={isSyncing}
              className="px-3 lg:px-6 py-2 lg:py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl font-medium transition-colors text-sm lg:text-base"
            >
              {isSyncing ? '🔄 Sincronizando...' : '🔄 FlowPay'}
            </button>
            <button
              onClick={exportarDados}
              className="px-3 lg:px-6 py-2 lg:py-3 bg-green-600 hover:bg-green-700 rounded-xl font-medium transition-colors text-sm lg:text-base"
            >
              📊 Exportar CSV
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-3 lg:px-6 py-2 lg:py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-medium transition-colors text-sm lg:text-base"
            >
              🏠 Voltar
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
            />
            
            <input
              type="date"
              value={filtros.data_fim}
              onChange={(e) => setFiltros({...filtros, data_fim: e.target.value})}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* Tabela Audiovisual */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-green-500/20 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-green-400">
              🎬 Audiovisual - Inscrições Pagas ({inscricoes.filter(i => i.tipo === 'audiovisual').length})
            </h3>
            <button
              onClick={handleReload}
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg font-medium transition-colors"
            >
              {loading ? '🔄 Carregando...' : '🔄 Atualizar'}
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-white/80">Carregando inscrições audiovisual...</p>
            </div>
          ) : inscricoes.filter(i => i.tipo === 'audiovisual').length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/80">Nenhuma inscrição audiovisual encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full min-w-[800px] sm:min-w-0">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4">Nome</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">WhatsApp</th>
                    <th className="text-left py-3 px-4">CPF</th>
                    <th className="text-left py-3 px-4">Portfolio</th>
                    <th className="text-left py-3 px-4">Valor</th>
                    <th className="text-left py-3 px-4 min-w-[120px]">Status</th>
                    <th className="text-left py-3 px-4">Data</th>
                    <th className="text-left py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {inscricoes.filter(i => i.tipo === 'audiovisual').map((inscricao) => (
                    <tr key={inscricao.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-3 px-4">{inscricao.nome}</td>
                      <td className="py-3 px-4">{inscricao.email}</td>
                      <td className="py-3 px-4">{inscricao.whatsapp}</td>
                      <td className="py-3 px-4">{inscricao.cpf}</td>
                      <td className="py-3 px-4">
                        {inscricao.portfolio === 'Typeform' ? (
                          <a 
                            href="https://admin.typeform.com/form/MEENUFvK/results#responses" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline"
                          >
                            {inscricao.portfolio}
                          </a>
                        ) : (
                          inscricao.portfolio || 'Não informado'
                        )}
                      </td>
                      <td className="py-3 px-4 text-green-400 font-semibold">R$ {(inscricao.valor || 0).toFixed(2)}</td>
                      <td className="py-3 px-4 min-w-[120px]">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap inline-block ${
                          inscricao.status === 'confirmado' || inscricao.status === 'pago' ? 'bg-green-500/20 text-green-300' :
                          inscricao.status === 'pendente' ? 'bg-yellow-500/20 text-yellow-300' :
                          inscricao.status === 'Estornado' ? 'bg-red-500/20 text-red-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {inscricao.status === 'confirmado' || inscricao.status === 'pago' ? '✅ Pago' : 
                           inscricao.status === 'pendente' ? '⏳ Pendente' : 
                           inscricao.status === 'Estornado' ? '❌ Estornado' :
                           '❓ Desconhecido'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {new Date(inscricao.data_criacao).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {inscricao.correlationID && (
                            <button
                              onClick={() => checkPaymentStatus(inscricao.correlationID!)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-medium transition-colors"
                              title="Verificar status do pagamento"
                            >
                              🔍
                            </button>
                          )}
                          <button
                            onClick={() => deleteInscricao(inscricao.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-medium transition-colors"
                            title="Remover inscrição"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tabela Judge & Staff */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/20">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-blue-400">
              👥 Judge & Staff - Inscrições Gratuitas ({inscricoes.filter(i => i.tipo === 'judge' || i.tipo === 'staff').length})
            </h3>
            <button
              onClick={handleReload}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium transition-colors"
            >
              {loading ? '🔄 Carregando...' : '🔄 Atualizar'}
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-white/80">Carregando inscrições judge & staff...</p>
            </div>
          ) : inscricoes.filter(i => i.tipo === 'judge' || i.tipo === 'staff').length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/80">Nenhuma inscrição judge & staff encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full min-w-[600px] sm:min-w-0">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4">Nome</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">WhatsApp</th>
                    <th className="text-left py-3 px-4 min-w-[100px]">Tipo</th>
                    <th className="text-left py-3 px-4">Data de Inscrição</th>
                    <th className="text-left py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {inscricoes.filter(i => i.tipo === 'judge' || i.tipo === 'staff').map((inscricao) => (
                    <tr key={inscricao.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-3 px-4">{inscricao.nome}</td>
                      <td className="py-3 px-4">{inscricao.email}</td>
                      <td className="py-3 px-4">{inscricao.whatsapp}</td>
                      <td className="py-3 px-4 min-w-[100px]">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap inline-block ${
                          inscricao.tipo === 'judge' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {inscricao.tipo === 'judge' ? '👨‍⚖️ Judge' : '👥 Staff'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {new Date(inscricao.data_criacao).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => deleteInscricao(inscricao.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-medium transition-colors"
                            title="Remover inscrição"
                          >
                            🗑️
                          </button>
                        </div>
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