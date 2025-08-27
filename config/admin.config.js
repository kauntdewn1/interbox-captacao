/**
 * Configuração de Administração INTERBØX 2025
 * ⚠️ IMPORTANTE: Altere esta API Key em produção
 */

export const ADMIN_CONFIG = {
  // 🔑 API Key para acesso ao dashboard (padrão: interbox2025)
  API_KEY: process.env.ADMIN_API_KEY || 'interbox2025',
  
  // 🌐 URLs das APIs
  ADMIN_API_BASE: 'https://interbox-captacao.netlify.app/.netlify/functions/admin-inscricoes',
  
  // 📊 Configurações de exportação
  EXPORT_FORMATS: ['csv', 'excel', 'json'],
  
  // 🔍 Filtros disponíveis
  FILTERS: {
    tipos: ['judge', 'audiovisual', 'staff'],
    status: ['confirmado', 'pendente', 'cancelado']
  }
};
