export const handler = async (event, context) => {
  console.log('=== TESTE DE VARIÁVEIS DE AMBIENTE ===');
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
  console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log('SUPABASE_SERVICE_ROLE_KEY length:', process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.length : 0);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Teste de variáveis de ambiente',
      supabase_url: process.env.SUPABASE_URL,
      supabase_key_exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabase_key_length: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.length : 0,
      node_env: process.env.NODE_ENV
    })
  };
};
