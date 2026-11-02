import { useState, useEffect, useCallback, useRef } from 'react';
import { TUTORIAL_STEPS, TutorialStep } from '../components/tutorial/tutorialSteps';

export const ONBOARDING_STORAGE_KEY = 'techage_tracker_onboarding_v1';

interface UseGuidedTourProps {
  isHydrated: boolean;
  hasExistingData: boolean;
  onOpenAddModal?: () => void;
  onCloseAddModal?: () => void;
  onOpenSettings?: () => void;
  onCloseSettings?: () => void;
  isAddModalOpen?: boolean;
  isSettingsOpen?: boolean;
}

export interface UseGuidedTourReturn {
  isTourOpen: boolean;
  isWelcomeOpen: boolean;
  currentStepIndex: number;
  currentStep: TutorialStep;
  totalSteps: number;
  startTour: () => void;
  restartTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  finishTour: () => void;
  dismissWelcome: () => void;
}

export function useGuidedTour({
  isHydrated,
  hasExistingData,
  onOpenAddModal,
  onCloseAddModal,
  onOpenSettings,
  onCloseSettings,
  isAddModalOpen,
  isSettingsOpen,
}: UseGuidedTourProps): UseGuidedTourReturn {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Keep ref to callbacks to prevent stale closure issues
  const callbacksRef = useRef({
    onOpenAddModal,
    onCloseAddModal,
    onOpenSettings,
    onCloseSettings,
  });
  useEffect(() => {
    callbacksRef.current = {
      onOpenAddModal,
      onCloseAddModal,
      onOpenSettings,
      onCloseSettings,
    };
  }, [onOpenAddModal, onCloseAddModal, onOpenSettings, onCloseSettings]);

  // First-launch check for genuinely fresh users
  useEffect(() => {
    // Wait until local and remote cloud data hydration have fully resolved
    if (!isHydrated) return;

    // Existing users with collections/products must never see the automated prompt
    if (hasExistingData) return;

    // Check if the user has already completed or dismissed onboarding
    const status = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!status) {
      const timer = setTimeout(() => {
        setIsWelcomeOpen(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isHydrated, hasExistingData]);

  // Start the tour from step 1
  const startTour = useCallback(() => {
    callbacksRef.current.onCloseAddModal?.();
    callbacksRef.current.onCloseSettings?.();
    setCurrentStepIndex(0);
    setIsWelcomeOpen(false);
    setIsTourOpen(true);
  }, []);

  // Force-start or restart the tour (e.g. via Alt+T shortcut)
  const restartTour = useCallback(() => {
    callbacksRef.current.onCloseAddModal?.();
    callbacksRef.current.onCloseSettings?.();
    setCurrentStepIndex(0);
    setIsWelcomeOpen(false);
    setIsTourOpen(true);
  }, []);

  // Dismiss welcome prompt without launching tour
  const dismissWelcome = useCallback(() => {
    setIsWelcomeOpen(false);
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'dismissed');
  }, []);

  // Handle transition logic when moving between steps
  const handleStepTransition = useCallback((fromIndex: number, toIndex: number) => {
    const fromStep = TUTORIAL_STEPS[fromIndex];
    const toStep = TUTORIAL_STEPS[toIndex];

    // Entering or leaving Add Product Modal step
    if (toStep?.id === 'add-product-modal') {
      callbacksRef.current.onOpenAddModal?.();
    } else if (fromStep?.id === 'add-product-modal') {
      callbacksRef.current.onCloseAddModal?.();
    }

    // Entering or leaving Settings step
    if (toStep?.id === 'settings') {
      callbacksRef.current.onOpenSettings?.();
    } else if (fromStep?.id === 'settings') {
      callbacksRef.current.onCloseSettings?.();
    }
  }, []);

  // Advance to the next step or complete tour on last step
  const nextStep = useCallback(() => {
    setCurrentStepIndex(prev => {
      if (prev < TUTORIAL_STEPS.length - 1) {
        const nextIdx = prev + 1;
        handleStepTransition(prev, nextIdx);
        return nextIdx;
      }
      // On final step
      setIsTourOpen(false);
      callbacksRef.current.onCloseAddModal?.();
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'completed');
      return prev;
    });
  }, [handleStepTransition]);

  // Return to previous step
  const prevStep = useCallback(() => {
    setCurrentStepIndex(prev => {
      if (prev > 0) {
        const prevIdx = prev - 1;
        handleStepTransition(prev, prevIdx);
        return prevIdx;
      }
      return 0;
    });
  }, [handleStepTransition]);

  // Skip the tour
  const skipTour = useCallback(() => {
    setIsTourOpen(false);
    callbacksRef.current.onCloseAddModal?.();
    callbacksRef.current.onCloseSettings?.();
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'completed');
  }, []);

  // Finish the tour
  const finishTour = useCallback(() => {
    setIsTourOpen(false);
    callbacksRef.current.onCloseAddModal?.();
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'completed');
  }, []);

  // If user is on step 1 (Add Button) and clicks the Add button directly, advance to Step 2 (Modal)
  useEffect(() => {
    if (isTourOpen && currentStepIndex === 1 && isAddModalOpen) {
      setCurrentStepIndex(2);
      handleStepTransition(1, 2);
    }
  }, [isTourOpen, currentStepIndex, isAddModalOpen, handleStepTransition]);

  // Global Keyboard Shortcut: Alt + T
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Alt+T or Alt+Shift+T (case-insensitive)
      if (e.altKey && (e.key === 't' || e.key === 'T' || e.code === 'KeyT')) {
        e.preventDefault();
        restartTour();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [restartTour]);

  return {
    isTourOpen,
    isWelcomeOpen,
    currentStepIndex,
    currentStep: TUTORIAL_STEPS[currentStepIndex] || TUTORIAL_STEPS[0],
    totalSteps: TUTORIAL_STEPS.length,
    startTour,
    restartTour,
    nextStep,
    prevStep,
    skipTour,
    finishTour,
    dismissWelcome,
  };
}
