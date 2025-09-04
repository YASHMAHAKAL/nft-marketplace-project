// frontend/src/components/Periods.tsx

export function Periods() {
  const periodsData = [
    {
      name: "Archaic",
      description: "Marked by the emergence of a more naturalistic style, the Archaic period saw the development of monumental stone sculpture and black-figure pottery, laying the groundwork for future artistic revolutions.",
      imageUrl: "https://images.unsplash.com/photo-1618722060945-b87f7326995b?fit=crop&w=1200&q=80"
    },
    {
      name: "Classical",
      description: "Considered the zenith of Greek artistry, the Classical period is characterized by its pursuit of ideal beauty, harmony, and proportion, epitomized by the architecture of the Parthenon and the sculptures of Phidias.",
      imageUrl: "https://images.unsplash.com/photo-1598564254441-be3be79c2b9a?fit=crop&w=1200&q=80"
    },
    {
      name: "Hellenistic",
      description: "Following the conquests of Alexander the Great, the Hellenistic period embraced drama, emotion, and realism. Art became more diverse and expressive, capturing a wider range of subjects and human experiences.",
      imageUrl: "https://images.unsplash.com/photo-1746270083992-886b48c22ab4?fit=crop&w=1200&q=80"
    }
  ];

  return (
    <section id="periods" className="py-24 sm:py-32 bg-zinc-950 border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-light tracking-tight text-white mb-4">
            A Journey Through Time
          </h2>
          <p className="text-lg text-zinc-400 leading-relaxed">
            Discover the evolution of an artistic legacy across three distinct eras.
          </p>
        </div>

        <div className="space-y-20">
          {periodsData.map((period, index) => (
            <div key={period.name} className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
              {/* Image Column */}
              <div className={`rounded-xl overflow-hidden ${index % 2 === 1 ? 'md:order-last' : ''}`}>
                <img 
                  src={period.imageUrl} 
                  alt={`${period.name} period art`} 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Text Column */}
              <div>
                <h3 className="text-4xl font-light mb-4 gold-accent font-serif">{period.name}</h3>
                <p className="text-zinc-300 leading-loose">
                  {period.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}