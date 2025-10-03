import { useCallback } from 'react';
export function useAnalytics() {
    const trackPage = useCallback((page) => {
        // Implementar tracking de página quando necessário
        console.log('Page tracked:', page || 'current');
    }, []);
    const trackAudiovisual = useCallback((event, category) => {
        // Implementar tracking específico para audiovisual quando necessário
        console.log('Audiovisual tracked:', event, category);
    }, []);
    return {
        trackPage,
        trackAudiovisual,
    };
}
