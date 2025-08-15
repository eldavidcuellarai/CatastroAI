import { UploadedFile } from '@/lib/types';
import FileItem from './file-item'; // Importamos el nuevo componente FileItem

interface FileListProps {
  files: UploadedFile[];
}

export default function FileList({ files }: FileListProps) {
  if (files.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No hay documentos subidos aún.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {files.map((file) => (
        <FileItem key={file.id} file={file} />
      ))}
    </div>
  );
}
