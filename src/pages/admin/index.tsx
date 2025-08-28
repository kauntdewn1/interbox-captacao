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

export default function AdminDashboard() {
  const [inscricoes , setInscricoes] = useState<Inscricao[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    tipo: '',
    status: '',
    data_inicio: '',
    data_fim: ''
  });
        

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 🆕 PRIMEIRO: Carregar dados do localStorage
      const inscricoesLocal = JSON.parse(localStorage.getItem('interbox_inscricoes') || '[]');
      console.log('📱 Dados locais carregados:', inscricoesLocal);
      
      // 🆕 SEGUNDO: Tentar sincronizar com servidor (se disponível)
      try {
        const inscricoesResponse = await fetch('https://interbox-captacao.netlify.app/.netlify/functions/real-time-sync', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer interbox2025'
          }
        });
        
        if (inscricoesResponse.ok) {
          const inscricoesData = await inscricoesResponse.json();
          console.log('🌐 Dados do servidor em tempo real:', inscricoesData.inscricoes || []);
          
          // Combinar dados locais e do servidor (evitar duplicatas)
          const todasInscricoes = [...inscricoesLocal];
          
          // Adicionar dados do servidor que não existem localmente
          inscricoesData.inscricoes?.forEach((inscricao: Inscricao) => {
            const existeLocal = inscricoesLocal.find((i: Inscricao) => i.id === inscricao.id || i.correlationID === inscricao.correlationID);
            if (!existeLocal) {
              todasInscricoes.push(inscricao);
            }
          });
          
                // 🧹 LIMPEZA AUTOMÁTICA: Remover dados falsos e adicionar dados verdadeiros
          const inscricoesLimpos = limparDadosAutomaticamente(todasInscricoes);
          
          // 🆕 APLICAR FILTROS aos dados limpos
          const inscricoesFiltradas = aplicarFiltros(inscricoesLimpos, filtros);
          setInscricoes(inscricoesFiltradas);
          
          // Atualizar localStorage com dados limpos
          localStorage.setItem('interbox_inscricoes', JSON.stringify(inscricoesLimpos));
          
          console.log(`✅ Dados sincronizados e limpos: ${inscricoesLocal.length} locais + ${inscricoesData.inscricoes?.length || 0} servidor = ${inscricoesLimpos.length} total (após limpeza)`);
        } else {
          // Se servidor não estiver disponível, usar apenas dados locais com filtros
          const inscricoesFiltradas = aplicarFiltros(inscricoesLocal, filtros);
          setInscricoes(inscricoesFiltradas);
          console.log('⚠️ Servidor não disponível, usando apenas dados locais');
        }
      } catch (error) {
        console.log('⚠️ Servidor não disponível, usando dados locais:', error);
        const inscricoesFiltradas = aplicarFiltros(inscricoesLocal, filtros);
        setInscricoes(inscricoesFiltradas);
      }

      // 🆕 Calcular estatísticas dos dados combinados
      const inscricoesParaStats = inscricoesLocal;
      const stats = {
        total_inscricoes: inscricoesParaStats.length,
        tipos: {
          judge: inscricoesParaStats.filter((i: Inscricao) => i.tipo === 'judge').length,
          audiovisual: inscricoesParaStats.filter((i: Inscricao) => i.tipo === 'audiovisual').length,
          staff: inscricoesParaStats.filter((i: Inscricao) => i.tipo === 'staff').length
        },
        valor_total: inscricoesParaStats.reduce((total: number, i: Inscricao) => total + (i.valor || 0), 0),
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
    console.log(`🔍 Filtros aplicados:`, filtros);
    console.log(`📊 Tipos após filtros:`, {
      total: inscricoesFiltradas.length,
      staff: inscricoesFiltradas.filter(i => i.tipo === 'staff').length,
      judge: inscricoesFiltradas.filter(i => i.tipo === 'judge').length,
      audiovisual: inscricoesFiltradas.filter(i => i.tipo === 'audiovisual').length
    });
    return inscricoesFiltradas;
  };

  // 📊 Carregar dados
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 📤 Exportar dados
  const exportarDados  = () => {
    if (!inscricoes.length) {
      alert('Não há dados para exportar');
      return;
    }
    const dados = inscricoes.map(i => ({
      ...i,
      data_criacao: new Date(i.data_criacao).toLocaleDateString('pt-BR'),
      data_atualizacao: new Date(i.data_atualizacao).toLocaleDateString('pt-BR')
    }));
    const csv = Papa.unparse(dados);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inscricoes_${new Date().toISOString()}.csv`;
    link.click();
  };

  // 🔐 Salvar API Key

  // 🗑️ Remover inscrição

  // 🧹 LIMPEZA AUTOMÁTICA: Remove dados falsos e adiciona dados verdadeiros
  const limparDadosAutomaticamente = (inscricoes: Inscricao[]) => {
    try {
      console.log('🧹 Executando limpeza automática...');
      
      // Dados recuperados com muito custo
      const dadosRecuperados = [
        {
          id: `judge_bruno_peixoto_${Date.now()}`,
          nome: 'Bruno Peixoto Santos Borges',
          email: 'brunaocross85@gmail.com',
          whatsapp: '62981660285',
          cpf: 'CPF não informado',
          tipo: 'judge' as const,
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
          tipo: 'judge' as const,
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
      
      // 🆕 ATUALIZAR DADOS EXISTENTES COM INFORMAÇÕES CORRETAS
      const inscricoesAtualizadas = inscricoes.map((inscricao: Inscricao) => {
        // RAFAEL MESSIAS DOS SANTOS
        if (inscricao.nome === 'RAFAEL MESSIAS DOS SANTOS') {
          return {
            ...inscricao,
            email: 'puroestiloacessorios@outlook.com',
            whatsapp: '62 98268-5031',
            portfolio: 'Typeform'
          };
        }
        
        // Waldinez de Oliveira Luz Junior
        if (inscricao.nome === 'Waldinez de Oliveira Luz Junior') {
          return {
            ...inscricao,
            email: 'cobyti18@gmail.com',
            portfolio: 'Typeform'
          };
        }
        
        // André Luiz Corrêa dos Santos
        if (inscricao.nome === 'André Luiz Corrêa dos Santos') {
          return {
            ...inscricao,
            email: 'andrelcds30@gmail.com',
            whatsapp: '62 98217-3637',
            portfolio: 'Typeform'
          };
        }
        
        // RENATA CRISTINA COSTA E SILVA
        if (inscricao.nome === 'RENATA CRISTINA COSTA E SILVA') {
          return {
            ...inscricao,
            email: 'rebioespecifica@gmail.com',
            whatsapp: '62 99122-3167',
            portfolio: 'Typeform'
          };
        }
        
        // RODRIGO JOSE GONCALVES
        if (inscricao.nome === 'RODRIGO JOSE GONCALVES') {
          return {
            ...inscricao,
            email: 'rodrigojosegoncalves@hotmail.com',
            whatsapp: '62 99391-3203',
            portfolio: 'Typeform'
          };
        }
        
        // DANIEL VIEIRA DE SOUZA
        if (inscricao.nome === 'DANIEL VIEIRA DE SOUZA') {
          return {
            ...inscricao,
            whatsapp: '62 99110-2615',
            status: 'Estornado'
          };
        }
        
        // Luciana Rodrigues Lopes de Oliveira
        if (inscricao.nome === 'Luciana Rodrigues Lopes de Oliveira') {
          return {
            ...inscricao,
            whatsapp: '62 998593-3971',
            status: 'Estornado'
          };
        }
        
        // 🎨 ATUALIZAR PORTFÓLIO PARA TODOS OS AUDIOVISUAL
        if (inscricao.tipo === 'audiovisual') {
          return {
            ...inscricao,
            portfolio: 'Typeform'
          };
        }
        
        // 🆕 ADICIONAR LEONARDO JAIME (STAFF) SE NÃO EXISTIR
        const leonardoExiste = inscricoes.some(i => i.email === 'leonardojaime.s235@gmail.com');
        console.log('🔍 Verificando Leonardo Jaime:', { leonardoExiste, totalInscricoes: inscricoes.length });
        
        if (!leonardoExiste) {
          const leonardoJaime = {
            id: `staff_leonardo_jaime_${Date.now()}`,
            nome: 'Leonardo Jaime',
            email: 'leonardojaime.s235@gmail.com',
            whatsapp: '62 993814700',
            cpf: 'CPF não informado',
            tipo: 'staff' as const,
            valor: 0,
            status: 'cadastrado',
            data_criacao: new Date().toISOString(),
            data_atualizacao: new Date().toISOString(),
            experiencia: 'Experiência não informada',
            disponibilidade: 'Disponibilidade não informada',
            motivacao: 'Motivação não informada'
          };
          inscricoes.push(leonardoJaime);
          console.log('✅ Leonardo Jaime (STAFF) adicionado automaticamente');
          console.log('📊 Dados após adição:', { 
            total: inscricoes.length, 
            staff: inscricoes.filter(i => i.tipo === 'staff').length,
            leonardo: inscricoes.find(i => i.email === 'leonardojaime.s235@gmail.com')
          });
          
          // 🚨 FORÇAR ATUALIZAÇÃO DO ESTADO
          setInscricoes([...inscricoes]);
          
          // 🚨 FORÇAR SALVAMENTO NO LOCALSTORAGE
          localStorage.setItem('interbox_inscricoes', JSON.stringify(inscricoes));
        }
        
        return inscricao;
      });
      
      // 🧹 REMOVER DADOS FALSOS (Candidato staff, Candidato judge, Candidato judge 2)
      const inscricoesLimpas = inscricoesAtualizadas.filter((inscricao: Inscricao) => {
        // Manter apenas dados verdadeiros (não são "Candidato...")
        return !inscricao.nome.startsWith('Candidato');
      });
      
      // Verificar se Bruno e Olavo já existem
      const brunoExiste = inscricoesLimpas.some(i => i.email === 'brunaocross85@gmail.com');
      const olavoExiste = inscricoesLimpas.some(i => i.email === 'olavofilipeleal@gmail.com');
      
      // Adicionar apenas se não existirem
      const inscricoesFinais = [
        ...inscricoesLimpas,
        ...(brunoExiste ? [] : [dadosRecuperados[0]]),
        ...(olavoExiste ? [] : [dadosRecuperados[1]])
      ];
      
      if (!brunoExiste) {
        console.log('✅ Bruno Peixoto adicionado automaticamente');
      }
      
      if (!olavoExiste) {
        console.log('✅ Olavo Filipe adicionado automaticamente');
      }
      
      console.log(`🧹 Limpeza automática concluída: ${inscricoes.length} → ${inscricoesFinais.length} inscrições`);
      return inscricoesFinais;
      
    } catch (error) {
      console.error('❌ Erro na limpeza automática:', error);
      return inscricoes; // Retornar dados originais em caso de erro
    }
  };

  // 🔍 Verificar status do pagamento

  // 🔄 Sincronizar com servidor em tempo real

  // 🚨 FUNÇÃO REMOVIDA - CONFLITAVA COM LIMPEZA AUTOMÁTICA
  // const restoreLostData = async () => {
    if (!confirm('🚨 DADOS PERDIDOS DETECTADOS!\n\nVou restaurar automaticamente todos os dados que você me forneceu anteriormente.\n\nContinuar?')) {
      return;
    }

    try {
      console.log('🚨 Iniciando restauração automática de dados perdidos...');
      
      // Dados que você me forneceu anteriormente
      const dadosPerdidos = [
        {
          id: 'insc_1756323495080_staff_restored',
          nome: 'Candidato staff',
          email: 'staff@interbox.com',
          whatsapp: 'WhatsApp não informado',
          cpf: 'CPF não informado',
          tipo: 'staff',
          valor: 19.90,
          status: 'pago',
          correlationID: 'interbox_staff_1756323495080',
          charge_id: '9fdb64a769a54a0588564e80815452ed',
          data_criacao: '2025-08-27T16:38:00.000Z',
          data_atualizacao: new Date().toISOString(),
          experiencia: 'Experiência não informada',
          disponibilidade: 'Disponibilidade não informada',
          motivacao: 'Motivação não informada'
        },
        {
          id: 'insc_1756299983259_audiovisual_restored',
          nome: 'Candidato audiovisual',
          email: 'audiovisual@interbox.com',
          whatsapp: 'WhatsApp não informado',
          cpf: 'CPF não informado',
          tipo: 'audiovisual',
          valor: 29.90,
          status: 'pago',
          correlationID: 'interbox_audiovisual_1756299983259',
          charge_id: 'd7bae40b44a7455ea34da04d4c1a5f8f',
          data_criacao: '2025-08-27T10:06:00.000Z',
          data_atualizacao: new Date().toISOString(),
          portfolio: 'Portfolio não informado',
          experiencia: 'Experiência não informada',
          disponibilidade: 'Disponibilidade não informada',
          motivacao: 'Motivação não informada'
        },
        {
          id: 'insc_1756295652996_judge_restored',
          nome: 'Candidato judge',
          email: 'judge@interbox.com',
          whatsapp: 'WhatsApp não informado',
          cpf: 'CPF não informado',
          tipo: 'judge',
          valor: 19.90,
          status: 'pago',
          correlationID: 'interbox_judge_1756295652996',
          charge_id: '6e971a79c3b54bbe872251c8f1b78ccc',
          data_criacao: '2025-08-27T08:54:00.000Z',
          data_atualizacao: new Date().toISOString(),
          certificacoes: 'Certificações não informadas',
          experiencia: 'Experiência não informada',
          disponibilidade: 'Disponibilidade não informada',
          motivacao: 'Motivação não informada'
        },
        {
          id: 'insc_1756295592591_judge2_restored',
          nome: 'Candidato judge 2',
          email: 'judge2@interbox.com',
          whatsapp: 'WhatsApp não informado',
          cpf: 'CPF não informado',
          tipo: 'judge',
          valor: 19.90,
          status: 'pago',
          correlationID: 'interbox_judge_1756295592591',
          charge_id: '961080ad66ec4990a77a31f2a3773498',
          data_criacao: '2025-08-27T08:53:00.000Z',
          data_atualizacao: new Date().toISOString(),
          certificacoes: 'Certificações não informadas',
          experiencia: 'Experiência não informada',
          disponibilidade: 'Disponibilidade não informada',
          motivacao: 'Motivação não informada'
        },
        {
          id: 'insc_audiovisual_969c7cc1_restored',
          nome: 'RAFAEL MESSIAS DOS SANTOS',
          email: 'puroestiloacessorios@outlook.com',
          whatsapp: '62 98268-5031',
          cpf: 'CPF não informado',
          tipo: 'audiovisual',
          valor: 29.90,
          status: 'pago',
          correlationID: 'audiovisual-969c7cc1-2a96-4555-841e-a4b6cfc0515b',
          charge_id: 'e7ed9e169fd64dc6b2379969cb0ddc8f',
          data_criacao: '2025-08-24T14:30:00.000Z',
          data_atualizacao: new Date().toISOString(),
          portfolio: 'Portfolio não informado',
          experiencia: 'Experiência não informada',
          disponibilidade: 'Disponibilidade não informada',
          motivacao: 'Motivação não informada'
        },
        {
          id: 'insc_judge_4092b61b_restored',
          nome: 'DANIEL VIEIRA DE SOUZA',
          email: 'daniel@interbox.com',
          whatsapp: '62 99110-2615',
          cpf: 'CPF não informado',
          tipo: 'judge',
          valor: 19.90,
          status: 'Estornado',
          correlationID: 'judge-4092b61b-ac8a-45e9-8719-98459b821db7',
          charge_id: 'de49c553102b45d79a4298844915026f',
          data_criacao: '2025-08-24T10:37:00.000Z',
          data_atualizacao: new Date().toISOString(),
          certificacoes: 'Certificações não informadas',
          experiencia: 'Experiência não informada',
          disponibilidade: 'Disponibilidade não informada',
          motivacao: 'Motivação não informada'
        },
        {
          id: 'insc_audiovisual_5afa3a05_restored',
          nome: 'BASE CRIATIVA DIGIT',
          email: 'base@interbox.com',
          whatsapp: 'WhatsApp não informado',
          cpf: 'CPF não informado',
          tipo: 'audiovisual',
          valor: 29.90,
          status: 'pago',
          correlationID: 'audiovisual-5afa3a05-a3aa-4b9e-8c3e-2188fcd4444e',
          charge_id: 'af323149658d4cc297105a680c5b082f',
          data_criacao: '2025-08-23T18:35:00.000Z',
          data_atualizacao: new Date().toISOString(),
          portfolio: 'Portfolio não informado',
          experiencia: 'Experiência não informada',
          disponibilidade: 'Disponibilidade não informada',
          motivacao: 'Motivação não informada'
        },
        {
          id: 'insc_audiovisual_02f9c9c6_restored',
          nome: 'Waldinez de Oliveira Luz Junior',
          email: 'cobyti18@gmail.com',
          whatsapp: 'WhatsApp não informado',
          cpf: 'CPF não informado',
          tipo: 'audiovisual',
          valor: 29.90,
          status: 'pago',
          correlationID: 'audiovisual-02f9c9c6-c1a1-43c8-86ec-e019e826330e',
          charge_id: '52aa88164b7346e093e62f89f7abfddd',
          data_criacao: '2025-08-23T15:01:00.000Z',
          data_atualizacao: new Date().toISOString(),
          portfolio: 'Portfolio não informado',
          experiencia: 'Experiência não informada',
          disponibilidade: 'Disponibilidade não informada',
          motivacao: 'Motivação não informada'
        },
        {
          id: 'insc_audiovisual_8b78a81e_restored',
          nome: 'André Luiz Corrêa dos Santos',
          email: 'andrelcds30@gmail.com',
          whatsapp: '62 98217-3637',
          cpf: 'CPF não informado',
          tipo: 'audiovisual',
          valor: 29.90,
          status: 'pago',
          correlationID: 'audiovisual-8b78a81e-fc88-4da3-b460-b37426c13fb6',
          charge_id: '9ff2a15022db47879e0f358c8e61cabf',
          data_criacao: '2025-08-23T14:52:00.000Z',
          data_atualizacao: new Date().toISOString(),
          portfolio: 'Portfolio não informado',
          experiencia: 'Experiência não informada',
          disponibilidade: 'Disponibilidade não informada',
          motivacao: 'Motivação não informada'
        },
        {
          id: 'insc_judge_78aa15a8_restored',
          nome: 'Luciana Rodrigues Lopes de Oliveira',
          email: 'luciana@interbox.com',
          whatsapp: '62 998593-3971',
          cpf: 'CPF não informado',
          tipo: 'judge',
          valor: 19.90,
          status: 'Estornado',
          correlationID: 'judge-78aa15a8-4ff9-4a0f-acd2-06cd868f7bb7',
          charge_id: 'efecfa6c2b844b8486ab2c22965de923',
          data_criacao: '2025-08-23T13:49:00.000Z',
          data_atualizacao: new Date().toISOString(),
          certificacoes: 'Certificações não informadas',
          experiencia: 'Experiência não informada',
          disponibilidade: 'Disponibilidade não informada',
          motivacao: 'Motivação não informada'
        },
        {
          id: 'insc_audiovisual_0bbaa801_restored',
          nome: 'RENATA CRISTINA COSTA E SILVA',
          email: 'rebioespecifica@gmail.com',
          whatsapp: '62 99122-3167',
          cpf: 'CPF não informado',
          tipo: 'audiovisual',
          valor: 29.90,
          status: 'pago',
          correlationID: 'audiovisual-0bbaa801-d197-4f32-b5b4-4b731d95b22c',
          charge_id: 'e8b9651388d64c979c9b468083dfca55',
          data_criacao: '2025-08-23T10:35:00.000Z',
          data_atualizacao: new Date().toISOString(),
          portfolio: 'Portfolio não informado',
          experiencia: 'Experiência não informada',
          disponibilidade: 'Disponibilidade não informada',
          motivacao: 'Motivação não informada'
        },
        {
          id: 'insc_audiovisual_96297a5a_restored',
          nome: 'RODRIGO JOSE GONCALVES',
          email: 'rodrigojosegoncalves@hotmail.com',
          whatsapp: '62 99391-3203',
          cpf: 'CPF não informado',
          tipo: 'audiovisual',
          valor: 29.90,
          status: 'pago',
          correlationID: 'audiovisual-96297a5a-451d-47fd-b9cb-7055ea13cf0c',
          charge_id: 'd5943732463b459192db180811cd6a33',
          data_criacao: '2025-08-23T10:35:00.000Z',
          data_atualizacao: new Date().toISOString(),
          portfolio: 'Portfolio não informado',
          experiencia: 'Experiência não informada',
          disponibilidade: 'Disponibilidade não informada',
          motivacao: 'Motivação não informada'
        }
      ];
      
      console.log(`🚨 Restaurando ${dadosPerdidos.length} inscrições perdidas...`);
      
      // Salvar no localStorage
      localStorage.setItem('interbox_inscricoes', JSON.stringify(dadosPerdidos));
      
      // Sincronizar com servidor usando real-time-sync
      const deviceId = `device_restore_${Date.now()}`;
      
      const response = await fetch('https://interbox-captacao.netlify.app/.netlify/functions/real-time-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer interbox2025'
        },
        body: JSON.stringify({ 
          inscricoes: dadosPerdidos,
          deviceId: deviceId
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`🚨 RESTAURAÇÃO CONCLUÍDA!\n\n✅ ${dadosPerdidos.length} inscrições restauradas!\n\nDados sincronizados com o servidor em tempo real.`);
        console.log('🚨 Restauração concluída:', result);
        
        // Recarregar dados
        loadData();
      } else {
        throw new Error('Erro na sincronização com servidor');
      }
      
    } catch (error) {
      console.error('❌ Erro na restauração:', error);
      alert('❌ Erro na restauração automática');
    }
  };

  // 🔄 Sincronizar com plataforma FlowPay/OpenPix
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
      
      // 🆕 SEGUNDA ETAPA: Buscar TODAS as charges da FlowPay
      try {
        console.log('🔍 Buscando TODAS as inscrições da FlowPay...');
        
        // 🎯 BUSCAR TODAS AS CHARGES (não apenas as 12 hardcoded)
        // Vamos usar a API de listagem da FlowPay para pegar todas
        const response = await fetch('https://interbox-captacao.netlify.app/.netlify/functions/real-time-sync', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer interbox2025'
          }
        });
        
        if (response.ok) {
          const serverData = await response.json();
          console.log('📡 Dados do servidor:', serverData);
          
          if (serverData.inscricoes && serverData.inscricoes.length > 0) {
            console.log(`🎯 Encontradas ${serverData.inscricoes.length} inscrições no servidor`);
            
            // Adicionar todas as inscrições do servidor que não estão no localStorage
            for (const inscricaoServidor of serverData.inscricoes) {
              const existeLocal = inscricoesLocal.find((i: Inscricao) => 
                i.id === inscricaoServidor.id || 
                i.correlationID === inscricaoServidor.correlationID ||
                (i.email === inscricaoServidor.email && i.tipo === inscricaoServidor.tipo)
              );
              
              if (!existeLocal) {
                // Adicionar nova inscrição do servidor
                inscricoesLocal.push({
                  ...inscricaoServidor,
                  data_atualizacao: new Date().toISOString()
                });
                inscricoesNovas++;
                console.log(`✅ Nova inscrição adicionada:`, inscricaoServidor.email);
              }
            }
          }
        }
        
        // 🎯 TESTAR COM IDs REAIS DAS COMPRAS CONFIRMADAS (fallback)
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
                  console.log(`📡 Dados da FlowPay para ${chargeId}:`, data);
                  
                  if (data.success && data.charge) {
                    const charge = data.charge;
                    const chargeData = charge.charge || charge;
                    
                    // Atualizar dados com informações reais da FlowPay
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
      alert('❌ Erro durante a sincronização. Por favor, tente novamente mais tarde.');
    } finally {
      // setIsSyncing(false);
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

    if (apiKey) {
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
              onClick={syncWithServer}
              className="px-3 lg:px-6 py-2 lg:py-3 bg-orange-600 hover:bg-orange-700 rounded-xl font-medium transition-colors text-sm lg:text-base"
            >
              🔄 Sincronizar
            </button>
            {/* 🚨 BOTÃO RESTAURAR REMOVIDO - CONFLITAVA COM LIMPEZA AUTOMÁTICA */}
            <button
              onClick={syncWithWoovi}
              disabled={isSyncing}
              className="px-3 lg:px-6 py-2 lg:py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl font-medium transition-colors text-sm lg:text-base"
            >
              {isSyncing ? '🔄...' : '🔄 FlowPay'}
            </button>
            <button
              onClick={exportarDados}
              className="px-3 lg:px-6 py-2 lg:py-3 bg-green-600 hover:bg-green-700 rounded-xl font-medium transition-colors text-sm lg:text-base"
            >
              📊 CSV
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

        {/* 🎬 TABELA AUDIOVISUAL (PAGOS) */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-green-500/20 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-green-400">🎬 Audiovisual - Inscrições Pagas ({inscricoes.filter(i => i.tipo === 'audiovisual').length})</h3>
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

        {/* 👥 TABELA JUDGE & STAFF (GRATUITOS) */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/20">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-blue-400">👥 Judge & Staff - Inscrições Gratuitas ({inscricoes.filter(i => i.tipo === 'judge' || i.tipo === 'staff').length})</h3>
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