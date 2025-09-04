// frontend/src/components/Footer.tsx

import { Twitter, Instagram, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-white/10 text-zinc-400">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Logo & Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 rounded-full flex items-center justify-center bg-zinc-900 border border-white/10">
                <span className="gold-accent text-xl font-light">Α</span>
              </div>
              <h1 className="gold-accent text-2xl font-light tracking-wide">
                ΑΘΗΝΑΙΟΝ
              </h1>
            </div>
            <p className="max-w-sm">
              A curated digital gallery celebrating the timeless beauty and profound legacy of classical art.
            </p>
          </div>

          {/* Column 2: Explore Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 tracking-wider">Explore</h4>
            <ul className="space-y-2">
              <li><a href="#gallery" className="hover:text-primary transition-colors">Collection</a></li>
              <li><a href="#periods" className="hover:text-primary transition-colors">Periods</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
            </ul>
          </div>

          {/* Column 3: Social Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 tracking-wider">Follow Us</h4>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-primary transition-colors"><Twitter /></a>
              <a href="#" className="hover:text-primary transition-colors"><Instagram /></a>
              <a href="#" className="hover:text-primary transition-colors"><Facebook /></a>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto px-6 py-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} ΑΘΗΝΑΙΟΝ. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}