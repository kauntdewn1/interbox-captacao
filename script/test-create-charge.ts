/**
 * Script de teste para criar charge PIX via OpenPix/Woovi
 */

const testCreateCharge = async () => {
  const API_KEY = process.env.OPENPIX_API_KEY?.trim();
  const API_URL = process.env.API_BASE_URL || 'https://api.woovi.com';

  if (!API_KEY) {
    console.error('❌ OPENPIX_API_KEY não configurada');
    process.exit(1);
  }

  console.log('🔑 API Key configurada:', API_KEY.substring(0, 20) + '...');
  console.log('🌐 API URL:', API_URL);
  console.log('\n📦 Criando charge de teste...\n');

  const chargeData = {
    correlationID: `teste_charge_${Date.now()}`,
    value: 14900, // R$ 149,00
    comment: 'Teste de integração - Camiseta INTERBØX',
    customer: {
      name: 'João Silva',
      email: 'joao.teste@example.com',
      phone: '+5511987654321',
      taxID: '31324227036' // CPF válido para teste
    },
    additionalInfo: [
      { key: 'event', value: 'INTERBØX 2025' },
      { key: 'flow', value: 'product' },
      { key: 'product_id', value: 'camiseta-interbox-masculina' },
      { key: 'product_slug', value: 'camiseta-interbox' },
      { key: 'product_name', value: 'Camiseta INTERBØX Masculina' },
      { key: 'tags', value: 'INTERBOX, ECOMMERCE, CAMISETA, MASCULINO' },
      { key: 'category', value: 'vestuario' },
      { key: 'origin', value: 'teste-manual' },
      { key: 'campaign_tag', value: 'test' }
    ]
  };

  try {
    const response = await fetch(`${API_URL}/api/v1/charge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': API_KEY,
        'Accept': 'application/json'
      },
      body: JSON.stringify(chargeData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenPix API Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    console.log('✅ Charge criado com sucesso!\n');
    console.log('📋 Detalhes:');
    console.log('  ID:', result.charge?.identifier || 'N/A');
    console.log('  Correlation ID:', result.correlationID);
    console.log('  Status:', result.status || result.charge?.status);
    console.log('  Valor: R$', (chargeData.value / 100).toFixed(2));
    console.log('\n💳 Dados PIX:');
    console.log('  BR Code disponível:', !!result.brCode);
    console.log('  QR Code disponível:', !!result.qrCodeImage);
    
    if (result.brCode) {
      console.log('\n📱 PIX Copia e Cola (primeiros 80 caracteres):');
      console.log('  ', result.brCode.substring(0, 80) + '...');
    }

    console.log('\n🔗 Link de pagamento:');
    console.log('  ', result.paymentLinkUrl || 'N/A');

    return result;
  } catch (error) {
    console.error('\n❌ Erro ao criar charge:', error.message);
    throw error;
  }
};

// Executar
testCreateCharge()
  .then(() => {
    console.log('\n✅ Teste concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Teste falhou:', error);
    process.exit(1);
  });
