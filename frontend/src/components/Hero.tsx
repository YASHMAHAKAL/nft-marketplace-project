import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Hero() {
  return (
    <section className="relative h-[90vh] min-h-[700px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1722325872613-a2a45f03350e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljYWwlMjBncmVlayUyMHRlbXBsZSUyMGNvbHVtbnMlMjBtYXJibGV8ZW58MXx8fHwxNzU2OTgyMzU1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Classical Greek temple with marble columns"
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 navy-gradient opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background/90" />
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-background/20 to-background/60" />
      </div>
      
      <div className="relative z-10 text-center max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <div className="inline-flex items-center gap-3 p-3 rounded-full marble-texture border classical-border mb-8">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            <span className="gold-accent text-sm tracking-[0.15em] uppercase font-medium">
              Eternal Beauty
            </span>
            <div className="w-8 h-px bg-gradient-to-r from-primary to-transparent"></div>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-light tracking-tight leading-[0.85]">
              <span className="block gold-accent font-serif">
                ΚΛΑΣΙΚΗ
              </span>
              <span className="block text-foreground/90 mt-2 font-light tracking-[0.02em]">
                ΤΕΧΝΗ
              </span>
            </h1>
            <div className="flex justify-center">
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            </div>
          </div>
        </div>
        
        <p className="mb-16 text-xl md:text-2xl text-foreground/70 max-w-4xl mx-auto leading-relaxed font-light tracking-wide">
          <span className="italic">Ἀεὶ κάλλος ἀθάνατον</span> — "Beauty is eternal." <br />
          Discover the timeless masterpieces that have inspired civilization for millennia.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-20">
          <a 
            href="#gallery" 
            className="group inline-flex items-center justify-center rounded-full classical-shadow px-12 py-5 navy-gradient border classical-border transition-all duration-500 hover:scale-105"
          >
            <span className="gold-accent text-lg font-medium tracking-wide mr-3">ENTER GALLERY</span>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
              <span className="gold-accent">→</span>
            </div>
          </a>
          <a 
            href="#periods" 
            className="group inline-flex items-center justify-center rounded-full border-2 border-border bg-card/30 px-12 py-5 backdrop-blur-md transition-all duration-500 hover:border-primary/50 hover:bg-card/50"
          >
            <span className="text-foreground/80 group-hover:text-primary text-lg font-medium tracking-wide mr-3">HISTORICAL TIMELINE</span>
            <div className="w-2 h-2 bg-current rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          </a>
        </div>
        
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-3 animate-bounce">
            <div className="w-6 h-12 border-2 border-primary/30 rounded-full flex justify-center classical-shadow">
              <div className="w-1.5 h-4 bg-primary/60 rounded-full mt-2 animate-pulse"></div>
            </div>
            <span className="text-xs text-muted-foreground tracking-[0.1em] uppercase">Scroll</span>
          </div>
        </div>
      </div>
    </section>
  );
}