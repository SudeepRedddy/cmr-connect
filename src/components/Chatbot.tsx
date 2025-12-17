import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, GraduationCap, Users, Eye, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { collegeData, faqData, type UserRole, roleDescriptions } from '@/data/collegeData';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const roleIcons: Record<UserRole, React.ElementType> = {
  student: GraduationCap,
  faculty: User,
  parent: Users,
  visitor: Eye,
};

const roleColors: Record<UserRole, string> = {
  student: 'border-blue-500 hover:bg-blue-50',
  faculty: 'border-green-500 hover:bg-green-50',
  parent: 'border-purple-500 hover:bg-purple-50',
  visitor: 'border-orange-500 hover:bg-orange-50',
};

function generateResponse(query: string, role: UserRole): string {
  const q = query.toLowerCase();
  
  // Search FAQs
  for (const category of faqData) {
    for (const faq of category.questions) {
      const keywords = faq.q.toLowerCase().split(' ');
      const matchCount = keywords.filter(kw => kw.length > 3 && q.includes(kw)).length;
      if (matchCount >= 2 || q.includes(faq.q.toLowerCase().slice(0, 20))) {
        return faq.a;
      }
    }
  }

  // EAMCET code
  if (q.includes('eamcet') || q.includes('code')) {
    return `The EAMCET code for ${collegeData.shortName} is **${collegeData.eamcetCode}**. You can use this code during counseling to select our college.`;
  }

  // Placements
  if (q.includes('placement') || q.includes('package') || q.includes('salary') || q.includes('job')) {
    return `**Placement Highlights 2024:**\n\n- **Highest Package:** ${collegeData.placements.highestPackage} (PayPal)\n- **Total Placements:** ${collegeData.placements.totalPlacements}+ students\n- **Top Recruiters:** ${collegeData.placements.recruiters.slice(0, 8).join(', ')}\n\nTop companies like Microsoft, Amazon, and Accenture regularly recruit from our campus!`;
  }

  // Courses
  if (q.includes('course') || q.includes('branch') || q.includes('program') || q.includes('btech') || q.includes('mtech')) {
    const courses = collegeData.courses.undergraduate.map(c => `- ${c.name} (${c.code}): ${c.intake} seats`).join('\n');
    return `**B.Tech Programs at CMRCET:**\n\n${courses}\n\nWe also offer M.Tech and MBA programs. Would you like details on any specific course?`;
  }

  // Location
  if (q.includes('location') || q.includes('address') || q.includes('where') || q.includes('reach')) {
    return `**Campus Location:**\n\n📍 ${collegeData.location.address}\n\n- ${collegeData.location.distance}\n- On ${collegeData.location.highway}\n- ${collegeData.location.campus}\n\nTransport facilities are available covering major areas of Hyderabad.`;
  }

  // Accreditation
  if (q.includes('naac') || q.includes('nirf') || q.includes('ranking') || q.includes('accredit')) {
    const accreds = collegeData.accreditations.map(a => `- **${a.name}:** ${a.grade || a.rank || a.status}`).join('\n');
    return `**Accreditations & Rankings:**\n\n${accreds}\n\nWe are proud to be ranked in NIRF for 8 consecutive years!`;
  }

  // Fees (general response)
  if (q.includes('fee') || q.includes('cost') || q.includes('tuition')) {
    return `For detailed fee structure, please contact our admissions office:\n\n📞 +91-40-64635858\n📧 admissions@cmrcet.ac.in\n\nFee payment can be done through the college portal. Would you like information about scholarships?`;
  }

  // Hostel
  if (q.includes('hostel') || q.includes('accommodation') || q.includes('stay')) {
    return `**Hostel Facilities:**\n\n- Separate hostels for boys and girls\n- Modern amenities and 24/7 security\n- Mess facility with nutritious food\n- Wi-Fi connectivity\n- Recreation areas\n\nFor hostel admission, contact the admissions office.`;
  }

  // Admission
  if (q.includes('admission') || q.includes('apply') || q.includes('join')) {
    return `**Admission Process:**\n\n1. Qualify in TS EAMCET / AP EAMCET\n2. Participate in counseling through TSCHE/APSCHE\n3. Select CMRCET using code: **CMRK**\n\n**Eligibility:** 10+2 with Physics, Chemistry & Mathematics\n\nAdmission office: 10:00 AM to 04:00 PM`;
  }

  // Contact
  if (q.includes('contact') || q.includes('phone') || q.includes('email') || q.includes('call')) {
    return `**Contact Information:**\n\n📞 ${collegeData.contact.phone.join(' / ')}\n📧 ${collegeData.contact.email}\n🌐 ${collegeData.contact.website}\n\n📍 ${collegeData.location.address}`;
  }

  // Role-specific responses
  if (role === 'student') {
    if (q.includes('lms') || q.includes('portal')) {
      return `Students can access the Learning Management System (LMS) through the college portal. Your login credentials are provided by the IT department during admission. For any access issues, contact the IT helpdesk.`;
    }
  }

  if (role === 'faculty') {
    if (q.includes('research') || q.includes('publication')) {
      return `**Research at CMRCET:**\n\n- Multiple research centers across departments\n- Funded projects from government and industry\n- Support for patent filing\n- Collaboration opportunities with top institutions\n\nContact the R&D cell for research proposals.`;
    }
  }

  if (role === 'parent') {
    if (q.includes('safe') || q.includes('security')) {
      return `**Campus Safety:**\n\n- 24/7 security with CCTV surveillance\n- Secure, gated campus\n- Anti-ragging measures strictly enforced\n- Medical facilities available\n- Regular parent-teacher meetings\n\nYour child's safety is our priority!`;
    }
  }

  // Default response
  return `Thank you for your question! Here are some topics I can help you with:\n\n- 📚 **Courses & Admissions** - Programs, eligibility, EAMCET code\n- 💼 **Placements** - Packages, recruiters, career support\n- 🏛️ **Campus & Facilities** - Location, hostel, infrastructure\n- 🏆 **Rankings** - NAAC, NIRF, accreditations\n- 📞 **Contact** - Phone, email, address\n\nPlease ask about any of these topics, and I'll be happy to help!`;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: `Welcome to CMRCET! 👋 I'm here to help you as a **${role}**.\n\nYou can ask me about:\n- Courses & Admissions\n- Placements & Career\n- Campus Life & Facilities\n- Rankings & Accreditations\n\nHow can I assist you today?`,
      },
    ]);
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedRole) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = generateResponse(input, selectedRole);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetChat = () => {
    setSelectedRole(null);
    setMessages([]);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-secondary text-secondary-foreground shadow-glow flex items-center justify-center hover:scale-110 transition-transform ${isOpen ? 'hidden' : ''}`}
      >
        <MessageCircle className="w-7 h-7" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-card rounded-2xl shadow-medium flex flex-col overflow-hidden border border-border animate-scale-in">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <Bot className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">CMRCET Assistant</h3>
                <p className="text-xs text-primary-foreground/70">
                  {selectedRole ? `Helping as ${selectedRole}` : 'Select your role'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedRole && (
                <button
                  onClick={resetChat}
                  className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Change Role
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-primary-foreground/10 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {!selectedRole ? (
              /* Role Selection */
              <div className="flex-1 p-4 overflow-y-auto">
                <p className="text-center text-muted-foreground mb-6">
                  Please select your role to get personalized assistance:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(roleDescriptions) as UserRole[]).map((role) => {
                    const Icon = roleIcons[role];
                    return (
                      <button
                        key={role}
                        onClick={() => handleRoleSelect(role)}
                        className={`p-4 rounded-xl border-2 bg-card text-left transition-all hover:shadow-soft ${roleColors[role]}`}
                      >
                        <Icon className="w-8 h-8 mb-2 text-foreground" />
                        <h4 className="font-semibold text-foreground capitalize mb-1">{role}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {roleDescriptions[role].slice(0, 60)}...
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Chat Messages */
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted text-foreground rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          {selectedRole && (
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your question..."
                  className="flex-1 px-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  variant="chat"
                  size="icon"
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Ask about courses, placements, admissions & more
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
