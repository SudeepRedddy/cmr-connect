import { TrendingUp, Building2, Award, Users } from 'lucide-react';

const topPlacements = [
  { name: 'PayPal', package: '34.4 LPA', logo: '💳' },
  { name: 'Siemens', package: '20.4 LPA', logo: '⚡' },
  { name: 'Zenoti', package: '11.47 LPA', logo: '🔧' },
  { name: 'Texas Instruments', package: '10.04 LPA', logo: '🔬' },
  { name: 'Honeywell', package: '10.0 LPA', logo: '🏭' },
];

const recruiters = [
  'Microsoft', 'Amazon', 'Accenture', 'Infosys', 'TCS', 'Wipro',
  'Capgemini', 'Cognizant', 'IBM', 'Tech Mahindra', 'LTIMindtree', 'Deloitte',
  'JPMorgan', 'PwC', 'Ernst & Young', 'EPAM', 'Virtusa', 'UST'
];

export function PlacementsSection() {
  return (
    <section id="placements" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-semibold mb-4">
            Career Success
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Placements & Higher Studies
          </h2>
          <p className="text-muted-foreground text-lg">
            Our students are placed in top companies worldwide with exceptional packages
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { icon: TrendingUp, value: '607+', label: 'Placements 2024', color: 'text-green-500' },
            { icon: Award, value: '34.4 LPA', label: 'Highest Package', color: 'text-secondary' },
            { icon: Building2, value: '200+', label: 'Recruiting Companies', color: 'text-blue-500' },
            { icon: Users, value: '95%', label: 'Placement Rate', color: 'text-purple-500' },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="bg-card rounded-2xl p-6 shadow-card text-center hover:shadow-medium transition-all"
            >
              <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Top Packages */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">
            Top Packages 2024
          </h3>
          <div className="grid md:grid-cols-5 gap-4">
            {topPlacements.map((placement, index) => (
              <div
                key={placement.name}
                className="bg-card rounded-xl p-5 shadow-card text-center hover:shadow-medium hover:-translate-y-1 transition-all border border-border"
              >
                <div className="text-4xl mb-3">{placement.logo}</div>
                <h4 className="font-semibold text-foreground mb-1">{placement.name}</h4>
                <div className="text-lg font-bold text-secondary">{placement.package}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recruiters Marquee */}
        <div className="relative overflow-hidden py-8 bg-card rounded-2xl shadow-card">
          <h3 className="text-xl font-bold text-foreground text-center mb-6">
            Our Recruiters
          </h3>
          <div className="flex items-center">
            <div className="flex gap-8 animate-marquee">
              {[...recruiters, ...recruiters].map((recruiter, index) => (
                <div
                  key={`${recruiter}-${index}`}
                  className="flex-shrink-0 px-6 py-3 bg-muted rounded-lg text-foreground font-medium whitespace-nowrap"
                >
                  {recruiter}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Congratulations to all students placed in Microsoft, Rubrik, JPMorgan Chase & Co, Amazon, and many more!
          </p>
          <a href="#" className="text-secondary font-semibold hover:underline">
            View Full Placement Report →
          </a>
        </div>
      </div>
    </section>
  );
}
