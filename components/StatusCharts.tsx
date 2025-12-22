
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { EquipmentData, EquipmentStatus } from '../types';
import { STATUS_CONFIG } from '../constants';
import { BarChart3 } from 'lucide-react';

interface Props {
  data: EquipmentData;
}

const StatusCharts: React.FC<Props> = ({ data }) => {
  const chartData = Object.values(STATUS_CONFIG).map(config => {
    const count = Object.values(data).filter(status => status === config.id).length;
    return {
      name: config.label,
      value: count,
      color: config.color
    };
  }).filter(item => item.value > 0);

  return (
    <div className="bg-slate-900 border border-slate-800 shadow-2xl flex flex-col rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-10 min-h-[420px] lg:h-full">
      <h3 className="font-black flex items-center gap-4 text-white uppercase text-xl lg:text-3xl mb-8">
        <BarChart3 className="w-6 h-6 lg:w-10 lg:h-10 text-blue-400" />
        Prontidão Operacional
      </h3>
      
      {chartData.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
           <p className="font-black uppercase tracking-widest opacity-30 text-xs lg:text-xl">Sem dados de prontidão...</p>
        </div>
      ) : (
        <div className="flex-1 w-full min-h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                paddingAngle={8}
                dataKey="value"
                animationDuration={1500}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155', 
                  borderRadius: '24px',
                  fontSize: '16px',
                  color: '#f1f5f9',
                  borderWidth: '2px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                }}
                itemStyle={{ color: '#f1f5f9', fontWeight: 'bold' }}
              />
              <Legend 
                verticalAlign="bottom" 
                align="center"
                layout="horizontal"
                iconType="circle"
                iconSize={16}
                formatter={(value) => (
                  <span className="font-black text-slate-400 uppercase tracking-widest text-[12px] lg:text-lg ml-2">
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
