"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ButtonHTMLAttributes, RefObject, ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import type { TargetAndTransition, Variants } from "motion/react";
import { ArrowRight } from "lucide-react";
import { motionTokens } from "../lib/motion-tokens";
import styles from "./action-button.module.css";

export interface ActionButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onDrag" | "onDragEnd" | "onDragStart" | "onAnimationStart"> {
  label: string;
  successLabel?: string;
  pendingLabel?: string;
  icon?: ReactNode;
  iconPosition?: "leading" | "trailing";
  state?: "idle" | "pending" | "success";
  onAction?: () => void | Promise<void>;
  resetAfterMs?: number;
  onActionError?: (error: unknown) => void;
  onStateChange?: (state: "idle" | "pending" | "success") => void;
}

const pressVariants: Variants = {
  pressed: (button: RefObject<HTMLButtonElement | null>) => ({
    scale: (button.current?.offsetWidth ?? 0) > 220 ? 0.985 : 0.97,
    transition: {
      duration: motionTokens.duration.instant,
      ease: [...motionTokens.ease.standard],
    },
  }),
};

const rest: TargetAndTransition = { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" };
const labelIn = { duration: 0.16, ease: [...motionTokens.ease.enter] } as const;
const labelOut: TargetAndTransition = {
  opacity: 0,
  transition: { duration: 0.1, ease: [...motionTokens.ease.standard] },
};

const iconIn: TargetAndTransition = {
  opacity: 0,
  scale: 0.6,
  filter: `blur(${motionTokens.blur.subtle}px)`,
};
const iconOut: TargetAndTransition = {
  ...iconIn,
  transition: {
    duration: motionTokens.duration.fast,
    ease: [...motionTokens.ease.standard],
  },
};

const arrowIn: TargetAndTransition = {
  opacity: 0,
  x: -6,
  filter: `blur(${motionTokens.blur.subtle}px)`,
};
const arrowOut: TargetAndTransition = {
  opacity: 0,
  x: 8,
  filter: `blur(${motionTokens.blur.subtle}px)`,
  transition: {
    duration: motionTokens.duration.fast,
    ease: [...motionTokens.ease.standard],
  },
};

const iconRest: TargetAndTransition = { ...rest, x: 0 };
const fadeIn: TargetAndTransition = { ...rest, opacity: 0 };
const fadeOut: TargetAndTransition = {
  opacity: 0,
  transition: { duration: motionTokens.duration.instant },
};

const iconEnter = {
  ...motionTokens.spring.snappy,
  opacity: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] },
  filter: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] },
} as const;

/** Springs the wrapper to the natural width of its content when the text changes */
function useMorphWidth(content: RefObject<HTMLElement | null>, key: string, reduced: boolean) {
  const width = useMotionValue<number | "auto">("auto");
  const lastKey = useRef(key);
  const armedUntil = useRef(0);

  useLayoutEffect(() => {
    if (lastKey.current === key) return;
    lastKey.current = key;
    armedUntil.current = performance.now() + 700;
  }, [key]);

  useEffect(() => {
    const node = content.current;
    const slot = node?.parentElement;
    if (!node || !slot || typeof ResizeObserver === "undefined") return;

    let measured = false;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const next = entry.contentRect.width;
      if (!next || !measured || reduced || performance.now() > armedUntil.current) {
        measured = next > 0;
        width.jump(next || "auto");
        delete slot.dataset.morphing;
        return;
      }
      slot.dataset.morphing = "";
      animate(width, next, {
        type: "spring",
        visualDuration: 0.24,
        bounce: 0,
        onComplete: () => {
          delete slot.dataset.morphing;
        },
      });
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [content, reduced, width]);

  return width;
}

/** The success tick draws itself from its short stroke with smooth bezier spring */
function DrawnCheck({ reduced }: { reduced: boolean }) {
  return (
    <svg
      className={styles.statusIcon}
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <motion.path
        d="M4 12.5l5 5L20 6"
        initial={reduced ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: {
            duration: motionTokens.duration.standard,
            ease: [...motionTokens.ease.enter],
            delay: 0.05,
          },
          opacity: { duration: 0.05, delay: 0.05 },
        }}
      />
    </svg>
  );
}

/** Swaps one label for the next with a single crossfade and spring width */
function SwapText({ text, reduced }: { text: string; reduced: boolean }) {
  const sizerRef = useRef<HTMLSpanElement>(null);
  const width = useMorphWidth(sizerRef, text, reduced);

  return (
    <motion.span className={styles.morph} style={{ width }} aria-hidden="true">
      <span ref={sizerRef} className={styles.sizer}>
        {text}
      </span>
      <AnimatePresence initial={false}>
        <motion.span
          key={text}
          className={styles.label}
          initial={reduced ? false : { opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0, transition: { duration: 0 } } : labelOut}
          transition={labelIn}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}

export function ActionButton({
  label,
  successLabel = "Saved",
  pendingLabel = "Saving",
  icon,
  iconPosition = "leading",
  state: controlledState,
  onAction,
  resetAfterMs = 2400,
  onActionError,
  onStateChange,
  className,
  disabled,
  onClick,
  ...props
}: ActionButtonProps) {
  const [internalState, setInternalState] = useState<"idle" | "pending" | "success">("idle");
  const isControlled = controlledState !== undefined;
  const state = isControlled ? controlledState : internalState;

  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const text = state === "pending" ? pendingLabel : state === "success" ? successLabel : label;

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  async function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (state === "pending") return;

    if (onClick) {
      onClick(e);
    }

    if (onAction) {
      if (resetTimer.current) clearTimeout(resetTimer.current);
      if (!isControlled) setInternalState("pending");
      onStateChange?.("pending");

      try {
        await onAction();
        if (!isControlled) setInternalState("success");
        onStateChange?.("success");
        if (resetAfterMs > 0) {
          resetTimer.current = setTimeout(() => {
            if (!isControlled) setInternalState("idle");
            onStateChange?.("idle");
          }, resetAfterMs);
        }
      } catch (error) {
        if (!isControlled) setInternalState("idle");
        onStateChange?.("idle");
        onActionError?.(error);
      }
    }
  }

  const pending = state === "pending";
  const isIdle = state === "idle";
  const defaultArrow = <ArrowRight className={styles.arrow} width={15} height={15} />;
  const idleIcon = icon !== undefined ? icon : defaultArrow;

  const iconElement = (
    <span className={styles.iconSlot}>
      <AnimatePresence initial={false}>
        <motion.span
          key={state}
          className={styles.phase}
          initial={reduceMotion ? fadeIn : isIdle ? arrowIn : iconIn}
          animate={iconRest}
          exit={reduceMotion ? fadeOut : isIdle ? arrowOut : iconOut}
          transition={reduceMotion ? { duration: motionTokens.duration.instant } : iconEnter}
        >
          {pending ? (
            <span className={styles.spinner} />
          ) : state === "success" ? (
            <DrawnCheck reduced={reduceMotion} />
          ) : (
            idleIcon
          )}
        </motion.span>
      </AnimatePresence>
    </span>
  );

  return (
    <motion.button
      {...props}
      ref={buttonRef}
      tabIndex={props.tabIndex ?? 0}
      type={props.type ?? "button"}
      className={[styles.button, className].filter(Boolean).join(" ")}
      disabled={disabled}
      aria-disabled={pending ? true : props["aria-disabled"]}
      aria-busy={pending}
      data-state={state}
      onClick={handleClick}
      custom={buttonRef}
      variants={pressVariants}
      whileTap={reduceMotion || disabled || pending ? undefined : "pressed"}
      transition={motionTokens.spring.snappy}
    >
      <span className={styles.content} aria-hidden="true">
        {iconPosition === "leading" && iconElement}
        <SwapText text={text} reduced={reduceMotion} />
        {iconPosition === "trailing" && iconElement}
      </span>
      <span className={styles.visuallyHidden}>{label}</span>
      <span className={styles.visuallyHidden} role="status">
        {state === "pending" ? pendingLabel : state === "success" ? successLabel : ""}
      </span>
    </motion.button>
  );
}

export default ActionButton;
