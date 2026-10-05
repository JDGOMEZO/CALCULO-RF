import React, { useState, useEffect } from 'react';
import { generatePDF } from '../utils/pdfGenerator';

// Interfaces
export interface RFLinkInputs {
  frequencyMHz: number;
  distanceKm: number;
  txPowerWatts: number;
  txGainDbi: number;
  rxGainDbi: number;
  txCableLossDb: number;
  rxCableLossDb: number;
  rxSensitivityDbm: number;
}

export interface RFLinkOutputs {
  txPowerDbm: number;
  eirpDbm: number;
  fsplDb: number;
  rxPowerDbm: number;
  rxPowerMw: number;
  fadeMarginDb: number;
  fresnelRadiusMeters: number;
  status: 'EXCELLENT' | 'GOOD' | 'MARGINAL' | 'POOR';
}

// Logic function (implemented based on standard RF equations to make the UI executable out of the box)
export function calculateRFLink(inputs: RFLinkInputs): RFLinkOutputs {
  const {
    frequencyMHz,
    distanceKm,
    txPowerWatts,
    txGainDbi,
    rxGainDbi,
    txCableLossDb,
    rxCableLossDb,
    rxSensitivityDbm,
  } = inputs;

  const txPowerDbm = 10 * Math.log10(txPowerWatts * 1000);
  const eirpDbm = txPowerDbm - txCableLossDb + txGainDbi;
  const fsplDb = 20 * Math.log10(distanceKm) + 20 * Math.log10(frequencyMHz) + 32.44;
  const rxPowerDbm = eirpDbm - fsplDb + rxGainDbi - rxCableLossDb;
  const rxPowerMw = Math.pow(10, rxPowerDbm / 10);
  const fadeMarginDb = rxPowerDbm - rxSensitivityDbm;
  
  const fGhz = frequencyMHz / 1000;
  const fresnelRadiusMeters = 17.32 * Math.sqrt(distanceKm / (4 * fGhz));
  
  let status: RFLinkOutputs['status'] = 'POOR';
  if (fadeMarginDb >= 20) status = 'EXCELLENT';
  else if (fadeMarginDb >= 10) status = 'GOOD';
  else if (fadeMarginDb >= 0) status = 'MARGINAL';
  
  return {
    txPowerDbm,
    eirpDbm,
    fsplDb,
    rxPowerDbm,
    rxPowerMw,
    fadeMarginDb,
    fresnelRadiusMeters,
    status
  };
}

export default function RFCalculatorUI() {
  const [inputs, setInputs] = useState<RFLinkInputs>({
    frequencyMHz: 98.7,
    distanceKm: 25,
    txPowerWatts: 500,
    txGainDbi: 6,
    rxGainDbi: 6,
    txCableLossDb: 1.5,
    rxCableLossDb: 1.5,
    rxSensitivityDbm: -90,
  });

  const [outputs, setOutputs] = useState<RFLinkOutputs | null>(null);

  useEffect(() => {
    setOutputs(calculateRFLink(inputs));
  }, [inputs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXCELLENT': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border-green-500';
      case 'GOOD': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 border-blue-500';
      case 'MARGINAL': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500';
      case 'POOR': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border-red-500';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border-gray-500';
    }
  };

  const getStatusClasses = (status: string) => {
    const base = getStatusColor(status);
    const parts = base.split(' ');
    return {
      text: `${parts[0]} ${parts[1]}`,
      bg: `${parts[2]} ${parts[3]}`,
      border: parts[4]
    };
  };

  const InputField = ({ label, name, value, min, max, step, unit }: { label: string, name: string, value: number, min: number, max: number, step: number, unit: string }) => (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{value} {unit}</span>
      </div>
      <input
        type="range"
        name={name}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-600 mb-2"
      />
      <input
        type="number"
        name={name}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center lg:text-left">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">RF Link Profiler</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">Calculadora de Presupuesto de Enlace (FM/STL)</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Formulario (Columna Izquierda) */}
          <div className="w-full lg:w-5/12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
              Parámetros del Enlace
            </h2>
            
            <InputField label="Frecuencia" name="frequencyMHz" value={inputs.frequencyMHz} min={87.5} max={108} step={0.1} unit="MHz" />
            <InputField label="Distancia" name="distanceKm" value={inputs.distanceKm} min={1} max={150} step={1} unit="km" />
            <InputField label="Potencia TX" name="txPowerWatts" value={inputs.txPowerWatts} min={1} max={10000} step={10} unit="W" />
            
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Ganancia TX" name="txGainDbi" value={inputs.txGainDbi} min={0} max={30} step={0.5} unit="dBi" />
              <InputField label="Ganancia RX" name="rxGainDbi" value={inputs.rxGainDbi} min={0} max={30} step={0.5} unit="dBi" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField label="Pérdidas TX" name="txCableLossDb" value={inputs.txCableLossDb} min={0} max={10} step={0.1} unit="dB" />
              <InputField label="Pérdidas RX" name="rxCableLossDb" value={inputs.rxCableLossDb} min={0} max={10} step={0.1} unit="dB" />
            </div>

            <InputField label="Sensibilidad RX" name="rxSensitivityDbm" value={inputs.rxSensitivityDbm} min={-120} max={-50} step={1} unit="dBm" />
          </div>

          {/* Resultados (Columna Derecha) */}
          <div className="w-full lg:w-7/12 flex flex-col gap-6">
            {outputs && (
              <>
                {/* Tarjeta Destacada */}
                <div className={`rounded-2xl shadow-lg p-8 border-2 flex flex-col items-center justify-center text-center transition-all duration-300 ${getStatusClasses(outputs.status).bg} ${getStatusClasses(outputs.status).border}`}>
                  <h3 className={`text-sm font-bold uppercase tracking-widest mb-2 ${getStatusClasses(outputs.status).text}`}>Fade Margin</h3>
                  <div className={`text-7xl font-black mb-4 tracking-tighter ${getStatusClasses(outputs.status).text}`}>
                    {outputs.fadeMarginDb.toFixed(1)} <span className="text-3xl tracking-normal font-bold">dB</span>
                  </div>
                  <div className={`inline-flex items-center px-5 py-2.5 rounded-full font-extrabold text-sm uppercase tracking-wider border-2 ${getStatusClasses(outputs.status).border} ${getStatusClasses(outputs.status).text}`}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    Estado: {outputs.status}
                  </div>
                </div>

                {/* Grid de Resultados Secundarios */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ResultCard label="Potencia Recibida (RX)" value={outputs.rxPowerDbm.toFixed(2)} unit="dBm" />
                  <ResultCard label="EIRP (Potencia Radiada)" value={outputs.eirpDbm.toFixed(2)} unit="dBm" />
                  <ResultCard label="Pérdida en Espacio Libre (FSPL)" value={outputs.fsplDb.toFixed(2)} unit="dB" />
                  <ResultCard label="Radio 1ª Zona de Fresnel" value={outputs.fresnelRadiusMeters.toFixed(2)} unit="m" />
                </div>
                
                {/* Botón de Exportar a PDF */}
                <div className="mt-2">
                  <button
                    onClick={() => generatePDF(inputs, outputs)}
                    className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-3 group"
                  >
                    <svg className="w-5 h-5 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Exportar Memoria de Cálculo (PDF)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const ResultCard = ({ label, value, unit }: { label: string, value: string | number, unit: string }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md p-5 border border-gray-100 dark:border-gray-700 transition-shadow">
    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">{label}</h4>
    <div className="flex items-baseline">
      <span className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">{value}</span>
      <span className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">{unit}</span>
    </div>
  </div>
);
