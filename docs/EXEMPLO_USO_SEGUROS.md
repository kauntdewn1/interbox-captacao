# 🚀 Guia Prático - Sistema de Seguros INTERBØX

## 📱 Para Usuários Finais

### 1. Acessar a Página de Seguro
- **URL:** `https://interbox-captacao.netlify.app/seguro`
- **Dispositivo:** Qualquer dispositivo (mobile, tablet, desktop)

### 2. Preencher o Formulário
```
✅ Nome Completo: João Silva Santos
✅ CPF: 123.456.789-00
✅ Data de Nascimento: 15/03/1990
✅ Sexo: Masculino
✅ Email: joao@email.com
✅ Telefone: (11) 99999-9999
✅ Nome do Time: CrossFit Champions
✅ Observações: Alergia a penicilina
```

### 3. Enviar Formulário
- Clicar em "🛡️ Contratar Seguro"
- Aguardar confirmação
- Anotar informações de pagamento

### 4. Fazer o PIX
- **Valor:** R$ 39,90
- **Chave:** 00.283.283/0001-26
- **Beneficiário:** Saga Corretora de Seguros

### 5. Enviar Comprovante
- **Email:** financeirocorretora@gruposaga.com.br
- **Assunto:** Seguro INTERBØX - CPF 123.456.789-00
- **Anexo:** Comprovante do PIX

---

## 🖥️ Para Administradores (Saga Corretora)

### 1. Acessar Dashboard
- **URL:** `https://interbox-captacao.netlify.app/adm_seguro`
- **Login:** API Key fornecida pela INTERBØX

### 2. Sincronizar Dados
- Inserir API Key no campo
- Clicar em "Sincronizar"
- Aguardar carregamento dos dados

### 3. Visualizar Estatísticas
```
📊 Total: 150 seguros
🟡 Pendentes: 45
🟠 Comprovantes: 78
🟢 Pagos: 27
💰 Valor Total: R$ 5.985,00
```

### 4. Filtrar Seguros
- **Por Status:** Pendente, Comprovante, Pago
- **Por Data:** Período específico
- **Por CPF:** Busca direta

### 5. Atualizar Status
- **Pendente → Comprovante:** Usuário enviou comprovante
- **Comprovante → Pago:** Pagamento confirmado
- **Ações:** Dropdown na coluna "Ações"

### 6. Exportar Dados
- Aplicar filtros desejados
- Clicar em "📊 Exportar CSV"
- Arquivo baixado automaticamente

---

## 🔧 Para Desenvolvedores

### 1. Estrutura de Arquivos
```
src/pages/seguro/
├── index.tsx          # Formulário público
└── success/           # Página de sucesso

src/pages/admin/
└── seguro.tsx        # Dashboard admin

netlify/functions/
├── save-seguro.js           # POST /seguro
├── admin-seguros.js         # GET /admin-seguros
└── update-seguro-status.js  # PUT /status
```

### 2. APIs Disponíveis

#### Salvar Seguro
```bash
POST /save-seguro
Authorization: Bearer interbox2025
Content-Type: application/json

{
  "nome": "João Silva",
  "cpf": "123.456.789-00",
  "dataNascimento": "1990-03-15",
  "sexo": "masculino",
  "email": "joao@email.com",
  "telefone": "(11) 99999-9999",
  "nomeTime": "CrossFit Champions",
  "observacoes": "Alergia a penicilina"
}
```

#### Listar Seguros (Admin)
```bash
POST /admin-seguros
Authorization: Bearer {API_KEY_SAGA}
```

#### Atualizar Status
```bash
POST /update-seguro-status
Authorization: Bearer {API_KEY_SAGA}
Content-Type: application/json

{
  "seguroId": "notion_page_id",
  "status": "pago_confirmado"
}
```

### 3. Estados do Sistema
```typescript
type SeguroStatus = 
  | 'pendente_comprovante'    // Usuário preencheu formulário
  | 'comprovante_enviado'     // Comprovante recebido
  | 'pago_confirmado';        // Pagamento confirmado
```

### 4. Validações
- **CPF único:** 1 CPF = 1 seguro
- **Campos obrigatórios:** Todos preenchidos
- **Formato de dados:** Validação de tipos
- **Autorização:** Tokens específicos por função

---

## 📊 Exemplos de Uso Real

### Cenário 1: Usuário Contrata Seguro
1. Acessa `/seguro`
2. Preenche formulário completo
3. Recebe confirmação
4. Faz PIX de R$ 39,90
5. Envia comprovante por email
6. Status muda para "Comprovante Enviado"

### Cenário 2: Admin Atualiza Status
1. Acessa `/adm_seguro`
2. Sincroniza dados
3. Filtra por "Comprovante Enviado"
4. Verifica comprovante recebido
5. Muda status para "Pago e Confirmado"
6. Seguro ativado automaticamente

### Cenário 3: Exportação de Relatórios
1. Admin aplica filtros (data, status)
2. Visualiza lista filtrada
3. Clica em "Exportar CSV"
4. Arquivo baixado com nomenclatura:
   ```
   seguros_interbox_2024-12-20.csv
   ```

---

## 🚨 Troubleshooting

### Problema: Formulário não envia
**Solução:** Verificar conexão com internet e campos obrigatórios

### Problema: API Key não funciona
**Solução:** Verificar se a chave está correta e ativa

### Problema: Dados não sincronizam
**Solução:** Verificar variáveis de ambiente do Netlify

### Problema: Status não atualiza
**Solução:** Verificar permissões da API Key e formato dos dados

---

## 📞 Suporte

### Para Usuários
- **Email:** financeirocorretora@gruposaga.com.br
- **Assunto:** Suporte Seguro INTERBØX

### Para Administradores
- **Email:** Equipe técnica INTERBØX
- **Assunto:** Suporte Admin Seguros

### Para Desenvolvedores
- **Documentação:** Este arquivo + `SISTEMA_SEGUROS.md`
- **Código:** Repositório INTERBØX
- **Logs:** Netlify Functions + Console
