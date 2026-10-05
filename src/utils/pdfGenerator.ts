import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { RFLinkInputs, RFLinkOutputs } from '../components/RFCalculatorUI';

export const generatePDF = (inputs: RFLinkInputs, outputs: RFLinkOutputs) => {
  const doc = new jsPDF();
  
  // Encabezado
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("Memoria de Calculo de Enlace RF", 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Fecha de generacion: ${new Date().toLocaleString()}`, 14, 28);
  doc.text(`Version: 1.0.0 (RF Link Profiler PWA)`, 14, 33);
  
  // Estado del enlace (Badge)
  let r = 0, g = 0, b = 0;
  if (outputs.status === 'EXCELLENT') { r = 34; g = 197; b = 94; }
  else if (outputs.status === 'GOOD') { r = 59; g = 130; b = 246; }
  else if (outputs.status === 'MARGINAL') { r = 234; g = 179; b = 8; }
  else { r = 239; g = 68; b = 68; }
  
  doc.setFillColor(r, g, b);
  doc.roundedRect(14, 40, 60, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`ESTADO: ${outputs.status}`, 19, 47);
  
  // Tabla de Parámetros de Entrada
  autoTable(doc, {
    startY: 58,
    head: [['Parametro de Entrada', 'Valor']],
    body: [
      ['Frecuencia', `${inputs.frequencyMHz} MHz`],
      ['Distancia', `${inputs.distanceKm} km`],
      ['Potencia TX', `${inputs.txPowerWatts} W`],
      ['Ganancia TX', `${inputs.txGainDbi} dBi`],
      ['Ganancia RX', `${inputs.rxGainDbi} dBi`],
      ['Perdidas Cable TX', `${inputs.txCableLossDb} dB`],
      ['Perdidas Cable RX', `${inputs.rxCableLossDb} dB`],
      ['Sensibilidad RX', `${inputs.rxSensitivityDbm} dBm`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
    styles: { font: 'helvetica' }
  });
  
  // Tabla de Resultados Calculados
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [['Parametro Calculado', 'Valor']],
    body: [
      ['Potencia TX (dBm)', `${outputs.txPowerDbm.toFixed(2)} dBm`],
      ['EIRP (Potencia Radiada)', `${outputs.eirpDbm.toFixed(2)} dBm`],
      ['Perdida en Espacio Libre (FSPL)', `${outputs.fsplDb.toFixed(2)} dB`],
      ['Potencia Recibida (RX)', `${outputs.rxPowerDbm.toFixed(2)} dBm`],
      ['Potencia Recibida (Lineal)', `${(outputs.rxPowerMw * 1e9).toFixed(2)} pW`],
      ['Fade Margin', `${outputs.fadeMarginDb.toFixed(1)} dB`],
      ['Radio 1a Zona de Fresnel', `${outputs.fresnelRadiusMeters.toFixed(2)} m`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] },
    styles: { font: 'helvetica' }
  });
  
  // Pie de página
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150);
  doc.text("Generado por RF Link Profiler - Soluciones de Ingenieria de Radio", 14, pageHeight - 10);
  
  // Guardar PDF
  doc.save('Memoria_Calculo_RF.pdf');
};
