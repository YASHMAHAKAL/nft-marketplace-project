import { Search, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface HeaderProps {
  onSearch: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full marble-texture backdrop-blur-md border-b classical-border">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 classical-shadow rounded-full flex items-center justify-center navy-gradient">
              <span className="gold-accent text-xl font-light">Α</span>
            </div>
            <div className="flex flex-col">
              <h1 className="gold-accent text-2xl font-light tracking-wide">
                ΑΘΗΝΑΙΟΝ
              </h1>
              <span className="text-xs text-muted-foreground tracking-[0.2em] uppercase">
                Classical Gallery
              </span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-10">
            <a href="#gallery" className="group relative text-foreground/80 hover:text-primary transition-all duration-500">
              <span className="relative z-10 text-sm tracking-wide uppercase font-medium">Collection</span>
              <div className="absolute -bottom-2 left-0 w-0 h-px bg-gradient-to-r from-primary to-transparent group-hover:w-full transition-all duration-500"></div>
              <div className="absolute -bottom-1 left-0 w-0 h-px bg-primary/50 group-hover:w-full transition-all duration-300 delay-100"></div>
            </a>
            <a href="#periods" className="group relative text-foreground/80 hover:text-primary transition-all duration-500">
              <span className="relative z-10 text-sm tracking-wide uppercase font-medium">Periods</span>
              <div className="absolute -bottom-2 left-0 w-0 h-px bg-gradient-to-r from-primary to-transparent group-hover:w-full transition-all duration-500"></div>
              <div className="absolute -bottom-1 left-0 w-0 h-px bg-primary/50 group-hover:w-full transition-all duration-300 delay-100"></div>
            </a>
            <a href="#about" className="group relative text-foreground/80 hover:text-primary transition-all duration-500">
              <span className="relative z-10 text-sm tracking-wide uppercase font-medium">About</span>
              <div className="absolute -bottom-2 left-0 w-0 h-px bg-gradient-to-r from-primary to-transparent group-hover:w-full transition-all duration-500"></div>
              <div className="absolute -bottom-1 left-0 w-0 h-px bg-primary/50 group-hover:w-full transition-all duration-300 delay-100"></div>
            </a>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search the collection..."
              className="pl-12 w-80 h-11 bg-card/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 rounded-full"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          <Button variant="ghost" size="icon" className="md:hidden text-foreground/70 hover:text-primary hover:bg-accent/50 rounded-full">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}