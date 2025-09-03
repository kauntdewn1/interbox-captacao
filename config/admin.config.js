/**
 * Configuração de Administração INTERBØX 2025
 * ⚠️ IMPORTANTE: Altere esta API Key em produção
 */

export const ADMIN_CONFIG = {
  // 🔑 API Key para acesso ao dashboard (padrão: interbox2025)
  API_KEY: process.env.ADMIN_API_KEY || 'interbox2025',
  
  // 🌐 URLs das APIs
  ADMIN_API_BASE: 'https://interbox-captacao.netlify.app/.netlify/functions/admin-inscricoes',
  SEGUROS_API_BASE: 'https://interbox-captacao.netlify.app/.netlify/functions/admin-seguros',
  UPDATE_SEGURO_API: 'https://interbox-captacao.netlify.app/.netlify/functions/update-seguro-status',
  
  // 🗄️ Banco de Dados
  DATABASE: {
    provider: 'supabase',
    url: 'https://ymriypyyirnwctyitcsu.supabase.co',
    tables: {
      seguros: 'seguros',
      inscricoes: 'inscricoes'
    }
  },
  
  // 📊 Configurações de exportação
  EXPORT_FORMATS: ['csv', 'excel', 'json'],
  
  // 🔍 Filtros disponíveis
  FILTERS: {
    tipos: ['judge', 'audiovisual', 'staff'],
    status: ['confirmado', 'pendente', 'cancelado']
  },
  
  // 🛡️ Configurações de seguros
  SEGUROS: {
    status: ['pendente_comprovante', 'comprovante_enviado', 'pago_confirmado'],
    valor_fixo: 39.90,
    parceiro: 'Saga Corretora de Seguros',
    chave_pix: '00.283.283/0001-26',
    email_comprovante: 'financeirocorretora@gruposaga.com.br'
  }
};
