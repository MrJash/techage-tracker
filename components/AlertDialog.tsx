"use client"

import * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "radix-ui"

import { cn } from "../lib/utils"
import { Button } from "./Button"

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root {...props} />
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger {...props} />
  )
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal {...props} />
  )
}

interface AlertDialogOverlayProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay> {
  noBlur?: boolean;
  className?: string;
  anchorRect?: DOMRect | null;
}



function AlertDialogOverlay({
  className,
  noBlur,
  anchorRect,
  ...props
}: AlertDialogOverlayProps) {
  const spotlightStyle = anchorRect ? {
    clipPath: `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${anchorRect.left}px ${anchorRect.top}px, ${anchorRect.left}px ${anchorRect.bottom}px, ${anchorRect.right}px ${anchorRect.bottom}px, ${anchorRect.right}px ${anchorRect.top}px, ${anchorRect.left}px ${anchorRect.top}px)`
  } : undefined;

  return (
    <AlertDialogPrimitive.Overlay
      style={spotlightStyle}
      className={cn(
        "fixed inset-0 z-50 transition-all duration-500 ease-in-out",
        anchorRect 
          ? "bg-black/0 backdrop-blur-[5px] animate-in fade-in" 
          : "bg-black/90 backdrop-blur-md animate-in fade-in duration-300",
        className
      )}
      {...props}
    />

  )
}




interface AlertDialogContentProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> {
  anchorRect?: DOMRect | null;
  className?: string;
  children?: React.ReactNode;
}


function AlertDialogContent({
  className,
  anchorRect,
  ...props
}: AlertDialogContentProps) {
  const isAnchored = !!anchorRect;

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay anchorRect={anchorRect} />
      <div 
        className={cn(


          "fixed inset-0 z-50 flex p-4",
          isAnchored ? "items-start justify-start" : "items-center justify-center pointer-events-none"
        )}
      >
        <AlertDialogPrimitive.Content
          style={isAnchored ? {
            position: 'absolute',
            top: `${anchorRect.bottom + 12}px`,
            left: `${Math.min(window.innerWidth - 340, Math.max(20, anchorRect.left - 130))}px`,
            width: '320px',
            pointerEvents: 'auto'
          } : {
            pointerEvents: 'auto'
          }}
          className={cn(
            "relative z-50 grid w-full gap-6 border border-slate-200 bg-white p-6 shadow-2xl animate-in duration-200 dark:border-zinc-800 dark:bg-zinc-950 sm:rounded-2xl",
            isAnchored ? "fade-in slide-in-from-top-2 zoom-in-95" : "max-w-lg zoom-in-95 text-center",
            className
          )}
          {...props}
        >
          {isAnchored && (
            <div 
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-zinc-950 border-l border-t border-slate-200 dark:border-zinc-800 rotate-45" 
            />
          )}

          {props.children}
        </AlertDialogPrimitive.Content>
      </div>
    </AlertDialogPortal>
  )
}




function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-left",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      className={cn("text-lg font-semibold text-slate-900 dark:text-white", className)}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      className={cn("text-sm text-slate-500 dark:text-zinc-400", className)}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      asChild
      className={cn(className)}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      asChild
      className={cn(className)}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
