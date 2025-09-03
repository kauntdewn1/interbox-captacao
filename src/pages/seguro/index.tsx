import { useState, useEffect } from 'react';
import Header from '../../components/header';
import Footer from '../../components/Footer';
import SEOHead from '../../components/SEOHead';
import { useAnalytics } from '../../hooks/useAnalytics';

export default function SeguroPage() {
  const { trackPage } = useAnalytics();
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    dataNascimento: '',
    sexo: '',
    email: '',
    telefone: '',
    nomeTime: '',
    observacoes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Track page view
  useEffect(() => {
    trackPage();
  }, [trackPage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Preparar dados do seguro
      const seguroData = {
        nome: formData.nome,
        cpf: formData.cpf,
        dataNascimento: formData.dataNascimento,
        sexo: formData.sexo,
        email: formData.email,
        telefone: formData.telefone,
        nomeTime: formData.nomeTime,
        observacoes: formData.observacoes,
        tipo: 'seguro',
        valor: 39.90,
        status: 'pendente_comprovante',
        data_criacao: new Date().toISOString()
      };
      
      // Salvar no servidor via API
      const response = await fetch('https://interbox-captacao.netlify.app/.netlify/functions/save-seguro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer interbox2025'
        },
        body: JSON.stringify(seguroData)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao salvar no servidor');
      }
      
      const result = await response.json();
      console.log('✅ Seguro salvo no servidor:', result);
      
      // Também salvar no localStorage como backup
      const segurosExistentes = JSON.parse(localStorage.getItem('interbox_seguros') || '[]');
      segurosExistentes.push({
        ...seguroData,
        id: result.seguro.id
      });
      localStorage.setItem('interbox_seguros', JSON.stringify(segurosExistentes));
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('❌ Erro ao salvar seguro:', error);
      
      // Fallback: salvar apenas no localStorage
      const seguroData = {
        id: `seguro_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nome: formData.nome,
        cpf: formData.cpf,
        dataNascimento: formData.dataNascimento,
        sexo: formData.sexo,
        email: formData.email,
        telefone: formData.telefone,
        nomeTime: formData.nomeTime,
        observacoes: formData.observacoes,
        tipo: 'seguro',
        valor: 39.90,
        status: 'pendente_comprovante',
        data_criacao: new Date().toISOString()
      };
      
      const segurosExistentes = JSON.parse(localStorage.getItem('interbox_seguros') || '[]');
      segurosExistentes.push(seguroData);
      localStorage.setItem('interbox_seguros', JSON.stringify(segurosExistentes));
      
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isSubmitted) {
    return (
      <>
        <SEOHead
          title="Seguro Confirmado - INTERBØX 2025"
          description="Seu seguro foi registrado com sucesso! Envie o comprovante para finalizar."
          image="/images/og-interbox.png"
          type="website"
        />
        
        <div className="min-h-screen bg-gray-900 text-white">
          <Header />
          
          <main className="pt-24 pb-16 px-4">
            <div className="max-w-4xl mx-auto text-center">
              
              {/* Sucesso */}
              <div className="bg-[#1a1b2f] rounded-3xl p-8 border border-green-500/20 shadow-xl mb-8">
                <div className="text-6xl mb-6">🎉</div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-6">
                  Seguro Registrado!
                </h1>
                <p className="text-xl text-gray-300 mb-8">
                  Seu seguro foi registrado com sucesso. Agora é só enviar o comprovante para finalizar.
                </p>
                
                {/* Logo Saga Corretora */}
                <div className="flex justify-center">
                  <div className="bg-gray-800 rounded-2xl p-4 shadow-xl border border-gray-600">
                    <img 
                      src="/logos/saga_seguros.png" 
                      alt="Saga Corretora de Seguros" 
                      className="h-12 object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Instruções */}
              <div className="bg-[#0f0f23] rounded-3xl p-8 border border-blue-500/20 shadow-xl">
                <h2 className="text-2xl font-bold text-blue-400 mb-6">📋 Próximos Passos</h2>
                
                <div className="space-y-6 text-left max-w-2xl mx-auto">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Faça o PIX</h3>
                      <p className="text-gray-300">Valor: <span className="font-bold text-green-400">R$ 39,90</span></p>
                      <p className="text-gray-300">Chave: <span className="font-mono bg-gray-800 px-2 py-1 rounded">00.283.283/0001-26</span></p>
                      <p className="text-gray-400 text-sm">Saga Corretora de Seguros</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Envie o Comprovante</h3>
                      <p className="text-gray-300">Email: <span className="font-mono bg-gray-800 px-2 py-1 rounded">financeirocorretora@gruposaga.com.br</span></p>
                      <p className="text-gray-400 text-sm">Inclua seu CPF no assunto</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Aguarde Confirmação</h3>
                      <p className="text-gray-300">Sua apólice será ativada após confirmação do pagamento</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                  <p className="text-yellow-400 font-semibold">⚠️ Importante</p>
                  <p className="text-gray-300 text-sm">1 CPF = 1 seguro. Não é possível contratar múltiplos seguros com o mesmo CPF.</p>
                </div>
              </div>
            </div>
          </main>
          
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Seguro INTERBØX 2025 - Proteção Completa"
        description="Contrate seu seguro INTERBØX 2025 por apenas R$ 39,90. Proteção completa para sua participação no maior evento fitness de times da América Latina."
        image="/images/og-interbox.png"
        type="website"
      />
      
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Header da página */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-6">
                🛡️ SEGURO INTERBØX
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Proteção completa para sua participação no maior evento fitness de times da América Latina.
                Por apenas <span className="font-bold text-green-400">R$ 39,90</span>.
              </p>
              
              {/* Logo Saga Corretora */}
              <div className="flex justify-center mb-8">
                <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-600">
                  <img 
                    src="/logos/saga_seguros.png" 
                    alt="Saga Corretora de Seguros" 
                    className="h-16 md:h-20 object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Card principal */}
            <div className="bg-[#1a1b2f] rounded-3xl p-8 border border-blue-500/20 shadow-xl">
              
              {/* Informações do seguro */}
              <div className="bg-[#0f0f23] rounded-3xl p-6 mb-8 border border-blue-500/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-blue-400">📋 Informações do Seguro</h2>
                  <div className="bg-gray-800 rounded-xl p-2 border border-gray-600">
                    <img 
                      src="/logos/saga_seguros.png" 
                      alt="Saga Corretora" 
                      className="h-8 object-contain"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Valor:</span>
                    <span className="font-bold text-green-400">R$ 39,90</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Forma de Pagamento:</span>
                    <span className="font-bold text-white">PIX</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Chave PIX:</span>
                    <span className="font-mono bg-gray-800 px-2 py-1 rounded text-xs">00.283.283/0001-26</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Beneficiário:</span>
                    <span className="font-bold text-white">Saga Corretora de Seguros</span>
                  </div>
                </div>
              </div>

              {/* Formulário */}
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Nome e CPF */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nome" className="block text-sm font-medium text-gray-300 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-[#0f0f23] border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      placeholder="Digite seu nome completo"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cpf" className="block text-sm font-medium text-gray-300 mb-2">
                      CPF *
                    </label>
                    <input
                      type="text"
                      id="cpf"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleInputChange}
                      required
                      maxLength={14}
                      className="w-full px-4 py-3 bg-[#0f0f23] border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>

                {/* Data de Nascimento e Sexo */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-300 mb-2">
                      Data de Nascimento *
                    </label>
                    <input
                      type="date"
                      id="dataNascimento"
                      name="dataNascimento"
                      value={formData.dataNascimento}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-[#0f0f23] border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="sexo" className="block text-sm font-medium text-gray-300 mb-2">
                      Sexo *
                    </label>
                    <select
                      id="sexo"
                      name="sexo"
                      value={formData.sexo}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-[#0f0f23] border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    >
                      <option value="">Selecione...</option>
                      <option value="masculino">Masculino</option>
                      <option value="feminino">Feminino</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                </div>

                {/* Email e Telefone */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-[#0f0f23] border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      placeholder="seu@email.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="telefone" className="block text-sm font-medium text-gray-300 mb-2">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      id="telefone"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-[#0f0f23] border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                {/* Nome do Time */}
                <div>
                  <label htmlFor="nomeTime" className="block text-sm font-medium text-gray-300 mb-2">
                    Nome de seu Time *
                  </label>
                  <input
                    type="text"
                    id="nomeTime"
                    name="nomeTime"
                    value={formData.nomeTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-[#0f0f23] border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    placeholder="Digite o nome do seu time"
                  />
                </div>

                {/* Observações */}
                <div>
                  <label htmlFor="observacoes" className="block text-sm font-medium text-gray-300 mb-2">
                    Observações
                  </label>
                  <textarea
                    id="observacoes"
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-[#0f0f23] border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none"
                    placeholder="Informações adicionais, alergias, condições especiais..."
                  />
                </div>

                {/* Botão de envio */}
                <div className="text-center pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative inline-flex items-center justify-center w-full px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-lg shadow-blue-500/20 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Processando...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">🛡️</span>
                        Contratar Seguro
                        <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Aviso importante */}
            <div className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-center">
              <p className="text-yellow-400 font-semibold mb-2">⚠️ Aviso Importante</p>
              <p className="text-gray-300">1 CPF = 1 seguro. Não é possível contratar múltiplos seguros com o mesmo CPF.</p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
