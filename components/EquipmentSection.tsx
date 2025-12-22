
import React, { useMemo } from 'react';
import { 
  Settings, 
  Snowflake, 
  Droplets, 
  ShipWheel, 
  Flame, 
  Zap, 
  Wind, 
  Waves, 
  ShieldCheck,
  Power,
  Thermometer
} from 'lucide-react';
import { EquipmentCategory, EquipmentData, EquipmentStatus } from '../types';
import { STATUS_CONFIG, EQUIPMENT_LOCATIONS } from '../constants';

interface Props {
  categories: EquipmentCategory[];
  data: EquipmentData;
  onStatusChange: (name: string) => void;
}

const SnowLayer: React.FC = () => {
  const particles = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
    left: `${Math.random() * 100}%`,
    duration: `${2 + Math.random() * 3}s`,
    delay: `${Math.random() * 5}s`,
    size: `${2 + Math.random() * 4}px`
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50 z-0">
      {particles.map((p, i) => (
        <div 
          key={i} 
          className="snow-particle" 
          style={{ 
            left: p.left, 
            animationDuration: p.duration, 
            animationDelay: p.delay,
            width: p.size,
            height: p.size
          }} 
        />
      ))}
    </div>
  );
};

const EquipmentSection: React.FC<Props> = ({ categories, data, onStatusChange }) => {
  const getIcon = (name: string, status: EquipmentStatus) => {
    const isRunning = status === EquipmentStatus.IN_LINE || status === EquipmentStatus.IN_SERVICE;
    const isUnavailable = status === EquipmentStatus.UNAVAILABLE;
    
    let animationClass = '';
    if (isRunning) {
      if (name.includes('Purificador') || name.includes('GOR') || name.includes('DEMIN') || name.includes('Separador')) {
        animationClass = 'animate-drip';
      } else if (
        (name.includes('HPSW') || name.includes('Bomba') || name.includes('MotoBomba') || name.includes('LPSW')) && 
        !name.includes('Água Quente')
      ) {
        animationClass = 'animate-wave-move';
      } else if (
        name.includes('MCA') || 
        name.includes('MCP') || 
        name.includes('Leme') || 
        name.includes('Gerador') || 
        name.includes('BAG') || 
        name.includes('Água Quente')
      ) {
        animationClass = 'animate-spin';
      } else if (name.includes('BOILER')) {
        animationClass = 'animate-pulse';
      } else {
        animationClass = 'animate-pulse';
      }
    }

    const props = {
      size: 32, // Aumentado de 24 para 32
      className: `transition-all duration-700 ${!isUnavailable ? 'opacity-100' : 'opacity-40'} ${animationClass}`
    };

    if (name.includes('URA') || name.includes('Frigorífica') || name.includes('Container')) return <Snowflake {...props} />;
    if (
      name.includes('MCA') || 
      name.includes('MCP') || 
      name.includes('Gerador') || 
      name.includes('BAG') || 
      name.includes('Água Quente')
    ) return <Settings {...props} />;
    if (name.includes('BOILER')) return <Thermometer {...props} />;
    if (name.includes('Purificador') || name.includes('GOR') || name.includes('DEMIN') || name.includes('Separador')) return <Droplets {...props} />;
    if (name.includes('Leme')) return <ShipWheel {...props} />;
    if (
      (name.includes('HPSW') || name.includes('Bomba') || name.includes('LPSW') || name.includes('MotoBomba')) &&
      !name.includes('Água Quente')
    ) return <Waves {...props} />;
    if (name.includes('CBP') || name.includes('CMP') || name.includes('CAP')) return <Wind {...props} />;
    if (name.includes('Incêndio')) return <Flame {...props} />;
    if (name.includes('Proteção')) return <ShieldCheck {...props} />;
    
    return <Settings {...props} />;
  };

  const getNameSizeClass = (name: string) => {
    const len = name.length;
    // Lógica de escala mais agressiva para ocupar o espaço
    if (len <= 5) return 'text-4xl sm:text-5xl lg:text-7xl';
    if (len <= 10) return 'text-3xl sm:text-4xl lg:text-5xl';
    if (len <= 18) return 'text-2xl sm:text-3xl lg:text-4xl';
    return 'text-xl sm:text-2xl lg:text-3xl';
  };

  return (
    <div className="space-y-10">
      {categories.map(category => {
        const items = category.items;
        const isCoolingCategory = category.name.includes('Climatização') || category.name.includes('Planta Frigorífica');

        return (
          <div key={category.name} className="bg-slate-900/60 border border-slate-700/50 shadow-2xl backdrop-blur-md rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h4 className="font-black text-white uppercase tracking-widest mb-8 lg:mb-12 text-xl lg:text-3xl flex items-center gap-4">
              <div className="w-2.5 h-2.5 lg:w-4 lg:h-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
              {category.name}
              <span className="text-xs font-bold text-slate-500 ml-auto bg-slate-950 px-3 py-1 rounded-full">{items.length} ITENS</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {items.map((item) => {
                const status = data[item] || EquipmentStatus.AVAILABLE;
                const config = STATUS_CONFIG[status];
                const isRunning = status === EquipmentStatus.IN_LINE || status === EquipmentStatus.IN_SERVICE;
                const showSnow = isCoolingCategory && isRunning && (item.includes('URA') || item.includes('Frigorífica') || item.includes('Container'));

                return (
                  <button 
                    key={item}
                    onClick={() => onStatusChange(item)}
                    className={`relative transition-all duration-300 border-[3px] lg:border-[4px] rounded-[1.5rem] lg:rounded-[2.5rem] p-4 lg:p-6 flex flex-col justify-between min-h-[180px] lg:min-h-[260px] text-left overflow-hidden 
                      ${config.bgColor} ${config.textColor} ${config.borderColor} 
                      active:scale-95 hover:brightness-110 shadow-xl
                      ${status === EquipmentStatus.IN_LINE ? 'active-glow-green' : ''}
                    `}
                  >
                    {showSnow && <SnowLayer />}

                    <div className="flex justify-between items-start relative z-10 w-full">
                      <span className="font-black uppercase opacity-90 text-sm lg:text-xl bg-black/40 px-4 py-2 rounded-xl border border-white/10 shadow-lg">
                        #{EQUIPMENT_LOCATIONS[item] || '??'}
                      </span>
                      <div className="bg-white/10 p-2 rounded-2xl">
                        {getIcon(item, status)}
                      </div>
                    </div>

                    <div className="relative z-10 mt-auto w-full">
                      <span className={`font-black uppercase leading-[0.85] block tracking-tighter drop-shadow-md ${getNameSizeClass(item)}`}>
                        {item}
                      </span>
                      <div className="mt-4 lg:mt-6 flex justify-between items-center border-t border-white/20 pt-4">
                        <span className="text-[11px] lg:text-[14px] font-black uppercase tracking-[0.15em] opacity-90 drop-shadow-sm">
                          {status !== EquipmentStatus.UNAVAILABLE ? config.label : 'INDISP.'}
                        </span>
                        {isRunning && (
                          <div className="bg-white/20 p-1.5 rounded-full">
                            <Power size={18} className="animate-pulse text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EquipmentSection;
