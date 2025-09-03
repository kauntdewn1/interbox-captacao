-- 🛠️ Script para corrigir trigger duplicado
-- Execute este SQL no SQL Editor do Supabase

-- 1. Verificar triggers existentes
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'seguros';

-- 2. Remover trigger duplicado se existir
DROP TRIGGER IF EXISTS update_seguros_updated_at ON seguros;

-- 3. Recriar o trigger corretamente
CREATE TRIGGER update_seguros_updated_at 
  BEFORE UPDATE ON seguros 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 4. Verificar se o trigger foi criado
SELECT 
  'Trigger criado' as status,
  trigger_name,
  event_manipulation
FROM information_schema.triggers 
WHERE event_object_table = 'seguros';

-- 5. Verificar se a tabela está funcionando
SELECT 
  'Tabela funcionando' as status,
  COUNT(*) as total_registros
FROM seguros;

-- 6. Testar inserção de um novo registro
INSERT INTO seguros (
  nome, 
  cpf, 
  data_nascimento, 
  sexo, 
  email, 
  telefone, 
  nome_time, 
  observacoes, 
  tipo, 
  valor, 
  status
) VALUES 
(
  'Maria Teste Sistema',
  '777.888.999-00',
  '1990-01-01',
  'feminino',
  'maria@teste.com',
  '(11) 77777-7777',
  'Time Teste Sistema',
  'Teste após correção do trigger',
  'seguro',
  39.90,
  'pendente_comprovante'
)
RETURNING id, nome, cpf, status;

-- 7. Verificar se foi inserido
SELECT 
  'Após inserção' as status,
  COUNT(*) as total_registros
FROM seguros;
