const fs = require('fs');

// Ler dados do localstorage.json
const localstorageContent = fs.readFileSync('.cursor/localstorage.json', 'utf8');
const localstorageMatch = localstorageContent.match(/dadosCompletos = \[(.*)\]/s);

if (!localstorageMatch) {
  console.log('❌ Não foi possível extrair dados do localstorage.json');
  process.exit(1);
}

let localstorageData = [];
try {
  localstorageData = JSON.parse('[' + localstorageMatch[1] + ']');
} catch (e) {
  console.log('❌ Erro ao parsear dados do localstorage:', e.message);
  process.exit(1);
}

console.log('📊 Dados no localstorage.json:', localstorageData.length);

// Buscar dados do Supabase
const { exec } = require('child_process');
exec('curl -X GET "https://interbox-captacao.netlify.app/.netlify/functions/admin-inscricoes/inscricoes" -H "Authorization: Bearer interbox2025"', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Erro ao buscar dados do Supabase:', error);
    return;
  }
  
  try {
    const supabaseResponse = JSON.parse(stdout);
    const supabaseData = supabaseResponse.data || [];
    
    console.log('📊 Dados no Supabase:', supabaseData.length);
    
    // Verificar quais dados do localstorage não estão no Supabase
    const emailsNoSupabase = localstorageData.filter(localItem => {
      return !supabaseData.some(supabaseItem => 
        supabaseItem.email === localItem.email && 
        supabaseItem.tipo === localItem.tipo
      );
    });
    
    console.log('📊 Dados do localstorage que NÃO estão no Supabase:', emailsNoSupabase.length);
    
    if (emailsNoSupabase.length > 0) {
      console.log('\n🔍 Primeiros 5 registros que precisam ser enviados:');
      emailsNoSupabase.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. ${item.nome} (${item.email}) - ${item.tipo}`);
      });
      
      // Salvar dados que precisam ser enviados
      fs.writeFileSync('dados_para_supabase.json', JSON.stringify(emailsNoSupabase, null, 2));
      console.log('\n💾 Dados salvos em dados_para_supabase.json');
    } else {
      console.log('\n✅ Todos os dados do localstorage já estão no Supabase!');
    }
  } catch (e) {
    console.log('❌ Erro ao processar resposta do Supabase:', e.message);
  }
});
