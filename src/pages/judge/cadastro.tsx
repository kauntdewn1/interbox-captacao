import { useState, useEffect } from 'react';
import Header from '../../components/header';
import Footer from '../../components/Footer';
import SEOHead from '../../components/SEOHead';
import { useAnalytics } from '../../hooks/useAnalytics';

export default function JudgeCadastroPage() {
  const { trackPage } = useAnalytics();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    cpf: '',
    certificacoes: '',
    experiencia: '',
    disponibilidade: '',
    motivacao: ''
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
      // Simular envio do formulário
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Salvar no localStorage
      const inscricaoData = {
        id: `judge_insc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nome: formData.nome,
        email: formData.email,
        whatsapp: formData.whatsapp,
        cpf: formData.cpf,
        tipo: 'judge',
        valor: 0, // Gratuito
        status: 'cadastrado',
        data_criacao: new Date().toISOString(),
        certificacoes: formData.certificacoes,
        experiencia: formData.experiencia,
        disponibilidade: formData.disponibilidade,
        motivacao: formData.motivacao
      };
      
      const inscricoesExistentes = JSON.parse(localStorage.getItem('interbox_inscricoes') || '[]');
      inscricoesExistentes.push(inscricaoData);
      localStorage.setItem('interbox_inscricoes', JSON.stringify(inscricoesExistentes));
      
      setIsSubmitted(true);
      console.log('✅ Cadastro judge salvo:', inscricaoData);
    } catch (error) {
      console.error('❌ Erro ao salvar cadastro:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isSubmitted) {
    return (
      <>
        <SEOHead
          title="Cerrado INTERBØX 25 - Cadastro JUDGE Confirmado"
          description="Seu cadastro como Judge foi realizado com sucesso na INTERBØX."
          type="website"
        />
        
        <div className="min-h-screen bg-neutral-950">
          <Header />
          
          <main className="pt-24 pb-16 px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-green-900/20 border border-green-500/30 rounded-3xl p-8 mb-8">
                <div className="text-6xl mb-4">✅</div>
                <h1 className="text-3xl font-bold text-green-400 mb-4">
                  Cadastro Confirmado!
                </h1>
                <p className="text-gray-300 text-lg mb-6">
                  Seu cadastro como Judge foi realizado com sucesso. 
                  Nossa equipe entrará em contato em breve para próximos passos.
                </p>
                <div className="bg-green-800/20 rounded-2xl p-4">
                  <p className="text-green-300 font-medium">
                    📧 Verifique seu email para confirmação
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => window.location.href = '/'}
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-2xl font-semibold transition-all duration-200"
              >
                Voltar ao Início
              </button>
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
          title="Cerrado INTERBØX 25 - Cadastro JUDGE"
          description="Cadastre-se como Judge na INTERBØX. Seja responsável pela avaliação técnica e fair play."
          type="website"
        />
      
      <div className="min-h-screen bg-neutral-950">
        <Header />
        
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent mb-4">
                🎯 CADASTRO JUDGE
              </h1>
              <p className="text-xl text-gray-300">
                Seja responsável pela avaliação técnica, garantindo fair play 
                e excelência competitiva na INTERBØX
              </p>
            </div>

            {/* Formulário */}
            <div className="bg-neutral-900/50 border border-pink-500/20 rounded-3xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome */}
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-300 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    required
                    value={formData.nome}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-neutral-800 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200"
                    placeholder="Digite seu nome completo"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-neutral-800 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200"
                    placeholder="seu@email.com"
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-300 mb-2">
                    WhatsApp *
                  </label>
                  <input
                    type="tel"
                    id="whatsapp"
                    name="whatsapp"
                    required
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-neutral-800 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200"
                    placeholder="(62) 99999-9999"
                  />
                </div>

                {/* CPF */}
                <div>
                  <label htmlFor="cpf" className="block text-sm font-medium text-gray-300 mb-2">
                    CPF *
                  </label>
                  <input
                    type="text"
                    id="cpf"
                    name="cpf"
                    required
                    value={formData.cpf}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-neutral-800 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200"
                    placeholder="000.000.000-00"
                  />
                </div>

                {/* Certificações */}
                <div>
                  <label htmlFor="certificacoes" className="block text-sm font-medium text-gray-300 mb-2">
                    Certificações e Credenciais
                  </label>
                  <textarea
                    id="certificacoes"
                    name="certificacoes"
                    rows={3}
                    value={formData.certificacoes}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-neutral-800 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200"
                    placeholder="Liste suas certificações, credenciais e qualificações..."
                  />
                </div>

                {/* Experiência */}
                <div>
                  <label htmlFor="experiencia" className="block text-sm font-medium text-gray-300 mb-2">
                    Experiência como Judge
                  </label>
                  <textarea
                    id="experiencia"
                    name="experiencia"
                    rows={3}
                    value={formData.experiencia}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-neutral-800 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200"
                    placeholder="Conte sobre sua experiência como judge em competições..."
                  />
                </div>

                {/* Disponibilidade */}
                <div>
                  <label htmlFor="disponibilidade" className="block text-sm font-medium text-gray-300 mb-2">
                    Disponibilidade *
                  </label>
                  <select
                    id="disponibilidade"
                    name="disponibilidade"
                    required
                    value={formData.disponibilidade}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-neutral-800 border border-gray-600 rounded-2xl text-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200"
                  >
                    <option value="">Selecione sua disponibilidade</option>
                    <option value="integral">Integral (sexta, sábado e domingo)</option>
                    <option value="sexta">Apenas sexta-feira</option>
                    <option value="sabado">Apenas sábado</option>
                    <option value="domingo">Apenas domingo</option>
                    <option value="sexta-sabado">Sexta e sábado</option>
                    <option value="sabado-domingo">Sábado e domingo</option>
                  </select>
                </div>

                {/* Motivação */}
                <div>
                  <label htmlFor="motivacao" className="block text-sm font-medium text-gray-300 mb-2">
                    Por que quer ser Judge? *
                  </label>
                  <textarea
                    id="motivacao"
                    name="motivacao"
                    rows={3}
                    required
                    value={formData.motivacao}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-neutral-800 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200"
                    placeholder="Conte sua motivação para participar como Judge..."
                  />
                </div>

                {/* Botão de envio */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 rounded-2xl font-semibold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3 inline"></div>
                      Enviando...
                    </>
                  ) : (
                    '📝 Enviar Cadastro'
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
