# Guia de Migração - CORS Middleware

## 📦 Instalação

O middleware já está disponível em `netlify/functions/_shared/cors.ts`

## 🔄 Como Migrar

### ❌ Antes (Código Repetitivo)

```js
export const handler = async (event, context) => {
  // CORS Headers copiado em toda function
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Preflight manual
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // lógica aqui
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

### ✅ Depois (Com Middleware)

```js
import { withCors } from '../_shared/cors.ts';

export const handler = withCors(async (event, context) => {
  // lógica aqui - CORS é automático
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
});
```

## 📚 Exemplos de Uso

### 1. Uso Básico (CORS padrão)

```ts
import { withCors } from '../_shared/cors.ts';

export const handler = withCors(async (event, context) => {
  const data = JSON.parse(event.body || '{}');

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Success', data })
  };
});
```

### 2. Com Configuração Customizada

```ts
import { withCors, CORS_PRESETS } from '../_shared/cors.ts';

// Usando preset READ_ONLY (apenas GET)
export const handler = withCors(async (event, context) => {
  const products = await fetchProducts();

  return {
    statusCode: 200,
    body: JSON.stringify(products)
  };
}, CORS_PRESETS.READ_ONLY);
```

### 3. API Autenticada

```ts
import { withCors, CORS_PRESETS } from '../_shared/cors.ts';

export const handler = withCors(async (event, context) => {
  // Middleware já trata CORS, você foca na lógica
  const authHeader = event.headers.authorization;

  if (!authHeader) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  // lógica autenticada
  return {
    statusCode: 200,
    body: JSON.stringify({ data: 'secret info' })
  };
}, CORS_PRESETS.AUTHENTICATED);
```

### 4. Com Helper jsonResponse

```ts
import { withCors, jsonResponse } from '../_shared/cors.ts';

export const handler = withCors(async (event, context) => {
  try {
    const result = await processData();
    return jsonResponse(200, { success: true, result });
  } catch (error) {
    return jsonResponse(400, { error: error.message });
  }
});
```

### 5. CORS Customizado Completo

```ts
import { withCors } from '../_shared/cors.ts';

export const handler = withCors(async (event, context) => {
  // sua lógica
  return {
    statusCode: 200,
    body: JSON.stringify({ data: 'custom cors' })
  };
}, {
  allowOrigin: 'https://interbox-captacao.netlify.app',
  allowMethods: 'POST, PUT',
  allowHeaders: 'Content-Type, X-Custom-Header',
  allowCredentials: true
});
```

## 🎯 Benefícios

1. ✅ **-15 linhas** de código boilerplate por function
2. ✅ **Erro handling automático** com CORS headers
3. ✅ **Preflight (OPTIONS) automático**
4. ✅ **Configuração centralizada** e reutilizável
5. ✅ **Type-safe** com TypeScript
6. ✅ **Presets prontos** para casos comuns

## 🔧 Presets Disponíveis

```ts
import { CORS_PRESETS } from '../_shared/cors.ts';

// Aceita qualquer origem (padrão)
CORS_PRESETS.PUBLIC

// Apenas leitura (GET)
CORS_PRESETS.READ_ONLY

// Com autenticação
CORS_PRESETS.AUTHENTICATED
```

## 📝 Checklist de Migração

Para cada function:

- [ ] Importar `withCors` no topo
- [ ] Remover declaração manual de `headers`
- [ ] Remover bloco `if (event.httpMethod === 'OPTIONS')`
- [ ] Remover merge manual de headers nas respostas
- [ ] Envolver handler com `withCors()`
- [ ] Testar endpoint (especialmente preflight)

## 🚀 Exemplo Completo de Migração

**Arquivo: `get-reviews.js`**

### ❌ Antes (40 linhas)

```js
let createStorage;
const loadStorage = async () => {
  if (!createStorage) {
    const mod = await import('../../src/utils/storage.ts');
    createStorage = mod.createStorage;
  }
};

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }

  try {
    await loadStorage();
    const storage = createStorage();
    const reviews = await storage.read('reviews.json');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, reviews })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

### ✅ Depois (25 linhas) - **37% menos código**

```js
import { withCors, jsonResponse, CORS_PRESETS } from '../_shared/cors.ts';

let createStorage;
const loadStorage = async () => {
  if (!createStorage) {
    const mod = await import('../../src/utils/storage.ts');
    createStorage = mod.createStorage;
  }
};

export const handler = withCors(async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { error: 'Método não permitido' });
  }

  try {
    await loadStorage();
    const storage = createStorage();
    const reviews = await storage.read('reviews.json');

    return jsonResponse(200, { success: true, reviews });
  } catch (error) {
    return jsonResponse(500, { error: error.message });
  }
}, CORS_PRESETS.READ_ONLY);
```

## 🎉 Resultado

- **-15 linhas de boilerplate**
- **Código mais limpo e focado na lógica**
- **Menos bugs** (CORS centralizado)
- **Manutenção simplificada**
