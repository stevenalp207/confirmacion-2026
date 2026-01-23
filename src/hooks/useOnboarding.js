import { useState, useEffect } from 'react';

const ONBOARDING_KEY = 'confirmacion2026_onboarding_completed';

/**
 * Hook para gestionar el estado del tutorial de onboarding
 */
export function useOnboarding() {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = () => {
    try {
      const completed = localStorage.getItem(ONBOARDING_KEY);
      const hasSeenOnboarding = completed === 'true';
      
      // Mostrar onboarding si no se ha completado
      setShouldShowOnboarding(!hasSeenOnboarding);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setShouldShowOnboarding(false);
      setIsLoading(false);
    }
  };

  const completeOnboarding = () => {
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      setShouldShowOnboarding(false);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  const resetOnboarding = () => {
    try {
      localStorage.removeItem(ONBOARDING_KEY);
      setShouldShowOnboarding(true);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  return {
    shouldShowOnboarding,
    isLoading,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding
  };
}

export default useOnboarding;
