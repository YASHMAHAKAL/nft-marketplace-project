import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const periods = [
  {
    name: "Archaic Period",
    dates: "800-480 BCE",
    description: "Characterized by the development of the kouros and kore sculptures, black-figure pottery, and the emergence of monumental architecture. Artists began to move away from geometric patterns toward more naturalistic representations.",
    characteristics: ["Kouros and kore sculptures", "Black-figure pottery", "Geometric to naturalistic transition", "Temple architecture development"]
  },
  {
    name: "Classical Period",
    dates: "480-323 BCE",
    description: "The golden age of Greek art, featuring perfect proportions, idealized beauty, and the development of red-figure pottery. This era produced some of the most famous works of ancient art, including the Parthenon.",
    characteristics: ["Perfect proportions", "Red-figure pottery", "Parthenon construction", "Idealized human form"]
  },
  {
    name: "Hellenistic Period",
    dates: "323-146 BCE",
    description: "Following Alexander the Great's conquests, Greek art became more emotional, dynamic, and realistic. Artists explored dramatic expressions, complex compositions, and diverse subjects from everyday life.",
    characteristics: ["Emotional expression", "Realistic portraiture", "Complex compositions", "Dramatic subjects"]
  },
  {
    name: "Roman Period",
    dates: "146 BCE-330 CE",
    description: "Greek artistic traditions continued under Roman rule, with Romans both preserving Greek masterpieces and commissioning new works in the Greek style. Many famous Greek sculptures survive only as Roman copies.",
    characteristics: ["Roman patronage", "Preservation of Greek works", "Portrait sculpture", "Architectural innovation"]
  }
];

export function Periods() {
  return (
    <section id="periods" className="py-28 marble-texture relative overflow-hidden">
      <div className="absolute inset-0 greek-pattern opacity-20"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-6 relative">
        <div className="max-w-5xl mx-auto text-center mb-20">
          <div className="inline-flex items-center gap-4 p-4 rounded-full navy-gradient border classical-border mb-10 classical-shadow">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            <span className="gold-accent text-sm tracking-[0.2em] uppercase font-medium">
              Temporal Journey
            </span>
            <div className="w-12 h-px bg-gradient-to-r from-primary to-transparent"></div>
          </div>
          
          <h2 className="mb-8 text-5xl md:text-6xl font-light tracking-tight">
            <span className="gold-accent font-serif">ΧΡΟΝΟΣ</span>
            <br />
            <span className="text-foreground/90 text-3xl md:text-4xl font-light tracking-[0.02em] mt-2 block">
              Ages of Artistic Mastery
            </span>
          </h2>
          
          <div className="flex justify-center mb-8">
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          </div>
          
          <p className="text-muted-foreground leading-relaxed text-lg max-w-4xl mx-auto font-light">
            Through the millennia, Greek artistry evolved across distinct epochs, each contributing unique 
            innovations and aesthetic philosophies that continue to influence civilization today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-7xl mx-auto">
          {periods.map((period, index) => (
            <Card key={index} className="group h-full marble-texture border classical-border backdrop-blur-sm hover:scale-[1.02] transition-all duration-700 overflow-hidden relative classical-shadow">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-primary/80 to-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
              
              <CardHeader className="space-y-6 p-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <CardTitle className="text-foreground group-hover:text-primary transition-colors duration-500 text-2xl font-light tracking-wide">
                      {period.name}
                    </CardTitle>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-primary/60 rounded-full group-hover:bg-primary group-hover:scale-125 transition-all duration-500"></div>
                      <span className="text-sm text-primary/80 font-medium tracking-[0.05em] uppercase">
                        {period.dates}
                      </span>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-full navy-gradient border classical-border flex items-center justify-center group-hover:border-primary/50 transition-colors duration-500 classical-shadow">
                    <span className="gold-accent font-light text-2xl">
                      {['Ι', 'ΙΙ', 'ΙΙΙ', 'ΙV'][index]}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-8 p-8 pt-0">
                <p className="text-muted-foreground leading-relaxed text-base">
                  {period.description}
                </p>
                
                <div className="space-y-5">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-px bg-gradient-to-r from-primary to-transparent"></div>
                    <h4 className="text-foreground font-medium tracking-wide uppercase text-sm">Defining Elements</h4>
                    <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent"></div>
                  </div>
                  <ul className="space-y-3 ml-4">
                    {period.characteristics.map((characteristic, idx) => (
                      <li key={idx} className="text-muted-foreground flex items-start gap-4 group/item">
                        <div className="w-2 h-2 bg-primary/40 rounded-full shrink-0 mt-2 group-hover/item:bg-primary group-hover/item:scale-125 transition-all duration-300"></div>
                        <span className="group-hover/item:text-foreground transition-colors duration-300 leading-relaxed">
                          {characteristic}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="pt-4">
                  <div className="flex items-center justify-center">
                    <div className="w-0 group-hover:w-20 h-px bg-gradient-to-r from-primary/50 to-primary transition-all duration-700"></div>
                    <div className="mx-4 w-3 h-3 border-2 border-primary/30 rounded-full group-hover:border-primary group-hover:bg-primary/20 transition-all duration-500"></div>
                    <div className="w-0 group-hover:w-20 h-px bg-gradient-to-l from-primary/50 to-primary transition-all duration-700"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}