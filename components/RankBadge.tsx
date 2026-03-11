
import React from 'react';
import { RankData } from '../types';

interface RankBadgeProps {
  data: RankData;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const RankBadge: React.FC<RankBadgeProps> = ({ data, isSelected, onClick, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center rounded-full font-bold transition-all
        ${isSelected 
          ? 'ring-4 ring-pink-400 scale-110 shadow-lg' 
          : 'hover:scale-105 hover:shadow-md'
        }
        ${data.bgColor} ${data.color}
      `}
    >
      {data.rank}
    </button>
  );
};

export default RankBadge;
