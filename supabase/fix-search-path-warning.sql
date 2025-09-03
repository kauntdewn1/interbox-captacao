-- 🔧 CORRIGIR WARNING DE SEARCH_PATH
-- Execute este SQL no SQL Editor do Supabase (opcional)

-- 1️⃣ RECRIAR FUNÇÃO COM SEARCH_PATH FIXO
CREATE OR REPLACE FUNCTION update_inscricoes_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 2️⃣ VERIFICAR SE A FUNÇÃO FOI ATUALIZADA
SELECT 
  proname as function_name,
  proconfig as config
FROM pg_proc 
WHERE proname = 'update_inscricoes_updated_at';

-- 3️⃣ VERIFICAR SE O TRIGGER AINDA ESTÁ ATIVO
SELECT 
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'update_inscricoes_updated_at';
