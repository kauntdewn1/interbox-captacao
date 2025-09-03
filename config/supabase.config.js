/**
 * Configuração Centralizada do Supabase - INTERBØX 2025
 * Configurações para todas as tabelas e funcionalidades
 */

export const SUPABASE_CONFIG = {
  // 🔗 Configuração de Conexão
  CONNECTION: {
    url: 'https://ymriypyyirnwctyitcsu.supabase.co',
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },

  // 🗄️ Tabelas do Sistema
  TABLES: {
    // Sistema de Seguros
    seguros: {
      name: 'seguros',
      description: 'Tabela para armazenar seguros do INTERBØX 2025',
      columns: {
        id: 'UUID PRIMARY KEY',
        nome: 'VARCHAR(255) NOT NULL',
        cpf: 'VARCHAR(14) NOT NULL UNIQUE',
        data_nascimento: 'DATE NOT NULL',
        sexo: 'VARCHAR(20) NOT NULL',
        email: 'VARCHAR(255) NOT NULL',
        telefone: 'VARCHAR(20) NOT NULL',
        nome_time: 'VARCHAR(255) NOT NULL',
        observacoes: 'TEXT',
        tipo: 'VARCHAR(50) NOT NULL',
        valor: 'DECIMAL(10,2) NOT NULL',
        status: 'VARCHAR(50) NOT NULL',
        created_at: 'TIMESTAMP WITH TIME ZONE',
        updated_at: 'TIMESTAMP WITH TIME ZONE',
        data_criacao: 'TIMESTAMP WITH TIME ZONE'
      },
      indexes: [
        'idx_seguros_cpf',
        'idx_seguros_status',
        'idx_seguros_data_criacao',
        'idx_seguros_tipo',
        'idx_seguros_email'
      ]
    },

    // Sistema de Inscrições
    inscricoes: {
      name: 'inscricoes',
      description: 'Tabela para armazenar inscrições do INTERBØX 2025',
      columns: {
        id: 'UUID PRIMARY KEY',
        nome: 'VARCHAR(255) NOT NULL',
        email: 'VARCHAR(255) NOT NULL',
        whatsapp: 'VARCHAR(20) NOT NULL',
        cpf: 'VARCHAR(14)',
        tipo: 'VARCHAR(50) NOT NULL',
        valor: 'DECIMAL(10,2) DEFAULT 0',
        status: 'VARCHAR(50) DEFAULT cadastrado',
        portfolio: 'TEXT',
        experiencia: 'TEXT',
        disponibilidade: 'TEXT',
        motivacao: 'TEXT',
        certificacoes: 'TEXT',
        correlation_id: 'VARCHAR(255)',
        charge_id: 'VARCHAR(255)',
        created_at: 'TIMESTAMP WITH TIME ZONE',
        updated_at: 'TIMESTAMP WITH TIME ZONE',
        data_criacao: 'TIMESTAMP WITH TIME ZONE'
      },
      indexes: [
        'idx_inscricoes_email',
        'idx_inscricoes_tipo',
        'idx_inscricoes_status',
        'idx_inscricoes_data_criacao',
        'idx_inscricoes_cpf'
      ]
    }
  },

  // 🔐 Políticas de Segurança (RLS)
  POLICIES: {
    seguros: {
      select: 'Permitir leitura pública de estatísticas',
      insert: 'Permitir inserção com autenticação',
      update: 'Permitir atualização com autenticação'
    },
    inscricoes: {
      select: 'Permitir leitura pública de inscrições',
      insert: 'Permitir inserção com autenticação',
      update: 'Permitir atualização com autenticação',
      delete: 'Permitir remoção com autenticação'
    }
  },

  // 📊 Views para Estatísticas
  VIEWS: {
    seguros_stats: {
      name: 'seguros_stats',
      description: 'Estatísticas dos seguros',
      columns: [
        'total_seguros',
        'pendentes',
        'comprovantes_enviados',
        'pagos_confirmados',
        'valor_total',
        'valor_medio'
      ]
    },
    inscricoes_stats: {
      name: 'inscricoes_stats',
      description: 'Estatísticas das inscrições',
      columns: [
        'total_inscricoes',
        'total_judges',
        'total_audiovisual',
        'total_staff',
        'cadastrados',
        'pagos',
        'valor_total',
        'valor_medio'
      ]
    }
  },

  // 🔧 Funções e Triggers
  FUNCTIONS: {
    update_updated_at: {
      name: 'update_updated_at_column',
      description: 'Atualiza automaticamente o campo updated_at',
      tables: ['seguros', 'inscricoes']
    }
  },

  // 📋 Validações e Constraints
  CONSTRAINTS: {
    seguros: {
      sexo: "CHECK (sexo IN ('masculino', 'feminino', 'outro'))",
      status: "CHECK (status IN ('pendente_comprovante', 'comprovante_enviado', 'pago_confirmado'))",
      cpf_unique: 'UNIQUE(cpf)'
    },
    inscricoes: {
      tipo: "CHECK (tipo IN ('judge', 'audiovisual', 'staff'))",
      status: "CHECK (status IN ('cadastrado', 'pago', 'cancelado'))"
    }
  },

  // 🚀 Configurações de Performance
  PERFORMANCE: {
    connectionPool: {
      min: 2,
      max: 10
    },
    queryTimeout: 30000, // 30 segundos
    retryAttempts: 3
  },

  // 📈 Monitoramento
  MONITORING: {
    enableLogs: true,
    logLevel: 'info',
    metrics: [
      'query_performance',
      'connection_pool',
      'error_rate'
    ]
  },

  // 🔄 Migrações
  MIGRATIONS: {
    currentVersion: '1.0.0',
    files: [
      'supabase/schema.sql',
      'supabase/inscricoes-schema.sql'
    ],
    autoBackup: true
  }
};

// 🎯 Validações de Configuração
export const validarConfiguracaoSupabase = () => {
  const erros = [];
  
  // Verificar URL
  if (!SUPABASE_CONFIG.CONNECTION.url) {
    erros.push('URL do Supabase não configurada');
  }
  
  // Verificar chave anônima
  if (!SUPABASE_CONFIG.CONNECTION.anonKey) {
    erros.push('Chave anônima do Supabase não configurada');
  }
  
  // Verificar tabelas
  if (!SUPABASE_CONFIG.TABLES.seguros || !SUPABASE_CONFIG.TABLES.inscricoes) {
    erros.push('Configuração de tabelas incompleta');
  }
  
  if (erros.length > 0) {
    console.error('❌ Erros na configuração do Supabase:', erros);
    return false;
  }
  
  console.log('✅ Configuração do Supabase validada com sucesso');
  return true;
};

// 🚀 Inicialização automática
if (typeof window !== 'undefined') {
  validarConfiguracaoSupabase();
}
