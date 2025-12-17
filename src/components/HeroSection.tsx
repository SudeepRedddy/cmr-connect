import { ArrowRight, Award, Users, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen bg-gradient-hero overflow-hidden pt-32 pb-16">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-foreground rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-primary-foreground">
            {/* Badges */}
            <div className="flex flex-wrap gap-3 mb-6 animate-fade-in">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/20 backdrop-blur-sm rounded-full text-sm font-medium border border-secondary/30">
                <Award className="w-4 h-4" />
                NAAC A+ Accredited
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full text-sm font-medium border border-primary-foreground/20">
                NIRF Ranked 151-200
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              CMR College of
              <span className="block text-secondary">Engineering & Technology</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Explore to Invent. 23 years of excellence in engineering education with 
              world-class placements and industry partnerships.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-12 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Button variant="hero" size="xl">
                Apply Now
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="heroOutline" size="xl">
                Virtual Tour
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="text-center p-4 rounded-xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10">
                <div className="text-3xl md:text-4xl font-bold text-secondary mb-1">607+</div>
                <div className="text-sm text-primary-foreground/70">Placements 2024</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10">
                <div className="text-3xl md:text-4xl font-bold text-secondary mb-1">34.4</div>
                <div className="text-sm text-primary-foreground/70">LPA Highest Package</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10">
                <div className="text-3xl md:text-4xl font-bold text-secondary mb-1">23</div>
                <div className="text-sm text-primary-foreground/70">Years of Excellence</div>
              </div>
            </div>
          </div>

          {/* Hero Image/Card */}
          <div className="relative animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="relative z-10 bg-card/10 backdrop-blur-md rounded-3xl p-8 border border-primary-foreground/20">
              {/* Top Recruiters Card */}
              <div className="bg-card rounded-2xl p-6 shadow-medium">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-secondary" />
                  Top Recruiters 2025
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'Accenture', count: 456 },
                    { name: 'Infosys', count: 127 },
                    { name: 'Capgemini', count: 472 },
                    { name: 'LTIMindtree', count: 67 },
                    { name: 'Cognizant', count: 231 },
                    { name: 'PwC', count: 45 },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium text-foreground">{item.name}</span>
                      <span className="text-sm font-bold text-secondary">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Info */}
              <div className="mt-6 flex items-center justify-center gap-4 text-primary-foreground">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-secondary" />
                  <span className="text-sm">10,000+ Alumni</span>
                </div>
                <span className="text-primary-foreground/40">|</span>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-secondary" />
                  <span className="text-sm">EAMCET: CMRK</span>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary/30 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary-foreground/20 rounded-full blur-2xl" />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-secondary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
