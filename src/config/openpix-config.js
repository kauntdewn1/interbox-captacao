/**
 * Configuração OpenPix para INTERBØX 2025
 * Credenciais e configurações da API OpenPix/Woovi
 * ⚠️ IMPORTANTE: Todas as credenciais devem estar em variáveis de ambiente
 */

// 🔑 CREDENCIAIS PRINCIPAIS (OpenPix/Woovi)
// ⚠️ NUNCA coloque credenciais reais aqui - use apenas variáveis de ambiente
// ⚠️ IMPORTANTE: No Vite (frontend), use import.meta.env ao invés de process.env
// ⚠️ Variáveis frontend DEVEM ter prefixo VITE_ para serem acessíveis
const OPENPIX_API_KEY = import.meta.env.VITE_OPENPIX_API_KEY;
const OPENPIX_APP_ID = import.meta.env.VITE_OPENPIX_APP_ID;
const OPENPIX_CLIENT_ID = import.meta.env.VITE_OPENPIX_CLIENT_ID;
const OPENPIX_CORP_ID = import.meta.env.VITE_OPENPIX_CORP_ID;
const OPENPIX_WEBHOOK_TOKEN = import.meta.env.VITE_OPENPIX_WEBHOOK_TOKEN;

// 🌐 URLs da API WOOVI (OPENPIX)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.woovi.com';
const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL || 'https://interbox-captacao.netlify.app/.netlify/functions/webhook';

// 📊 Configurações de pagamento por tipo
const PAYMENT_CONFIGS = {
  audiovisual: {
    amount: 2990, // R$ 29,90
    description: 'Inscrição Audiovisual INTERBØX 2025',
    comment: 'Taxa de inscrição para candidatura audiovisual'
  },
  judge: {
    amount: 1990, // R$ 19,90
    description: 'Inscrição Judge INTERBØX 2025',
    comment: 'Taxa de inscrição para candidatura judge'
  },
  staff: {
    amount: 1990, // R$ 19,90
    description: 'Inscrição Staff INTERBØX 2025',
    comment: 'Taxa de inscrição para candidatura staff'
  },

};

// 🔧 Funções utilitárias baseadas na documentação oficial WOOVI
const createCharge = async (paymentData) => {
  // ⚠️ Verificar se as credenciais estão configuradas
  if (!OPENPIX_API_KEY) {
    throw new Error('OPENPIX_API_KEY não configurada');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/charge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': OPENPIX_API_KEY,
        'Accept': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenPix API Error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao criar charge OpenPix:', error);
    throw error;
  }
};

const getChargeStatus = async (chargeId) => {
  // ⚠️ Verificar se as credenciais estão configuradas
  if (!OPENPIX_API_KEY) {
    throw new Error('OPENPIX_API_KEY não configurada');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/charge/${chargeId}`, {
      method: 'GET',
      headers: {
        'Authorization': OPENPIX_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`OpenPix API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao verificar status da charge:', error);
    throw error;
  }
};

// 📤 Exportar configurações
export {
  OPENPIX_API_KEY,
  OPENPIX_APP_ID,
  OPENPIX_CLIENT_ID,
  OPENPIX_CORP_ID,
  OPENPIX_WEBHOOK_TOKEN,
  API_BASE_URL,
  WEBHOOK_URL,
  PAYMENT_CONFIGS,
  createCharge,
  getChargeStatus
};
