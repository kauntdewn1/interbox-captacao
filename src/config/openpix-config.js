/**
 * Configuração OpenPix para INTERBØX 2025
 * Credenciais e configurações da API OpenPix
 */

// 🔑 CREDENCIAIS PRINCIPAIS (ClickPix/Woovi)
const OPENPIX_API_KEY = process.env.OPENPIX_API_KEY || 'd14a8e82-1ab7-4dee-a1a5-6d86c3781ccb';
const OPENPIX_CORP_ID = process.env.OPENPIX_CORP_ID || 'd14a8e82-1ab7-4dee-a1a5-6d86c3781ccb';
const OPENPIX_WEBHOOK_TOKEN = process.env.OPENPIX_WEBHOOK_TOKEN || 'webhook_interbox_2025_secure';

// 🌐 URLs da API WOOVI (OPENPIX)
const API_BASE_URL = 'https://api.woovi.com';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://interbox-captacao.netlify.app/webhook';

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
  espectador: {
    amount: 1990, // R$ 19,90
    description: 'Inscrição Espectador INTERBØX 2025',
    comment: 'Taxa de inscrição para espectador'
  },
  atleta: {
    amount: 9990, // R$ 99,90
    description: 'Inscrição Atleta INTERBØX 2025',
    comment: 'Taxa de inscrição para atleta'
  }
};

// 🔧 Funções utilitárias baseadas na documentação oficial WOOVI
const createCharge = async (paymentData) => {
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
  OPENPIX_CORP_ID,
  OPENPIX_WEBHOOK_TOKEN,
  API_BASE_URL,
  WEBHOOK_URL,
  PAYMENT_CONFIGS,
  createCharge,
  getChargeStatus
};
