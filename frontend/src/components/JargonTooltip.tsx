import React from 'react';
import { BilingualHoverCard } from './BilingualHoverCard';

interface JargonTooltipProps {
  termKey: string;
  children?: React.ReactNode;
}

export const JargonTooltip: React.FC<JargonTooltipProps> = ({ termKey, children }) => {
  return (
    <BilingualHoverCard termKey={termKey}>
      {children}
    </BilingualHoverCard>
  );
};
