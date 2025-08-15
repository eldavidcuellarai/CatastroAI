import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DataCardProps {
  title: string;
  data: Record<string, any>; // Usamos 'any' temporalmente para la flexibilidad de la nueva estructura
}

export default function DataCard({ title, data }: DataCardProps) {
  return (
    <Card className={cn(
      "shadow-md transition-shadow duration-300 hover:shadow-lg",
      "relative"
    )}>
      <CardHeader className="bg-primary/10 p-4 rounded-t-lg">
        <CardTitle className="text-lg font-semibold text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 text-sm text-gray-700">
        {Object.entries(data).map(([key, value]) => {
          // Ignorar los campos de confianza directamente aquí, se mostrarán junto a su campo principal
          if (key.endsWith('_confidence')) {
            return null;
          }

          const confidenceKey = `${key}_confidence`;
          const confidence = data[confidenceKey];

          return (
            <div key={key} className="mb-2 last:mb-0 flex items-center justify-between">
              <div>
                <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}: </span>
                <span>{value === null || value === undefined || value === '' ? 'NO_CONSTA' : value}</span>
              </div>
              {typeof confidence === 'number' && (
                <span className="ml-2 text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
                  {confidence}%
                </span>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
