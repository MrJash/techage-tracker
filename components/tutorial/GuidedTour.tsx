import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Check 
} from 'lucide-react';
import { TutorialStep } from './tutorialSteps';

interface GuidedTourProps {
  isOpen: boolean;
  currentStep: TutorialStep;
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onFinish: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

// Robust visibility check that works for sticky, fixed, and nested flex elements
function isElementVisible(el: HTMLElement | null): boolean {
  if (!el) return false;
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({
  isOpen,
  currentStep,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  onFinish,
}) => {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number }>({ top: 100, left: 100 });
  const popupRef = useRef<HTMLDivElement>(null);

  // Find target element and measure its viewport coordinates
  const measureTarget = useCallback(() => {
    if (!isOpen) return;

    let targetElement = document.querySelector(currentStep.targetSelector) as HTMLElement | null;

    // Check if element is visible
    if (!isElementVisible(targetElement)) {
      if (currentStep.fallbackSelector) {
        // Try comma-separated fallbacks
        const fallbacks = currentStep.fallbackSelector.split(',').map(s => s.trim());
        for (const selector of fallbacks) {
          const el = document.querySelector(selector) as HTMLElement | null;
          if (isElementVisible(el)) {
            targetElement = el;
            break;
          }
        }
      }
    }

    if (isElementVisible(targetElement)) {
      // Scroll into view if needed (avoid scrolling for fixed viewport elements)
      const isFixed = window.getComputedStyle(targetElement!).position === 'fixed';
      if (!isFixed) {
        targetElement!.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
        });
      }

      const rect = targetElement!.getBoundingClientRect();
      const padding = currentStep.spotlightPadding ?? 8;

      const top = Math.max(0, rect.top - padding);
      const left = Math.max(0, rect.left - padding);
      const width = Math.min(window.innerWidth - left, rect.width + padding * 2);
      const height = Math.min(window.innerHeight - top, rect.height + padding * 2);

      setTargetRect({
        top,
        left,
        width,
        height,
        bottom: top + height,
        right: left + width,
      });
    } else {
      setTargetRect(null);
    }
  }, [isOpen, currentStep]);

  // Recalculate on step change, resize, or scroll
  useLayoutEffect(() => {
    if (!isOpen) return;

    // Initial measure
    measureTarget();

    // Small delay to allow any DOM transitions/modals to settle
    const timer = setTimeout(measureTarget, 80);

    const updatePosition = () => measureTarget();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, currentStep, measureTarget]);

  // Make interactive target clickable by raising z-index
  useEffect(() => {
    if (!isOpen || !currentStep.interactiveTarget) return;

    let target = document.querySelector(currentStep.targetSelector) as HTMLElement | null;
    if (!isElementVisible(target) && currentStep.fallbackSelector) {
      target = document.querySelector(currentStep.fallbackSelector) as HTMLElement | null;
    }

    if (target) {
      const originalZIndex = target.style.zIndex;
      const originalPosition = target.style.position;
      target.style.zIndex = '9995';

      // Only apply relative position if element is in static flow; never alter fixed/absolute elements
      const computedPosition = window.getComputedStyle(target).position;
      if (computedPosition === 'static') {
        target.style.position = 'relative';
      }

      return () => {
        target.style.zIndex = originalZIndex;
        target.style.position = originalPosition;
      };
    }
  }, [isOpen, currentStep]);

  // Calculate popup position relative to targetRect and viewport
  useLayoutEffect(() => {
    if (!isOpen) return;

    const popupEl = popupRef.current;
    const popupWidth = popupEl ? popupEl.offsetWidth : 360;
    const popupHeight = popupEl ? popupEl.offsetHeight : 210;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 16;
    const gap = 12;

    if (!targetRect) {
      // Centered fallback if target is not visible or not found
      setPopupPos({
        top: Math.max(margin, (viewportHeight - popupHeight) / 2),
        left: Math.max(margin, (viewportWidth - popupWidth) / 2),
      });
      return;
    }

    const preferredPlacement = currentStep.placement || 'auto';
    let top = 0;
    let left = 0;

    if (preferredPlacement === 'top') {
      top = targetRect.top - gap - popupHeight;
      left = targetRect.left + targetRect.width / 2 - popupWidth / 2;

      // If extends above top viewport, flip to bottom
      if (top < margin) {
        top = targetRect.bottom + gap;
      }
    } else if (preferredPlacement === 'right') {
      left = targetRect.right + gap;
      top = targetRect.top + targetRect.height / 2 - popupHeight / 2;

      // If extends past right viewport, flip to bottom or left
      if (left + popupWidth > viewportWidth - margin) {
        left = targetRect.left - gap - popupWidth;
        if (left < margin) {
          // Fallback to bottom
          top = targetRect.bottom + gap;
          left = targetRect.left + targetRect.width / 2 - popupWidth / 2;
        }
      }
    } else if (preferredPlacement === 'left') {
      left = targetRect.left - gap - popupWidth;
      top = targetRect.top + targetRect.height / 2 - popupHeight / 2;

      // If extends past left viewport, flip to right
      if (left < margin) {
        left = targetRect.right + gap;
      }
    } else {
      // 'bottom' or 'auto'
      top = targetRect.bottom + gap;
      left = targetRect.left + targetRect.width / 2 - popupWidth / 2;

      // If extends below bottom viewport, flip to top
      if (top + popupHeight > viewportHeight - margin) {
        const topOption = targetRect.top - gap - popupHeight;
        if (topOption >= margin) {
          top = topOption;
        }
      }
    }

    // Horizontal and vertical boundary clamping
    left = Math.max(margin, Math.min(viewportWidth - popupWidth - margin, left));
    top = Math.max(margin, Math.min(viewportHeight - popupHeight - margin, top));

    setPopupPos({ top, left });
  }, [isOpen, targetRect, currentStep]);

  // Keyboard Navigation: Esc, ArrowRight, ArrowLeft
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onSkip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentStepIndex === totalSteps - 1) {
          onFinish();
        } else {
          onNext();
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentStepIndex > 0) {
          onPrev();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex, totalSteps, onNext, onPrev, onSkip, onFinish]);

  if (!isOpen) return null;

  const isLastStep = currentStepIndex === totalSteps - 1;
  const StepIcon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-[9990] pointer-events-auto">
      {/* 4 Backdrop pieces surrounding targetRect: uniformly darkens all background content and lines */}
      {targetRect ? (
        <>
          {/* Top backdrop */}
          <div
            className="fixed bg-black/65 z-[9990] transition-all duration-300 ease-out"
            style={{
              top: 0,
              left: 0,
              right: 0,
              height: `${Math.max(0, targetRect.top)}px`,
            }}
            onClick={e => e.stopPropagation()}
          />

          {/* Bottom backdrop */}
          <div
            className="fixed bg-black/65 z-[9990] transition-all duration-300 ease-out"
            style={{
              top: `${targetRect.bottom}px`,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            onClick={e => e.stopPropagation()}
          />

          {/* Left backdrop */}
          <div
            className="fixed bg-black/65 z-[9990] transition-all duration-300 ease-out"
            style={{
              top: `${targetRect.top}px`,
              left: 0,
              width: `${Math.max(0, targetRect.left)}px`,
              height: `${targetRect.height}px`,
            }}
            onClick={e => e.stopPropagation()}
          />

          {/* Right backdrop */}
          <div
            className="fixed bg-black/65 z-[9990] transition-all duration-300 ease-out"
            style={{
              top: `${targetRect.top}px`,
              left: `${targetRect.right}px`,
              right: 0,
              height: `${targetRect.height}px`,
            }}
            onClick={e => e.stopPropagation()}
          />

          {/* Glowing highlight ring around target cutout */}
          <div
            className="fixed pointer-events-none rounded-xl ring-2 ring-primary ring-offset-2 ring-offset-background z-[9992] transition-all duration-300 ease-out"
            style={{
              top: `${targetRect.top}px`,
              left: `${targetRect.left}px`,
              width: `${targetRect.width}px`,
              height: `${targetRect.height}px`,
            }}
          />
        </>
      ) : (
        <div 
          className="fixed inset-0 bg-black/65 z-[9990] transition-opacity duration-200" 
          onClick={e => e.stopPropagation()} 
        />
      )}

      {/* Contextual Popup Card (No zoom-in-95 to prevent button size distortion) */}
      <div
        ref={popupRef}
        className="fixed z-[9999] bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-5 w-[calc(100vw-32px)] sm:w-[380px] max-w-full text-left flex flex-col gap-3.5 transition-[top,left] duration-300 ease-out"
        style={{
          top: `${popupPos.top}px`,
          left: `${popupPos.left}px`,
        }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={currentStep.title}
      >
        {/* Card Header: Icon, Title, and Close Button */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 ring-1 ring-primary/20">
              <StepIcon size={16} className="text-primary" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              {currentStep.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onSkip}
            className="p-1.5 -mr-1 -mt-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Skip Tutorial (Esc)"
            aria-label="Close tutorial"
          >
            <X size={16} />
          </button>
        </div>

        {/* Card Body: Description */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
          {currentStep.description}
        </p>

        {/* Card Footer: Progress Indicators and Fixed-Width Navigation Actions */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
          {/* Step counter and dots */}
          <div className="flex flex-col gap-1 shrink-0">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    i === currentStepIndex
                      ? 'w-4.5 bg-primary'
                      : i < currentStepIndex
                      ? 'w-1.5 bg-primary/40'
                      : 'w-1.5 bg-slate-200 dark:bg-zinc-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Navigation Action Buttons: Exact fixed-size buttons with zero layout shift on click */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onSkip}
              className="h-8 px-2.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-0 focus-visible:ring-1 focus-visible:ring-primary active:scale-100 select-none shrink-0 cursor-pointer"
            >
              Skip
            </button>

            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={onPrev}
                className="w-[72px] h-8 rounded-lg text-xs font-medium border border-slate-200 dark:border-zinc-700 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1 focus:outline-none focus:ring-0 focus-visible:ring-1 focus-visible:ring-primary active:scale-100 select-none shrink-0 cursor-pointer"
                title="Previous Step (Left Arrow)"
              >
                <ChevronLeft size={14} className="shrink-0" />
                <span>Back</span>
              </button>
            )}

            {isLastStep ? (
              <button
                type="button"
                onClick={onFinish}
                className="w-[84px] h-8 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-1 focus:outline-none focus:ring-0 focus-visible:ring-1 focus-visible:ring-ring active:scale-100 select-none shrink-0 shadow-sm cursor-pointer"
                title="Finish Tutorial"
              >
                <Check size={14} className="shrink-0" />
                <span>Finish</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onNext}
                className="w-[84px] h-8 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-1 focus:outline-none focus:ring-0 focus-visible:ring-1 focus-visible:ring-ring active:scale-100 select-none shrink-0 shadow-sm cursor-pointer"
                title="Next Step (Right Arrow)"
              >
                <span>Next</span>
                <ChevronRight size={14} className="shrink-0" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
