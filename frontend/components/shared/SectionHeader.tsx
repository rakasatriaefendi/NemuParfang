import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  align = 'left',
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'mb-10 border-b border-outline-variant/10 pb-4',
        align === 'center' && 'text-center border-none',
        align === 'right' && 'text-right',
        className
      )}
      {...props}
    >
      {subtitle && (
        <span className="font-label-caps text-label-caps text-primary mb-2 block uppercase tracking-widest">
          {subtitle}
        </span>
      )}
      <h2 className="font-headline-md text-headline-md text-on-surface">
        {title}
      </h2>
    </div>
  );
};
export default SectionHeader;
