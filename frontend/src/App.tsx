// frontend/src/App.tsx

import { useState } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Gallery } from "./components/Gallery";
import { Periods } from "./components/Periods";
import { Footer } from "./components/Footer";
import { MintModal } from "./components/MintModal"; // --- NEW: Import the modal ---

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMintModalOpen, setIsMintModalOpen] = useState(false); // --- NEW: State for modal ---

  return (
    <div className="dark min-h-screen bg-zinc-950 text-white">
      <Header 
        onSearch={setSearchQuery} 
        onMintClick={() => setIsMintModalOpen(true)} // --- NEW: Pass handler to Header ---
      />
      <main>
        <Hero />
        <Gallery searchQuery={searchQuery} />
        <Periods />
      </main>
      <Footer />

      {/* --- NEW: Conditionally render the modal --- */}
      {isMintModalOpen && <MintModal onClose={() => setIsMintModalOpen(false)} />}
    </div>
  );
}