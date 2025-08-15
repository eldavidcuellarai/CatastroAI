'use server';

import { ExtractorResult, DocumentType } from '@/lib/types';
import ExtractorDatosIRCNL from '@/lib/extractorDatos';
import API_CONFIG from '@/lib/config';

// NUEVO: Server Action que recibe TEXTO ya extraído del PDF.
export async function extractDataFromText(
  documentText: string,
  documentType: DocumentType
): Promise<{ data?: ExtractorResult; error?: string }> {
  try {
    const extractor = new ExtractorDatosIRCNL();

    const useMock = API_CONFIG.USE_MOCK_DATA;
    const result = await extractor.extraerDatosDocumento(
      documentText,
      useMock,
      documentType
    );

    if (result.error) {
      return {
        error:
          result.errorMessage ||
          'Error en la extracción de datos o validación.'
      };
    }

    return { data: result };
  } catch (error: any) {
    console.error('Error en extractDataFromText:', error);
    return {
      error: `Error al procesar el documento: ${
        error?.message || 'Error desconocido'
      }`
    };
  }
}

// Mantener la export existente (si otra parte del código aún la importa),
// pero se recomienda migrar al flujo basado en TEXTO.
// Esta función no se utiliza en el nuevo flujo.
export async function extractDataFromDocument(
  file: File,
  documentType: DocumentType
): Promise<{ data?: ExtractorResult; error?: string }> {
  try {
    return { error: 'Este endpoint ahora usa texto. Use extractDataFromText().' };
  } catch {
    return { error: 'Error no esperado.' };
  }
}
