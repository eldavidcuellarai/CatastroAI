import { UserCircleIcon } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-primary text-white p-4 shadow-md flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🏛️</span>
        <h1 className="text-xl font-semibold">IRCNL Captura</h1>
      </div>
      <div className="flex items-center gap-2">
        <UserCircleIcon className="h-6 w-6" />
        <span className="text-sm hidden sm:block">Usuario Legal</span>
      </div>
    </header>
  );
}
