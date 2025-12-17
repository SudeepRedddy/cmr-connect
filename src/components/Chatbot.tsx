import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, GraduationCap, Users, Eye, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type UserRole, roleDescriptions } from '@/data/collegeData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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
    const userInput = input;
    setInput('');
    setIsTyping(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('college-chatbot', {
        body: {
          message: userInput,
          role: selectedRole,
          conversationHistory: conversationHistory
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      
      // Show toast for rate limit or payment errors
      if (error instanceof Error) {
        if (error.message.includes('Rate limit') || error.message.includes('429')) {
          toast({
            title: "Please wait",
            description: "Too many requests. Please try again in a moment.",
            variant: "destructive"
          });
        } else if (error.message.includes('402') || error.message.includes('credits')) {
          toast({
            title: "Service unavailable",
            description: "AI service is temporarily unavailable. Please try again later.",
            variant: "destructive"
          });
        }
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or contact the college directly at +91-40-64635858.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
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
                <h3 className="font-semibold">CMRCET AI Assistant</h3>
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
                    <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
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
                  disabled={isTyping}
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
                Powered by AI • Ask anything about CMRCET
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
