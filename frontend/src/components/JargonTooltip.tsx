import React from 'react';
import { BilingualHoverCard } from './BilingualHoverCard';

interface JargonTooltipProps {
  termKey: string;
  children?: React.ReactNode;
  isPlainTalk?: boolean;
}

export const JargonTooltip: React.FC<JargonTooltipProps> = ({ termKey, children, isPlainTalk = false }) => {
  return (
    <BilingualHoverCard termKey={termKey} isPlainTalk={isPlainTalk}>
      {children}
    </BilingualHoverCard>
  );
};
