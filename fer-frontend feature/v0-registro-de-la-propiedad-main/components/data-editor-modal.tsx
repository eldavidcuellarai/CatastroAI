'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExtractedDataAI, FieldValidation } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  validateExpedienteCatastral,
  validateCURP,
  validateFecha,
  validateSuperficie
} from '@/utils/validation';

interface DataEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: ExtractedDataAI | null;
  onSave: (editedData: ExtractedDataAI) => void;
}

// Mapeo de campos a sus funciones de validación
const fieldValidators: { [key: string]: (value?: string) => FieldValidation } = {
  expediente_catastral: validateExpedienteCatastral,
  vendedor_curp: validateCURP,
  comprador_curp: validateCURP,
  fecha_escritura: validateFecha,
  superficie: validateSuperficie,
};

// Estructura de datos vacía por defecto para asegurar que editedData nunca sea null
const defaultEmptyData: ExtractedDataAI = {
  informacion_predio: {
    expediente_catastral: "NO_CONSTA", lote: "NO_CONSTA", manzana: "NO_CONSTA",
    superficie: "NO_CONSTA", colonia: "NO_CONSTA", municipio: "NO_CONSTA",
    codigo_postal: "NO_CONSTA", tipo_predio: "NO_CONSTA"
  },
  medidas_colindancias: {
    norte: "NO_CONSTA", sur: "NO_CONSTA", este: "NO_CONSTA", oeste: "NO_CONSTA"
  },
  titulares: {
    vendedor_nombre: "NO_CONSTA", vendedor_curp: "NO_CONSTA", vendedor_rfc: "NO_CONSTA",
    comprador_nombre: "NO_CONSTA", comprador_curp: "NO_CONSTA", comprador_rfc: "NO_CONSTA",
    regimen_matrimonial: "NO_CONSTA"
  },
  acto_juridico: {
    tipo_acto: "NO_CONSTA", numero_escritura: "NO_CONSTA", fecha_escritura: "NO_CONSTA",
    notario_nombre: "NO_CONSTA", notario_numero: "NO_CONSTA", valor_operacion: "NO_CONSTA",
    moneda: "NO_CONSTA"
  },
  datos_registrales: {
    volumen: "NO_CONSTA", libro: "NO_CONSTA", seccion: "NO_CONSTA",
    inscripcion: "NO_CONSTA", folio_real: "NO_CONSTA", fecha_registro: "NO_CONSTA"
  },
  antecedentes: {
    inscripcion_anterior: "NO_CONSTA", volumen_anterior: "NO_CONSTA", fecha_anterior: "NO_CONSTA"
  },
  extractionQuality: {
    camposExtraidos: "0/0", confianzaOCR: "0%", estado: "Error"
  }
};

export default function DataEditorModal({ isOpen, onClose, initialData, onSave }: DataEditorModalProps) {
  // Inicializar editedData con una copia profunda de initialData o con la estructura vacía
  const [editedData, setEditedData] = useState<ExtractedDataAI>(
    initialData ? JSON.parse(JSON.stringify(initialData)) : defaultEmptyData
  );
  const [validationErrors, setValidationErrors] = useState<Record<string, string | null>>({});

  // Función para ejecutar todas las validaciones y actualizar el estado de errores
  const runAllValidations = (data: ExtractedDataAI) => {
    const errors: Record<string, string | null> = {};
    // Validar campos específicos
    errors['informacion_predio.expediente_catastral'] = fieldValidators.expediente_catastral(data.informacion_predio?.expediente_catastral).message;
    errors['titulares.vendedor_curp'] = fieldValidators.vendedor_curp(data.titulares?.vendedor_curp).message;
    errors['titulares.comprador_curp'] = fieldValidators.comprador_curp(data.titulares?.comprador_curp).message;
    errors['acto_juridico.fecha_escritura'] = fieldValidators.fecha_escritura(data.acto_juridico?.fecha_escritura).message;
    errors['informacion_predio.superficie'] = fieldValidators.superficie(data.informacion_predio?.superficie).message;

    // También verificar si hay campos "NO_CONSTA" o vacíos en campos críticos que no tienen una validación de formato específica
    if (data.informacion_predio?.lote === "NO_CONSTA" || data.informacion_predio?.lote.trim() === "") {
      errors['informacion_predio.lote'] = "Campo requerido.";
    }
    if (data.informacion_predio?.manzana === "NO_CONSTA" || data.informacion_predio?.manzana.trim() === "") {
      errors['informacion_predio.manzana'] = "Campo requerido.";
    }
    if (data.titulares?.vendedor_nombre === "NO_CONSTA" || data.titulares?.vendedor_nombre.trim() === "") {
      errors['titulares.vendedor_nombre'] = "Campo requerido.";
    }
    if (data.titulares?.comprador_nombre === "NO_CONSTA" || data.titulares?.comprador_nombre.trim() === "") {
      errors['titulares.comprador_nombre'] = "Campo requerido.";
    }
    if (data.acto_juridico?.tipo_acto === "NO_CONSTA" || data.acto_juridico?.tipo_acto.trim() === "") {
      errors['acto_juridico.tipo_acto'] = "Campo requerido.";
    }
    if (data.acto_juridico?.numero_escritura === "NO_CONSTA" || data.acto_juridico?.numero_escritura.trim() === "") {
      errors['acto_juridico.numero_escritura'] = "Campo requerido.";
    }
    if (data.acto_juridico?.valor_operacion === "NO_CONSTA" || data.acto_juridico?.valor_operacion.trim() === "") {
      errors['acto_juridico.valor_operacion'] = "Campo requerido.";
    }

    setValidationErrors(errors);
  };

  useEffect(() => {
    // Actualizar editedData cuando initialData o isOpen cambian
    setEditedData(initialData ? JSON.parse(JSON.stringify(initialData)) : defaultEmptyData);
  }, [initialData, isOpen]);

  useEffect(() => {
    // Re-ejecutar validaciones cada vez que editedData cambia
    runAllValidations(editedData);
  }, [editedData]);

  // Determinar si hay algún error de validación
  const hasErrors = useMemo(() => {
    return Object.values(validationErrors).some(error => error !== null);
  }, [validationErrors]);

  const handleChange = (section: keyof ExtractedDataAI, field: string, value: string) => {
    setEditedData(prevData => {
      const updatedSection = {
        ...(prevData[section] as Record<string, any>),
        [field]: value,
      };

      const newData = {
        ...prevData,
        [section]: updatedSection,
      };
      return newData;
    });
  };

  const handleSave = () => {
    // runAllValidations(editedData); // Ya se ejecuta en useEffect
    if (hasErrors) {
      alert("Por favor, corrige los errores de validación antes de guardar.");
      return;
    }
    onSave(editedData);
    onClose();
  };

  const renderSectionFields = (sectionTitle: string, sectionKey: keyof ExtractedDataAI, data: Record<string, any>) => {
    // `data` aquí ya no debería ser null gracias a la inicialización de editedData
    // y la estructura de defaultEmptyData
    if (!data) return null; // Esto es una salvaguarda, pero no debería ser necesario

    return (
      <div key={sectionKey} className="mb-6 p-4 border rounded-md bg-gray-50">
        <h3 className="text-md font-semibold text-gray-800 mb-3">{sectionTitle}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(data).map(([key, value]) => {
            if (key.endsWith('_confidence')) {
              return null;
            }
            const confidenceKey = `${key}_confidence`;
            const confidence = data[confidenceKey];
            const displayValue = value === null || value === undefined || value === '' || value === 'NO_CONSTA' ? '' : value;
            const fieldPath = `${sectionKey}.${key}`;
            const error = validationErrors[fieldPath];

            return (
              <div key={key} className="flex flex-col gap-1">
                <Label htmlFor={`${sectionKey}-${key}`} className="text-xs font-medium text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                  {typeof confidence === 'number' && (
                    <span className="ml-2 text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
                      {confidence}%
                    </span>
                  )}
                </Label>
                <Input
                  id={`${sectionKey}-${key}`}
                  value={displayValue}
                  onChange={(e) => handleChange(sectionKey, key, e.target.value)}
                  className={cn(
                    "text-sm",
                    error && "border-destructive focus-visible:ring-destructive",
                    displayValue === '' && "border-yellow-500"
                  )}
                  placeholder="NO_CONSTA"
                />
                {error && (
                  <p className="text-destructive text-xs mt-1">{error}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Editar Datos Extraídos</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {renderSectionFields("Información del Predio", "informacion_predio", editedData.informacion_predio)}
          {renderSectionFields("Medidas y Colindancias", "medidas_colindancias", editedData.medidas_colindancias)}
          {renderSectionFields("Titulares", "titulares", editedData.titulares)}
          {renderSectionFields("Acto Jurídico", "acto_juridico", editedData.acto_juridico)}
          {renderSectionFields("Datos Registrales", "datos_registrales", editedData.datos_registrales)}
          {renderSectionFields("Antecedentes", "antecedentes", editedData.antecedentes)}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={hasErrors}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
