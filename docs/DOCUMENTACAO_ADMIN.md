# 📚 DOCUMENTAÇÃO ADMINISTRATIVA - INTERBØX 2025

## 🎯 **Visão Geral**

Sistema completo de gestão de inscrições para o CERRADO INTERBØX 2025, incluindo:
- ✅ Captura de dados de contato
- ✅ Geração de PIX via OpenPix/Woovi
- ✅ Confirmação automática de pagamentos
- ✅ Banco de dados JSON local
- ✅ Dashboard de administração
- ✅ Exportação de relatórios

---

## 🔐 **ACESSO AO SISTEMA**

### **Dashboard Web (Recomendado)**
```
🌐 URL: https://interbox-captacao.netlify.app/admin
🔑 API Key: interbox2025 (padrão)
```

### **Alterar API Key de Segurança**
Para produção, altere a API Key padrão em:
```javascript
// config/admin.config.js
export const ADMIN_CONFIG = {
  API_KEY: 'SUA_CHAVE_SECRETA_AQUI', // ← Altere aqui
  // ... outras configurações
};
```

---

## 📊 **DASHBOARD DE ADMINISTRAÇÃO**

### **Funcionalidades Principais**

#### **1. Estatísticas em Tempo Real**
- 📈 Total de inscrições
- 🎯 Contagem por tipo (Judge, Audiovisual, Staff)
- 💰 Valor total arrecadado
- 📅 Inscrições por mês

#### **2. Lista de Inscrições**
- 👥 Nome completo
- 📧 Email
- 📱 WhatsApp
- 🏷️ Tipo de inscrição
- 💵 Valor pago
- 📅 Data de inscrição
- 🗑️ Ações (editar/remover)

#### **3. Filtros Avançados**
- **Tipo**: Judge, Audiovisual, Staff
- **Status**: Confirmado, Pendente
- **Data Início**: Filtrar por período
- **Data Fim**: Filtrar por período

#### **4. Exportação de Dados**
- 📊 **CSV**: Para Excel/Google Sheets
- 📈 **Excel**: Formato JSON estruturado
- 🔄 **Atualizar**: Recarregar dados em tempo real

---

## 🌐 **APIs DISPONÍVEIS**

### **Base URL**
```
https://interbox-captacao.netlify.app/.netlify/functions/admin-inscricoes
```

### **Endpoints**

#### **1. Listar Inscrições**
```bash
GET /inscricoes
GET /inscricoes?tipo=judge
GET /inscricoes?status=confirmado
GET /inscricoes?data_inicio=2025-01-01&data_fim=2025-12-31
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "insc_1234567890_abc123",
      "nome": "João Silva",
      "email": "joao@email.com",
      "whatsapp": "11999999999",
      "tipo": "judge",
      "valor": 1990,
      "status": "confirmado",
      "data_criacao": "2025-01-27T10:00:00.000Z"
    }
  ],
  "total": 1,
  "filtros": {}
}
```

#### **2. Estatísticas**
```bash
GET /estatisticas
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "total_inscricoes": 25,
    "tipos": {
      "judge": 10,
      "audiovisual": 8,
      "staff": 7
    },
    "valor_total": 149500,
    "inscricoes_por_mes": {
      "2025-01": {
        "total": 15,
        "tipos": { "judge": 6, "audiovisual": 5, "staff": 4 }
      }
    }
  }
}
```

#### **3. Exportar Dados**
```bash
GET /export?formato=csv
GET /export?formato=excel
```

---

## 💰 **TIPOS DE INSCRIÇÃO**

| Tipo | Valor | Descrição |
|------|-------|-----------|
| **Judge** | R$ 19,90 | Juízes do evento |
| **Audiovisual** | R$ 29,90 | Fotógrafos e videomakers |
| **Staff** | R$ 19,90 | Equipe de organização |

---

## 🔄 **FLUXO DE FUNCIONAMENTO**

### **1. Inscrição do Usuário**
```
Usuário → Preenche dados → Gera PIX → Paga
```

### **2. Confirmação Automática**
```
OpenPix → Webhook → Banco JSON → Dashboard
```

### **3. Gestão Administrativa**
```
Admin → Dashboard → Visualiza → Filtra → Exporta
```

---

## 🛠️ **MANUTENÇÃO E SUPORTE**

### **Arquivos Importantes**

#### **Banco de Dados**
```bash
📁 data/inscricoes.json
# Arquivo principal com todas as inscrições
# Backup automático a cada operação
```

#### **Configurações**
```bash
📁 config/admin.config.js
# Configurações de administração
# URLs e chaves de API
```

#### **Functions Netlify**
```bash
📁 netlify/functions/
├── create-charge.js      # Criação de PIX
├── check-charge.js       # Verificação de status
├── webhook.js           # Confirmação de pagamento
└── admin-inscricoes.js  # API de administração
```

### **Logs e Monitoramento**

#### **Logs das Functions**
```
🌐 https://app.netlify.com/projects/interbox-captacao/logs/functions
```

#### **Logs do Webhook**
```javascript
// Verificar no console do Netlify
console.log('Webhook OpenPix recebido:', webhookData);
console.log('✅ Inscrição salva no banco:', nome);
```

---

## 🚨 **TROUBLESHOOTING**

### **Problemas Comuns**

#### **1. Dashboard não carrega**
- ✅ Verificar API Key: `interbox2025`
- ✅ Verificar se as functions estão deployadas
- ✅ Verificar logs no Netlify

#### **2. Dados não aparecem**
- ✅ Verificar se há inscrições confirmadas
- ✅ Verificar se o webhook está funcionando
- ✅ Verificar arquivo `data/inscricoes.json`

#### **3. Exportação falha**
- ✅ Verificar permissões de API
- ✅ Verificar formato solicitado (csv/excel)
- ✅ Verificar se há dados para exportar

#### **4. Webhook não salva dados**
- ✅ Verificar logs da function
- ✅ Verificar se OpenPix está enviando webhooks
- ✅ Verificar permissões de escrita no banco

---

## 📱 **COMANDOS ÚTEIS**

### **Deploy das Functions**
```bash
# Deploy completo
netlify deploy --prod --functions netlify/functions

# Apenas functions
netlify deploy --prod --functions netlify/functions --skip-functions-cache
```

### **Build do Projeto**
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
```

### **Verificar Status**
```bash
# Verificar se está rodando
lsof -i :5173

# Verificar logs
netlify logs --functions
```

---

## 🔒 **SEGURANÇA**

### **Recomendações**
1. **Altere a API Key padrão** em produção
2. **Use HTTPS** para todas as comunicações
3. **Monitore logs** regularmente
4. **Faça backup** do arquivo de dados
5. **Restrinja acesso** ao dashboard

### **API Key Segura**
```javascript
// Exemplo de API Key segura
const API_KEY = 'interbox_2025_' + Math.random().toString(36).substr(2, 15);
// Resultado: interbox_2025_a1b2c3d4e5f6g7h
```

---

## 📞 **SUPORTE**

### **Contatos**
- **Desenvolvedor**: Mellø
- **Projeto**: INTERBØX 2025
- **Sistema**: Captação e Gestão de Inscrições

### **Recursos Adicionais**
- 📚 [Documentação OpenPix](https://docs.openpix.com.br/)
- 🌐 [Netlify Functions](https://docs.netlify.com/functions/overview/)
- 📊 [React Router](https://reactrouter.com/)

---

## 🎉 **CONCLUSÃO**

O sistema INTERBØX 2025 está **100% funcional** e pronto para:
- ✅ Receber inscrições reais
- ✅ Processar pagamentos via PIX
- ✅ Gerenciar dados administrativamente
- ✅ Exportar relatórios profissionais
- ✅ Escalar conforme necessário

**Boa sorte com o evento! 🏆**

---

*Última atualização: Janeiro 2025*  
*Versão: 1.0.0*  
*Sistema: INTERBØX Captação*
