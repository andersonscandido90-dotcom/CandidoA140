
import React from 'react';
import { DailyReport, EquipmentStatus } from '../types';
import { SHIP_CONFIG } from '../constants';

interface Props {
  data: DailyReport;
}

const PapeletaReport: React.FC<Props> = ({ data }) => {
  const { equipment, fuel, personnel, restrictionReasons } = data;

  const getStatusMark = (fullItemName: string, target: 'OPER' | 'DISP' | 'INOP') => {
    const status = equipment[fullItemName] || EquipmentStatus.AVAILABLE;
    if (target === 'OPER') return (status === EquipmentStatus.IN_LINE || status === EquipmentStatus.IN_SERVICE) ? 'X' : '';
    if (target === 'DISP') return status === EquipmentStatus.AVAILABLE ? 'X' : '';
    if (target === 'INOP') return (status === EquipmentStatus.UNAVAILABLE || status === EquipmentStatus.RESTRICTED) ? 'X' : '';
    return '';
  };

  const EquipmentRow = ({ label, items, prefix = "" }: { label: string, items: (string | number)[], prefix?: string }) => {
    // Helper to get unit label (e.g., "BE", "BB" or "1", "2")
    const getUnitLabel = (it: string | number) => it.toString();
    
    // Helper to get search key in the equipment data
    const getSearchKey = (it: string | number) => {
      if (prefix) return `${prefix} ${it}`;
      return it.toString();
    };

    return (
      <tr className="border-b border-black text-[11px] leading-tight">
        <td className="border-r border-black px-2 py-1 font-bold w-[35%] uppercase">{label}</td>
        
        {/* OPERANDO */}
        <td className="border-r border-black p-0 w-[15%]">
          <div className="flex divide-x divide-black h-full min-h-[24px]">
            {items.map(it => (
              <div key={`oper-${it}`} className="flex-1 flex flex-col items-center justify-between">
                <span className="text-[8px] border-b border-black w-full text-center bg-gray-50">{getUnitLabel(it)}</span>
                <span className="font-bold text-center h-4">{getStatusMark(getSearchKey(it), 'OPER')}</span>
              </div>
            ))}
          </div>
        </td>

        {/* DISPONÍVEL */}
        <td className="border-r border-black p-0 w-[15%]">
          <div className="flex divide-x divide-black h-full min-h-[24px]">
            {items.map(it => (
              <div key={`disp-${it}`} className="flex-1 flex flex-col items-center justify-center">
                <span className="font-bold text-center">{getStatusMark(getSearchKey(it), 'DISP')}</span>
              </div>
            ))}
          </div>
        </td>

        {/* INOPERANTE */}
        <td className="border-r border-black p-0 w-[15%]">
          <div className="flex divide-x divide-black h-full min-h-[24px]">
            {items.map(it => (
              <div key={`inop-${it}`} className="flex-1 flex flex-col items-center justify-center">
                <span className="font-bold text-center">{getStatusMark(getSearchKey(it), 'INOP')}</span>
              </div>
            ))}
          </div>
        </td>

        {/* OBSERVAÇÕES */}
        <td className="px-2 py-1 text-[9px] italic truncate max-w-[150px]">
          {items.map(it => restrictionReasons?.[getSearchKey(it)]).filter(Boolean).join('; ')}
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white text-black p-10 font-serif print:p-4 max-w-[210mm] mx-auto shadow-2xl print:shadow-none min-h-[297mm] flex flex-col" id="papeleta-print">
      {/* Cabeçalho Oficial */}
      <div className="flex justify-between items-start mb-6">
        <div className="text-center flex-1">
          <h2 className="text-lg font-bold tracking-tight">MARINHA DO BRASIL</h2>
          <h2 className="text-xl font-bold italic tracking-tighter">NAM "{SHIP_CONFIG.name.split(' ')[1]}"</h2>
          <h1 className="text-md font-bold mt-4 underline decoration-1 underline-offset-4 uppercase">Papeleta de Situação de Equipamento</h1>
        </div>
        <img src={SHIP_CONFIG.badgeUrl} className="w-20 h-20 object-contain" alt="Badge" />
      </div>

      <div className="flex justify-end mb-4 font-bold text-sm">
        DATA: <span className="ml-2 border-b border-black w-32 text-center">{new Date(data.date).toLocaleDateString('pt-BR')}</span>
      </div>

      {/* Tabela Principal de Equipamentos */}
      <table className="w-full border-2 border-black border-collapse flex-grow">
        <thead>
          <tr className="border-b-2 border-black text-[10px] font-bold uppercase bg-gray-100 h-10">
            <th className="border-r border-black px-2 text-left">Equipamento</th>
            <th className="border-r border-black px-1 text-center">Operando</th>
            <th className="border-r border-black px-1 text-center">Disponível</th>
            <th className="border-r border-black px-1 text-center">Inoperante</th>
            <th className="px-1 text-center">Observações</th>
          </tr>
        </thead>
        <tbody>
          <EquipmentRow label="MCP" items={["BE", "BB"]} prefix="MCP" />
          <EquipmentRow label="MCA" items={[1, 2, 3, 4]} prefix="MCA" />
          <EquipmentRow label="URA" items={[1, 2, 3, 4, 5, 6]} prefix="URA" />
          <EquipmentRow label="GOR" items={[1, 2, 3, 4]} prefix="GOR" />
          <EquipmentRow label="Máquina do Leme BE" items={[1, 2]} prefix="Maquina do Leme BE" />
          <EquipmentRow label="Máquina do Leme BB" items={[1, 2]} prefix="Maquina do Leme BB" />
          <EquipmentRow label="HPSW" items={[1, 2, 3, 4, 5]} prefix="HPSW" />
          <EquipmentRow label="LPSW" items={[1, 2, 3, 4]} prefix="LPSW" />
          <EquipmentRow label="BEI" items={[1, 2, 3]} prefix="BEI" />
          <EquipmentRow label="BB Incêndio Emerg" items={[1, 2, 3, 4]} prefix="MotoBomba" />
          <EquipmentRow label="CAP" items={[1, 2, 3]} prefix="CAP" />
          <EquipmentRow label="CMP" items={[1, 2]} prefix="CMP" />
          <EquipmentRow label="CBP" items={[1, 2, 3, 4]} prefix="CBP" />
          <EquipmentRow label="Frigorífica" items={[1, 2]} prefix="Planta Frigorífica" />
          <EquipmentRow label="Estabilizador" items={["BE", "BB"]} prefix="Estabilizador" />
          <EquipmentRow label="BAG" items={[1, 2, 3, 4]} prefix="BAG" />
          <EquipmentRow label="Boiler" items={[1, 2, 3, 4]} prefix="BOILER" />
          <EquipmentRow label="Água Quente" items={[1, 2]} prefix="Bomba de Água Quente" />
          <EquipmentRow label="Purificador OC MCP" items={[1, 2]} prefix="Purificador Óleo Comb" />
          <EquipmentRow label="Purificador OL MCP" items={[1, 2]} prefix="Purificador Óleo Lub" />
          <EquipmentRow label="Purificador OL Redutora" items={[1, 2]} prefix="Purificador Redutora" />
          <EquipmentRow label="Purificador OL MCA" items={[1]} prefix="Purificador Óleo Lub GER Diesel" />
          <EquipmentRow label="MBR" items={["AV", "AR"]} prefix="MBR" />
          <EquipmentRow label="Proteção Catódica" items={["AV", "AR"]} prefix="Proteção Catódica" />
        </tbody>
      </table>

      {/* Seção Inferior: Cargas e Pessoal */}
      <div className="grid grid-cols-2 gap-0 border-x-2 border-b-2 border-black">
        <div className="border-r border-black p-2 bg-gray-50/50">
          <h3 className="text-[11px] font-bold underline mb-1 uppercase">Cargas Líquidas (m³)</h3>
          <div className="grid grid-cols-2 text-[10px] gap-x-2 gap-y-0.5">
            <span className="border-b border-black/10">ÁGUA DOCE:</span> 
            <span className="font-bold border-b border-black/10">{fuel.water} / {fuel.maxWater}</span>
            <span className="border-b border-black/10">ÓLEO LUB:</span> 
            <span className="font-bold border-b border-black/10">{fuel.lubOil} / {fuel.maxLubOil}</span>
            <span className="border-b border-black/10">ÓLEO COMB:</span> 
            <span className="font-bold border-b border-black/10">{fuel.fuelOil} / {fuel.maxFuelOil}</span>
            <span>JP-5 (AV):</span> 
            <span className="font-bold">{fuel.jp5} / {fuel.maxJp5}</span>
          </div>
        </div>
        <div className="p-2 bg-gray-50/50">
          <h3 className="text-[11px] font-bold underline mb-1 uppercase">Quarto de Serviço</h3>
          <div className="flex flex-col text-[10px] gap-y-0.5">
            <div className="flex justify-between border-b border-black/10 italic">
              <span>SUPERV. MO:</span> <span className="font-bold not-italic">{personnel.supervisorMO || '---'}</span>
            </div>
            <div className="flex justify-between border-b border-black/10 italic">
              <span>SUPERV. EL:</span> <span className="font-bold not-italic">{personnel.supervisorEL || '---'}</span>
            </div>
            <div className="flex justify-between border-b border-black/10 italic">
              <span>FIEL CAV:</span> <span className="font-bold not-italic">{personnel.fielCav || '---'}</span>
            </div>
            <div className="flex justify-between italic">
              <span>ENC. MÁQ:</span> <span className="font-bold not-italic">{personnel.encarregadoMaquinas || '---'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-x-2 border-b-2 border-black p-3 h-24 mb-6">
        <span className="text-[11px] font-bold underline">Alterações previstas:</span>
        <div className="mt-2 text-[10px] leading-tight text-justify">
           {Object.keys(restrictionReasons || {}).length > 0 
             ? "ATENÇÃO: Existem equipamentos operando com restrição técnica ou indisponíveis. Consultar justificativas no sistema digital para detalhes sobre manutenção e prazos de reparo." 
             : "Nenhuma alteração de status ou restrição técnica prevista para o período atual. Todos os sistemas secundários em prontidão conforme escalas."}
        </div>
      </div>

      {/* Rodapé de Assinaturas conforme o Padrão do PDF */}
      <div className="grid grid-cols-3 gap-12 mt-auto pb-4 text-center text-[10px]">
        <div className="flex flex-col items-center">
          <div className="w-full border-t border-black mb-1"></div>
          <span className="font-bold">Supervisor que passa</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-full border-t border-black mb-1"></div>
          <span className="font-bold">Oficial de serviço que passa</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-full border-t border-black mb-1"></div>
          <span className="font-bold">Oficial de serviço que assume</span>
        </div>
      </div>
    </div>
  );
};

export default PapeletaReport;
