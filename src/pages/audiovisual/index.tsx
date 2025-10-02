import { useState, useEffect } from 'react';
import Header from '../../components/header';
import Footer from '../../components/Footer';   
import SEOHead from '../../components/SEOHead';
import { useAnalytics } from '../../hooks/useAnalytics';

interface ContactInfo {
  email: string;
  whatsapp: string;
}

export default function AudiovisualInscricaoPage() {
  const { trackPage, trackAudiovisual } = useAnalytics();
  const [isLoading, setIsLoading] = useState(false);
  const [showContactForm, setShowContactForm] = useState(true);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: '',
    whatsapp: ''
  });
  const [contactErrors, setContactErrors] = useState<Partial<ContactInfo>>({});
  const [contactSaved, setContactSaved] = useState(false);

  // Track page view
  useEffect(() => {
    trackPage('audiovisual');
    trackAudiovisual('page_view', 'audiovisual_registration');
  }, [trackPage, trackAudiovisual]);

  // Carregar dados de contato salvos anteriormente
  useEffect(() => {
    try {
      const savedContactInfo = localStorage.getItem('interbox_contact_info');
      if (savedContactInfo) {
        const parsed = JSON.parse(savedContactInfo);
        // Só carregar se for do tipo audiovisual
        if (parsed.type === 'audiovisual') {
          setContactInfo({
            email: parsed.email || '',
            whatsapp: parsed.whatsapp || ''
          });
          setShowContactForm(false);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados salvos:', error);
    }
  }, []);

  // Validação dos dados de contato
  const validateContactInfo = (): boolean => {
    const errors: Partial<ContactInfo> = {};
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const whatsappRegex = /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/;
    
    if (!contactInfo.email || !emailRegex.test(contactInfo.email)) {
      errors.email = 'Email válido é obrigatório';
    }
    
    if (!contactInfo.whatsapp || !whatsappRegex.test(contactInfo.whatsapp)) {
      errors.whatsapp = 'WhatsApp válido é obrigatório (ex: 11 99999-9999)';
    }
    
    setContactErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Salvar dados de contato
  const handleSaveContactInfo = async () => {
    if (!validateContactInfo()) return;
    
    try {
      // Salvar no localStorage para uso posterior
      const contactData = {
        ...contactInfo,
        type: 'audiovisual',
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('interbox_contact_info', JSON.stringify(contactData));
      
      // 🆕 SALVAR NO SUPABASE IMEDIATAMENTE
      const inscricaoData = {
        nome: contactInfo.email.split('@')[0], // Usar parte do email como nome temporário
        email: contactInfo.email,
        whatsapp: contactInfo.whatsapp,
        cpf: '', // CPF será preenchido no checkout
        tipo: 'audiovisual',
        valor: 29.90,
        status: 'cadastrado',
        portfolio: '',
        experiencia: '',
        disponibilidade: '',
        motivacao: '',
        certificacoes: ''
      };
      
      const response = await fetch('https://interbox-captacao.netlify.app/.netlify/functions/save-inscricao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer interbox2025'
        },
        body: JSON.stringify(inscricaoData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Inscrição audiovisual salva no Supabase:', result.inscricao?.id);
      } else {
        console.error('❌ Erro ao salvar inscrição no Supabase:', response.status);
      }
      
      // Log para debug e acompanhamento
      console.log('📧 INTERBØX - Dados de contato capturados:', {
        ...contactData,
        role: 'Audiovisual',
        event: 'INTERBØX 2025'
      });
      
      setShowContactForm(false);
      setContactSaved(true);
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setContactSaved(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar dados de contato:', error);
    }
  };

  const handlePayment = () => {
    if (showContactForm) {
      alert('Por favor, complete seus dados de contato antes de prosseguir.');
      return;
    }
    
    setIsLoading(true);
    // Link real do OpenPix para Audiovisual
    const openPixLink = 'https://openpix.com.br/pay/03aa867e-46ff-45a3-9cdd-60900cc9b222';
    window.open(openPixLink, '_blank');
    setIsLoading(false);
  };

  return (
    <>
      <SEOHead
        title="Inscrição Audiovisual - INTERBØX 2025"
        description="Inscreva-se como audiovisual no maior evento fitness de times da América Latina. Capture momentos épicos e faça parte da história!"
        image="/images/og-interbox.png"
        type="website"
      />
      
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Header da página */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent mb-4">
                Audiovisual
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Capture a intensidade, eternize os momentos épicos e conte a história da INTERBØX através das suas lentes
              </p>
            </div>

            {/* Explicação do papel */}
            <div className="bg-gray-800 rounded-3xl p-8 mb-12 border border-gray-700">
              <h2 className="text-2xl font-semibold mb-6 text-center">
                🎬 Seu Papel na INTERBØX 2025
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 text-gray-300">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-pink-400">📸 O que você fará:</h3>
                  <ul className="space-y-2">
                    <li>• Documentar competições e performances</li>
                    <li>• Capturar momentos únicos dos atletas</li>
                    <li>• Criar conteúdo para redes sociais</li>
                    <li>• Contribuir para o acervo oficial do evento</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-purple-400">🎯 O que você ganha:</h3>
                  <ul className="space-y-2">
                    <li>• Acesso VIP a todas as áreas</li>
                    <li>• Credencial oficial de audiovisual</li>
                    <li>• Networking com profissionais da área</li>
                    <li>• Portfolio com conteúdo exclusivo</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Informações do pagamento */}
            <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-3xl p-8 mb-12 border border-pink-500/20">
              
              {/* Formulário de Contato */}
              {showContactForm && (
                <div className="mb-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-semibold mb-2">📧 Dados de Contato</h3>
                    <p className="text-gray-300 text-sm">Precisamos dessas informações para confirmar sua inscrição</p>
                  </div>
                  
                  {/* Mensagem de sucesso */}
                  {contactSaved && (
                    <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-2xl text-center">
                      <p className="text-green-400 font-medium">✅ Dados salvos com sucesso!</p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="audiovisual-contact-email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email Profissional *
                      </label>
                      <input
                        type="email"
                        id="audiovisual-contact-email"
                        name="email"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="seu@email.com"
                        autoComplete="email"
                        className={`w-full px-4 py-3 bg-gray-800 border rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all ${
                          contactErrors.email ? 'border-red-400' : 'border-gray-600'
                        }`}
                      />
                      {contactErrors.email && (
                        <p className="text-red-400 text-sm mt-1">{contactErrors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="audiovisual-contact-whatsapp" className="block text-sm font-medium text-gray-300 mb-2">
                        WhatsApp *
                      </label>
                      <input
                        type="tel"
                        id="audiovisual-contact-whatsapp"
                        name="whatsapp"
                        value={contactInfo.whatsapp}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, whatsapp: e.target.value }))}
                        placeholder="11 99999-9999"
                        autoComplete="tel"
                        className={`w-full px-4 py-3 bg-gray-800 border rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all ${
                          contactErrors.whatsapp ? 'border-red-400' : 'border-gray-600'
                        }`}
                      />
                      {contactErrors.whatsapp && (
                        <p className="text-red-400 text-sm mt-1">{contactErrors.whatsapp}</p>
                      )}
                    </div>
                    
                    <button
                      onClick={handleSaveContactInfo}
                      className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      ✅ Confirmar Dados
                    </button>
                  </div>
                </div>
              )}

              {/* Dados de contato confirmados */}
              {!showContactForm && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-green-400">✅ Dados Confirmados</h3>
                    <button
                      onClick={() => setShowContactForm(true)}
                      className="text-green-400 hover:text-green-300 text-sm underline"
                    >
                      Editar
                    </button>
                  </div>
                  <div className="text-left text-sm text-green-300">
                    <p><strong>Email:</strong> {contactInfo.email}</p>
                    <p><strong>WhatsApp:</strong> {contactInfo.whatsapp}</p>
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold mb-2">💳 Taxa de Inscrição</h3>
                <p className="text-3xl font-bold text-pink-400">R$ 29,90</p>
                <p className="text-gray-400 text-sm">Pagamento único via PIX</p>
              </div>
              
              <div className="bg-gray-800 rounded-2xl p-6 mb-6">
                <h4 className="text-lg font-medium mb-4 text-center">✅ O que está incluído:</h4>
                <ul className="space-y-2 text-gray-300 text-center">
                  <li>• Inscrição oficial para audiovisual</li>
                  <li>• Credencial personalizada</li>
                  <li>• Acesso ao grupo exclusivo</li>
                  <li>• Suporte da organização</li>
                </ul>
              </div>
            </div>

            {/* Botão de pagamento */}
            <div className="text-center">
              <button
                onClick={handlePayment}
                disabled={isLoading || showContactForm}
                className={`group relative inline-flex items-center justify-center px-12 py-6 text-lg font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl shadow-2xl hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                  showContactForm ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Processando...
                  </>
                ) : showContactForm ? (
                  '📧 Complete os dados acima'
                ) : (
                  <>
                    <span className="mr-2">🎬</span>
                    Inscrever-se como Audiovisual
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </>
                )}
              </button>
              
              <p className="text-gray-400 text-sm mt-4">
                {showContactForm 
                  ? 'Complete seus dados para prosseguir com a inscrição'
                  : 'Você será redirecionado para o OpenPix para finalizar o pagamento'
                }
              </p>
            </div>

            {/* Informações adicionais */}
            <div className="mt-12 text-center text-gray-400">
              <p className="text-sm">
                Dúvidas? Entre em contato conosco através das redes sociais ou email
              </p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
