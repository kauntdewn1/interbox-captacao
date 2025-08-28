// Teste da função real-time-sync
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'inscricoes.json');

console.log('📁 Caminho do arquivo:', DATA_FILE);
console.log('📊 Diretório existe:', fs.existsSync(path.dirname(DATA_FILE)));
console.log('📄 Arquivo existe:', fs.existsSync(DATA_FILE));

// Testar escrita
try {
  const testData = {
    inscricoes: [
      {
        id: 'test_001',
        nome: 'Teste',
        email: 'teste@teste.com',
        tipo: 'audiovisual',
        status: 'pendente'
      }
    ],
    metadata: {
      ultima_atualizacao: new Date().toISOString(),
      total_inscricoes: 1,
      tipos: { audiovisual: 1 },
      dispositivos: ['test_device'],
      ultima_sincronizacao: new Date().toISOString()
    }
  };
  
  console.log('💾 Tentando salvar dados de teste...');
  fs.writeFileSync(DATA_FILE, JSON.stringify(testData, null, 2), 'utf8');
  console.log('✅ Dados salvos com sucesso!');
  
  // Verificar se foi salvo
  const savedData = fs.readFileSync(DATA_FILE, 'utf8');
  console.log('📖 Dados salvos:', savedData);
  
} catch (error) {
  console.error('❌ Erro ao salvar:', error);
}
