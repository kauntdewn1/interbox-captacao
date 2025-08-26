import { useCallback } from 'react';

export function useAnalytics() {
  const trackPage = useCallback((page?: string) => {
    // Implementar tracking de página quando necessário
    console.log('Page tracked:', page || 'current');
  }, []);

  const trackAudiovisual = useCallback((event: string, category?: string) => {
    // Implementar tracking específico para audiovisual quando necessário
    console.log('Audiovisual tracked:', event, category);
  }, []);

  return {
    trackPage,
    trackAudiovisual,
  };
}
