// frontend/src/components/ArtworkFilters.tsx

import { Button } from "./ui/button";

const types = ['All', 'Sculpture', 'Pottery', 'Architecture', 'Mosaic'];
const periods = ['All', 'Archaic', 'Classical', 'Hellenistic'];

interface ArtworkFiltersProps {
  selectedType: string;
  selectedPeriod: string;
  onTypeChange: (type: string) => void;
  onPeriodChange: (period: string) => void;
}

export function ArtworkFilters({
  selectedType,
  selectedPeriod,
  onTypeChange,
  onPeriodChange,
}: ArtworkFiltersProps) {
  
  const baseClasses = "rounded-full bg-white/5 border border-transparent text-zinc-300 transition-all duration-300 hover:bg-white/10 hover:border-white/20";
  const activeClasses = "bg-primary text-background hover:bg-primary/90";

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="text-sm text-zinc-500 mr-2">TYPE:</span>
        {types.map((type) => (
          <Button
            key={type}
            onClick={() => onTypeChange(type)}
            className={`${baseClasses} ${selectedType === type ? activeClasses : ''}`}
            variant="ghost"
          >
            {type}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="text-sm text-zinc-500 mr-2">PERIOD:</span>
        {periods.map((period) => (
          <Button
            key={period}
            onClick={() => onPeriodChange(period)}
            className={`${baseClasses} ${selectedPeriod === period ? activeClasses : ''}`}
            variant="ghost"
          >
            {period}
          </Button>
        ))}
      </div>
    </div>
  );
}