'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/header';
import FileUploadArea from '@/components/file-upload-area';
import FileList from '@/components/file-list';
import DataCard from '@/components/data-card';
import ProcessFlowBar from '@/components/process-flow-bar';
import BreadcrumbNav from '@/components/breadcrumb-nav';
import ActionBar from '@/components/action-bar';
import DataEditorModal from '@/components/data-editor-modal';
import TestPanel from '@/components/test-panel';
import BackendTestPanel from '@/components/backend-test-panel';
import { UploadedFile, ExtractorResult, FileStatus, DocumentType, ExtractedDataAI } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { saveExtractedData } from './actions/save-data';
import ExtractorDatosIRCNL from '@/lib/extractorDatos';
import { extractDataFromPdf } from './actions/extract-from-pdf';
import { getSampleData, createSampleFile } from '@/lib/sampleData';

export default function Home() {
  const { toast } = useToast();

  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType>('propiedad');
  const [isTestMode, setIsTestMode] = useState(false);

  const [files, setFiles] = useState<Record<DocumentType, UploadedFile[]>>({
    propiedad: [],
    gravamen: [],
  });
  const [processingFiles, setProcessingFiles] = useState<Record<DocumentType, Set<string>>>({
    propiedad: new Set(),
    gravamen: new Set(),
  });
  const [extractedData, setExtractedData] = useState<Record<DocumentType, ExtractorResult | null>>({
    propiedad: null,
    gravamen: null,
  });
  const [errors, setErrors] = useState<Record<DocumentType, Record<string, string | null>>>({
    propiedad: {},
    gravamen: {},
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState<Record<DocumentType, boolean>>({
    propiedad: false,
    gravamen: false,
  });
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    setIsSaved(prev => ({
      ...prev,
      [selectedDocumentType]: false,
    }));
  }, [selectedDocumentType]);

  const updateFileStatus = useCallback((fileId: string, status: FileStatus, documentType: DocumentType, message?: string, progress?: number) => {
    setFiles(prev => ({
      ...prev,
      [documentType]: prev[documentType].map(file =>
        file.id === fileId
          ? { ...file, status, message, progress: progress !== undefined ? progress : file.progress }
          : file
      )
    }));
  }, []);

  // Convierte el File a data URL base64 (para mandarlo a la Server Action)
  const fileToDataUrl = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
    const base64 = btoa(binary);
    return `data:application/pdf;base64,${base64}`;
  };

  const procesarArchivo = async (file: File, documentType: DocumentType) => {
    const isDuplicate = files[documentType].some(
      (existingFile) => existingFile.name === file.name && existingFile.size === file.size
    );

    if (isDuplicate) {
      toast({
        title: "Documento Duplicado",
        description: `El archivo "${file.name}" ya ha sido subido para este tipo de documento.`,
        variant: "destructive",
      });
      return;
    }

    const newFile: UploadedFile = {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      status: 'Pendiente',
      progress: 0,
      fileObject: file,
      message: 'Esperando...',
      documentType: documentType,
    };

    setFiles((prev) => ({
      ...prev,
      [documentType]: [...prev[documentType], newFile],
    }));
    setProcessingFiles((prev) => ({
      ...prev,
      [documentType]: new Set([...prev[documentType], newFile.id]),
    }));
    setErrors((prev) => ({
      ...prev,
      [documentType]: { ...prev[documentType], [newFile.id]: null },
    }));
    setIsSaved(prev => ({ ...prev, [documentType]: false }));

    try {
      // Validación básica
      const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (!isPDF) {
        updateFileStatus(newFile.id, 'Error', documentType, '❌ Solo se aceptan PDFs.', 100);
        return;
      }

      // 1) Preparar PDF para envío
      updateFileStatus(newFile.id, 'Procesando', documentType, 'Preparando PDF para IA (OCR)...', 30);
      const dataUrl = await fileToDataUrl(file);

      // 2) Llamar a la IA con el PDF (OCR + extracción real)
      updateFileStatus(newFile.id, 'Procesando', documentType, 'Enviando a IA...', 65);
      const { data, error } = await extractDataFromPdf(dataUrl, documentType);
      if (error) throw new Error(error);

      // 3) Finalizar
      updateFileStatus(newFile.id, 'Completado', documentType, 'Completado', 100);
      setExtractedData((prev) => ({ ...prev, [documentType]: data! }));
    } catch (error: any) {
      console.error(`Error procesando archivo de ${documentType}:`, error);
      updateFileStatus(newFile.id, 'Error', documentType, error.message || 'Error desconocido', 100);
      setErrors((prev) => ({
        ...prev,
        [documentType]: { ...prev[documentType], [newFile.id]: error.message || 'Error desconocido' },
      }));
      toast({
        title: "Error de Extracción",
        description: `Fallo al procesar "${file.name}": ${error.message || 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      setProcessingFiles((prev) => {
        const newSet = new Set(prev[documentType]);
        newSet.delete(newFile.id);
        return { ...prev, [documentType]: newSet };
      });
    }
  };

  const handleSaveData = async () => {
    const currentExtractedData = extractedData[selectedDocumentType];
    const currentFiles = files[selectedDocumentType];
    const lastProcessedFile = currentFiles.find(f => f.status === 'Completado' && f.documentType === selectedDocumentType);

    if (!currentExtractedData || !lastProcessedFile) {
      toast({
        title: "No hay datos para guardar",
        description: "Por favor, sube y procesa un documento primero.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { success, message } = await saveExtractedData(
        currentExtractedData,
        selectedDocumentType,
        lastProcessedFile.name
      );

      if (success) {
        toast({ title: "Guardado Exitoso", description: message, variant: "success" });
        setIsSaved(prev => ({ ...prev, [selectedDocumentType]: true }));
      } else {
        toast({ title: "Error al Guardar", description: message, variant: "destructive" });
      }
    } catch (error: any) {
      console.error('Error al llamar a saveExtractedData:', error);
      toast({
        title: "Error Inesperado",
        description: `Ocurrió un error al intentar guardar: ${error.message || 'desconocido'}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadAnotherDocument = () => {
    setFiles(prev => ({ ...prev, [selectedDocumentType]: [] }));
    setExtractedData(prev => ({ ...prev, [selectedDocumentType]: null }));
    setErrors(prev => ({ ...prev, [selectedDocumentType]: {} }));
    setIsSaved(prev => ({ ...prev, [selectedDocumentType]: false }));
    toast({ title: "Listo para nuevo documento", description: "La sección ha sido limpiada. Puedes subir otro documento." });
  };

  const handleEditFields = () => {
    if (extractedData[selectedDocumentType]) {
      setShowEditModal(true);
    } else {
      toast({
        title: "No hay datos para editar",
        description: "Por favor, sube y procesa un documento para editar sus campos.",
        variant: "destructive",
      });
    }
  };

  const handleSaveEditedData = (editedData: ExtractedDataAI) => {
    const extractor = new ExtractorDatosIRCNL();
    const revalidatedResult = extractor.validarDatos(editedData);
    setExtractedData(prev => ({ ...prev, [selectedDocumentType]: revalidatedResult }));
    toast({ title: "Cambios Guardados", description: "Los datos han sido actualizados y revalidados.", variant: "success" });
  };

  const hasExtractedData = extractedData[selectedDocumentType] !== null;
  const isProcessingAnyFile = processingFiles[selectedDocumentType].size > 0;
  const showSaveButton = hasExtractedData && !isSaved[selectedDocumentType] && !isProcessingAnyFile;
  const showUploadAnotherButton = hasExtractedData && isSaved[selectedDocumentType] && !isProcessingAnyFile;
  const showEditButton = hasExtractedData && !isSaved[selectedDocumentType] && !isProcessingAnyFile;

  // Test mode functions
  const handleToggleTestMode = () => {
    setIsTestMode(!isTestMode);
    toast({
      title: isTestMode ? "Modo Normal Activado" : "Modo Prueba Activado",
      description: isTestMode 
        ? "Ahora usarás el sistema completo con IA real." 
        : "Ahora puedes probar fácilmente con datos de ejemplo.",
    });
  };

  const handleLoadSampleData = (documentType: DocumentType = selectedDocumentType) => {
    const sampleData = getSampleData(documentType);
    setExtractedData(prev => ({ ...prev, [documentType]: sampleData }));
    setIsSaved(prev => ({ ...prev, [documentType]: false }));
    
    toast({
      title: "Datos de Ejemplo Cargados",
      description: `Se han cargado datos de ejemplo para ${documentType === 'propiedad' ? 'Propiedad' : 'Gravamen'}.`,
    });
  };

  const handleLoadSampleFile = async (documentType: DocumentType = selectedDocumentType) => {
    const sampleFile = createSampleFile(documentType);
    await procesarArchivo(sampleFile, documentType);
    
    toast({
      title: "Archivo de Prueba Cargado",
      description: `Se ha procesado un archivo PDF de ejemplo para ${documentType === 'propiedad' ? 'Propiedad' : 'Gravamen'}.`,
    });
  };

  const handleClearAll = () => {
    setFiles({ propiedad: [], gravamen: [] });
    setExtractedData({ propiedad: null, gravamen: null });
    setErrors({ propiedad: {}, gravamen: {} });
    setIsSaved({ propiedad: false, gravamen: false });
    setProcessingFiles({ propiedad: new Set(), gravamen: new Set() });
    
    toast({
      title: "Datos Limpiados",
      description: "Se han eliminado todos los archivos y datos extraídos.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        onLoadSampleData={() => handleLoadSampleData()}
        onClearAll={handleClearAll}
        onToggleTestMode={handleToggleTestMode}
        isTestMode={isTestMode}
      />
      <BreadcrumbNav />
      <main className="flex-1 p-4 md:p-8">
        <ProcessFlowBar />
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Backend Test Panel */}
          <BackendTestPanel isVisible={isTestMode} />
          
          {/* Test Panel */}
          <TestPanel
            isTestMode={isTestMode}
            onLoadSampleData={handleLoadSampleData}
            onLoadSampleFile={handleLoadSampleFile}
            extractedData={extractedData}
            onClearAll={handleClearAll}
          />
          <Tabs value={selectedDocumentType} onValueChange={(value) => setSelectedDocumentType(value as DocumentType)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="propiedad">Documentos de Propiedad</TabsTrigger>
              <TabsTrigger value="gravamen">Documentos de Gravamen</TabsTrigger>
            </TabsList>

            <TabsContent value="propiedad" className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Carga de Documentos de Propiedad</h2>
                <FileUploadArea onFilesUpload={(filesToUpload) => filesToUpload.forEach(file => procesarArchivo(file, 'propiedad'))} />
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">Archivos Subidos (Propiedad)</h3>
                  <FileList files={files.propiedad} />
                  {Object.entries(errors.propiedad).map(([fileId, errorMessage]) => (
                    errorMessage && (
                      <p key={fileId} className="text-sm text-destructive mt-2" role="alert">
                        Error en {files.propiedad.find(f => f.id === fileId)?.name || 'archivo desconocido'}: {errorMessage}
                      </p>
                    )
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Datos Extraídos (Propiedad)</h2>
                {extractedData.propiedad ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DataCard title="🏠 Información del Predio" data={extractedData.propiedad.datos_extraidos.informacion_predio} />
                    <DataCard title="🗺️ Medidas y Colindancias" data={extractedData.propiedad.datos_extraidos.medidas_colindancias} />
                    <DataCard title="👥 Titulares" data={extractedData.propiedad.datos_extraidos.titulares} />
                    <DataCard title="⚖️ Acto Jurídico" data={extractedData.propiedad.datos_extraidos.acto_juridico} />
                    <DataCard title="📜 Datos Registrales" data={extractedData.propiedad.datos_extraidos.datos_registrales} />
                    <DataCard title="📚 Antecedentes" data={extractedData.propiedad.datos_extraidos.antecedentes} />
                    <DataCard
                      title="🎯 Calidad de Extracción"
                      data={{
                        'Campos Extraídos': `${extractedData.propiedad.campos_extraidos.extraidos}/${extractedData.propiedad.campos_extraidos.total}`,
                        'Confianza Global': `${extractedData.propiedad.confianza_global}%`,
                        'Estado': extractedData.propiedad.error ? 'Error' : extractedData.propiedad.datos_extraidos.extractionQuality.estado,
                        'Timestamp': new Date(extractedData.propiedad.timestamp).toLocaleString(),
                      }}
                    />
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-lg shadow-md text-center text-gray-500">
                    <p>Sube un documento de Propiedad para ver los datos extraídos aquí.</p>
                  </div>
                )}
              </section>
            </TabsContent>

            <TabsContent value="gravamen" className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Carga de Documentos de Gravamen</h2>
                <FileUploadArea onFilesUpload={(filesToUpload) => filesToUpload.forEach(file => procesarArchivo(file, 'gravamen'))} />
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">Archivos Subidos (Gravamen)</h3>
                  <FileList files={files.gravamen} />
                  {Object.entries(errors.gravamen).map(([fileId, errorMessage]) => (
                    errorMessage && (
                      <p key={fileId} className="text-sm text-destructive mt-2" role="alert">
                        Error en {files.gravamen.find(f => f.id === fileId)?.name || 'archivo desconocido'}: {errorMessage}
                      </p>
                    )
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Datos Extraídos (Gravamen)</h2>
                {extractedData.gravamen ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DataCard title="🏠 Información del Predio (Gravamen)" data={extractedData.gravamen.datos_extraidos.informacion_predio} />
                    <DataCard title="⚖️ Acto Jurídico (Gravamen)" data={extractedData.gravamen.datos_extraidos.acto_juridico} />
                    <DataCard title="📜 Datos Registrales (Gravamen)" data={extractedData.gravamen.datos_extraidos.datos_registrales} />
                    <DataCard
                      title="🎯 Calidad de Extracción (Gravamen)"
                      data={{
                        'Campos Extraídos': `${extractedData.gravamen.campos_extraidos.extraidos}/${extractedData.gravamen.campos_extraidos.total}`,
                        'Confianza Global': `${extractedData.gravamen.confianza_global}%`,
                        'Estado': extractedData.gravamen.error ? 'Error' : extractedData.gravamen.datos_extraidos.extractionQuality.estado,
                        'Timestamp': new Date(extractedData.gravamen.timestamp).toLocaleString(),
                      }}
                    />
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-lg shadow-md text-center text-gray-500">
                    <p>Sube un documento de Gravamen para ver los datos extraídos aquí.</p>
                  </div>
                )}
              </section>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <ActionBar
        onSaveData={handleSaveData}
        onUploadAnotherDocument={handleUploadAnotherDocument}
        onEditFields={handleEditFields}
        showSaveButton={showSaveButton}
        showUploadAnotherButton={showUploadAnotherButton}
        showEditButton={showEditButton}
        isSaving={isSaving}
      />

      <DataEditorModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        initialData={extractedData[selectedDocumentType]?.datos_extraidos || null}
        onSave={handleSaveEditedData}
      />
    </div>
  );
}
