import { GraduationCap, Briefcase, Users, Calendar, Phone, MapPin, Award, BookOpen } from 'lucide-react';

interface QuickActionsProps {
  onAction: (query: string) => void;
  disabled?: boolean;
}

const quickActions = [
  { label: 'Placements', query: 'Tell me about placements and top recruiters at CMRCET', icon: Briefcase },
  { label: 'Courses', query: 'What courses and programs are offered at CMRCET?', icon: GraduationCap },
  { label: 'Faculty', query: 'Tell me about the faculty members at CMRCET', icon: Users },
  { label: 'Rankings', query: 'What are the NIRF rankings and accreditations of CMRCET?', icon: Award },
  { label: 'Events', query: 'What upcoming events are happening at CMRCET?', icon: Calendar },
  { label: 'Campus', query: 'Tell me about the campus facilities at CMRCET', icon: MapPin },
  { label: 'Admissions', query: 'How can I apply for admission to CMRCET?', icon: BookOpen },
  { label: 'Contact', query: 'What are the contact details of CMRCET?', icon: Phone },
];

const QuickActions = ({ onAction, disabled }: QuickActionsProps) => {
  return (
    <div className="flex flex-wrap gap-1.5 px-4 py-2 border-b border-border bg-muted/30">
      {quickActions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={() => onAction(action.query)}
            disabled={disabled}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-full bg-background border border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon className="w-3 h-3" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
};

export default QuickActions;
