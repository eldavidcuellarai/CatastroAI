import { UploadedFile, FileStatus } from '@/lib/types';
import { formatFileSize } from '@/utils/formatFileSize'; // Importamos la utilidad
import { FileTextIcon, CheckCircleIcon, XCircleIcon, Loader2Icon, UploadCloudIcon } from 'lucide-react'; // Importamos iconos de Lucide

interface FileItemProps {
  file: UploadedFile;
}

const FileItem = ({ file }: FileItemProps) => {
  const getStatusColor = (status: FileStatus) => {
    switch(status) {
      case 'Pendiente': return 'text-gray-600';
      case 'Procesando': return 'text-primary'; // Usamos el color primary de Tailwind
      case 'Completado': return 'text-success'; // Usamos el color success de Tailwind
      case 'Error': return 'text-destructive'; // Usamos el color destructive de Tailwind
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: FileStatus) => {
    switch(status) {
      case 'Pendiente': return <FileTextIcon className="h-6 w-6 text-gray-500" />;
      case 'Procesando': return <Loader2Icon className="h-6 w-6 text-primary animate-spin" />;
      case 'Completado': return <CheckCircleIcon className="h-6 w-6 text-success" />;
      case 'Error': return <XCircleIcon className="h-6 w-6 text-destructive" />;
      default: return <FileTextIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="flex items-center gap-4 p-3 border rounded-md bg-white shadow-sm">
      {getStatusIcon(file.status)}
      <div className="flex-1">
        <p className="font-medium text-sm truncate">{file.name}</p>
        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
        <p className="text-xs text-gray-600 mt-1">
          {file.message || file.status}
        </p>
        <div className="w-full bg-neutral rounded-full h-2.5 mt-1">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ease-out ${getStatusColor(file.status).replace('text-', 'bg-')}`}
            style={{ width: `${file.progress}%` }}
            role="progressbar"
            aria-valuenow={file.progress}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>
      </div>
      {/* No necesitamos un span de estado adicional aquí, ya que el mensaje y el icono se muestran en el div principal */}
    </div>
  );
};

export default FileItem;
