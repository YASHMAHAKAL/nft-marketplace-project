import { Separator } from "./ui/separator";

export function Footer() {
  return (
    <footer className="navy-gradient border-t classical-border relative overflow-hidden">
      <div className="absolute inset-0 greek-pattern opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
      
      <div className="container mx-auto px-6 py-20 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
          <div className="space-y-8 md:col-span-2">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 classical-shadow rounded-full flex items-center justify-center navy-gradient border classical-border">
                <span className="gold-accent text-2xl font-light">Α</span>
              </div>
              <div className="flex flex-col">
                <h3 className="gold-accent text-2xl font-light tracking-wide">
                  ΑΘΗΝΑΙΟΝ
                </h3>
                <span className="text-xs text-muted-foreground tracking-[0.2em] uppercase">
                  Classical Gallery
                </span>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-md font-light text-base">
              <span className="italic">Ars longa, vita brevis</span> — Art is long, life is short. 
              We are dedicated guardians of Hellenic heritage, preserving these eternal masterpieces 
              for generations yet to come.
            </p>
            <div className="flex space-x-6">
              {['Φ', 'Τ', 'Ι'].map((letter, index) => (
                <div key={index} className="w-12 h-12 rounded-full marble-texture border classical-border flex items-center justify-center hover:border-primary/50 transition-all duration-500 cursor-pointer classical-shadow group">
                  <span className="text-muted-foreground group-hover:text-primary transition-colors duration-300 font-light text-lg">{letter}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-6 bg-primary/60 rounded-full"></div>
              <h4 className="text-foreground font-medium tracking-wide uppercase text-sm">Sacred Collection</h4>
            </div>
            <ul className="space-y-4">
              {['Sculptures', 'Ceramics', 'Architecture', 'Mosaics'].map((item, index) => (
                <li key={index}>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-all duration-500 flex items-center group font-light">
                    <div className="w-0 group-hover:w-4 h-px bg-gradient-to-r from-primary to-transparent mr-0 group-hover:mr-3 transition-all duration-500"></div>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{item}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-8">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-6 bg-primary/60 rounded-full"></div>
              <h4 className="text-foreground font-medium tracking-wide uppercase text-sm">Temporal Epochs</h4>
            </div>
            <ul className="space-y-4">
              {['Archaic Era', 'Classical Period', 'Hellenistic Age', 'Roman Influence'].map((item, index) => (
                <li key={index}>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-all duration-500 flex items-center group font-light">
                    <div className="w-0 group-hover:w-4 h-px bg-gradient-to-r from-primary to-transparent mr-0 group-hover:mr-3 transition-all duration-500"></div>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{item}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t classical-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-primary/40 rounded-full"></div>
              <p className="text-muted-foreground font-light">
                <span className="italic">Anno Domini</span> MMXXIV · Curated with reverence for eternal beauty
              </p>
            </div>
            <div className="flex items-center gap-10">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-500 text-sm tracking-wide">
                Privata Politica
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-500 text-sm tracking-wide">
                Condiciones Servitii
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}