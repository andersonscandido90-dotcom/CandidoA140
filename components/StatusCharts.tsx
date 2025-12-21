
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { EquipmentData, EquipmentStatus } from '../types';
import { STATUS_CONFIG } from '../constants';
import { BarChart3 } from 'lucide-react';

interface Props {
  data: EquipmentData;
  uiMode?: 'desktop' | 'tv' | 'tablet' | 'phone';
}

const StatusCharts: React.FC<Props> = ({ data, uiMode = 'desktop' }) => {
  const isTv = uiMode === 'tv';
  const isTablet = uiMode === 'tablet';
  const isPhone = uiMode === 'phone';

  const chartData = Object.values(STATUS_CONFIG).map(config => {
    const count = Object.values(data).filter(status => status === config.id).length;
    return {
      name: config.label,
      value: count,
      color: config.color
    };
  }).filter(item => item.value > 0);

  const containerHeight = isTv ? 'h-[800px]' : isTablet ? 'h-[500px]' : isPhone ? 'h-[400px]' : 'h-[400px]';

  return (
    <div className={`bg-slate-900 border border-slate-800 shadow-2xl flex flex-col rounded-[2.5rem] ${isTv ? 'p-16' : 'p-8'} ${containerHeight}`}>
      <h3 className={`font-black flex items-center gap-4 text-white uppercase ${isTv ? 'text-5xl mb-12' : 'text-xl mb-6'}`}>
        <BarChart3 className={`${isTv ? 'w-12 h-12' : 'w-6 h-6'} text-blue-400`} />
        Prontidão Operacional
      </h3>
      
      {chartData.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
           <p className="font-black uppercase tracking-widest opacity-30">Aguardando dados...</p>
        </div>
      ) : (
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={isTv ? 140 : isTablet ? 80 : 60}
                outerRadius={isTv ? 240 : isTablet ? 140 : 100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155', 
                  borderRadius: '20px',
                  fontSize: isTv ? '24px' : '12px',
                  color: '#f1f5f9'
                }}
                itemStyle={{ color: '#f1f5f9', fontWeight: 'bold' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={isTv ? 80 : 36} 
                formatter={(value) => (
                  <span className={`font-black text-slate-400 uppercase tracking-widest ${isTv ? 'text-xl' : 'text-[10px]'}`}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default StatusCharts;
