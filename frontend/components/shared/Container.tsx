import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn('w-full px-margin-mobile md:px-gutter max-w-container-max mx-auto', className)}
      {...props}
    >
      {children}
    </div>
  );
};
export default Container;
