import { useEffect } from 'react';
import Header from '../../components/header';
import Footer from '../../components/Footer';
import SEOHead from '../../components/SEOHead';
import CheckoutCard from '../../components/CheckoutCard';
import { useAnalytics } from '../../hooks/useAnalytics';

export default function JudgePagarPage() {
  const { trackPage } = useAnalytics();

  // Track page view
  useEffect(() => {
    trackPage();
  }, [trackPage]);

  return (
    <>
      <SEOHead
        title="INTERBØX - Pagamento Judge"
        description="Finalize sua inscrição como Judge na INTERBØX. Seja responsável pela avaliação técnica e fair play."
        type="website"
      />
      
      <div className="min-h-screen bg-neutral-950">
        <Header />
        
        <CheckoutCard
          type="judge"
          subtitle="Seja responsável pela avaliação técnica, garantindo fair play e excelência competitiva na INTERBØX"
          amount="R$ 19,90"
        />
        
        <Footer />
      </div>
    </>
  );
}
