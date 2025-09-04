// frontend/src/App.tsx

import { useState } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Gallery } from "./components/Gallery";
import { Periods } from "./components/Periods";
import { Footer } from "./components/Footer";
import { MintModal } from "./components/MintModal";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);

  return (
    // --- MODIFIED: Removed old theme classes, added a new dark background ---
    <div className="dark min-h-screen bg-zinc-950 text-white">
      <Header 
        onSearch={setSearchQuery} 
        onMintClick={() => setIsMintModalOpen(true)}
      />
      <main>
        <Hero />
        <Gallery searchQuery={searchQuery} />
        <Periods />
      </main>
      <Footer />
      
      {isMintModalOpen && <MintModal onClose={() => setIsMintModalOpen(false)} />}
    </div>
  );
}