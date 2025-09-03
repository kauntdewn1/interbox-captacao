-- 🚀 MIGRAÇÃO COMPLETA COM TODOS OS DADOS HISTÓRICOS (CORRIGIDO)
-- Execute este SQL no SQL Editor do Supabase: https://vlwuwutoulfbbieznios.supabase.co

-- 1️⃣ PRIMEIRO: Limpar dados existentes para inserir os corretos
DELETE FROM inscricoes;

-- 2️⃣ INSERIR TODOS OS DADOS HISTÓRICOS

-- 👨‍⚖️ JUDGES
INSERT INTO inscricoes (
  nome, email, whatsapp, cpf, tipo, valor, status, 
  portfolio, experiencia, disponibilidade, motivacao, certificacoes, data_criacao
) VALUES 
(
  'DANIEL VIEIRA DE SOUZA',
  'daniel@interbox.com',
  '62 99110-2615',
  'CPF não informado',
  'judge',
  0,
  'cadastrado',
  NULL,
  'Não informada',
  'Não informada',
  'Não informada',
  'Não informadas',
  '2025-08-24T00:00:00.000Z'
),
(
  'Luciana Rodrigues Lopes de Oliveira',
  'luciana@interbox.com',
  '62 998593-3971',
  'CPF não informado',
  'judge',
  0,
  'cadastrado',
  NULL,
  'Não informada',
  'Não informada',
  'Não informada',
  'Não informadas',
  '2025-08-23T00:00:00.000Z'
),
(
  'Bruno Peixoto Santos Borges',
  'brunaocross85@gmail.com',
  '62981660285',
  'CPF não informado',
  'judge',
  0,
  'cadastrado',
  NULL,
  'Não informada',
  'Não informada',
  'Não informada',
  'Não informadas',
  '2025-08-28T00:00:00.000Z'
),
(
  'Olavo Filipe Ferreira Leal',
  'olavofilipeleal@gmail.com',
  '(62) 9 9909-6846',
  'CPF não informado',
  'judge',
  0,
  'cadastrado',
  NULL,
  'Não informada',
  'Não informada',
  'Não informada',
  'Não informadas',
  '2025-08-28T00:00:00.000Z'
),
(
  'Leonardo Jaime',
  'leonardojaime.s235@gmail.com',
  '62 993814700',
  'CPF não informado',
  'staff',
  0,
  'cadastrado',
  NULL,
  'Não informada',
  'Não informada',
  'Não informada',
  'Não informadas',
  '2025-09-01T00:00:00.000Z'
);

-- 📸 AUDIOVISUAL
INSERT INTO inscricoes (
  nome, email, whatsapp, cpf, tipo, valor, status, 
  portfolio, experiencia, disponibilidade, motivacao, certificacoes, data_criacao
) VALUES 
(
  'RAFAEL MESSIAS DOS SANTOS',
  'puroestiloacessorios@outlook.com',
  '62 98268-5031',
  'CPF não informado',
  'audiovisual',
  29.90,
  'pago',
  'Typeform',
  'Não informada',
  'Não informada',
  'Não informada',
  'Não informadas',
  '2025-08-24T00:00:00.000Z'
),
(
  'BASE CRIATIVA DIGIT',
  'base@interbox.com',
  'Não informado',
  'CPF não informado',
  'audiovisual',
  29.90,
  'pago',
  'Typeform',
  'Não informada',
  'Não informada',
  'Não informada',
  'Não informadas',
  '2025-08-23T00:00:00.000Z'
),
(
  'Waldinez de Oliveira Luz Junior',
  'cobyti18@gmail.com',
  'Não informado',
  'CPF não informado',
  'audiovisual',
  29.90,
  'pago',
  'Typeform',
  'Não informada',
  'Não informada',
  'Não informada',
  'Não informadas',
  '2025-08-23T00:00:00.000Z'
),
(
  'André Luiz Corrêa dos Santos',
  'andrelcds30@gmail.com',
  '62 98217-3637',
  'CPF não informado',
  'audiovisual',
  29.90,
  'pago',
  'Typeform',
  'Não informada',
  'Não informada',
  'Não informada',
  'Não informadas',
  '2025-08-23T00:00:00.000Z'
),
(
  'RENATA CRISTINA COSTA E SILVA',
  'rebioespecifica@gmail.com',
  '62 99122-3167',
  'CPF não informado',
  'audiovisual',
  29.90,
  'pago',
  'Typeform',
  'Não informada',
  'Não informada',
  'Não informada',
  'Não informadas',
  '2025-08-23T00:00:00.000Z'
),
(
  'RODRIGO JOSE GONCALVES',
  'rodrigojosegoncalves@hotmail.com',
  '62 99391-3203',
  'CPF não informado',
  'audiovisual',
  29.90,
  'pago',
  'Typeform',
  'Não informada',
  'Não informada',
  'Não informada',
  'Não informadas',
  '2025-08-23T00:00:00.000Z'
),
( 
  'Willian Saldanha',
  'fwsbsb@gmail.com',
  '61 98208 0393',
  '276.137.711-72',
  'audiovisual',
  29.90,
  'pago',
  'Typeform',
  'Não informada',
  'Não informada',
  'Não informada',
  'Não informadas',
  '2025-08-23T00:00:00.000Z'
),
(
  'Evanitie de Freitas Carneiro',
  'evanitieecarneiro@gmail.com',
  '61 98539 1318',
  '007.903.442-03',
  'audiovisual',
  29.90,
  'pago',
  'Typeform',
  'Não informada',
  'Não informada',
  'Não informada',
  'Não informadas',
  '2025-08-23T00:00:00.000Z'
),
(
  'Aruake Frois',
  'aruakefrois@gmail.com',
  '61 99831 1772',
  '014.859.336-41',
  'audiovisual',
  29.90,
  'pago',
  'Typeform',
  'Não informada',
  'Não informada',
  'Não informada',
  'Não informadas',
  '2025-08-23T00:00:00.000Z'
),
(
  'Gih Ribeiro',
  'gihsele@gmail.com',
  '11 972721008',
  '229.632.418-5',
  'audiovisual',
  29.90,
  'pago',
  'Typeform',
  'Não informada',
  'Não informada',
  'Não informada',
  'Não informadas',
  '2025-08-23T00:00:00.000Z'
),
(
  'Welder Myllena',
  'weldermyllena@gmail.com',
  '64 981063830',  
  '057.340.391-01',
  'audiovisual',
  29.90,
  'pago',
  'Typeform',
  'Não informada',
  'Não informada',
  'Não informada',
  'Não informadas',
  '2025-08-23T00:00:00.000Z'
);

-- 3️⃣ VERIFICAR MIGRAÇÃO COMPLETA
SELECT 
  '✅ MIGRAÇÃO COMPLETA!' as status,
  COUNT(*) as total_inscricoes,
  COUNT(CASE WHEN tipo = 'judge' THEN 1 END) as total_judges,
  COUNT(CASE WHEN tipo = 'audiovisual' THEN 1 END) as total_audiovisual,
  COUNT(CASE WHEN tipo = 'staff' THEN 1 END) as total_staff,
  SUM(CASE WHEN status = 'pago' THEN valor ELSE 0 END) as valor_total_pago,
  MIN(data_criacao) as primeira_inscricao,
  MAX(data_criacao) as ultima_inscricao
FROM inscricoes;

-- 4️⃣ LISTAR TODAS AS INSCRIÇÕES POR TIPO
SELECT 
  tipo,
  nome,
  email,
  status,
  valor,
  data_criacao
FROM inscricoes 
ORDER BY tipo, data_criacao DESC;
