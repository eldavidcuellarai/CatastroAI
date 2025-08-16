'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Brain, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface BackendTestResult {
  success: boolean;
  message: string;
  extractedData?: any;
  confidence?: number;
  processingTime?: number;
}

interface BackendTestPanelProps {
  isVisible: boolean;
}

export default function BackendTestPanel({ isVisible }: BackendTestPanelProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [testResult, setTestResult] = useState<BackendTestResult | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');

  // Test backend connection
  const testBackendConnection = async () => {
    setConnectionStatus('testing');
    try {
      const response = await fetch('https://8080-cs-f36064f3-70e1-4a6c-9760-da09e18f7444.cs-us-east1-yeah.cloudshell.dev/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setConnectionStatus('connected');
        setTestResult({
          success: true,
          message: 'Backend CatastroAI conectado exitosamente',
        });
      } else {
        throw new Error('Backend no disponible');
      }
    } catch (error) {
      setConnectionStatus('error');
      setTestResult({
        success: false,
        message: 'Error conectando con backend. Asegúrate de que el servidor Python esté corriendo.',
      });
    }
  };

  // Upload and process PDF with backend
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setTestResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', 'propiedad');

      const startTime = Date.now();
      const response = await fetch('https://8080-cs-f36064f3-70e1-4a6c-9760-da09e18f7444.cs-us-east1-yeah.cloudshell.dev/extract', {
        method: 'POST',
        body: formData,
      });

      const processingTime = Date.now() - startTime;

      if (response.ok) {
        const result = await response.json();
        setTestResult({
          success: true,
          message: 'Archivo procesado exitosamente con CatastroAI',
          extractedData: result.data,
          confidence: result.confidence || 0.95,
          processingTime,
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Error procesando archivo');
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error procesando archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <Card className="w-full mb-6 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Brain className="h-5 w-5" />
          Panel de Prueba - Backend CatastroAI
        </CardTitle>
        <CardDescription>
          Prueba la conexión directa con el agente Python y procesamiento de documentos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Connection Test */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={testBackendConnection}
            disabled={connectionStatus === 'testing'}
            variant={connectionStatus === 'connected' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            {connectionStatus === 'testing' && <Loader2 className="h-4 w-4 animate-spin" />}
            {connectionStatus === 'connected' && <CheckCircle className="h-4 w-4 text-green-600" />}
            {connectionStatus === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
            Probar Conexión Backend
          </Button>
          
          {connectionStatus !== 'idle' && (
            <Badge 
              variant={connectionStatus === 'connected' ? 'default' : connectionStatus === 'error' ? 'destructive' : 'secondary'}
            >
              {connectionStatus === 'connected' && 'Conectado'}
              {connectionStatus === 'testing' && 'Probando...'}
              {connectionStatus === 'error' && 'Error'}
            </Badge>
          )}
        </div>

        {/* File Upload Test */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-purple-700">
            <FileText className="h-4 w-4" />
            Subir PDF para Procesar con IA
          </label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={isUploading || connectionStatus !== 'connected'}
              className="flex-1 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
            />
            {isUploading && (
              <div className="flex items-center gap-2 text-sm text-purple-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando con IA...
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {testResult && (
          <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <div className="flex items-start gap-2">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <AlertDescription className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                  {testResult.message}
                </AlertDescription>
                
                {testResult.success && testResult.extractedData && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-4 text-sm">
                      {testResult.confidence && (
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          Confianza: {(testResult.confidence * 100).toFixed(1)}%
                        </Badge>
                      )}
                      {testResult.processingTime && (
                        <Badge variant="outline" className="text-blue-700 border-blue-300">
                          Tiempo: {testResult.processingTime}ms
                        </Badge>
                      )}
                    </div>
                    
                    <details className="mt-2">
                      <summary className="text-sm font-medium text-green-700 cursor-pointer">
                        Ver datos extraídos (clic para expandir)
                      </summary>
                      <pre className="mt-2 p-3 bg-white rounded-md border text-xs overflow-auto max-h-40">
                        {JSON.stringify(testResult.extractedData, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            </div>
          </Alert>
        )}

        {/* Instructions */}
        <div className="text-xs text-purple-600 bg-purple-100 p-3 rounded-md">
          <strong>Instrucciones:</strong>
          <ul className="mt-1 space-y-1 list-disc list-inside">
            <li>Asegúrate de que el servidor Python esté corriendo en puerto 8080</li>
            <li>Ejecuta: <code className="bg-white px-1 rounded">poetry run python web_demo.py</code></li>
            <li>Prueba primero la conexión, luego sube un PDF catastral</li>
            <li>El agente usará Gemini 2.5 Flash + Document AI para extraer datos</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}