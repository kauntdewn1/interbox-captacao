# 🎯 Exemplos Práticos - CORS Middleware

## 📦 Arquivos Criados

```
netlify/functions/_shared/
├── cors.ts                     # Middleware principal
├── CORS_MIGRATION_GUIDE.md     # Guia completo de migração
└── CORS_EXAMPLES.md            # Este arquivo
```

## ✅ Funções Já Migradas (Exemplos Prontos)

### 1. `get-reviews.js` - API READ-ONLY

```js
import { withCors, jsonResponse, CORS_PRESETS } from './_shared/cors.ts';

export const handler = withCors(async (event) => {
  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { error: 'Método não permitido' });
  }

  try {
    const data = await fetchData();
    return jsonResponse(200, { success: true, data });
  } catch (error) {
    return jsonResponse(500, { error: error.message });
  }
}, CORS_PRESETS.READ_ONLY);
```

**Redução:** 123 linhas → 100 linhas (-19%)

---

### 2. `save-review.js` - API POST com Validação

```js
import { withCors, jsonResponse } from './_shared/cors.ts';

export const handler = withCors(async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método não permitido' });
  }

  try {
    const data = JSON.parse(event.body);

    if (!validate(data)) {
      return jsonResponse(400, { error: 'Dados inválidos' });
    }

    await save(data);
    return jsonResponse(200, { success: true });
  } catch (error) {
    return jsonResponse(500, { error: error.message });
  }
});
```

**Redução:** 160 linhas → 130 linhas (-19%)

---

## 🚀 Templates para Outras Functions

### Template 1: Simple GET

```js
import { withCors, jsonResponse, CORS_PRESETS } from './_shared/cors.ts';

export const handler = withCors(async (event) => {
  const { id } = event.queryStringParameters || {};

  const data = await fetchById(id);

  return jsonResponse(200, { data });
}, CORS_PRESETS.READ_ONLY);
```

---

### Template 2: POST com Storage

```js
import { withCors, jsonResponse } from './_shared/cors.ts';

let createStorage;
const loadStorage = async () => {
  if (!createStorage) {
    const mod = await import('../../src/utils/storage.ts');
    createStorage = mod.createStorage;
  }
};

export const handler = withCors(async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método não permitido' });
  }

  await loadStorage();
  const storage = createStorage();
  const body = JSON.parse(event.body);

  await storage.append('data.json', body);

  return jsonResponse(200, { success: true });
});
```

---

### Template 3: Autenticação + CRUD

```js
import { withCors, jsonResponse, CORS_PRESETS } from './_shared/cors.ts';

const authenticate = (event) => {
  const authHeader = event.headers.authorization;
  const apiKey = process.env.ADMIN_API_KEY;
  return authHeader === `Bearer ${apiKey}`;
};

export const handler = withCors(async (event) => {
  // Verificar autenticação
  if (!authenticate(event)) {
    return jsonResponse(401, { error: 'Não autorizado' });
  }

  // Roteamento por método
  switch (event.httpMethod) {
    case 'GET':
      return jsonResponse(200, await getData());
    case 'POST':
      return jsonResponse(201, await createData(JSON.parse(event.body)));
    case 'PUT':
      return jsonResponse(200, await updateData(JSON.parse(event.body)));
    case 'DELETE':
      return jsonResponse(204, {});
    default:
      return jsonResponse(405, { error: 'Método não permitido' });
  }
}, CORS_PRESETS.AUTHENTICATED);
```

---

### Template 4: Webhook Receiver

```js
import { withCors, jsonResponse } from './_shared/cors.ts';

export const handler = withCors(async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método não permitido' });
  }

  const webhookData = JSON.parse(event.body);

  console.log('📥 Webhook received:', webhookData);

  // Processar webhook de forma assíncrona
  processWebhook(webhookData).catch(console.error);

  // Retornar imediatamente (webhooks devem responder rápido)
  return jsonResponse(200, { received: true });
});
```

---

## 📊 Comparação: Antes vs Depois

| Aspecto | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| **Linhas de boilerplate** | ~20/function | ~1 | -95% |
| **CORS headers manual** | ✓ | ✗ | Automático |
| **Preflight manual** | ✓ | ✗ | Automático |
| **Error handling CORS** | ✗ | ✓ | Built-in |
| **Type safety** | ✗ | ✓ | TypeScript |
| **Consistência** | Baixa | Alta | Centralizado |

---

## 🎨 Patterns Avançados

### Pattern 1: Múltiplos Métodos com Roteamento

```js
import { withCors, jsonResponse } from './_shared/cors.ts';

const routes = {
  GET: async (event) => {
    const items = await fetchItems();
    return jsonResponse(200, { items });
  },

  POST: async (event) => {
    const item = JSON.parse(event.body);
    const created = await createItem(item);
    return jsonResponse(201, { item: created });
  },

  PUT: async (event) => {
    const item = JSON.parse(event.body);
    const updated = await updateItem(item);
    return jsonResponse(200, { item: updated });
  },

  DELETE: async (event) => {
    const { id } = event.queryStringParameters || {};
    await deleteItem(id);
    return jsonResponse(204, {});
  }
};

export const handler = withCors(async (event) => {
  const route = routes[event.httpMethod];

  if (!route) {
    return jsonResponse(405, { error: 'Método não permitido' });
  }

  return route(event);
});
```

---

### Pattern 2: Middleware Chain (Composição)

```js
import { withCors, jsonResponse } from './_shared/cors.ts';

// Helper para adicionar timing
const withTiming = (handler) => async (event) => {
  const start = Date.now();
  const response = await handler(event);
  const duration = Date.now() - start;

  console.log(`⏱️ Request took ${duration}ms`);

  return {
    ...response,
    headers: {
      ...response.headers,
      'X-Response-Time': `${duration}ms`
    }
  };
};

// Compor middlewares
export const handler = withCors(
  withTiming(async (event) => {
    return jsonResponse(200, { message: 'Hello World' });
  })
);
```

---

### Pattern 3: Conditional CORS (Origem Dinâmica)

```js
import { withCors, jsonResponse } from './_shared/cors.ts';

const getAllowedOrigin = (event) => {
  const origin = event.headers.origin || event.headers.Origin;

  const allowedOrigins = [
    'https://interbox-captacao.netlify.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ];

  return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
};

export const handler = withCors(async (event) => {
  return jsonResponse(200, { data: 'restricted' });
}, {
  allowOrigin: getAllowedOrigin(event),
  allowCredentials: true
});
```

---

## 🔥 Quick Wins - Funções Prioritárias para Migrar

1. ✅ **`get-reviews.js`** - Migrado
2. ✅ **`save-review.js`** - Migrado
3. ⏳ **`save-order.js`** - Próximo
4. ⏳ **`get-payment-status.js`** - Próximo
5. ⏳ **`create-charge.js`** - Próximo
6. ⏳ **`webhook.js`** - Próximo

**Estimativa:** ~30 minutos para migrar todas as 22 functions

---

## 📚 Recursos

- **Middleware:** `netlify/functions/_shared/cors.ts`
- **Guia Completo:** `CORS_MIGRATION_GUIDE.md`
- **Netlify Docs:** https://docs.netlify.com/functions/overview/
- **TypeScript Types:** `@netlify/functions`

---

## 🐛 Troubleshooting

### Problema: Import não funciona

```
Error: Cannot find module './_shared/cors.ts'
```

**Solução:** Verificar path relativo. De `netlify/functions/`, usar:
```js
import { withCors } from './_shared/cors.ts';
```

---

### Problema: CORS ainda retorna erro

**Solução:** Verificar se response contém headers customizados que conflitam:

```js
// ❌ Errado - sobrescreve CORS
return {
  statusCode: 200,
  headers: { 'X-Custom': 'value' }, // apaga CORS!
  body: '{}'
};

// ✅ Correto - usa jsonResponse
return jsonResponse(200, {}, { 'X-Custom': 'value' });
```

---

## 💡 Dicas

1. **Sempre use `jsonResponse()`** para garantir CORS + Content-Type corretos
2. **Remova `context` parâmetro** se não usado (evita warnings)
3. **Use CORS_PRESETS** ao invés de configurar manualmente
4. **Teste preflight:** `curl -X OPTIONS -H "Origin: http://localhost" <url>`
5. **Error handling é automático** - não precisa try-catch para CORS

---

## 🎯 Próximos Passos

1. Migrar functions restantes usando templates acima
2. Remover código CORS duplicado
3. Adicionar testes E2E para CORS
4. Documentar APIs públicas

---

**Criado em:** 2025-10-02
**Versão:** 1.0.0
**Maintainer:** INTERBØX Team
