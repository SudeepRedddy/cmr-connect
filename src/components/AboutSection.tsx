import { MapPin, Calendar, Award, BookOpen, Building, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AboutSection() {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
              About CMRCET
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              The CMR Advantage
            </h2>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              CMR College of Engineering & Technology (CMRCET) is sponsored by the MGR Educational Society, 
              established in 2002. The College is situated 20 km from Secunderabad Railway Station on the 
              Hyderabad – Nagpur National Highway.
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Located in 10 acres of serene, lush green and pollution-free environment, we are committed to 
              assuring quality service to all stakeholders - parents, students, alumni, employees, employers, 
              and the community.
            </p>

            {/* Quick Facts */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { icon: Calendar, label: 'Established', value: '2002' },
                { icon: MapPin, label: 'Campus Area', value: '10 Acres' },
                { icon: Award, label: 'NAAC Grade', value: 'A+' },
                { icon: BookOpen, label: 'Status', value: 'Autonomous' },
              ].map((fact) => (
                <div key={fact.label} className="flex items-center gap-3 p-4 bg-muted rounded-xl">
                  <fact.icon className="w-6 h-6 text-secondary" />
                  <div>
                    <div className="text-sm text-muted-foreground">{fact.label}</div>
                    <div className="font-semibold text-foreground">{fact.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="default" size="lg">
              Learn More About Us
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                icon: Building,
                title: 'Centers of Excellence',
                description: 'State-of-the-art labs and research centers',
                color: 'bg-blue-500',
              },
              {
                icon: Lightbulb,
                title: 'Innovation Hub',
                description: 'Technology incubation & startup support',
                color: 'bg-secondary',
              },
              {
                icon: Award,
                title: 'NIRF Ranked',
                description: '8th consecutive year in 151-200 band',
                color: 'bg-green-500',
              },
              {
                icon: BookOpen,
                title: 'Industry Connect',
                description: '200+ MOUs with leading companies',
                color: 'bg-purple-500',
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="bg-card p-6 rounded-2xl shadow-card hover:shadow-medium transition-all border border-border"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.color} text-white mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
