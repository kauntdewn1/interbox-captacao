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
  correlationID?: string;
  charge_id?: string;
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
  const [isSyncing, setIsSyncing] = useState(false);
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
      // 🆕 PRIMEIRO: Carregar dados do localStorage
      const inscricoesLocal = JSON.parse(localStorage.getItem('interbox_inscricoes') || '[]');
      console.log('📱 Dados locais carregados:', inscricoesLocal);
      
      // 🆕 SEGUNDO: Tentar sincronizar com servidor (se disponível)
      try {
        const inscricoesResponse = await fetch(`${ADMIN_API_BASE}/inscricoes?${new URLSearchParams(filtros)}`);
        if (inscricoesResponse.ok) {
          const inscricoesData = await inscricoesResponse.json();
          console.log('🌐 Dados do servidor:', inscricoesData.data || []);
          
          // Combinar dados locais e do servidor
          const todasInscricoes = [...inscricoesLocal, ...(inscricoesData.data || [])];
          
          // 🆕 APLICAR FILTROS aos dados combinados
          const inscricoesFiltradas = aplicarFiltros(todasInscricoes, filtros);
          setInscricoes(inscricoesFiltradas);
        } else {
          // Se servidor não estiver disponível, usar apenas dados locais com filtros
          const inscricoesFiltradas = aplicarFiltros(inscricoesLocal, filtros);
          setInscricoes(inscricoesFiltradas);
        }
      } catch {
        console.log('⚠️ Servidor não disponível, usando dados locais');
        const inscricoesFiltradas = aplicarFiltros(inscricoesLocal, filtros);
        setInscricoes(inscricoesFiltradas);
      }

      // 🆕 Calcular estatísticas dos dados locais
      const stats = {
        total_inscricoes: inscricoesLocal.length,
        tipos: {
          judge: inscricoesLocal.filter((i: Inscricao) => i.tipo === 'judge').length,
          audiovisual: inscricoesLocal.filter((i: Inscricao) => i.tipo === 'audiovisual').length,
          staff: inscricoesLocal.filter((i: Inscricao) => i.tipo === 'staff').length
        },
        valor_total: inscricoesLocal.reduce((total: number, i: Inscricao) => total + i.valor, 0),
        inscricoes_por_mes: {} // Campo obrigatório da interface
      };
      
      setEstatisticas(stats);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // 🔍 Função para aplicar filtros
  const aplicarFiltros = (inscricoes: Inscricao[], filtros: Record<string, string>) => {
    let inscricoesFiltradas = [...inscricoes];
    
    // Filtro por tipo
    if (filtros.tipo && filtros.tipo !== '') {
      inscricoesFiltradas = inscricoesFiltradas.filter(i => i.tipo === filtros.tipo);
      console.log(`🔍 Filtro tipo "${filtros.tipo}": ${inscricoesFiltradas.length} inscrições`);
    }
    
    // Filtro por status
    if (filtros.status && filtros.status !== '') {
      inscricoesFiltradas = inscricoesFiltradas.filter(i => i.status === filtros.status);
      console.log(`🔍 Filtro status "${filtros.status}": ${inscricoesFiltradas.length} inscrições`);
    }
    
    // Filtro por data início
    if (filtros.data_inicio && filtros.data_inicio !== '') {
      inscricoesFiltradas = inscricoesFiltradas.filter(i => {
        const dataInscricao = new Date(i.data_criacao);
        const dataInicio = new Date(filtros.data_inicio);
        return dataInscricao >= dataInicio;
      });
      console.log(`🔍 Filtro data início "${filtros.data_inicio}": ${inscricoesFiltradas.length} inscrições`);
    }
    
    // Filtro por data fim
    if (filtros.data_fim && filtros.data_fim !== '') {
      inscricoesFiltradas = inscricoesFiltradas.filter(i => {
        const dataInscricao = new Date(i.data_criacao);
        const dataFim = new Date(filtros.data_fim);
        return dataInscricao <= dataFim;
      });
      console.log(`🔍 Filtro data fim "${filtros.data_fim}": ${inscricoesFiltradas.length} inscrições`);
    }
    
    console.log(`🎯 Total de inscrições após filtros: ${inscricoesFiltradas.length}`);
    return inscricoesFiltradas;
  };

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

  // 🔍 Verificar status do pagamento
  const checkPaymentStatus = async (correlationID: string | undefined) => {
    if (!correlationID) {
      alert('❌ ID de correlação não encontrado');
      return;
    }
    try {
      const response = await fetch(`https://interbox-captacao.netlify.app/.netlify/functions/check-charge?chargeId=${correlationID}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.charge) {
          const charge = data.charge;
          
          // 🎯 CORREÇÃO: A API retorna charge.charge (estrutura aninhada)
          const chargeData = charge.charge || charge;
          const newStatus = chargeData.status === 'COMPLETED' || charge.paid ? 'confirmado' : 'pendente';
          
          console.log(`🔍 Lupa - Status da Woovi: ${chargeData.status}, Status calculado: ${newStatus}`);
          
          // Atualizar status no localStorage
          const inscricoesLocal = JSON.parse(localStorage.getItem('interbox_inscricoes') || '[]');
          const inscricaoIndex = inscricoesLocal.findIndex((i: Inscricao) => i.correlationID === correlationID);
          
          if (inscricaoIndex !== -1) {
            inscricoesLocal[inscricaoIndex].status = newStatus;
            if (newStatus === 'confirmado') {
              inscricoesLocal[inscricaoIndex].data_confirmacao = new Date().toISOString();
            }
            localStorage.setItem('interbox_inscricoes', JSON.stringify(inscricoesLocal));
            
            // Recarregar dados
            loadData();
            
            alert(`Status atualizado: ${newStatus === 'confirmado' ? '✅ Pagamento confirmado!' : '⏳ Ainda pendente'}`);
          }
        } else {
          alert('❌ Erro ao verificar status do pagamento');
        }
      } else {
        alert('❌ Erro ao conectar com a API de pagamento');
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      alert('❌ Erro ao verificar status do pagamento');
    }
  };

  // 🔄 Sincronizar com plataforma Woovi/OpenPix
  const syncWithWoovi = async () => {
    setIsSyncing(true);
    try {
      // Buscar todas as inscrições locais
      const inscricoesLocal = JSON.parse(localStorage.getItem('interbox_inscricoes') || '[]');
      let inscricoesAtualizadas = 0;
      let inscricoesNovas = 0;
      
      // 🆕 PRIMEIRA ETAPA: Verificar status de inscrições locais existentes
      for (const inscricao of inscricoesLocal) {
        if (inscricao.correlationID) {
          try {
            const response = await fetch(`https://interbox-captacao.netlify.app/.netlify/functions/check-charge?chargeId=${inscricao.correlationID}`);
            
            if (response.ok) {
              const data = await response.json();
              
              if (data.success && data.charge) {
                const charge = data.charge;
                
                // 🎯 CORREÇÃO: A API retorna charge.charge (estrutura aninhada)
                const chargeData = charge.charge || charge;
                const newStatus = chargeData.status === 'COMPLETED' || charge.paid ? 'confirmado' : 'pendente';
                
                if (inscricao.status !== newStatus) {
                  inscricao.status = newStatus;
                  if (newStatus === 'confirmado') {
                    inscricao.data_confirmacao = new Date().toISOString();
                  }
                  inscricoesAtualizadas++;
                }
              }
            }
            
            // Aguardar um pouco entre as requisições para não sobrecarregar a API
            await new Promise(resolve => setTimeout(resolve, 300));
            
          } catch (error) {
            console.error(`Erro ao verificar inscrição ${inscricao.id}:`, error);
          }
        }
      }
      
      // 🆕 SEGUNDA ETAPA: Buscar charges confirmadas que não estão no localStorage
      try {
        // 🎯 TESTAR COM IDs REAIS DAS COMPRAS CONFIRMADAS
        const idsParaTestar = [
          // IDs novos (formato interbox_)
          'interbox_staff_1756323495080',
          'interbox_audiovisual_1756299983259', 
          'interbox_judge_1756295652996',
          'interbox_judge_1756295592591',
          
          // IDs antigos (formato uuid)
          'audiovisual-969c7cc1-2a96-4555-841e-a4b6cfc0515b',
          'judge-4092b61b-ac8a-45e9-8719-98459b821db7',
          'audiovisual-5afa3a05-a3aa-4b9e-8c3e-2188fcd4444e',
          'audiovisual-02f9c9c6-c1a1-43c8-86ec-e019e826330e',
          'audiovisual-8b78a81e-fc88-4da3-b460-b37426c13fb6',
          'judge-78aa15a8-4ff9-4a0f-acd2-06cd868f7bb7',
          'audiovisual-0bbaa801-d197-4f32-b5b4-4b731d95b22c',
          'audiovisual-96297a5a-451d-47fd-b9cb-7055ea13cf0c'
        ];
        
        console.log('🔍 Testando sincronização com IDs reais...');
        
        for (const chargeId of idsParaTestar) {
          try {
            // Verificar se já existe no localStorage
            const existeLocal = inscricoesLocal.find((i: Inscricao) => 
              i.correlationID === chargeId || i.charge_id === chargeId
            );
            
            console.log(`🔍 Verificando ${chargeId}:`, existeLocal ? 'Já existe' : 'Nova inscrição');
            
            if (existeLocal) {
              // 🆕 ATUALIZAR inscrição existente com dados reais da Woovi
              console.log(`🔄 Atualizando inscrição existente:`, existeLocal.id);
              
              try {
                const response = await fetch(`https://interbox-captacao.netlify.app/.netlify/functions/check-charge?chargeId=${chargeId}`);
                
                if (response.ok) {
                  const data = await response.json();
                  console.log(`📡 Dados da Woovi para ${chargeId}:`, data);
                  
                  if (data.success && data.charge) {
                    const charge = data.charge;
                    const chargeData = charge.charge || charge;
                    
                    // Atualizar dados com informações reais da Woovi
                    existeLocal.nome = extractNameFromCharge(chargeData, chargeId);
                    existeLocal.email = chargeData.customer?.email || 'email@nao.informado';
                    existeLocal.whatsapp = chargeData.customer?.phone || 'WhatsApp não informado';
                    existeLocal.cpf = chargeData.customer?.taxID?.taxID || chargeData.customer?.taxID || 'CPF não informado';
                    existeLocal.valor = extractValueFromCharge(chargeData, chargeId);
                    existeLocal.status = 'confirmado';
                    existeLocal.data_criacao = chargeData.createdAt || existeLocal.data_criacao;
                    existeLocal.data_confirmacao = chargeData.updatedAt || new Date().toISOString();
                    existeLocal.charge_id = chargeData.identifier || chargeId;
                    
                    inscricoesAtualizadas++;
                    console.log(`✅ Inscrição atualizada:`, existeLocal);
                  }
                }
              } catch (error) {
                console.error(`❌ Erro ao atualizar ${chargeId}:`, error);
              }
            } else {
              // Criar nova inscrição se não existir
              console.log(`🔍 Testando charge: ${chargeId}`);
              
              // Testar API com ID específico
              const response = await fetch(`https://interbox-captacao.netlify.app/.netlify/functions/check-charge?chargeId=${chargeId}`);
              
              if (response.ok) {
                const data = await response.json();
                console.log(`📡 Resposta para ${chargeId}:`, data);
                
                if (data.success && data.charge) {
                  const charge = data.charge;
                  
                  // 🎯 CORREÇÃO: A API retorna charge.charge (estrutura aninhada)
                  const chargeData = charge.charge || charge;
                  
                  // Criar nova inscrição para charge confirmada
                  const novaInscricao = {
                    id: `insc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    nome: extractNameFromCharge(chargeData, chargeId),
                    email: chargeData.customer?.email || 'email@nao.informado',
                    whatsapp: chargeData.customer?.phone || 'WhatsApp não informado',
                    cpf: chargeData.customer?.taxID?.taxID || chargeData.customer?.taxID || 'CPF não informado',
                    tipo: extractTypeFromCorrelationID(chargeId),
                    valor: extractValueFromCharge(chargeData, chargeId),
                    correlationID: chargeId,
                    status: 'confirmado',
                    data_criacao: chargeData.createdAt || new Date().toISOString(),
                    data_confirmacao: chargeData.updatedAt || new Date().toISOString(),
                    charge_id: chargeData.identifier || chargeId
                  };
                  
                  inscricoesLocal.push(novaInscricao);
                  inscricoesNovas++;
                  console.log(`✅ Nova inscrição criada:`, novaInscricao);
                  console.log(`📊 Total de inscrições agora:`, inscricoesLocal.length);
                }
              } else {
                console.log(`❌ Erro ao buscar ${chargeId}:`, response.status);
              }
              
              // Aguardar entre requisições
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          } catch (error) {
            console.error(`❌ Erro ao processar ${chargeId}:`, error);
          }
        }
        
        console.log(`🎯 Sincronização concluída: ${inscricoesAtualizadas} inscrições atualizadas, ${inscricoesNovas} novas inscrições encontradas`);
        
      } catch (error) {
        console.error('❌ Erro na busca por IDs específicos:', error);
      }
      
      // Salvar dados atualizados
      localStorage.setItem('interbox_inscricoes', JSON.stringify(inscricoesLocal));
      
      // Recarregar dados
      await loadData();
      
              alert(`🔄 Sincronização concluída!\n${inscricoesAtualizadas} inscrições atualizadas com dados reais.\n${inscricoesNovas} novas inscrições encontradas.`);
      
    } catch (error) {
      console.error('Erro na sincronização:', error);
      alert('❌ Erro durante a sincronização');
    } finally {
      setIsSyncing(false);
    }
  };

  // 🔧 Função auxiliar para extrair tipo da inscrição
  const extractTypeFromCorrelationID = (correlationID: string): 'judge' | 'audiovisual' | 'staff' => {
    if (correlationID.includes('judge')) return 'judge';
    if (correlationID.includes('audiovisual')) return 'audiovisual';
    if (correlationID.includes('staff')) return 'staff';
    return 'audiovisual'; // padrão
  };

  // 🔧 Função auxiliar para extrair nome da charge
  const extractNameFromCharge = (charge: Record<string, unknown>, chargeId: string): string => {
    console.log('🔍 Extraindo nome de:', charge);
    console.log('🔍 Customer object:', charge.customer);
    
    if (charge.customer && typeof charge.customer === 'object' && 'name' in charge.customer && typeof charge.customer.name === 'string') {
      console.log('✅ Nome encontrado:', charge.customer.name);
      return charge.customer.name;
    }
    if (charge.customer && typeof charge.customer === 'object' && 'email' in charge.customer && typeof charge.customer.email === 'string') {
      console.log('✅ Email encontrado:', charge.customer.email);
      return charge.customer.email.split('@')[0];
    }
    
    // Extrair nome do chargeId se possível
    if (chargeId.includes('interbox_')) {
      const nomeExtraido = chargeId.split('_')[2] || 'Cliente';
      console.log('✅ Nome extraído do ID:', nomeExtraido);
      return nomeExtraido;
    }
    
    console.log('⚠️ Nome não encontrado, usando padrão');
    return 'Cliente';
  };

  // 🔧 Função auxiliar para extrair valor da charge
  const extractValueFromCharge = (charge: Record<string, unknown>, chargeId: string): number => {
    if (charge.value && typeof charge.value === 'number') return charge.value;
    
    // Extrair valor baseado no tipo
    const tipo = extractTypeFromCorrelationID(chargeId);
    if (tipo === 'audiovisual') return 2990; // R$ 29,90
    if (tipo === 'judge' || tipo === 'staff') return 1990; // R$ 19,90
    
    return 1990; // padrão
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
              onClick={syncWithWoovi}
              disabled={isSyncing}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl font-medium transition-colors"
            >
              {isSyncing ? '🔄 Sincronizando...' : '🔄 Sincronizar com Woovi'}
            </button>
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
                    <th className="text-left py-3 px-4">Status</th>
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          inscricao.status === 'confirmado' ? 'bg-green-500/20 text-green-300' :
                          inscricao.status === 'pendente' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {inscricao.status === 'confirmado' ? '✅ Pago' : 
                           inscricao.status === 'pendente' ? '⏳ Pendente' : 
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
                              onClick={() => checkPaymentStatus(inscricao.correlationID)}
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
      </div>
    </div>
  );
}
