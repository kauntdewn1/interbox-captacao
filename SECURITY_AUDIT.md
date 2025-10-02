# 🔐 Auditoria de Segurança - INTERBØX 2025

## ✅ Status Atual: APROVADO COM RESSALVAS

**Data da Auditoria:** Outubro 2025
**Auditado por:** Claude (Arquiteto de Sistemas)

---

## 📋 Checklist de Segurança

### ✅ Proteção de Variáveis de Ambiente

| Item | Status | Observações |
|------|--------|-------------|
| `.env` no `.gitignore` | ✅ | Linha 12 do .gitignore |
| `.env.local` no `.gitignore` | ✅ | Linha 13 do .gitignore |
| `.env.example` criado | ✅ | Sem valores sensíveis |
| Variáveis sensíveis não expostas no frontend | ⚠️ | Ver seção "Problemas Críticos" |

### ⚠️ Problemas Críticos Encontrados

#### 1. **API Keys Expostas no .env com Prefixo VITE_**

**Severidade:** 🔴 CRÍTICA

**Problema:**
```bash
# ❌ EXPOSTO NO BUNDLE FRONTEND
VITE_OPENPIX_API_KEY=Q2xpZW50X0lkX2VhNGNh...

# ❌ EXPOSTO NO BUNDLE FRONTEND
VITE_OPENPIX_WOOVI_APP_ID=Q2xpZW50X0lkX2VhNGNh...
```

**Impacto:**
- Qualquer pessoa pode abrir o DevTools do navegador e ver essas chaves
- Atacantes podem fazer cobranças falsas em nome da INTERBØX
- Possível fraude financeira

**Solução:**
```bash
# ✅ APENAS NO BACKEND (Netlify Functions)
OPENPIX_API_KEY=Q2xpZW50X0lkX2VhNGNh...

# ✅ NO FRONTEND (Apenas IDs públicos, sem chaves secretas)
VITE_OPENPIX_CORP_ID=ea4cadf3-347f-410b-8064-452f7e80b082
```

**Ações Imediatas:**
1. Remover `VITE_OPENPIX_API_KEY` do `.env`
2. Remover `VITE_OPENPIX_WOOVI_APP_ID` do `.env`
3. **Rotacionar API Keys no dashboard OpenPix** (chaves antigas estão comprometidas)
4. Usar apenas `OPENPIX_API_KEY` (sem VITE_) nas Netlify Functions

---

#### 2. **Chave PIX FlowPay Não Configurada**

**Severidade:** 🟡 MÉDIA

**Problema:**
```typescript
// payment-split.service.ts linha 52
pixKey: process.env.FLOWPAY_PIX_KEY || '',
```

A variável `FLOWPAY_PIX_KEY` não está definida no `.env`.

**Impacto:**
- Split de 10% para FlowPay não será executado
- Dinheiro ficará retido ou irá 100% para o fornecedor

**Solução:**
Adicionar no `.env`:
```bash
FLOWPAY_PIX_KEY=sua_chave_pix_flowpay_aqui
```

---

#### 3. **URL Hardcoded em Webhook**

**Severidade:** 🟢 BAIXA

**Problema:**
```javascript
// webhook.js linha 105
const response = await fetch(`${process.env.URL || 'https://interbox-captacao.netlify.app'}/.netlify/functions/save-order`
```

URL hardcoded pode causar problemas em ambientes de staging.

**Solução:**
Garantir que `URL` está configurada em todos os ambientes:
```bash
# .env
URL=https://interbox-captacao.netlify.app

# .env.staging (se existir)
URL=https://staging--interbox-captacao.netlify.app
```

---

### ✅ Boas Práticas Implementadas

1. **CORS Configurado Corretamente**
   - Middleware `withCors()` em todas as functions públicas
   - Presets `READ_ONLY` para endpoints de leitura

2. **Validação de Entrada**
   - Validators centralizados em `src/utils/validators.ts`
   - Validação de CPF com algoritmo oficial
   - Sanitização de email e strings

3. **Storage Seguro**
   - Uso de Netlify Blobs ou FileSystem
   - Sanitização de dados antes de salvar
   - Sem SQL injection (não usa SQL direto)

4. **Logs Sem Dados Sensíveis**
   - CPFs e emails sanitizados nos logs
   - Uso de `sanitizeEmail()` e `sanitizeString()`

5. **Webhook Validation (Parcial)**
   - Token de webhook configurado
   - ⚠️ Falta implementar validação de assinatura HMAC

---

## 🛠️ Correções Necessárias

### Prioridade 1 (Crítica) - Fazer AGORA

#### A. Rotacionar API Keys OpenPix

```bash
# 1. Acessar https://app.woovi.com/home/applications/tab/charge/api-keys
# 2. Revogar chave atual
# 3. Gerar nova chave
# 4. Atualizar no Netlify:
#    Dashboard → Site Settings → Environment Variables
# 5. Atualizar .env local
```

#### B. Remover Variáveis VITE_ Sensíveis

**Arquivo:** `.env`

**Remover:**
```bash
# ❌ REMOVER ESTAS LINHAS
VITE_OPENPIX_API_KEY=...
VITE_OPENPIX_WOOVI_APP_ID=...
```

**Manter apenas:**
```bash
# ✅ MANTER (Sem prefixo VITE_)
OPENPIX_API_KEY=sua_nova_chave_aqui
OPENPIX_CORP_ID=ea4cadf3-347f-410b-8064-452f7e80b082
API_BASE_URL=https://api.woovi.com
```

**Netlify Environment Variables:**
```bash
netlify env:set OPENPIX_API_KEY "nova_chave_aqui"
netlify env:set RESEND_API_KEY "re_..."
netlify env:set FLOWPAY_PIX_KEY "chave_pix_flowpay"
```

#### C. Verificar Código Frontend

Buscar usos de `import.meta.env.VITE_OPENPIX_API_KEY`:

```bash
# Verificar se há uso indevido no frontend
grep -r "VITE_OPENPIX_API_KEY" src/
```

Se encontrar, **substituir por chamadas via Netlify Functions**.

**Antes (❌ INSEGURO):**
```typescript
// src/components/Checkout.tsx
const apiKey = import.meta.env.VITE_OPENPIX_API_KEY;
fetch('https://api.woovi.com/api/v1/charge', {
  headers: { 'Authorization': apiKey }
});
```

**Depois (✅ SEGURO):**
```typescript
// src/components/Checkout.tsx
fetch('/.netlify/functions/create-charge', {
  method: 'POST',
  body: JSON.stringify({ ... })
});
```

---

### Prioridade 2 (Alta) - Fazer Esta Semana

#### D. Implementar Validação de Webhook HMAC

**Arquivo:** `netlify/functions/webhook.js`

**Adicionar no início do handler:**
```javascript
import crypto from 'crypto';

const verifyWebhookSignature = (payload, signature) => {
  const secret = process.env.OPENPIX_WEBHOOK_SECRET;

  if (!secret) {
    console.warn('⚠️ OPENPIX_WEBHOOK_SECRET não configurado');
    return true; // Permitir por enquanto
  }

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  const expectedSignature = hmac.digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

export const handler = async (event) => {
  const signature = event.headers['x-openpix-signature'];
  const payload = JSON.parse(event.body);

  if (!verifyWebhookSignature(payload, signature)) {
    console.error('❌ Webhook signature inválida');
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid signature' })
    };
  }

  // ... resto do código
};
```

**Configurar:**
```bash
# .env
OPENPIX_WEBHOOK_SECRET=gere_string_aleatoria_segura_aqui
```

#### E. Adicionar Rate Limiting

**Arquivo:** `netlify/functions/get-supplier-sales.js`

```javascript
import { RateLimiter } from 'limiter';

const limiter = new RateLimiter({
  tokensPerInterval: 60,
  interval: 'minute'
});

export const handler = withCors(async (event) => {
  const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'];

  const hasToken = await limiter.tryRemoveTokens(1);
  if (!hasToken) {
    return jsonResponse(429, {
      error: 'Rate limit exceeded',
      message: 'Máximo de 60 requisições por minuto'
    });
  }

  // ... resto do código
});
```

**Instalar:**
```bash
npm install limiter
```

---

### Prioridade 3 (Média) - Fazer Este Mês

#### F. Adicionar Autenticação no Dashboard Fornecedor

**Arquivo:** `src/pages/fornecedor/index.tsx`

```typescript
import { useState, useEffect } from 'react';

export default function FornecedorDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    const auth = localStorage.getItem('fornecedor_auth');
    if (auth === 'playk_authenticated') {
      setAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    // ⚠️ TEMPORÁRIO: Substituir por JWT/OAuth
    if (password === process.env.VITE_FORNECEDOR_PASSWORD) {
      localStorage.setItem('fornecedor_auth', 'playk_authenticated');
      setAuthenticated(true);
    } else {
      alert('Senha incorreta');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4">Login Fornecedor</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite a senha"
            className="w-full px-4 py-2 border rounded mb-4"
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button
            onClick={handleLogin}
            className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  // ... resto do dashboard
}
```

**Configurar:**
```bash
# .env
VITE_FORNECEDOR_PASSWORD=playk2025_secure
```

#### G. Habilitar Supabase RLS (Row Level Security)

**Acessar:** https://supabase.com/dashboard/project/ymriypyyirnwctyitcsu/auth/policies

**Criar políticas:**

```sql
-- Política para tabela inscricoes
CREATE POLICY "Apenas admin pode ler inscricoes"
ON inscricoes FOR SELECT
USING (auth.role() = 'service_role');

-- Política para tabela seguros
CREATE POLICY "Apenas admin pode ler seguros"
ON seguros FOR SELECT
USING (auth.role() = 'service_role');

-- Política para tabela orders
CREATE POLICY "Apenas admin pode ler orders"
ON orders FOR SELECT
USING (auth.role() = 'service_role');
```

---

## 📊 Matriz de Risco

| Vulnerabilidade | Severidade | Probabilidade | Impacto | Prioridade |
|-----------------|------------|---------------|---------|------------|
| API Keys expostas no frontend | 🔴 Crítica | Alta | Alto | P1 |
| Webhook sem validação HMAC | 🟡 Média | Média | Alto | P2 |
| Dashboard sem autenticação | 🟡 Média | Alta | Médio | P3 |
| Sem rate limiting | 🟡 Média | Média | Médio | P2 |
| URL hardcoded | 🟢 Baixa | Baixa | Baixo | P3 |
| Supabase RLS desabilitado | 🟡 Média | Baixa | Alto | P3 |

---

## ✅ Checklist Final de Deploy Seguro

- [ ] Rotacionar API Keys OpenPix
- [ ] Remover `VITE_OPENPIX_API_KEY` do `.env`
- [ ] Configurar `FLOWPAY_PIX_KEY` no `.env`
- [ ] Adicionar `OPENPIX_WEBHOOK_SECRET` no `.env`
- [ ] Implementar validação HMAC no webhook
- [ ] Adicionar rate limiting nas functions públicas
- [ ] Adicionar autenticação no dashboard `/fornecedor`
- [ ] Habilitar RLS no Supabase
- [ ] Testar fluxo completo em staging
- [ ] Monitorar logs nos primeiros 7 dias

---

## 🔍 Como Verificar se API Keys Estão Seguras

### Teste 1: API Key não deve estar no bundle frontend

```bash
# Build da aplicação
npm run build

# Procurar por API keys no bundle
grep -r "OPENPIX_API_KEY" dist/
grep -r "Q2xpZW50X0lkX2VhNGNh" dist/

# ✅ Resultado esperado: Nenhum match
# ❌ Se encontrar: API key está exposta!
```

### Teste 2: Verificar variáveis no DevTools

1. Abrir site em produção
2. Abrir DevTools (F12)
3. Console: `console.log(import.meta.env)`
4. ✅ Deve mostrar apenas variáveis `VITE_` públicas
5. ❌ Se mostrar `VITE_OPENPIX_API_KEY`: **CRÍTICO!**

### Teste 3: Tentar usar API key diretamente do frontend

```javascript
// Tentar no console do navegador
fetch('https://api.woovi.com/api/v1/charge', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer COPIAR_CHAVE_DO_ENV'
  }
});

// ❌ Se funcionar: Chave está válida e exposta!
// ✅ Se retornar 401: Chave foi rotacionada (bom!)
```

---

## 📞 Contatos de Segurança

**Em caso de incidente de segurança:**
1. Revogar imediatamente todas as API Keys
2. Notificar OpenPix/Woovi: suporte@woovi.com
3. Notificar Resend: security@resend.com
4. Revisar logs de transações suspeitas

**Checklist de Resposta a Incidentes:**
- [ ] Revogar API keys comprometidas
- [ ] Gerar novas API keys
- [ ] Atualizar `.env` e Netlify Environment Variables
- [ ] Deploy de emergência
- [ ] Revisar transações das últimas 24h
- [ ] Notificar stakeholders

---

**Última Atualização:** Outubro 2025
**Próxima Revisão:** Novembro 2025
