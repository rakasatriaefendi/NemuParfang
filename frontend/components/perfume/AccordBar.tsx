import React from 'react';
import { Accord } from '@/lib/types';

interface AccordBarProps {
  accords: Accord[];
}

export const AccordBar: React.FC<AccordBarProps> = ({ accords }) => {
  return (
    <div className="w-full flex flex-col gap-4">
      {accords.map((acc) => (
        <div key={acc.name} className="flex flex-col gap-1 text-left">
          <div className="flex justify-between text-[11px] font-nav uppercase tracking-wider text-parfang-text font-medium">
            <span>{acc.name}</span>
            <span>{acc.percentage}%</span>
          </div>
          <div className="w-full h-2 bg-parfang-border/40 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${acc.percentage}%`,
                backgroundColor: acc.color || '#B89775',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
export default AccordBar;
