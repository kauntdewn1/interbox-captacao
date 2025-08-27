import { useEffect } from 'react';
import Header from '../../components/header';
import Footer from '../../components/Footer'; 
import SEOHead from '../../components/SEOHead';
import CheckoutCard from '../../components/CheckoutCard';
import { useAnalytics } from '../../hooks/useAnalytics';

export default function AudiovisualPagarPage() {
  const { trackPage, trackAudiovisual } = useAnalytics();

  // Track page view
  useEffect(() => {
    trackPage();
    trackAudiovisual('payment_view');
  }, [trackPage, trackAudiovisual]);

  return (
    <>
      <SEOHead
        title="INTERBØX - Pagamento Audiovisual"
        description="Finalize sua inscrição como Audiovisual na INTERBØX. Capture a intensidade e eternize os momentos épicos."
        type="website"
      />
      
      <div className="min-h-screen bg-neutral-950">
        <Header />
        
        <CheckoutCard
          type="audiovisual"
          subtitle="Capture a intensidade, eternize os momentos épicos e conte a história da INTERBØX através das suas lentes"
          amount="R$ 29,90"
        />
        
        <Footer />
      </div>
    </>
  );
}
