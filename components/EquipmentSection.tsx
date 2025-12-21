
import React, { useState } from 'react';
import { Settings, Slash, AlertCircle, Snowflake, Droplet, ShipWheel, Flame, Thermometer } from 'lucide-react';
import { EquipmentCategory, EquipmentData, EquipmentStatus } from '../types';
import { STATUS_CONFIG, EQUIPMENT_LOCATIONS } from '../constants';

interface Props {
  category: EquipmentCategory;
  data: EquipmentData;
  onStatusChange: (name: string) => void;
  uiMode?: 'desktop' | 'tv' | 'tablet' | 'phone';
}

const SnowEffect: React.FC<{ scale?: number }> = ({ scale = 1 }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full blur-[1px]"
          style={{
            width: `${4 * scale}px`,
            height: `${4 * scale}px`,
            left: `${Math.random() * 100}%`,
            top: '-10%',
            animation: `snowfall ${2 + Math.random() * 3}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes snowfall {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(500%) translateX(${Math.random() * 20 - 10}px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const EquipmentButton: React.FC<{
  item: string;
  status: EquipmentStatus;
  categoryName: string;
  onClick: () => void;
  uiMode?: 'desktop' | 'tv' | 'tablet' | 'phone';
}> = ({ item, status, categoryName, onClick, uiMode = 'desktop' }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const config = STATUS_CONFIG[status];
  const location = EQUIPMENT_LOCATIONS[item] || item.split(' ')[0];

  const isTv = uiMode === 'tv';
  const isTablet = uiMode === 'tablet';
  const isPhone = uiMode === 'phone';

  const isCoolingSystem = categoryName.toLowerCase().includes('climatização') || 
                          categoryName.toLowerCase().includes('frigorífica');
  
  const isPurificationSystem = categoryName.toLowerCase().includes('osmose') || 
                                categoryName.toLowerCase().includes('purificação');

  const isGovernmentSystem = categoryName.toLowerCase().includes('governo') || 
                             categoryName.toLowerCase().includes('leme');

  const isFireSystem = categoryName.toLowerCase().includes('incêndio');
  const isHeatSystem = item.toLowerCase().includes('boiler') || 
                       item.toLowerCase().includes('água quente');
  
  const BaseIcon = isHeatSystem ? Thermometer : isCoolingSystem ? Snowflake : 
                   isPurificationSystem ? Droplet : isGovernmentSystem ? ShipWheel : 
                   isFireSystem ? Flame : Settings;

  const isOperating = status === EquipmentStatus.IN_LINE || status === EquipmentStatus.IN_SERVICE;
  const isUnavailable = status === EquipmentStatus.UNAVAILABLE;
  const isRestricted = status === EquipmentStatus.RESTRICTED;
  const isNaLinha = status === EquipmentStatus.IN_LINE;

  const handleClick = () => {
    setIsAnimating(true);
    onClick();
    setTimeout(() => setIsAnimating(false), 400);
  };

  const getNameSize = () => {
    const len = item.length;
    
    if (isTv) {
      if (len < 8) return 'text-[7rem]';
      if (len < 15) return 'text-8xl';
      if (len < 25) return 'text-6xl';
      return 'text-5xl';
    }
    
    if (isTablet) {
      if (len < 10) return 'text-6xl';
      if (len < 20) return 'text-5xl';
      return 'text-4xl';
    }
    
    if (isPhone) {
      if (len < 10) return 'text-4xl';
      if (len < 20) return 'text-3xl';
      return 'text-2xl';
    }
    
    // Desktop
    if (len < 10) return 'text-4xl';
    if (len < 18) return 'text-3xl';
    if (len < 25) return 'text-2xl';
    return 'text-xl';
  };

  const getLocationSize = () => {
    if (isTv) return 'text-4xl';
    if (isTablet) return 'text-2xl';
    if (isPhone) return 'text-xl';
    return 'text-base';
  };

  const containerPadding = isTv ? 'p-12' : isTablet ? 'p-8' : isPhone ? 'p-6' : 'p-6';
  const minHeight = isTv ? 'min-h-[22rem]' : isTablet ? 'min-h-[16rem]' : isPhone ? 'min-h-[12rem]' : 'min-h-[11rem]';
  const iconSize = isTv ? 'w-20 h-20' : isTablet ? 'w-12 h-12' : isPhone ? 'w-10 h-10' : 'w-8 h-8';

  return (
    <button
      onClick={handleClick}
      className={`
        relative group transition-all duration-300 
        border-4 rounded-[2.5rem] flex flex-col justify-between text-left overflow-hidden
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        shadow-xl active:scale-95
        ${containerPadding} ${minHeight}
      `}
    >
      {isCoolingSystem && isNaLinha && !isHeatSystem && <SnowEffect scale={isTv ? 3 : 1.5} />}

      <div className="flex justify-between items-start w-full pointer-events-none relative z-10">
        <span className={`font-black uppercase opacity-60 tracking-[0.2em] bg-black/30 rounded-full px-5 py-2 ${getLocationSize()}`}>
          #{location}
        </span>
        <div className={`rounded-full bg-white/60 shadow-lg ${isAnimating ? 'animate-ping' : ''} ${isTv ? 'w-10 h-10' : 'w-4 h-4'}`}></div>
      </div>
      
      <div className="flex-1 flex items-center w-full my-6 pointer-events-none relative z-10">
        <span className={`block font-black break-words leading-[0.9] w-full uppercase tracking-tighter ${getNameSize()}`}>
          {item}
        </span>
      </div>

      <div className="w-full flex items-center justify-between pointer-events-none relative z-10">
        <span className={`font-black uppercase tracking-widest opacity-90 bg-white/15 rounded-xl px-5 py-2 border border-white/20 ${isTv ? 'text-3xl' : isTablet ? 'text-xl' : 'text-xs'}`}>
          {config.label}
        </span>
        
        <div className="flex items-center gap-3">
          {isOperating && (
            <BaseIcon 
              className={`
                text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]
                ${(isPurificationSystem || isFireSystem || isHeatSystem) ? 'animate-pulse' : 'animate-[spin_4s_linear_infinite]'}
                ${iconSize}
              `} 
            />
          )}

          {isRestricted && (
            <div className="relative flex items-center justify-center">
              <BaseIcon className={`text-black/30 ${iconSize}`} />
              <AlertCircle className={`absolute text-black animate-pulse ${isTv ? 'w-16 h-16' : 'w-6 h-6'}`} />
            </div>
          )}

          {isUnavailable && (
            <div className="relative flex items-center justify-center">
              <BaseIcon className={`text-white/30 ${iconSize}`} />
              <Slash className={`absolute text-white drop-shadow-md ${isTv ? 'w-20 h-20' : 'w-10 h-10'}`} />
            </div>
          )}
        </div>
      </div>
      
      {isAnimating && <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none z-20"></div>}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none rounded-[2.2rem]"></div>
    </button>
  );
};

const EquipmentSection: React.FC<Props> = ({ category, data, onStatusChange, uiMode = 'desktop' }) => {
  const isTv = uiMode === 'tv';
  const isTablet = uiMode === 'tablet';
  const isPhone = uiMode === 'phone';

  const gridCols = isTv ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 
                   isTablet ? 'grid-cols-2' : 
                   isPhone ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

  return (
    <div className={`bg-slate-900/60 border border-slate-700/50 shadow-2xl backdrop-blur-md rounded-[3rem] ${isTv ? 'p-20 mb-24' : isTablet ? 'p-12 mb-12' : 'p-8 mb-8'}`}>
      <div className={`flex items-center gap-6 ${isTv ? 'mb-16' : 'mb-8'}`}>
        <div className={`rounded-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] ${isTv ? 'w-14 h-14' : 'w-5 h-5'}`}></div>
        <h4 className={`font-black text-white uppercase tracking-widest ${isTv ? 'text-6xl' : isTablet ? 'text-4xl' : 'text-2xl'}`}>
          {category.name}
        </h4>
      </div>
      
      <div className={`grid gap-8 ${isTv ? 'gap-16' : 'gap-8'} ${gridCols}`}>
        {category.items.map((item) => (
          <EquipmentButton 
            key={item}
            item={item}
            status={data[item] || EquipmentStatus.AVAILABLE}
            categoryName={category.name}
            onClick={() => onStatusChange(item)}
            uiMode={uiMode}
          />
        ))}
      </div>
    </div>
  );
};

export default EquipmentSection;
