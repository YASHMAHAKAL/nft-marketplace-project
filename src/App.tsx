import { useState } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Gallery } from "./components/Gallery";
import { Periods } from "./components/Periods";
import { Footer } from "./components/Footer";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="dark min-h-screen navy-gradient greek-pattern">
      <Header onSearch={setSearchQuery} />
      <main>
        <Hero />
        <Gallery searchQuery={searchQuery} />
        <Periods />
      </main>
      <Footer />
    </div>
  );
}