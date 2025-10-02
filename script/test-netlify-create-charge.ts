/**
 * Script de teste para função Netlify create-charge
 * Simula uma chamada real do front-end
 */

const testNetlifyCreateCharge = async () => {
  const NETLIFY_URL = process.env.NETLIFY_URL || 'https://interbox-captacao.netlify.app';
  const endpoint = `${NETLIFY_URL}/.netlify/functions/create-charge`;

  console.log('🌐 Testando função Netlify create-charge');
  console.log('📍 Endpoint:', endpoint);
  console.log('\n📦 Dados do pedido:\n');

  const requestBody = {
    customerData: {
      name: 'João Silva',
      email: 'joao.teste@example.com',
      phone: '11987654321',
      cpf: '31324227036'
    },
    productId: 'camiseta-oversized-interbox-masculina'
  };

  console.log(JSON.stringify(requestBody, null, 2));
  console.log('\n🚀 Enviando requisição...\n');

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Erro na requisição:', response.status);
      console.error('Resposta:', JSON.stringify(data, null, 2));
      throw new Error(`HTTP ${response.status}: ${data.error || 'Erro desconhecido'}`);
    }

    console.log('✅ Charge criado com sucesso!\n');
    console.log('📋 Resposta completa:');
    console.log(JSON.stringify(data, null, 2));

    if (data.charge?.identifier) {
      console.log('\n💡 Informações principais:');
      console.log('  Charge ID:', data.charge.identifier);
      console.log('  Correlation ID:', data.correlationID);
      console.log('  Status:', data.status);
      console.log('  Valor: R$', (data.charge.value / 100).toFixed(2));
    }

    if (data.brCode) {
      console.log('\n📱 PIX Copia e Cola (primeiros 100 caracteres):');
      console.log(' ', data.brCode.substring(0, 100) + '...');
    }

    if (data.qrCodeImage) {
      console.log('\n🖼️  QR Code Image URL disponível');
    }

    if (data.paymentLinkUrl) {
      console.log('\n🔗 Link de pagamento:');
      console.log(' ', data.paymentLinkUrl);
    }

    return data;
  } catch (error) {
    console.error('\n❌ Erro ao testar função:', error.message);
    throw error;
  }
};

// Executar
testNetlifyCreateCharge()
  .then(() => {
    console.log('\n✅ Teste concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Teste falhou');
    process.exit(1);
  });
