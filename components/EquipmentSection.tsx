
import React, { useState, useEffect } from 'react';
import { EquipmentCategory, EquipmentData, EquipmentStatus } from '../types';
import { STATUS_CONFIG } from '../constants';

interface Props {
  category: EquipmentCategory;
  data: EquipmentData;
  onStatusChange: (name: string) => void;
  isTvMode?: boolean;
}

const EquipmentButton: React.FC<{
  item: string;
  status: EquipmentStatus;
  onClick: () => void;
  isTvMode?: boolean;
}> = ({ item, status, onClick, isTvMode }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const config = STATUS_CONFIG[status];

  const handleClick = () => {
    setIsAnimating(true);
    onClick();
    setTimeout(() => setIsAnimating(false), 400);
  };

  const getNameSize = (name: string) => {
    if (isTvMode) {
      if (name.length > 30) return 'text-3xl leading-tight';
      if (name.length > 20) return 'text-4xl leading-tight';
      return 'text-5xl font-black leading-none';
    }
    if (name.length > 30) return 'text-lg leading-tight';
    if (name.length > 20) return 'text-xl leading-tight';
    return 'text-2xl md:text-3xl leading-none';
  };

  return (
    <button
      onClick={handleClick}
      className={`
        relative group transition-all duration-300 
        border-4 rounded-[2.5rem] p-6 flex flex-col justify-between text-left overflow-hidden
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        shadow-[0_10px_40px_rgba(0,0,0,0.4)]
        ${isAnimating ? 'scale-105 brightness-125 z-10' : 'hover:scale-[1.02]'}
        active:scale-95
        ${isTvMode ? 'min-h-[18rem] border-8 rounded-[3.5rem] p-10' : 'min-h-[12rem]'}
      `}
      style={{
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}
    >
      <div className="flex justify-between items-start w-full pointer-events-none">
        <span className={`font-black uppercase opacity-60 tracking-widest bg-black/20 rounded-full whitespace-nowrap ${isTvMode ? 'text-lg px-6 py-2' : 'text-[10px] px-3 py-1'}`}>
          #{item.split(' ')[0]}
        </span>
        <div className={`rounded-full bg-white/60 shadow-[0_0_12px_rgba(255,255,255,0.6)] ${isAnimating ? 'animate-ping' : ''} ${isTvMode ? 'w-6 h-6' : 'w-3.5 h-3.5'}`}></div>
      </div>
      
      <div className="flex-1 flex items-center w-full my-4 pointer-events-none">
        <span className={`block font-black drop-shadow-md break-words w-full ${getNameSize(item)}`}>
          {item}
        </span>
      </div>

      <div className="w-full pointer-events-none">
        <span className={`font-black uppercase tracking-[0.2em] opacity-90 bg-white/10 rounded-xl inline-block border border-white/10 ${isTvMode ? 'text-2xl px-8 py-3' : 'text-xs md:text-sm px-4 py-1.5'}`}>
          {config.label}
        </span>
      </div>
      
      {isAnimating && (
        <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none"></div>
      )}
      
      <div className={`absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none ${isTvMode ? 'rounded-[3.2rem]' : 'rounded-[2.2rem]'}`}></div>
    </button>
  );
};

const EquipmentSection: React.FC<Props> = ({ category, data, onStatusChange, isTvMode }) => {
  return (
    <div className={`bg-slate-900/60 border border-slate-700/50 shadow-2xl backdrop-blur-sm ${isTvMode ? 'rounded-[4rem] p-16 mb-20' : 'rounded-[3rem] p-8 lg:p-10 mb-10'}`}>
      <div className={`flex items-center gap-5 ${isTvMode ? 'mb-16' : 'mb-10'}`}>
        <div className={`rounded-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] ${isTvMode ? 'w-10 h-10' : 'w-5 h-5'}`}></div>
        <h4 className={`font-black text-white uppercase tracking-[0.25em] ${isTvMode ? 'text-6xl' : 'text-3xl'}`}>
          {category.name}
        </h4>
      </div>
      
      <div className={`grid gap-8 ${isTvMode ? 'grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-16' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
        {category.items.map((item) => (
          <EquipmentButton 
            key={item}
            item={item}
            status={data[item] || EquipmentStatus.AVAILABLE}
            onClick={() => onStatusChange(item)}
            isTvMode={isTvMode}
          />
        ))}
      </div>
    </div>
  );
};

export default EquipmentSection;
