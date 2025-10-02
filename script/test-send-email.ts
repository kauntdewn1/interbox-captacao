import { EmailService } from '../src/services/email.service';

(async () => {
  const emailService = new EmailService({
    defaultFrom: {
      email: 'onboarding@resend.dev',
      name: 'INTERBØX 2025 Test'
    }
  });

  const fakeOrder = {
    correlationID: 'TESTE123456789',
    produto: 'Boné INTERBØX',
    produto_id: 'BONÉ-001',
    valor: 7500,
    tamanho: 'Único',
    cor: 'Preto',
    endereco: {
      rua: 'Av. Paulista',
      numero: '1000',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-100',
    },
    observacoes: 'Entregar no horário comercial',
    genero: 'Unissex' as const,
    cliente: {
      nome: 'Netto Mello',
      email: 'interbox25cerrado@gmail.com',
    },
    categoria: 'Acessórios',
    data_pedido: new Date().toISOString(),
  };

  // Enviar para o email verificado no Resend (modo teste)
  const result = await emailService.sendOrderEmail(
    fakeOrder,
    'interbox25cerrado@gmail.com' // Email verificado
  );

  console.log('Resultado do envio:', result);
})();