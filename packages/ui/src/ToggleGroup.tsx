import * as React from 'react';
import { Toggle } from './Toggle';
import type { ToggleProps } from './Toggle';

export interface ToggleGroupProps {
  type?: 'single' | 'multiple';
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export const ToggleGroup: React.FC<ToggleGroupProps> = ({
  type = 'single',
  value,
  onValueChange,
  className,
  children,
}) => {
  // Modo single: solo 1 Toggle activo
  const handleChange = (childValue: string) => {
    if (onValueChange) {
      onValueChange(childValue);
    }
  };

  return (
    <div className={className} role={type === 'single' ? 'radiogroup' : 'group'}>
      {React.Children.map(children, child => {
        if (React.isValidElement<ToggleProps>(child)) {
          const childValue = child.props.value || '';
          return React.cloneElement(child, {
            pressed: value === childValue,
            onClick: () => handleChange(childValue),
          });
        }
        return child;
      })}
    </div>
  );
};
