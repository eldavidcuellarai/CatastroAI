"use client"

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Zap, FileText, Database, Bug } from 'lucide-react';
import { DocumentType, ExtractorResult } from '@/lib/types';

interface TestPanelProps {
  isTestMode: boolean;
  onLoadSampleData: (documentType: DocumentType) => void;
  onLoadSampleFile: (documentType: DocumentType) => void;
  extractedData: Record<DocumentType, ExtractorResult | null>;
  onClearAll: () => void;
}

export default function TestPanel({ 
  isTestMode, 
  onLoadSampleData, 
  onLoadSampleFile, 
  extractedData, 
  onClearAll 
}: TestPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isTestMode) return null;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800';
    if (confidence >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="border-2 border-yellow-200 bg-yellow-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-yellow-100 transition-colors">
            <CardTitle className="flex items-center justify-between text-yellow-800">
              <div className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                Panel de Pruebas y Desarrollo
              </div>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  Datos de Prueba
                </h4>
                <div className="space-y-2">
                  <Button 
                    onClick={() => onLoadSampleData('propiedad')}
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                  >
                    Cargar Datos Propiedad
                  </Button>
                  <Button 
                    onClick={() => onLoadSampleData('gravamen')}
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                  >
                    Cargar Datos Gravamen
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Archivos de Prueba
                </h4>
                <div className="space-y-2">
                  <Button 
                    onClick={() => onLoadSampleFile('propiedad')}
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                  >
                    PDF Propiedad
                  </Button>
                  <Button 
                    onClick={() => onLoadSampleFile('gravamen')}
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                  >
                    PDF Gravamen
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-1">
                  <Database className="h-4 w-4" />
                  Estado Actual
                </h4>
                <div className="space-y-2">
                  <Button 
                    onClick={onClearAll}
                    variant="destructive" 
                    size="sm" 
                    className="w-full"
                  >
                    Limpiar Todo
                  </Button>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Propiedad:</span>
                      <Badge variant={extractedData.propiedad ? "default" : "secondary"}>
                        {extractedData.propiedad ? "Datos" : "Vacío"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Gravamen:</span>
                      <Badge variant={extractedData.gravamen ? "default" : "secondary"}>
                        {extractedData.gravamen ? "Datos" : "Vacío"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Debug Info */}
            {(extractedData.propiedad || extractedData.gravamen) && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-sm mb-2">Información de Debug</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {extractedData.propiedad && (
                    <div className="bg-white p-3 rounded border">
                      <h5 className="font-medium mb-2">Propiedad</h5>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Confianza Global:</span>
                          <Badge className={getConfidenceColor(extractedData.propiedad.confianza_global)}>
                            {extractedData.propiedad.confianza_global}%
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Campos Extraídos:</span>
                          <span>{extractedData.propiedad.campos_extraidos.extraidos}/{extractedData.propiedad.campos_extraidos.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estado:</span>
                          <Badge variant={extractedData.propiedad.datos_extraidos.extractionQuality.estado === 'Listo' ? 'default' : 'secondary'}>
                            {extractedData.propiedad.datos_extraidos.extractionQuality.estado}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {extractedData.gravamen && (
                    <div className="bg-white p-3 rounded border">
                      <h5 className="font-medium mb-2">Gravamen</h5>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Confianza Global:</span>
                          <Badge className={getConfidenceColor(extractedData.gravamen.confianza_global)}>
                            {extractedData.gravamen.confianza_global}%
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Campos Extraídos:</span>
                          <span>{extractedData.gravamen.campos_extraidos.extraidos}/{extractedData.gravamen.campos_extraidos.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estado:</span>
                          <Badge variant={extractedData.gravamen.datos_extraidos.extractionQuality.estado === 'Listo' ? 'default' : 'secondary'}>
                            {extractedData.gravamen.datos_extraidos.extractionQuality.estado}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
              <h4 className="font-semibold text-sm text-blue-800 mb-1">💡 Consejos para Pruebas</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Usa "Datos Demo" para cargar información de ejemplo sin archivos</li>
                <li>• Los PDFs de prueba se procesan localmente (modo mock)</li>
                <li>• La confianza global indica la calidad de extracción general</li>
                <li>• Verde: Excelente (90%+), Amarillo: Bueno (70-89%), Rojo: Revisar (&lt;70%)</li>
              </ul>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
