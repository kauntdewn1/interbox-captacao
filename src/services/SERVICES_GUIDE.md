## 🎯 Guia de Services - Separação de Responsabilidades

### 📦 Arquivos Criados

```
src/services/
├── payment.service.ts      # Gerencia cobranças PIX (OpenPix/Woovi)
├── storage.service.ts      # Gerencia persistência de dados
├── logger.service.ts       # Gerencia logs estruturados
└── SERVICES_GUIDE.md       # Este arquivo
```

---

## 🚀 Quick Start

### 1. Payment Service

```ts
import { createInscricaoCharge, createProductCharge } from '@/services/payment.service';

// Criar charge para inscrição
const charge = await createInscricaoCharge('audiovisual', {
  name: 'João Silva',
  email: 'joao@example.com',
  phone: '11999999999',
  taxID: '12345678900'
});

// Criar charge para produto
const charge = await createProductCharge(
  'prod-123',
  'camiseta-interbox',
  'Camiseta INTERBØX',
  49.90,
  customer,
  { origin: 'site', tag: 'campanha-verao' }
);
```

---

### 2. Storage Service

```ts
import { getStorageService } from '@/services/storage.service';

const storage = getStorageService();

// Salvar pedido pendente
await storage.savePendingOrder(charge, customer, {
  product_id: 'prod-123',
  origin: 'site'
});

// Atualizar para pago
await storage.updateOrderStatus(
  { correlationID: 'interbox_prod_123' },
  'paid',
  { txid: 'tx_123456' }
);

// Buscar estatísticas
const stats = await storage.getSalesStats();
```

---

### 3. Logger Service

```ts
import { getPaymentLogger, getStorageLogger } from '@/services/logger.service';

const logger = getPaymentLogger();

// Logs estruturados
logger.chargeCreated('corr_123', 2990, 'user@example.com');
logger.paymentReceived('corr_123', 'tx_456', 2990);
logger.chargeFailed('corr_789', new Error('API timeout'));
```

---

## 📊 Comparação: Antes vs Depois

### ❌ ANTES (create-charge.js - 315 linhas)

```js
// Tudo misturado: API calls, storage, logs, validação
export const handler = async (event) => {
  const headers = { /* CORS */ };

  // 50 linhas de validação inline
  if (!body.customerData) { /* ... */ }

  // 80 linhas de API calls inline
  const response = await fetch(/* ... */);

  // 30 linhas de storage inline
  const orders = await storage.read('orders.json');
  orders.push(/* ... */);

  // 20 linhas de logs espalhados
  console.log('🔑 Tentando criar charge...');
  console.log('✅ Charge criado:', charge);

  return { statusCode: 200, headers, body: /* ... */ };
};
```

**Problemas:**
- ❌ 3 responsabilidades misturadas
- ❌ Difícil de testar
- ❌ Código duplicado entre functions
- ❌ Logs inconsistentes
- ❌ Lógica de negócio acoplada

---

### ✅ DEPOIS (create-charge-refactored.example.js - 100 linhas)

```js
import { withCors, jsonResponse } from './_shared/cors.ts';
import { createProductCharge } from '../../src/services/payment.service.ts';
import { getStorageService } from '../../src/services/storage.service.ts';
import { getPaymentLogger } from '../../src/services/logger.service.ts';

export const handler = withCors(async (event) => {
  const logger = getPaymentLogger();
  const storage = getStorageService();

  // Validação simples
  if (!customerData?.name) {
    return jsonResponse(400, { error: 'Nome obrigatório' });
  }

  // Criar charge (delegado)
  const charge = await createProductCharge(product.id, product.slug, /* ... */);

  // Salvar (delegado)
  await storage.savePendingOrder(charge, customer);

  // Log (delegado)
  logger.chargeCreated(charge.correlationID, amount, customer.email);

  return jsonResponse(200, { success: true, charge });
});
```

**Benefícios:**
- ✅ Responsabilidades separadas
- ✅ Fácil de testar cada service
- ✅ Código reutilizável
- ✅ Logs estruturados e consistentes
- ✅ Lógica de negócio isolada

---

## 📚 Exemplos Detalhados

### Exemplo 1: Criar Charge + Salvar + Log

```ts
import { withCors, jsonResponse } from './_shared/cors.ts';
import { createInscricaoCharge } from '../../src/services/payment.service.ts';
import { getStorageService } from '../../src/services/storage.service.ts';
import { getPaymentLogger } from '../../src/services/logger.service.ts';

export const handler = withCors(async (event) => {
  const logger = getPaymentLogger();
  const storage = getStorageService();

  try {
    const { type, customer } = JSON.parse(event.body);

    // 1. Criar charge
    const charge = await createInscricaoCharge(type, customer);

    // 2. Salvar pendente
    await storage.savePendingOrder(charge, customer);

    // 3. Log sucesso
    logger.chargeCreated(charge.correlationID, charge.value, customer.email);

    return jsonResponse(200, { success: true, charge });
  } catch (error) {
    logger.error('Falha ao processar charge', error);
    return jsonResponse(500, { error: error.message });
  }
});
```

---

### Exemplo 2: Webhook com Services

```ts
import { getStorageService } from '../../src/services/storage.service.ts';
import { getWebhookLogger } from '../../src/services/logger.service.ts';

export const handler = async (event) => {
  const logger = getWebhookLogger();
  const storage = getStorageService();

  const webhookData = JSON.parse(event.body);

  logger.webhookReceived(webhookData.event, webhookData.transaction?.correlationID);

  if (webhookData.event === 'OPENPIX:TRANSACTION_RECEIVED') {
    const { correlationID, transactionEndToEndId } = webhookData.transaction;

    // Atualizar pedido para pago
    const updatedOrder = await storage.updateOrderStatus(
      { correlationID },
      'paid',
      { txid: transactionEndToEndId }
    );

    if (updatedOrder) {
      logger.webhookProcessed(webhookData.event, correlationID);
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
```

---

### Exemplo 3: Avaliações com Storage Service

```ts
import { getStorageService } from '../../src/services/storage.service.ts';
import { getStorageLogger } from '../../src/services/logger.service.ts';

export const handler = async (event) => {
  const storage = getStorageService();
  const logger = getStorageLogger();

  const reviewData = JSON.parse(event.body);

  // Salvar avaliação
  const review = await storage.saveReview({
    produto_id: reviewData.produto_id,
    cliente_email: reviewData.email,
    nota: reviewData.nota,
    comentario: reviewData.comentario,
    aprovado: true,
  });

  logger.reviewSaved(review.id, review.produto_id, review.nota);

  // Recalcular rating
  const rating = await storage.calculateProductRating(review.produto_id);
  await storage.saveProductRating(review.produto_id, rating);

  logger.success('Rating atualizado', { produto_id: review.produto_id, ...rating });

  return jsonResponse(200, { success: true, review });
};
```

---

## 🔧 Payment Service - API Completa

### Criar Charges

```ts
import {
  PaymentService,
  createInscricaoCharge,
  createProductCharge,
  PAYMENT_CONFIGS
} from '@/services/payment.service';

// Instanciar service (opcional)
const service = new PaymentService();

// Criar charge manual
const charge = await service.createCharge({
  correlationID: 'custom_123',
  value: 9990,
  comment: 'Pagamento personalizado',
  customer: { name: 'João', email: 'joao@example.com' }
});

// Helpers prontos
const charge1 = await createInscricaoCharge('audiovisual', customer);
const charge2 = await createProductCharge('prod-1', 'slug', 'Nome', 49.90, customer);
```

### Consultar Status

```ts
const service = new PaymentService();
const status = await service.getChargeStatus('interbox_123');

if (status) {
  console.log('Status:', status.status);
}
```

### Utilities

```ts
import { PaymentService, extractChargeInfo, isChargePaid } from '@/services/payment.service';

// Gerar correlation ID
const correlationID = PaymentService.generateCorrelationID('prod_camiseta');
// → 'interbox_prod_camiseta_1738358400000'

// Sanitizar CPF
const cleanCPF = PaymentService.sanitizeCPF('123.456.789-00');
// → '12345678900'

// Extrair info adicional
const productId = extractChargeInfo(charge, 'product_id');

// Verificar se pago
if (isChargePaid(charge)) {
  console.log('Pagamento confirmado!');
}
```

---

## 🗄️ Storage Service - API Completa

### Orders

```ts
import { getStorageService } from '@/services/storage.service';

const storage = getStorageService();

// Salvar pendente
await storage.savePendingOrder(charge, customer, {
  product_id: 'prod-123',
  origin: 'campanha-verao',
  tag: 'instagram'
});

// Atualizar status
await storage.updateOrderStatus(
  { correlationID: 'interbox_123' },
  'paid',
  { txid: 'tx_456' }
);

// Buscar pedido
const order = await storage.findOrder({ correlationID: 'interbox_123' });

// Estatísticas
const stats = await storage.getSalesStats();
console.log('Total vendido:', stats.total_revenue_cents / 100);
```

### Reviews

```ts
// Salvar avaliação
const review = await storage.saveReview({
  produto_id: 'prod-123',
  cliente_email: 'user@example.com',
  nota: 5,
  comentario: 'Produto excelente!',
  aprovado: true
});

// Buscar avaliações
const reviews = await storage.getProductReviews('prod-123', {
  aprovado: true,
  limit: 10,
  offset: 0
});

// Calcular rating
const rating = await storage.calculateProductRating('prod-123');
console.log('Média:', rating.media);
console.log('Total:', rating.total);
```

---

## 📝 Logger Service - API Completa

### Loggers Especializados

```ts
import {
  getPaymentLogger,
  getStorageLogger,
  getWebhookLogger,
  createLogger
} from '@/services/logger.service';

// Payment Logger
const paymentLogger = getPaymentLogger();
paymentLogger.chargeCreated('corr_123', 2990, 'user@example.com');
paymentLogger.paymentReceived('corr_123', 'tx_456', 2990);
paymentLogger.chargeFailed('corr_123', new Error('Timeout'));

// Storage Logger
const storageLogger = getStorageLogger();
storageLogger.orderSaved('ord_123', 'corr_456');
storageLogger.reviewSaved('rev_123', 'prod_456', 5);

// Webhook Logger
const webhookLogger = getWebhookLogger();
webhookLogger.webhookReceived('TRANSACTION_RECEIVED', 'corr_123');
webhookLogger.webhookProcessed('TRANSACTION_RECEIVED', 'corr_123', 150);

// Custom Logger
const customLogger = createLogger('meu-servico');
customLogger.info('Operação iniciada', { user_id: '123' });
```

### Logs Genéricos

```ts
import { LoggerService } from '@/services/logger.service';

const logger = new LoggerService('api');

logger.debug('Debug info', { data: 'test' });
logger.info('Info message', { status: 'ok' });
logger.warn('Warning', { threshold: 90 });
logger.error('Error occurred', new Error('Failed'), { step: 'validation' });
logger.success('Operation completed', { duration: 150 });
```

### Performance Tracking

```ts
import { PerformanceTimer, measurePerformance } from '@/services/logger.service';

// Manual timer
const timer = new PerformanceTimer('criar-charge');
await createCharge();
timer.end({ status: 'success' });

// Wrapper function
const result = await measurePerformance('processar-webhook', async () => {
  return await processWebhook(data);
});
```

---

## 🎯 Migration Roadmap

### Fase 1: Functions Críticas (Pagamento)

- [x] `payment.service.ts` criado
- [x] `storage.service.ts` criado
- [x] `logger.service.ts` criado
- [ ] Refatorar `create-charge.js`
- [ ] Refatorar `webhook.js`
- [ ] Refatorar `get-payment-status.js`

### Fase 2: Functions de Storage

- [ ] Refatorar `save-order.js`
- [ ] Refatorar `save-review.js`
- [ ] Refatorar `get-reviews.js`
- [ ] Refatorar `get-sales-stats.js`

### Fase 3: Functions de Admin

- [ ] Refatorar `admin-inscricoes.js`
- [ ] Refatorar `admin-seguros.js`

---

## 📊 Impacto Esperado

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| **Linhas por function** | ~300 | ~100 | -67% |
| **Código duplicado** | Alto | Zero | -100% |
| **Testabilidade** | Baixa | Alta | ✅ |
| **Manutenibilidade** | Difícil | Fácil | ✅ |
| **Logs estruturados** | ✗ | ✓ | ✅ |
| **Separação de responsabilidades** | ✗ | ✓ | ✅ |

---

## 🐛 Troubleshooting

### Erro: Cannot find module '@/services/...'

**Solução:** Configure alias no `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Ou use path relativo:

```js
import { createInscricaoCharge } from '../../src/services/payment.service.ts';
```

---

### Erro: PaymentService constructor requires apiKey

**Solução:** Configure `OPENPIX_API_KEY` no `.env`:

```env
OPENPIX_API_KEY=your-api-key-here
```

---

### Logs não aparecem em produção

**Solução:** Logs `debug()` são suprimidos em produção. Use `info()` ou `success()`:

```ts
// ❌ Não aparece em produção
logger.debug('Debug info');

// ✅ Aparece em produção
logger.info('Info message');
```

---

## 💡 Best Practices

1. **Sempre use services** ao invés de lógica inline
2. **Um service por responsabilidade** (SRP - Single Responsibility Principle)
3. **Injete dependências** quando necessário para facilitar testes
4. **Use loggers especializados** (PaymentLogger, StorageLogger, etc.)
5. **Centralize configurações** em constants (PAYMENT_CONFIGS)
6. **Valide inputs** antes de passar para services
7. **Handle errors gracefully** - não deixe services crasharem a function

---

**Criado em:** 2025-10-02
**Versão:** 1.0.0
**Maintainer:** INTERBØX Team
