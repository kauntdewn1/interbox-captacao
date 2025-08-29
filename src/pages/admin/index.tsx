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

  // Função para limpar e normalizar dados
  const limparDadosAutomaticamente = useCallback((inscricoes: Inscricao[]): Inscricao[] => {
    try {
      console.log('Executando limpeza automática...');
      
      // Dados pré-definidos para restauração
      const dadosRecuperados: Inscricao[] = [
        {
          id: `judge_bruno_peixoto_${Date.now()}`,
          nome: 'Bruno Peixoto Santos Borges',
          email: 'brunaocross85@gmail.com',
          whatsapp: '62981660285',
          cpf: 'CPF não informado',
          tipo: 'judge',
          valor: 0,
          status: 'cadastrado',
          data_criacao: '2025-08-28T21:50:00.000Z',
          data_atualizacao: new Date().toISOString(),
          experiencia: 'Experiência não informada',
          disponibilidade: 'Disponibilidade não informada',
          motivacao: 'Motivação não informada',
          certificacoes: 'Certificações não informadas'
        },
        {
          id: `judge_olavo_filipe_${Date.now()}`,
          nome: 'Olavo Filipe Ferreira Leal',
          email: 'olavofilipeleal@gmail.com',
          whatsapp: '(62) 9 9909-6846',
          cpf: 'CPF não informado',
          tipo: 'judge',
          valor: 0,
          status: 'cadastrado',
          data_criacao: '2025-08-28T21:50:00.000Z',
          data_atualizacao: new Date().toISOString(),
          experiencia: 'Experiência não informada',
          disponibilidade: 'Disponibilidade não informada',
          motivacao: 'Motivação não informada',
          certificacoes: 'Certificações não informadas'
        }
      ];
      
      // Atualizar dados existentes com informações corretas
      const inscricoesAtualizadas = inscricoes.map((inscricao: Inscricao) => {
        // Mapeamento de atualizações por nome
        const atualizacoes: Record<string, Partial<Inscricao>> = {
          'RAFAEL MESSIAS DOS SANTOS': {
            email: 'puroestiloacessorios@outlook.com',
            whatsapp: '62 98268-5031',
            portfolio: 'Typeform'
          },
          'Waldinez de Oliveira Luz Junior': {
            email: 'cobyti18@gmail.com',
            portfolio: 'Typeform'
          },
          'André Luiz Corrêa dos Santos': {
            email: 'andrelcds30@gmail.com',
            whatsapp: '62 98217-3637',
            portfolio: 'Typeform'
          },
          'RENATA CRISTINA COSTA E SILVA': {
            email: 'rebioespecifica@gmail.com',
            whatsapp: '62 99122-3167',
            portfolio: 'Typeform'
          },
          'RODRIGO JOSE GONCALVES': {
            email: 'rodrigojosegoncalves@hotmail.com',
            whatsapp: '62 99391-3203',
            portfolio: 'Typeform'
          },
          'DANIEL VIEIRA DE SOUZA': {
            whatsapp: '62 99110-2615',
            status: 'Estornado'
          },
          'Luciana Rodrigues Lopes de Oliveira': {
            whatsapp: '62 998593-3971',
            status: 'Estornado'
          }
        };

        const atualizacao = atualizacoes[inscricao.nome];
        if (atualizacao) {
          return { ...inscricao, ...atualizacao };
        }

        // Atualizar portfólio para todos os audiovisual
        if (inscricao.tipo === 'audiovisual') {
          return { ...inscricao, portfolio: 'Typeform' };
        }

        return inscricao;
      });
      
      // Remover dados falsos (começam com "Candidato")
      const inscricoesLimpas = inscricoesAtualizadas.filter((inscricao: Inscricao) => {
        return !inscricao.nome.startsWith('Candidato');
      });
      
      // Verificar se Bruno e Olavo já existem
      const brunoExiste = inscricoesLimpas.some(i => i.email === 'brunaocross85@gmail.com');
      const olavoExiste = inscricoesLimpas.some(i => i.email === 'olavofilipeleal@gmail.com');
      
      // Adicionar dados recuperados se não existirem
      const inscricoesFinais = [
        ...inscricoesLimpas,
        ...(brunoExiste ? [] : [dadosRecuperados[0]]),
        ...(olavoExiste ? [] : [dadosRecuperados[1]])
      ];
      
      // Adicionar Leonardo Jaime se não existir
      const leonardoExiste = inscricoesFinais.some(i => i.email === 'leonardojaime.s235@gmail.com');
      if (!leonardoExiste) {
        const leonardoJaime: Inscricao = {
          id: `staff_leonardo_jaime_${Date.now()}`,
          nome: 'Leonardo Jaime',
          email: 'leonardojaime.s235@gmail.com',
          whatsapp: '62 993814700',
          cpf: 'CPF não informado',
          tipo: 'staff',
          valor: 0,
          status: 'cadastrado',
          data_criacao: new Date().toISOString(),
          data_atualizacao: new Date().toISOString(),
          experiencia: 'Experiência não informada',
          disponibilidade: 'Disponibilidade não informada',
          motivacao: 'Motivação não informada'
        };
        inscricoesFinais.push(leonardoJaime);
      }
      
      console.log(`Limpeza automática concluída: ${inscricoes.length} → ${inscricoesFinais.length} inscrições`);
      return inscricoesFinais;
      
    } catch (error) {
      console.error('Erro na limpeza automática:', error);
      return inscricoes;
    }
  }, []);

  // Função principal para carregar dados
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Carregar dados do localStorage
      const inscricoesLocal: Inscricao[] = JSON.parse(localStorage.getItem('interbox_inscricoes') || '[]');
      console.log('Dados locais carregados:', inscricoesLocal.length);
      
      const todasInscricoes = [...inscricoesLocal];

      // Tentar sincronizar com servidor
      try {
        const response = await fetch('https://interbox-captacao.netlify.app/.netlify/functions/real-time-sync', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer interbox2025'
          }
        });
        
        if (response.ok) {
          const serverData = await response.json();
          console.log('Dados do servidor:', serverData.inscricoes?.length || 0);
          
          // Combinar dados sem duplicatas
          if (serverData.inscricoes?.length > 0) {
            serverData.inscricoes.forEach((inscricao: Inscricao) => {
              const existeLocal = inscricoesLocal.find((i: Inscricao) => 
                i.id === inscricao.id || 
                i.correlationID === inscricao.correlationID ||
                (i.email === inscricao.email && i.tipo === inscricao.tipo)
              );
              if (!existeLocal) {
                todasInscricoes.push(inscricao);
              }
            });
          }
        }
      } catch (error) {
        console.log('Servidor não disponível, usando dados locais:', error);
      }

      // Aplicar limpeza automática
      const inscricoesLimpos = limparDadosAutomaticamente(todasInscricoes);
      
      // Aplicar filtros
      const inscricoesFiltradas = aplicarFiltros(inscricoesLimpos, filtros);
      setInscricoes(inscricoesFiltradas);
      
      // Atualizar localStorage com dados limpos
      localStorage.setItem('interbox_inscricoes', JSON.stringify(inscricoesLimpos));
      
      // Calcular estatísticas
      const stats: Estatisticas = {
        total_inscricoes: inscricoesLimpos.length,
        tipos: {
          judge: inscricoesLimpos.filter(i => i.tipo === 'judge').length,
          audiovisual: inscricoesLimpos.filter(i => i.tipo === 'audiovisual').length,
          staff: inscricoesLimpos.filter(i => i.tipo === 'staff').length
        },
        valor_total: inscricoesLimpos.reduce((total, i) => total + (i.valor || 0), 0),
        inscricoes_por_mes: {}
      };
      
      setEstatisticas(stats);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [filtros, aplicarFiltros, limparDadosAutomaticamente]);

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
      const inscricoesLocal: Inscricao[] = JSON.parse(localStorage.getItem('interbox_inscricoes') || '[]');
      let inscricoesAtualizadas = 0;
      let inscricoesNovas = 0;

      // IDs conhecidos para verificação
      const idsParaTestar = [
        'interbox_staff_1756323495080',
        'interbox_audiovisual_1756299983259', 
        'interbox_judge_1756295652996',
        'interbox_judge_1756295592591',
        'audiovisual-969c7cc1-2a96-4555-841e-a4b6cfc0515b',
        'judge-4092b61b-ac8a-45e9-8719-98459b821db7',
        'audiovisual-5afa3a05-a3aa-4b9e-8c3e-2188fcd4444e',
        'audiovisual-02f9c9c6-c1a1-43c8-86ec-e019e826330e',
        'audiovisual-8b78a81e-fc88-4da3-b460-b37426c13fb6',
        'judge-78aa15a8-4ff9-4a0f-acd2-06cd868f7bb7',
        'audiovisual-0bbaa801-d197-4f32-b5b4-4b731d95b22c',
        'audiovisual-96297a5a-451d-47fd-b9cb-7055ea13cf0c'
      ];

      for (const chargeId of idsParaTestar) {
        try {
          const existeLocal = inscricoesLocal.find(i => 
            i.correlationID === chargeId || i.charge_id === chargeId
          );

          const response = await fetch(`https://interbox-captacao.netlify.app/.netlify/functions/check-charge?chargeId=${chargeId}`);
          
          if (response.ok) {
            const data = await response.json();
            
                         if (data.success && data.charge) {
               if (existeLocal) {
                 // Atualizar existente
                 existeLocal.status = 'confirmado';
                 existeLocal.data_confirmacao = new Date().toISOString();
                 inscricoesAtualizadas++;
               } else {
                 // Criar nova inscrição
                 const charge = data.charge.charge || data.charge;
                const novaInscricao: Inscricao = {
                  id: `insc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  nome: charge.customer?.name || 'Cliente',
                  email: charge.customer?.email || 'email@nao.informado',
                  whatsapp: charge.customer?.phone || 'WhatsApp não informado',
                  cpf: charge.customer?.taxID?.taxID || 'CPF não informado',
                  tipo: chargeId.includes('judge') ? 'judge' : chargeId.includes('audiovisual') ? 'audiovisual' : 'staff',
                  valor: charge.value || (chargeId.includes('audiovisual') ? 2990 : 1990),
                  correlationID: chargeId,
                  status: 'confirmado',
                  data_criacao: charge.createdAt || new Date().toISOString(),
                  data_confirmacao: charge.updatedAt || new Date().toISOString(),
                  charge_id: charge.identifier || chargeId
                };
                
                inscricoesLocal.push(novaInscricao);
                inscricoesNovas++;
              }
            }
          }
          
          // Delay entre requisições
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Erro ao processar ${chargeId}:`, error);
        }
      }

      // Salvar dados atualizados
      localStorage.setItem('interbox_inscricoes', JSON.stringify(inscricoesLocal));
      
      // Recarregar dados
      await loadData();
      
      alert(`Sincronização concluída!\n${inscricoesAtualizadas} atualizadas, ${inscricoesNovas} novas.`);
      
    } catch (error) {
      console.error('Erro na sincronização:', error);
      alert('Erro durante a sincronização.');
    } finally { 
      setIsSyncing(false);
    }
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
              onClick={loadData}
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
              onClick={loadData}
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4">Nome</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">WhatsApp</th>
                    <th className="text-left py-3 px-4">CPF</th>
                    <th className="text-left py-3 px-4">Portfolio</th>
                    <th className="text-left py-3 px-4">Valor</th>
                    <th className="text-left py-3 px-4">Status</th>
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
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
              onClick={loadData}
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4">Nome</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">WhatsApp</th>
                    <th className="text-left py-3 px-4">Tipo</th>
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
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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