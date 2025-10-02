# 🔐 Relatório de Segurança - INTERBØX 2025

## 📊 Status: ⚠️ AÇÃO NECESSÁRIA

**Data:** Outubro 2025
**Auditor:** Claude (Arquitecto de Segurança)

---

## 🚨 PROBLEMAS CRÍTICOS ENCONTRADOS

### 1. API Keys Expostas no Bundle Frontend (CRÍTICO 🔴)

**Problema:**
7 variáveis com prefixo `VITE_` estão no `.env`, incluindo chaves sensíveis:

```bash
❌ VITE_OPENPIX_API_KEY          # EXPOSTA NO NAVEGADOR
❌ VITE_OPENPIX_WOOVI_APP_ID     # EXPOSTA NO NAVEGADOR
⚠️ VITE_OPENPIX_WEBHOOK_TOKEN    # EXPOSTA NO NAVEGADOR
⚠️ VITE_WEBHOOK_URL              # Pode expor, não sensível
✅ VITE_OPENPIX_CORP_ID           # ID público, OK
✅ VITE_API_BASE_URL              # URL pública, OK
✅ VITE_NODE_ENV                  # Configuração, OK
```

**Impacto:**
- Qualquer pessoa pode inspecionar o código do site e obter as chaves
- Possibilidade de criar cobranças falsas
- Fraude financeira
- Acesso não autorizado ao gateway de pagamento

**Solução Imediata:**

1. **Remover do `.env`:**
```bash
# ❌ REMOVER ESTAS 3 LINHAS
VITE_OPENPIX_API_KEY=...
VITE_OPENPIX_WOOVI_APP_ID=...
VITE_OPENPIX_WEBHOOK_TOKEN=...
```

2. **Adicionar versões sem VITE_:**
```bash
# ✅ ADICIONAR (apenas backend)
OPENPIX_API_KEY=sua_chave_aqui
OPENPIX_WOOVI_APP_ID=seu_app_id_aqui
OPENPIX_WEBHOOK_TOKEN=webhook_interbox_2025_secure
```

3. **Rotacionar chaves no OpenPix:**
```
→ Acessar: https://app.woovi.com/home/applications
→ Revogar API Key atual
→ Gerar nova API Key
→ Atualizar no .env e Netlify
```

---

### 2. Variável FLOWPAY_PIX_KEY Ausente (ALTA 🟡)

**Problema:**
```typescript
// payment-split.service.ts
pixKey: process.env.FLOWPAY_PIX_KEY || '',
//                                      ↑ String vazia = split falhará
```

**Impacto:**
- Split de 10% para FlowPay não será executado
- Fornecedor receberá 100% ao invés de 90%
- Perda de receita da comissão

**Solução:**
```bash
# Adicionar no .env
FLOWPAY_PIX_KEY=chave_pix_da_flowpay_aqui
```

---

### 3. Variável RESEND_API_KEY Ausente (ALTA 🟡)

**Problema:**
```typescript
// email.service.ts
apiKey: config?.apiKey || process.env.RESEND_API_KEY || '',
//                                                        ↑ String vazia = emails não enviam
```

**Impacto:**
- Emails para fornecedor não serão enviados
- PlayK não receberá notificação de novos pedidos
- Possível perda de vendas por falta de comunicação

**Solução:**
```bash
# Obter em: https://resend.com/api-keys
# Adicionar no .env
RESEND_API_KEY=re_sua_chave_resend_aqui
```

---

## ✅ Proteções Implementadas Corretamente

| Item | Status | Localização |
|------|--------|-------------|
| `.env` no `.gitignore` | ✅ | `.gitignore:12` |
| `.env.local` no `.gitignore` | ✅ | `.gitignore:13` |
| `.env.*.local` no `.gitignore` | ✅ | `.gitignore:14-16` |
| `.env.example` criado | ✅ | Raiz do projeto |
| Documentação de segurança | ✅ | `SECURITY_AUDIT.md` |
| CORS configurado | ✅ | `_shared/cors.ts` |
| Validators centralizados | ✅ | `src/utils/validators.ts` |
| Sanitização de dados | ✅ | `src/utils/storage.ts` |

---

## 🛠️ AÇÕES NECESSÁRIAS (Por Prioridade)

### 🔴 Prioridade 1 - CRÍTICO (Fazer HOJE)

#### Passo 1: Rotacionar API Keys OpenPix

```bash
# 1. Acessar dashboard OpenPix
open https://app.woovi.com/home/applications/tab/charge/api-keys

# 2. Revogar chave atual
# 3. Gerar nova chave
# 4. Copiar nova chave
```

#### Passo 2: Atualizar .env (Remover VITE_)

**Editar:** `/Users/nettomello/interbox-captacao/.env`

```bash
# ============================================================================
# REMOVER ESTAS LINHAS:
# ============================================================================
# VITE_OPENPIX_API_KEY=...           ← REMOVER
# VITE_OPENPIX_WOOVI_APP_ID=...      ← REMOVER
# VITE_OPENPIX_WEBHOOK_TOKEN=...     ← REMOVER

# ============================================================================
# ADICIONAR ESTAS LINHAS (SEM VITE_):
# ============================================================================
OPENPIX_API_KEY=sua_nova_chave_aqui
OPENPIX_WOOVI_APP_ID=seu_app_id_aqui
OPENPIX_WEBHOOK_TOKEN=webhook_interbox_2025_$(openssl rand -hex 16)

# ============================================================================
# ADICIONAR ESTAS NOVAS VARIÁVEIS:
# ============================================================================
RESEND_API_KEY=re_sua_chave_resend_aqui
FLOWPAY_PIX_KEY=chave_pix_flowpay_aqui
OPENPIX_WEBHOOK_SECRET=$(openssl rand -hex 32)
```

#### Passo 3: Configurar Netlify Environment Variables

```bash
# Instalar Netlify CLI (se não tiver)
npm install -g netlify-cli

# Login
netlify login

# Configurar variáveis
netlify env:set OPENPIX_API_KEY "nova_chave_aqui"
netlify env:set RESEND_API_KEY "re_sua_chave_aqui"
netlify env:set FLOWPAY_PIX_KEY "chave_pix_flowpay"
netlify env:set OPENPIX_WEBHOOK_SECRET "$(openssl rand -hex 32)"

# Verificar
netlify env:list
```

**Ou via Dashboard Netlify:**
```
→ https://app.netlify.com/sites/interbox-captacao/settings/deploys#environment
→ Adicionar variáveis uma por uma
→ Redeploy do site
```

#### Passo 4: Verificar Frontend

```bash
# Buscar usos de VITE_OPENPIX_API_KEY no código
grep -r "VITE_OPENPIX_API_KEY" src/

# Se encontrar, substituir por chamadas via Netlify Functions
```

#### Passo 5: Build e Verificar

```bash
# Build
npm run build

# Verificar se API keys NÃO estão no bundle
grep -r "Q2xpZW50X0lkX2VhNGNh" dist/

# ✅ Esperado: Nenhum resultado
# ❌ Se encontrar: API key ainda está exposta!
```

---

### 🟡 Prioridade 2 - ALTA (Fazer Esta Semana)

#### A. Implementar Validação HMAC no Webhook

**Arquivo:** `netlify/functions/webhook.js`

**Adicionar no topo:**
```javascript
import crypto from 'crypto';

const verifyWebhookSignature = (payload, signature) => {
  const secret = process.env.OPENPIX_WEBHOOK_SECRET;

  if (!secret) {
    console.warn('⚠️ OPENPIX_WEBHOOK_SECRET não configurado - INSEGURO!');
    return true; // Permitir temporariamente
  }

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  const expectedSignature = hmac.digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};
```

**Adicionar no início do handler:**
```javascript
export const handler = async (event, context) => {
  // Validar assinatura HMAC
  const signature = event.headers['x-openpix-signature'];
  const payload = JSON.parse(event.body);

  if (!verifyWebhookSignature(payload, signature)) {
    console.error('❌ Webhook signature inválida - possível ataque!');
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid signature' })
    };
  }

  // ... resto do código
};
```

#### B. Adicionar Rate Limiting

**Instalar:**
```bash
npm install limiter
```

**Aplicar em functions públicas:**
- `get-supplier-sales.js`
- `get-products.js`
- `get-reviews.js`

**Exemplo:**
```javascript
import { RateLimiter } from 'limiter';

const limiter = new RateLimiter({ tokensPerInterval: 60, interval: 'minute' });

export const handler = withCors(async (event) => {
  const ip = event.headers['x-forwarded-for'];

  if (!(await limiter.tryRemoveTokens(1))) {
    return jsonResponse(429, { error: 'Rate limit exceeded' });
  }

  // ... resto do código
});
```

---

### 🟢 Prioridade 3 - MÉDIA (Fazer Este Mês)

#### C. Autenticação no Dashboard Fornecedor

**Arquivo:** `src/pages/fornecedor/index.tsx`

```typescript
// Adicionar proteção por senha simples
const [authenticated, setAuthenticated] = useState(false);

useEffect(() => {
  const auth = localStorage.getItem('fornecedor_auth');
  if (auth !== 'playk_authenticated') {
    setAuthenticated(false);
  }
}, []);

if (!authenticated) {
  return <LoginScreen onSuccess={() => setAuthenticated(true)} />;
}
```

#### D. Habilitar Supabase RLS

```sql
-- Criar políticas de segurança
ALTER TABLE inscricoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE seguros ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only" ON inscricoes
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admin only" ON seguros
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admin only" ON orders
  FOR ALL USING (auth.role() = 'service_role');
```

---

## 📋 Checklist de Verificação de Segurança

### Antes do Deploy

- [ ] `.env` não contém variáveis `VITE_` com API keys
- [ ] `OPENPIX_API_KEY` configurada (sem VITE_)
- [ ] `RESEND_API_KEY` configurada
- [ ] `FLOWPAY_PIX_KEY` configurada
- [ ] `OPENPIX_WEBHOOK_SECRET` configurada
- [ ] API Keys antigas foram rotacionadas
- [ ] Netlify Environment Variables atualizadas
- [ ] Build verificado (sem API keys no bundle)
- [ ] Teste de segurança realizado

### Teste de Segurança (Manual)

```bash
# 1. Build
npm run build

# 2. Verificar bundle
grep -r "OPENPIX_API_KEY" dist/
grep -r "RESEND_API_KEY" dist/

# 3. Verificar no navegador
# Abrir DevTools → Console
console.log(Object.keys(import.meta.env))

# Deve mostrar apenas:
# - VITE_OPENPIX_CORP_ID
# - VITE_API_BASE_URL
# - VITE_NODE_ENV
# - VITE_WEBHOOK_URL (não sensível)
```

### Após Deploy

- [ ] Webhook recebendo pagamentos corretamente
- [ ] Split sendo executado (verificar logs)
- [ ] Emails sendo enviados para PlayK
- [ ] Dashboard `/fornecedor` funcionando
- [ ] Sem erros 500 nos logs
- [ ] Validação HMAC ativa (se implementada)
- [ ] Rate limiting funcionando (se implementado)

---

## 📞 Em Caso de Incidente

### Cenário 1: API Key Comprometida

1. **Revogar imediatamente** no dashboard OpenPix
2. Gerar nova API Key
3. Atualizar `.env` local
4. Atualizar Netlify: `netlify env:set OPENPIX_API_KEY "nova_chave"`
5. Deploy de emergência: `netlify deploy --prod`
6. Revisar transações suspeitas das últimas 24h

### Cenário 2: Webhook Recebendo Requisições Falsas

1. Implementar validação HMAC (Prioridade 2A)
2. Adicionar IP whitelist no Netlify (se possível)
3. Monitorar logs: `netlify functions:log webhook --live`
4. Bloquear IPs suspeitos via Netlify firewall

### Cenário 3: Split Falhando

1. Verificar `FLOWPAY_PIX_KEY` configurada
2. Verificar saldo da conta FlowPay
3. Verificar logs: `netlify functions:log webhook --live`
4. Revisar `splits.json` para erros
5. Executar split manual se necessário

---

## 📈 Métricas de Segurança

| Métrica | Antes | Depois | Meta |
|---------|-------|--------|------|
| API Keys expostas | 3 | 0 | 0 |
| Variáveis sensíveis com VITE_ | 3 | 0 | 0 |
| Functions sem rate limit | 22 | 0 | 0 |
| Webhook sem validação HMAC | Sim | Não | Não |
| Dashboard sem auth | Sim | Não | Não |
| RLS desabilitado | Sim | Não | Não |

---

## 🎯 Resumo Executivo

### O Que Está Bom ✅

- `.gitignore` protegendo `.env` corretamente
- CORS configurado em todas as functions
- Validators centralizados com sanitização
- Documentação completa de segurança
- Código modular e testável

### O Que Precisa de Atenção ⚠️

1. **CRÍTICO:** 3 API keys expostas no frontend via `VITE_`
2. **ALTO:** `FLOWPAY_PIX_KEY` ausente (split não funciona)
3. **ALTO:** `RESEND_API_KEY` ausente (emails não enviam)
4. **MÉDIO:** Webhook sem validação HMAC
5. **MÉDIO:** Dashboard sem autenticação
6. **MÉDIO:** Functions sem rate limiting

### Próximos Passos

1. **HOJE:** Rotacionar API keys e remover variáveis `VITE_` sensíveis
2. **HOJE:** Configurar `RESEND_API_KEY` e `FLOWPAY_PIX_KEY`
3. **Esta semana:** Implementar validação HMAC e rate limiting
4. **Este mês:** Adicionar autenticação no dashboard e habilitar RLS

---

**Última Atualização:** Outubro 2025
**Status:** ⚠️ AÇÃO NECESSÁRIA
**Próxima Revisão:** Após correções críticas
