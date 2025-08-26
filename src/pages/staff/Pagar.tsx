import { useEffect } from 'react';
import Header from '../../components/header';
import Footer from '../../components/Footer';
import SEOHead from '../../components/SEOHead';
import CheckoutCard from '../../components/CheckoutCard';
import { useAnalytics } from '../../hooks/useAnalytics';

export default function StaffPagarPage() {
  const { trackPage } = useAnalytics();

  // Track page view
  useEffect(() => {
    trackPage();
  }, [trackPage]);

  return (
    <>
      <SEOHead
        title="INTERBØX - Pagamento Staff"
        description="Finalize sua inscrição como Staff na INTERBØX. Seja parte da equipe que faz a magia acontecer."
        type="website"
      />
      
      <div className="min-h-screen bg-neutral-950">
        <Header />
        
        <CheckoutCard
          type="staff"
          subtitle="Seja parte da equipe que faz a magia acontecer. Organize, coordene e garanta o sucesso da INTERBØX"
          amount="R$ 19,90"
        />
        
        <Footer />
      </div>
    </>
  );
}
