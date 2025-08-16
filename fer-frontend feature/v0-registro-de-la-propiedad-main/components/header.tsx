import { UserCircleIcon, TestTube, PlayCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onLoadSampleData?: () => void;
  onClearAll?: () => void;
  onToggleTestMode?: () => void;
  isTestMode?: boolean;
}

export default function Header({ onLoadSampleData, onClearAll, onToggleTestMode, isTestMode }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🏛️</span>
        <div>
          <h1 className="text-xl font-bold">CatastroAI</h1>
          <p className="text-xs text-blue-100">Extractor de Datos Registrales</p>
        </div>
        {isTestMode && (
          <div className="bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold ml-2">
            MODO PRUEBA
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        {/* Test Tools */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            onClick={onToggleTestMode}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <TestTube className="h-4 w-4 mr-1" />
            Modo Prueba
          </Button>
          
          <Button
            onClick={onLoadSampleData}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <PlayCircle className="h-4 w-4 mr-1" />
            Datos Demo
          </Button>
          
          <Button
            onClick={onClearAll}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        </div>
        
        <div className="flex items-center gap-2 border-l border-white/20 pl-3">
          <UserCircleIcon className="h-6 w-6" />
          <span className="text-sm hidden sm:block">Usuario Legal</span>
        </div>
      </div>
    </header>
  );
}
