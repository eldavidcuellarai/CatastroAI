'use server';

import { ExtractorResult, DocumentType } from '@/lib/types';

export async function saveExtractedData(
  data: ExtractorResult,
  documentType: DocumentType,
  fileName: string
): Promise<{ success: boolean; message: string }> {
  console.log(`Simulando guardado de datos para: ${fileName} (${documentType})`);
  console.log('Datos a guardar (simulado):', JSON.stringify(data, null, 2));

  // Simular un retraso de red
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simular éxito siempre para esta demo
  return { success: true, message: `Datos de "${fileName}" guardados exitosamente (simulado).` };
}
