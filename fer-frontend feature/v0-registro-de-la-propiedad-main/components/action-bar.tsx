'use client';

import { Button } from '@/components/ui/button';
import { PencilIcon, CheckCircleIcon, UploadCloudIcon } from 'lucide-react'; // Eliminamos FileTextIcon

interface ActionBarProps {
  onSaveData: () => void;
  onUploadAnotherDocument: () => void;
  onEditFields: () => void; // Nueva prop para la edición de campos
  showSaveButton: boolean;
  showUploadAnotherButton: boolean;
  showEditButton: boolean; // Nueva prop para controlar la visibilidad del botón de edición
  isSaving: boolean;
}

export default function ActionBar({
  onSaveData,
  onUploadAnotherDocument,
  onEditFields, // Recibimos la nueva prop
  showSaveButton,
  showUploadAnotherButton,
  showEditButton, // Recibimos la nueva prop
  isSaving,
}: ActionBarProps) {
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 flex justify-center gap-4 z-10">
      {showEditButton && ( // Mostrar el botón de edición condicionalmente
        <Button
          onClick={onEditFields}
          variant="outline"
          className="flex items-center gap-2 text-primary border-primary hover:bg-primary hover:text-white transition-colors duration-200"
        >
          <PencilIcon className="h-4 w-4" />
          Editar Campos
        </Button>
      )}
      {/* Eliminamos el botón "Ver Documento" */}
      {showSaveButton && (
        <Button
          onClick={onSaveData}
          disabled={isSaving}
          className="flex items-center gap-2 bg-success hover:bg-success/90 text-white transition-colors duration-200"
        >
          {isSaving ? 'Guardando...' : <><CheckCircleIcon className="h-4 w-4" /> Guardar Datos</>}
        </Button>
      )}
      {showUploadAnotherButton && (
        <Button
          onClick={onUploadAnotherDocument}
          variant="secondary"
          className="flex items-center gap-2 text-gray-700 border-gray-300 hover:bg-gray-100 transition-colors duration-200"
        >
          <UploadCloudIcon className="h-4 w-4" />
          Subir Otro Documento
        </Button>
      )}
    </div>
  );
}
