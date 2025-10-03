import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
    return (_jsxs(_Fragment, { children: [_jsx(SEOHead, { title: "INTERB\u00D8X - Pagamento Audiovisual", description: "Finalize sua inscri\u00E7\u00E3o como Audiovisual na INTERB\u00D8X. Capture a intensidade e eternize os momentos \u00E9picos.", type: "website" }), _jsxs("div", { className: "min-h-screen bg-neutral-950", children: [_jsx(Header, {}), _jsx(CheckoutCard, { type: "audiovisual", subtitle: "Capture a intensidade, eternize os momentos \u00E9picos e conte a hist\u00F3ria da INTERB\u00D8X atrav\u00E9s das suas lentes", amount: "R$ 29,90" }), _jsx(Footer, {})] })] }));
}
