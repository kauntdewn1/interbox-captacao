import { EmailService } from '../src/services/email.service';

(async () => {
  const emailService = new EmailService({
    defaultFrom: {
      email: 'onboarding@resend.dev',
      name: 'INTERBØX 2025 Test'
    }
  });

  const fakeOrder = {
    correlationID: 'TESTE_PLAYK_' + Date.now(),
    produto: 'Camiseta INTERBØX Masculina',
    produto_id: 'camiseta-interbox-masculina',
    valor: 14900, // R$ 149,00
    tamanho: 'G',
    cor: 'Preta',
    endereco: {
      rua: 'Rua dos Esportes',
      numero: '450',
      complemento: 'Apto 302',
      bairro: 'Jardim Atlético',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '05425-010',
    },
    observacoes: '⚠️ PEDIDO DE TESTE - NÃO PROCESSAR\n\nEste é um email de teste da integração.\nEm produção, este email seria enviado para: contatoplayk@gmail.com\n\nTeste de integração do sistema de emails para fornecedor PlayK.',
    genero: 'Masculino' as const,
    cliente: {
      nome: 'João Silva',
      email: 'joao.teste@example.com',
      telefone: '(11) 98765-4321',
      cpf: '123.456.789-00',
    },
    categoria: 'Vestuário',
    data_pedido: new Date().toISOString(),
  };

  console.log('📧 Enviando email de teste (simulando envio para PlayK)...\n');
  console.log('📦 Produto:', fakeOrder.produto);
  console.log('💰 Valor: R$', (fakeOrder.valor / 100).toFixed(2));
  console.log('📍 Destinatário de teste: interbox25cerrado@gmail.com');
  console.log('📍 Destinatário produção: contatoplayk@gmail.com\n');

  // Enviar para seu email (em produção seria contatoplayk@gmail.com)
  const result = await emailService.sendOrderEmail(
    fakeOrder,
    'interbox25cerrado@gmail.com'
  );

  console.log('Resultado do envio:', result);
})();