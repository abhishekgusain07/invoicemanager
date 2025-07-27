"use client";

import * as React from "react";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const StepperContext = React.createContext<{
  value: number;
  onValueChange: (value: number) => void;
  orientation: "horizontal" | "vertical";
}>({
  value: 1,
  onValueChange: () => {},
  orientation: "horizontal",
});

// Need to be in context to access step from StepperItem
const StepperItemContext = React.createContext<{
  step: number;
}>({
  step: 1,
});

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  onValueChange: (value: number) => void;
  orientation?: "horizontal" | "vertical";
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  (
    { className, value, onValueChange, orientation = "horizontal", ...props },
    ref
  ) => {
    return (
      <StepperContext.Provider value={{ value, onValueChange, orientation }}>
        <div
          ref={ref}
          className={cn(
            "flex",
            orientation === "horizontal" ? "flex-row" : "flex-col",
            className
          )}
          {...props}
        />
      </StepperContext.Provider>
    );
  }
);
Stepper.displayName = "Stepper";

interface StepperItemProps extends React.HTMLAttributes<HTMLDivElement> {
  step: number;
}

const StepperItem = React.forwardRef<HTMLDivElement, StepperItemProps>(
  ({ className, step, children, ...props }, ref) => {
    const { orientation } = React.useContext(StepperContext);

    return (
      <StepperItemContext.Provider value={{ step }}>
        <div
          ref={ref}
          className={cn(
            "flex",
            orientation === "horizontal"
              ? "flex-col items-center"
              : "flex-row items-start",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </StepperItemContext.Provider>
    );
  }
);
StepperItem.displayName = "StepperItem";

interface StepperIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  completed?: boolean;
}

const StepperIndicator = React.forwardRef<
  HTMLDivElement,
  StepperIndicatorProps
>(({ className, completed, ...props }, ref) => {
  const { value, onValueChange } = React.useContext(StepperContext);
  const { step } = React.useContext(StepperItemContext);
  const isCompleted = completed || value > step;

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-full border border-input bg-background text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        value === step && "border-primary text-primary",
        isCompleted && "border-primary bg-primary text-primary-foreground",
        className
      )}
      {...props}
    >
      {isCompleted ? <CheckIcon className="h-4 w-4" /> : step}
    </div>
  );
});
StepperIndicator.displayName = "StepperIndicator";

interface StepperSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

const StepperSeparator = React.forwardRef<
  HTMLDivElement,
  StepperSeparatorProps
>(({ className, ...props }, ref) => {
  const { orientation } = React.useContext(StepperContext);
  return (
    <div
      ref={ref}
      className={cn(
        "bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  );
});
StepperSeparator.displayName = "StepperSeparator";

interface StepperTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const StepperTrigger = React.forwardRef<HTMLButtonElement, StepperTriggerProps>(
  ({ className, ...props }, ref) => {
    const { onValueChange } = React.useContext(StepperContext);
    const { step } = React.useContext(StepperItemContext);

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "w-fit cursor-pointer focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={() => onValueChange(step)}
        {...props}
      />
    );
  }
);
StepperTrigger.displayName = "StepperTrigger";

export {
  Stepper,
  StepperItem,
  StepperIndicator,
  StepperSeparator,
  StepperTrigger,
};
