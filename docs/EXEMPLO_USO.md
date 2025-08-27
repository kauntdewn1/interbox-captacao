# 💡 EXEMPLOS PRÁTICOS - INTERBØX 2025

## 🎯 **CENÁRIOS DE USO REAL**

---

## 📊 **1. VERIFICAR INSCRIÇÕES DO DIA**

### **Situação**
Você quer saber quantas pessoas se inscreveram hoje para o evento.

### **Passos**
1. **Acesse**: `https://interbox-captacao.netlify.app/admin`
2. **Login**: Digite `interbox2025`
3. **Filtros**: 
   - Data Início: `2025-01-27` (hoje)
   - Data Fim: `2025-01-27` (hoje)
4. **Resultado**: Lista de inscrições do dia

### **O que você vê**
```
📈 Total de Inscrições: 15
🎯 Judge: 8
📸 Audiovisual: 4  
👥 Staff: 3
💰 Valor Total: R$ 299,00
```

---

## 🏷️ **2. RELATÓRIO DE JUDGES**

### **Situação**
Precisa de uma lista completa de todos os judges inscritos para enviar para a coordenação.

### **Passos**
1. **Filtros**:
   - Tipo: `Judge`
   - Status: `Confirmado`
2. **Exportar**: Clique em "📊 Exportar CSV"
3. **Resultado**: Arquivo `inscricoes_interbox_2025.csv`

### **Arquivo CSV Gerado**
```csv
"Nome","Email","WhatsApp","Tipo","Valor","Data Criação","Status"
"João Silva","joao@email.com","11999999999","judge","R$ 19,90","27/01/2025","confirmado"
"Maria Santos","maria@email.com","11988888888","judge","R$ 19,90","27/01/2025","confirmado"
```

---

## 📅 **3. ANÁLISE MENSAL**

### **Situação**
Quer analisar o crescimento das inscrições ao longo do mês.

### **Passos**
1. **Filtros**:
   - Data Início: `2025-01-01`
   - Data Fim: `2025-01-31`
2. **Visualizar**: Estatísticas no topo
3. **Exportar**: Dados completos em CSV

### **Análise Possível**
```
📊 Janeiro 2025:
- Semana 1: 25 inscrições
- Semana 2: 45 inscrições  
- Semana 3: 67 inscrições
- Semana 4: 89 inscrições
→ Crescimento de 256% no mês!
```

---

## 💰 **4. RELATÓRIO FINANCEIRO**

### **Situação**
Precisa prestar contas do valor arrecadado para a organização.

### **Passos**
1. **Estatísticas**: Ver valor total no dashboard
2. **Filtros**: Por período específico
3. **Exportar**: Dados em Excel para contabilidade

### **Relatório Gerado**
```
💰 RELATÓRIO FINANCEIRO - INTERBØX 2025
📅 Período: 01/01/2025 a 27/01/2025

📊 RESUMO:
- Total de Inscrições: 156
- Valor Total: R$ 3.124,00

🎯 POR TIPO:
- Judge: 67 inscrições = R$ 1.333,30
- Audiovisual: 45 inscrições = R$ 1.345,50  
- Staff: 44 inscrições = R$ 875,60

📈 CRESCIMENTO:
- Média diária: 5,8 inscrições
- Projeção mensal: 174 inscrições
```

---

## 🔍 **5. BUSCA ESPECÍFICA**

### **Situação**
Alguém ligou dizendo que se inscreveu mas não recebeu confirmação.

### **Passos**
1. **Filtros**: 
   - Email: Use busca por email
   - Status: `Confirmado`
2. **Verificar**: Se aparece na lista
3. **Ação**: 
   - Se encontrou: Confirmar dados
   - Se não encontrou: Verificar pendências

### **Exemplo de Busca**
```
🔍 Buscando: "joao.silva@email.com"
✅ Encontrado:
- Nome: João Silva
- Tipo: Judge
- Status: Confirmado
- Data: 27/01/2025
- Valor: R$ 19,90
```

---

## 📱 **6. MONITORAMENTO EM TEMPO REAL**

### **Situação**
Evento está rolando e você quer acompanhar inscrições ao vivo.

### **Passos**
1. **Dashboard**: Mantenha aberto
2. **Atualizar**: Clique em "🔄 Atualizar" a cada 5 min
3. **Monitorar**: Novas inscrições aparecem automaticamente

### **O que Monitorar**
```
📊 DASHBOARD AO VIVO:
- ⏰ Última atualização: 15:30
- 🆕 Novas inscrições: +3 (última hora)
- 🎯 Judge: +2, Audiovisual: +1
- 💰 Arrecadado hoje: R$ 89,70
```

---

## 🗂️ **7. ORGANIZAÇÃO POR EQUIPES**

### **Situação**
Precisa organizar as pessoas em equipes para o evento.

### **Passos**
1. **Filtros**: Por tipo (Judge, Audiovisual, Staff)
2. **Exportar**: Cada tipo em arquivo separado
3. **Organizar**: Dados para coordenação

### **Arquivos Gerados**
```
📁 EQUIPES INTERBØX 2025:

👨‍⚖️ JUDGES.csv
- 67 pessoas
- R$ 1.333,30 total

📸 AUDIOVISUAL.csv  
- 45 pessoas
- R$ 1.345,50 total

👥 STAFF.csv
- 44 pessoas  
- R$ 875,60 total
```

---

## 🚨 **8. RESOLUÇÃO DE PROBLEMAS**

### **Situação**
Alguém reportou erro no pagamento.

### **Passos**
1. **Verificar**: Status da inscrição
2. **Logs**: Acessar logs do Netlify
3. **Ação**: Corrigir ou reembolsar

### **Verificação**
```
🔍 PROBLEMA REPORTADO:
- Email: maria@email.com
- Tipo: Audiovisual
- Status: Pendente

📋 AÇÕES:
1. Verificar logs do webhook
2. Confirmar pagamento manualmente
3. Atualizar status no sistema
4. Enviar confirmação por email
```

---

## 💡 **DICAS AVANÇADAS**

### **1. Atalhos de Teclado**
- **F5**: Atualizar página
- **Ctrl+F**: Buscar na página
- **Ctrl+S**: Salvar dados

### **2. Filtros Rápidos**
- **Hoje**: Data início = Data fim = hoje
- **Esta semana**: Data início = segunda, Data fim = domingo
- **Este mês**: Data início = 01, Data fim = último dia

### **3. Exportação Inteligente**
- **CSV**: Para análise em Excel
- **Excel**: Para sistemas de gestão
- **JSON**: Para desenvolvedores

---

## 🎉 **RESULTADO FINAL**

Com estes exemplos, você consegue:
- ✅ **Gerenciar** inscrições eficientemente
- ✅ **Gerar** relatórios profissionais
- ✅ **Monitorar** crescimento do evento
- ✅ **Resolver** problemas rapidamente
- ✅ **Organizar** equipes e logística

**O INTERBØX 2025 está completamente sob controle! 🚀**

---

*Exemplos Práticos - INTERBØX 2025*  
*Versão: 1.0.0*  
*Última atualização: Janeiro 2025*
