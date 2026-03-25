import { Scene3D } from '@/components/Scene3D';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/20" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* 3D Scene */}
      <Scene3D />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Advanced Technology Solutions</span>
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
            <span className="text-foreground">Your Tech</span>
            <br />
            <span className="text-gradient glow-text">Partner</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Expert electronics sales, professional repair services, and reliable technical support. 
            We bring innovation to your doorstep.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Button variant="glow" size="xl" onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>
              Explore Services
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            {[
              { value: '10K+', label: 'Devices Repaired' },
              { value: '99%', label: 'Satisfaction Rate' },
              { value: '24/7', label: 'Support Available' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-3xl md:text-4xl font-bold text-primary glow-text">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};
