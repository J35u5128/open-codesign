import * as React from 'react';

export interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pressed?: boolean;
  value?: string;
  children?: React.ReactNode;
}

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ pressed, value, className, ...props }, ref) => (
    <button
      ref={ref}
      data-state={pressed ? 'on' : 'off'}
      data-value={value}
      className={className}
      aria-pressed={pressed}
      type="button"
      {...props}
    />
  )
);
Toggle.displayName = 'Toggle';
