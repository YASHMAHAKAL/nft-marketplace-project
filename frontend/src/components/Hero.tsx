// frontend/src/components/Hero.tsx

import { Button } from "./ui/button";

export function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          // Replace this with a high-quality background image of your choice
          src="https://images.unsplash.com/photo-1588256385559-4221a2a57c43?fit=crop&w=1920&h=1080&q=80"
          alt="Ancient Greek statue background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
      </div>

      {/* Atmospheric Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse animation-delay-4000" />

      {/* Centered Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        <h1 className="text-5xl md:text-7xl font-light tracking-[0.3em] uppercase text-white animate-fade-in-down">
          Treasury of Antiquity
        </h1>
        <p className="text-lg md:text-xl text-zinc-300 max-w-2xl leading-relaxed animate-fade-in-up">
          Experience the timeless allure of ancient artistry. Each artifact a story, each piece a masterpiece.
        </p>
        <a href="#gallery">
          <Button
            size="lg"
            className="rounded-full px-10 py-6 text-lg bg-white/10 border border-white/20 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:border-white/30"
          >
            Explore Collection
          </Button>
        </a>
      </div>
    </section>
  );
}