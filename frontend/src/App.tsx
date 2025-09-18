// frontend/src/App.tsx

import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Gallery } from "./components/Gallery";
import { Favorites } from "./components/Favorites";
import { Periods } from "./components/Periods";
import { Footer } from "./components/Footer";
import { MintModal } from "./components/MintModal";

function HomePage({ searchQuery }: { searchQuery: string }) {
  return (
    <>
      <Hero />
      <Gallery searchQuery={searchQuery} />
      <Periods />
    </>
  );
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);

  return (
    <Router>
      <div className="dark min-h-screen bg-zinc-950 text-white">
        <Header 
          onSearch={setSearchQuery} 
          onMintClick={() => setIsMintModalOpen(true)}
        />
        <main>
          <Routes>
            <Route path="/" element={<HomePage searchQuery={searchQuery} />} />
            <Route path="/gallery" element={<HomePage searchQuery={searchQuery} />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </main>
        <Footer />

        {isMintModalOpen && <MintModal onClose={() => setIsMintModalOpen(false)} />}
      </div>
    </Router>
  );
}