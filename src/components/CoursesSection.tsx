import { Monitor, Cpu, Zap, Wrench, Building2, BarChart3, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const courses = [
  {
    icon: Monitor,
    name: 'Computer Science & Engineering',
    code: 'CSE',
    intake: 180,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Cpu,
    name: 'CSE (Data Science)',
    code: 'CSE-DS',
    intake: 120,
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Monitor,
    name: 'Information Technology',
    code: 'IT',
    intake: 120,
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Cpu,
    name: 'CSE (AI & ML)',
    code: 'CSE-AIML',
    intake: 60,
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Zap,
    name: 'Electronics & Communication',
    code: 'ECE',
    intake: 120,
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Zap,
    name: 'Electrical & Electronics',
    code: 'EEE',
    intake: 60,
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: Wrench,
    name: 'Mechanical Engineering',
    code: 'MECH',
    intake: 60,
    color: 'from-gray-500 to-slate-600',
  },
  {
    icon: Building2,
    name: 'Civil Engineering',
    code: 'CIVIL',
    intake: 60,
    color: 'from-amber-500 to-yellow-600',
  },
];

export function CoursesSection() {
  return (
    <section id="courses" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-semibold mb-4">
            Academic Programs
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Courses Offered
          </h2>
          <p className="text-muted-foreground text-lg">
            Choose from our wide range of AICTE approved and industry-aligned engineering programs
          </p>
        </div>

        {/* Programs Tabs */}
        <div className="flex justify-center gap-4 mb-12">
          <Button variant="default" size="lg">
            B.Tech Programs
          </Button>
          <Button variant="outline" size="lg">
            PG Programs
          </Button>
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course, index) => (
            <div
              key={course.code}
              className="group relative bg-card rounded-2xl p-6 shadow-card hover:shadow-medium transition-all duration-300 hover:-translate-y-1 border border-border"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${course.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                <course.icon className="w-7 h-7" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {course.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Code: {course.code}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-sm font-medium text-foreground">
                  Intake: <span className="text-secondary font-bold">{course.intake}</span>
                </span>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>

        {/* PG Programs */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">
            Postgraduate Programs
          </h3>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border hover:shadow-medium transition-all">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground mb-4">
                <Cpu className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">M.Tech Programs</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Specializations in CSE, ECE, and EEE
              </p>
              <Button variant="outline" size="sm">
                Learn More <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border hover:shadow-medium transition-all">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-secondary to-secondary/70 text-secondary-foreground mb-4">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">MBA Program</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Master of Business Administration - 120 Intake
              </p>
              <Button variant="outline" size="sm">
                Learn More <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
