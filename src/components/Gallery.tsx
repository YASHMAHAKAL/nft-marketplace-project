import { useState, useMemo } from "react";
import { ArtworkCard, type Artwork } from "./ArtworkCard";
import { ArtworkFilters } from "./ArtworkFilters";

// Sample artwork data
const artworks: Artwork[] = [
  {
    id: "1",
    title: "Venus de Milo",
    description: "Ancient Greek marble sculpture believed to depict Aphrodite, the Greek goddess of love and beauty. Created between 130 and 100 BCE during the Hellenistic period.",
    period: "Hellenistic",
    type: "Sculpture",
    imageUrl: "https://images.unsplash.com/photo-1598564254441-be3be79c2b9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmNpZW50JTIwZ3JlZWslMjBzY3VscHR1cmUlMjBtYXJibGV8ZW58MXx8fHwxNzU2OTgxODYxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    date: "130-100 BCE",
    location: "Louvre Museum, Paris"
  },
  {
    id: "2",
    title: "Black-Figure Amphora",
    description: "Ancient Greek pottery featuring the distinctive black-figure technique, depicting mythological scenes and daily life from the Archaic period.",
    period: "Archaic",
    type: "Pottery",
    imageUrl: "https://images.unsplash.com/photo-1618722060945-b87f7326995b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlayUyMHBvdHRlcnklMjBhbmNpZW50JTIwdmFzZXxlbnwxfHx8fDE3NTY5ODE4NjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    date: "6th century BCE",
    location: "Metropolitan Museum, New York"
  },
  {
    id: "3",
    title: "The Parthenon",
    description: "Temple dedicated to the goddess Athena, representing the pinnacle of Classical Greek architecture with its perfect proportions and Doric columns.",
    period: "Classical",
    type: "Architecture",
    imageUrl: "https://images.unsplash.com/photo-1622272516735-283ce92fb934?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJ0aGVub24lMjBncmVlayUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NTY5ODE4NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    date: "447-432 BCE",
    location: "Athens, Greece"
  },
  {
    id: "4",
    title: "Hellenistic Goddess",
    description: "Marble sculpture showcasing the refined artistry of the Hellenistic period, with detailed drapery and expressive features characteristic of the era.",
    period: "Hellenistic",
    type: "Sculpture",
    imageUrl: "https://images.unsplash.com/photo-1746270083992-886b48c22ab4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlayUyMHN0YXR1ZSUyMHZlbnVzJTIwYW5jaWVudHxlbnwxfHx8fDE3NTY5ODE4NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    date: "2nd century BCE",
    location: "British Museum, London"
  },
  {
    id: "5",
    title: "Ancient Greek Mosaic",
    description: "Intricate mosaic artwork demonstrating the sophisticated decorative techniques used in Greek homes and public buildings during the Hellenistic period.",
    period: "Hellenistic",
    type: "Mosaic",
    imageUrl: "https://images.unsplash.com/photo-1631715629294-71d905c66378?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlayUyMG1vc2FpYyUyMGFuY2llbnQlMjBhcnR8ZW58MXx8fHwxNzU2OTgxODYyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    date: "3rd century BCE",
    location: "Archaeological Museum, Thessaloniki"
  },
  {
    id: "6",
    title: "Doric Temple Columns",
    description: "Classic example of Doric order architecture, featuring the characteristic simplicity and strength that defined Classical Greek temple design.",
    period: "Classical",
    type: "Architecture",
    imageUrl: "https://images.unsplash.com/photo-1636392589616-ec1ad83358ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlayUyMGNvbHVtbiUyMHRlbXBsZSUyMGFuY2llbnR8ZW58MXx8fHwxNzU2OTgxODYzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    date: "5th century BCE",
    location: "Various Greek Sites"
  }
];

interface GalleryProps {
  searchQuery: string;
}

export function Gallery({ searchQuery }: GalleryProps) {
  const [selectedType, setSelectedType] = useState('All');
  const [selectedPeriod, setSelectedPeriod] = useState('All');

  const filteredArtworks = useMemo(() => {
    return artworks.filter((artwork) => {
      const matchesSearch = artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           artwork.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           artwork.period.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = selectedType === 'All' || artwork.type === selectedType;
      const matchesPeriod = selectedPeriod === 'All' || artwork.period === selectedPeriod;
      
      return matchesSearch && matchesType && matchesPeriod;
    });
  }, [searchQuery, selectedType, selectedPeriod]);

  return (
    <section id="gallery" className="py-28 navy-gradient relative overflow-hidden">
      <div className="absolute inset-0 greek-pattern opacity-30"></div>
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-primary/3 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-6 relative">
        <div className="max-w-5xl mx-auto text-center mb-20">
          <div className="inline-flex items-center gap-4 p-4 rounded-full marble-texture border classical-border mb-10">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            <span className="gold-accent text-sm tracking-[0.2em] uppercase font-medium">
              Sacred Collection
            </span>
            <div className="w-12 h-px bg-gradient-to-r from-primary to-transparent"></div>
          </div>
          
          <h2 className="mb-8 text-5xl md:text-6xl font-light tracking-tight">
            <span className="gold-accent font-serif">ΘΗΣΑΥΡΟΣ</span>
            <br />
            <span className="text-foreground/90 text-3xl md:text-4xl font-light tracking-[0.02em] mt-2 block">
              Treasury of Antiquity
            </span>
          </h2>
          
          <div className="flex justify-center mb-8">
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          </div>
          
          <p className="text-muted-foreground leading-relaxed text-lg max-w-3xl mx-auto font-light">
            Each artifact represents centuries of artistic mastery, cultural significance, and human achievement. 
            These treasures have survived the passage of time to inspire and educate future generations.
          </p>
        </div>

        <div className="mb-16">
          <ArtworkFilters
            selectedType={selectedType}
            selectedPeriod={selectedPeriod}
            onTypeChange={setSelectedType}
            onPeriodChange={setSelectedPeriod}
          />
        </div>

        {filteredArtworks.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full marble-texture border classical-border flex items-center justify-center classical-shadow">
              <span className="text-muted-foreground text-3xl">∅</span>
            </div>
            <h3 className="text-xl text-foreground mb-2 font-light">No artifacts found</h3>
            <p className="text-muted-foreground">Adjust your search criteria to discover more treasures</p>
          </div>
        ) : (
          <>
            <div className="mb-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-primary/60 rounded-full"></div>
                  <span className="text-muted-foreground tracking-wide">
                    Displaying {filteredArtworks.length} of {artworks.length} masterpieces
                  </span>
                </div>
                <div className="hidden sm:block w-32 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredArtworks.map((artwork, index) => (
                <div 
                  key={artwork.id}
                  className="transform transition-all duration-500 hover:scale-[0.98]"
                  style={{ 
                    animationDelay: `${index * 150}ms`,
                  }}
                >
                  <ArtworkCard artwork={artwork} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}