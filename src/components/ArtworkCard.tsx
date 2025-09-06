import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export interface Artwork {
  id: string;
  title: string;
  description: string;
  period: string;
  type: string;
  imageUrl: string;
  date: string;
  location: string;
}

interface ArtworkCardProps {
  artwork: Artwork;
}

export function ArtworkCard({ artwork }: ArtworkCardProps) {
  return (
    <Card className="group cursor-pointer transition-all duration-700 classical-shadow hover:scale-[1.02] marble-texture border classical-border overflow-hidden">
      <div className="aspect-[4/5] overflow-hidden relative">
        <ImageWithFallback
          src={artwork.imageUrl}
          alt={artwork.title}
          className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-3 group-hover:translate-y-0">
          <Badge className="classical-shadow navy-gradient border-0 text-primary px-3 py-1">
            {artwork.type}
          </Badge>
        </div>
        <div className="absolute bottom-5 left-5 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-3 group-hover:translate-y-0">
          <div className="w-12 h-px bg-gradient-to-r from-primary to-transparent"></div>
        </div>
      </div>
      
      <CardContent className="p-8 space-y-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className="line-clamp-2 leading-tight text-foreground group-hover:text-primary transition-colors duration-500 font-light text-lg tracking-wide">
              {artwork.title}
            </h3>
          </div>
          <p className="text-muted-foreground line-clamp-3 leading-relaxed text-sm">
            {artwork.description}
          </p>
        </div>
        
        <div className="pt-4 border-t classical-border space-y-4">
          <div className="flex justify-between items-center group/item">
            <span className="text-xs text-muted-foreground uppercase tracking-[0.1em] group-hover/item:text-primary transition-colors duration-300">Period</span>
            <span className="text-sm text-foreground font-medium">{artwork.period}</span>
          </div>
          <div className="flex justify-between items-center group/item">
            <span className="text-xs text-muted-foreground uppercase tracking-[0.1em] group-hover/item:text-primary transition-colors duration-300">Date</span>
            <span className="text-sm text-foreground font-medium">{artwork.date}</span>
          </div>
          <div className="flex justify-between items-center group/item">
            <span className="text-xs text-muted-foreground uppercase tracking-[0.1em] group-hover/item:text-primary transition-colors duration-300">Location</span>
            <span className="text-sm text-foreground font-medium truncate ml-2">{artwork.location}</span>
          </div>
        </div>
        
        <div className="pt-4">
          <div className="flex items-center justify-between">
            <div className="w-0 group-hover:w-16 h-px bg-gradient-to-r from-primary to-transparent transition-all duration-700"></div>
            <div className="w-2 h-2 bg-primary/20 rounded-full group-hover:bg-primary group-hover:scale-125 transition-all duration-500"></div>
            <div className="w-0 group-hover:w-16 h-px bg-gradient-to-l from-primary to-transparent transition-all duration-700"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}