import { CheckCircleIcon, Loader2Icon } from 'lucide-react';

export default function ProcessFlowBar() {
  return (
    <div className="flex items-center justify-center py-4 px-4 bg-white shadow-sm rounded-lg mb-6">
      <div className="flex items-center">
        <CheckCircleIcon className="h-6 w-6 text-success mr-2" />
        <span className="font-medium text-gray-700 text-sm sm:text-base">Carga de Documentos</span>
      </div>
      <div className="flex-1 h-0.5 bg-success mx-4"></div> {/* Línea conectora */}
      <div className="flex items-center">
        <Loader2Icon className="h-6 w-6 text-primary mr-2 animate-spin" />
        <span className="font-medium text-primary text-sm sm:text-base">OCR + Extracción IA</span>
        <span className="relative flex h-3 w-3 ml-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
        </span>
      </div>
    </div>
  );
}
