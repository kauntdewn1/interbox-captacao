/**
 * Configuração do Sistema de Seguros INTERBØX 2025
 * Parceiro: Saga Corretora de Seguros
 */

export const SEGURO_CONFIG = {
  // 🏢 Informações da Parceira
  PARCEIRO: {
    nome: 'Saga Corretora de Seguros',
    cnpj: '00.283.283/0001-26',
    email: 'financeirocorretora@gruposaga.com.br',
    logo: '/images/saga_seguros.png'
  },

  // 💰 Configurações Financeiras
  FINANCEIRO: {
    valor_fixo: 39.90,
    moeda: 'BRL',
    forma_pagamento: 'PIX',
    chave_pix: '00.283.283/0001-26',
    tipo_chave: 'CNPJ'
  },

  // 📋 Campos do Formulário
  CAMPOS: {
    obrigatorios: [
      'nome',
      'cpf', 
      'dataNascimento',
      'sexo',
      'email',
      'telefone',
      'nomeTime'
    ],
    opcionais: [
      'observacoes'
    ],
    validacoes: {
      cpf: {
        unico: true,
        formato: '000.000.000-00'
      },
      email: {
        formato: 'email@dominio.com'
      },
      telefone: {
        formato: '(00) 00000-0000'
      }
    }
  },

  // 🔄 Status do Sistema
  STATUS: {
    PENDENTE_COMPROVANTE: {
      id: 'pendente_comprovante',
      nome: 'Pendente Comprovante',
      cor: 'yellow',
      descricao: 'Usuário preencheu formulário, aguardando PIX'
    },
    COMPROVANTE_ENVIADO: {
      id: 'comprovante_enviado', 
      nome: 'Comprovante Enviado',
      cor: 'orange',
      descricao: 'Comprovante recebido, aguardando confirmação'
    },
    PAGO_CONFIRMADO: {
      id: 'pago_confirmado',
      nome: 'Pago e Confirmado', 
      cor: 'green',
      descricao: 'Pagamento confirmado, seguro ativo'
    }
  },

  // 🚀 URLs e Endpoints
  API: {
    BASE_URL: 'https://interbox-captacao.netlify.app/.netlify/functions',
    ENDPOINTS: {
      SALVAR: '/save-seguro',
      LISTAR: '/admin-seguros',
      ATUALIZAR_STATUS: '/update-seguro-status'
    },
    AUTH: {
      PUBLICO: 'Bearer interbox2025',
      ADMIN: 'Bearer {API_KEY_SAGA}'
    }
  },

  // 🗄️ Banco de Dados
  DATABASE: {
    provider: 'supabase',
    url: 'https://ymriypyyirnwctyitcsu.supabase.co',
    tables: {
      seguros: 'seguros',
      inscricoes: 'inscricoes'
    }
  },

  // 🎨 Configurações de UI
  UI: {
    cores: {
      primaria: '#3B82F6',    // Azul
      secundaria: '#8B5CF6',  // Roxo
      sucesso: '#10B981',     // Verde
      aviso: '#F59E0B',       // Amarelo
      erro: '#EF4444'         // Vermelho
    },
    glassmorphism: {
      background: 'rgba(26, 27, 47, 0.8)',
      border: 'rgba(59, 130, 246, 0.2)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    }
  },

  // 📱 Configurações de Responsividade
  RESPONSIVE: {
    breakpoints: {
      mobile: '640px',
      tablet: '768px',
      desktop: '1024px',
      wide: '1280px'
    },
    grid: {
      mobile: 1,
      tablet: 2,
      desktop: 2,
      wide: 2
    }
  },

  // 🔐 Configurações de Segurança
  SEGURANCA: {
    cpf_unico: true,
    rate_limit: {
      formulario: '1 por minuto por IP',
      api: '100 por hora por API Key'
    },
    validacoes: {
      cpf: true,
      email: true,
      telefone: true
    }
  },

  // 📊 Configurações de Analytics
  ANALYTICS: {
    tracking: true,
    eventos: [
      'formulario_iniciado',
      'formulario_completado', 
      'formulario_erro',
      'pagina_visualizada',
      'status_atualizado'
    ]
  },

  // 🚨 Configurações de Notificações
  NOTIFICACOES: {
    email: {
      confirmacao: true,
      lembrete_pix: true,
      status_atualizado: true
    },
    admin: {
      novo_seguro: true,
      status_pendente: true
    }
  },

  // 📈 Configurações de Relatórios
  RELATORIOS: {
    formatos: ['csv', 'excel', 'json'],
    agrupamentos: [
      'por_status',
      'por_data',
      'por_time',
      'por_valor'
    ],
    filtros: [
      'data_inicio',
      'data_fim', 
      'status',
      'cpf',
      'nome_time'
    ]
  },

  // 🔧 Configurações de Desenvolvimento
  DEV: {
    debug: process.env.NODE_ENV === 'development',
    logs: {
      console: true,
      arquivo: false,
      nivel: 'info'
    },
    mock: {
      ativo: false,
      dados: []
    }
  }
};

// 🎯 Validações de Configuração
export const validarConfiguracao = () => {
  const erros = [];
  
  // Verificar campos obrigatórios
  if (!SEGURO_CONFIG.PARCEIRO.cnpj) {
    erros.push('CNPJ da parceira não configurado');
  }
  
  if (!SEGURO_CONFIG.FINANCEIRO.chave_pix) {
    erros.push('Chave PIX não configurada');
  }
  
  if (!SEGURO_CONFIG.API.BASE_URL) {
    erros.push('URL base da API não configurada');
  }
  
  // Verificar valores numéricos
  if (SEGURO_CONFIG.FINANCEIRO.valor_fixo <= 0) {
    erros.push('Valor do seguro deve ser maior que zero');
  }
  
  if (erros.length > 0) {
    console.error('❌ Erros na configuração do seguro:', erros);
    return false;
  }
  
  console.log('✅ Configuração do seguro validada com sucesso');
  return true;
};

// 🚀 Inicialização automática
if (typeof window !== 'undefined') {
  validarConfiguracao();
}
