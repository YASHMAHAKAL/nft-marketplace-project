import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface FilterProps {
  selectedType: string;
  selectedPeriod: string;
  onTypeChange: (type: string) => void;
  onPeriodChange: (period: string) => void;
}

const artworkTypes = ['All', 'Sculpture', 'Pottery', 'Architecture', 'Mosaic', 'Painting'];
const timePeriods = ['All', 'Archaic', 'Classical', 'Hellenistic', 'Roman'];

export function ArtworkFilters({ selectedType, selectedPeriod, onTypeChange, onPeriodChange }: FilterProps) {
  return (
    <div className="space-y-10 p-8 rounded-2xl marble-texture border classical-border backdrop-blur-sm classical-shadow">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-2 h-8 bg-gradient-to-b from-primary to-primary/50 rounded-full"></div>
          <h3 className="text-foreground text-lg font-light tracking-wide">Medium Classification</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent"></div>
        </div>
        <div className="flex flex-wrap gap-4">
          {artworkTypes.map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              size="sm"
              onClick={() => onTypeChange(type)}
              className={`rounded-full px-6 py-2 transition-all duration-500 font-medium tracking-wide ${
                selectedType === type 
                  ? "navy-gradient classical-shadow text-primary border-0 hover:scale-105" 
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-accent/50 hover:scale-105"
              }`}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-2 h-8 bg-gradient-to-b from-primary to-primary/50 rounded-full"></div>
          <h3 className="text-foreground text-lg font-light tracking-wide">Historical Era</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent"></div>
        </div>
        <div className="flex flex-wrap gap-4">
          {timePeriods.map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => onPeriodChange(period)}
              className={`rounded-full px-6 py-2 transition-all duration-500 font-medium tracking-wide ${
                selectedPeriod === period 
                  ? "navy-gradient classical-shadow text-primary border-0 hover:scale-105" 
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-accent/50 hover:scale-105"
              }`}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>
      
      {(selectedType !== 'All' || selectedPeriod !== 'All') && (
        <div className="pt-6 border-t classical-border">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-primary/60 rounded-full"></div>
              <span className="text-muted-foreground text-sm tracking-wide uppercase">Active Criteria</span>
            </div>
            {selectedType !== 'All' && (
              <Badge className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors group px-4 py-1 rounded-full">
                {selectedType}
                <button
                  onClick={() => onTypeChange('All')}
                  className="ml-3 text-primary hover:text-primary/80 group-hover:scale-125 transition-transform"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedPeriod !== 'All' && (
              <Badge className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors group px-4 py-1 rounded-full">
                {selectedPeriod}
                <button
                  onClick={() => onPeriodChange('All')}
                  className="ml-3 text-primary hover:text-primary/80 group-hover:scale-125 transition-transform"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}