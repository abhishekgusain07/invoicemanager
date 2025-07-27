"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  CURRENCY_SYMBOLS,
  type SupportedCurrencies,
} from "@/lib/validations/invoice-generation";

export interface MoneyInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange"
  > {
  currency: SupportedCurrencies;
  value: string | number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ className, currency, value, onChange, ...props }, ref) => {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;

    return (
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
          {symbol}
        </div>
        <input
          type="number"
          step="0.01"
          min="0"
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          value={value}
          onChange={onChange}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
MoneyInput.displayName = "MoneyInput";

export interface ReadOnlyMoneyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value"> {
  currency: SupportedCurrencies;
  value: string;
}

const ReadOnlyMoneyInput = React.forwardRef<
  HTMLInputElement,
  ReadOnlyMoneyInputProps
>(({ className, currency, value, ...props }, ref) => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
        {symbol}
      </div>
      <input
        type="text"
        readOnly
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-gray-50 pl-8 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        value={value}
        ref={ref}
        {...props}
      />
    </div>
  );
});
ReadOnlyMoneyInput.displayName = "ReadOnlyMoneyInput";

export { MoneyInput, ReadOnlyMoneyInput };
