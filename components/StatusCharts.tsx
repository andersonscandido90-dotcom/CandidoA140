
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { EquipmentData, EquipmentStatus } from '../types';
import { STATUS_CONFIG } from '../constants';
import { BarChart3 } from 'lucide-react';

interface Props {
  data: EquipmentData;
  isTvMode?: boolean;
}

const StatusCharts: React.FC<Props> = ({ data, isTvMode }) => {
  const chartData = Object.values(STATUS_CONFIG).map(config => {
    const count = Object.values(data).filter(status => status === config.id).length;
    return {
      name: config.label,
      value: count,
      color: config.color
    };
  }).filter(item => item.value > 0);

  return (
    <div className={`bg-slate-900 border border-slate-800 shadow-2xl flex flex-col ${isTvMode ? 'rounded-[3rem] p-12 h-[700px]' : 'rounded-3xl p-6 h-[400px]'}`}>
      <h3 className={`font-bold flex items-center gap-3 ${isTvMode ? 'text-5xl mb-12' : 'text-xl mb-4'}`}>
        <BarChart3 className={`${isTvMode ? 'w-12 h-12' : 'w-5 h-5'} text-blue-400`} />
        Monitoramento de Prontidão
      </h3>
      
      {chartData.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
           <BarChart3 className={`${isTvMode ? 'w-32 h-32' : 'w-12 h-12'} mb-6 opacity-20`} />
           <p className={`font-black uppercase tracking-widest ${isTvMode ? 'text-4xl' : 'text-sm'}`}>Sem dados operacionais</p>
        </div>
      ) : (
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={isTvMode ? 120 : 60}
                outerRadius={isTvMode ? 220 : 100}
                paddingAngle={8}
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
                  borderRadius: isTvMode ? '30px' : '12px',
                  fontSize: isTvMode ? '24px' : '12px',
                  color: '#f1f5f9',
                  padding: isTvMode ? '30px' : '10px',
                  borderWidth: isTvMode ? '4px' : '1px'
                }}
                itemStyle={{ color: '#f1f5f9', fontWeight: 'bold' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={isTvMode ? 100 : 36} 
                formatter={(value) => (
                  <span className={`font-black text-slate-400 uppercase tracking-widest ${isTvMode ? 'text-2xl px-6' : 'text-[11px]'}`}>
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
