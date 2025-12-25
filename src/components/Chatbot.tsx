import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, Mic, MicOff, GraduationCap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Web Speech API type declarations
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  readonly isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type UserRole = 'student' | 'faculty' | 'visitor';

interface ChatbotProps {
  userRole?: UserRole;
}

const Chatbot = ({ userRole = 'visitor' }: ChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessages: Record<UserRole, string> = {
        student: "Welcome back! 👋 I'm your CMRCET AI Assistant. Ask me about your courses, timetable, placements, or any academic queries!",
        faculty: "Welcome! 👋 I'm here to assist you with teaching resources, research info, and administrative queries about CMRCET.",
        visitor: "Welcome to CMRCET! 👋 I'm your AI Assistant. Ask me about admissions, courses, placements, campus facilities, or anything about our college!"
      };
      setMessages([{ id: '1', role: 'assistant', content: welcomeMessages[userRole] }]);
    }
  }, [isOpen, userRole]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast({ title: "Voice Error", description: "Could not recognize speech", variant: "destructive" });
      };

      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      toast({ title: "Not Supported", description: "Voice input not supported in this browser", variant: "destructive" });
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsTyping(true);

    try {
      const conversationHistory = messages.map(msg => ({ role: msg.role, content: msg.content }));
      const { data, error } = await supabase.functions.invoke('college-chatbot', {
        body: { message: userInput, role: userRole, conversationHistory }
      });

      if (error || data?.error) throw new Error(data?.error || error?.message);

      const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.response };
      setMessages((prev) => [...prev, assistantMessage]);

      // Log analytics
      await supabase.from('chatbot_analytics').insert({ user_role: userRole, question: userInput, response: data.response });
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting. Please try again or contact +91-40-64635858."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-secondary text-secondary-foreground shadow-glow flex items-center justify-center hover:scale-110 transition-transform ${isOpen ? 'hidden' : ''}`}
      >
        <MessageCircle className="w-7 h-7" />
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-card rounded-2xl shadow-medium flex flex-col overflow-hidden border border-border animate-scale-in">
          <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <Bot className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">CMRCET AI Assistant</h3>
                <p className="text-xs text-primary-foreground/70">
                  {userRole === 'visitor' ? 'General Assistance' : `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Support`}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full hover:bg-primary-foreground/10 flex items-center justify-center">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm'}`}>
                  <div className="text-sm whitespace-pre-wrap prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {userRole === 'visitor' && (
            <div className="px-4 py-2 border-t border-border bg-muted/50">
              <p className="text-xs text-muted-foreground text-center mb-2">Login for personalized assistance</p>
              <div className="flex gap-2 justify-center">
                <Button size="sm" variant="outline" onClick={() => navigate('/login?type=student')}>
                  <GraduationCap className="w-3 h-3 mr-1" /> Student
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigate('/login?type=faculty')}>
                  <Users className="w-3 h-3 mr-1" /> Faculty
                </Button>
              </div>
            </div>
          )}

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleVoice} className={isListening ? 'bg-destructive/10 text-destructive' : ''}>
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? "Listening..." : "Type your question..."}
                className="flex-1 px-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isTyping}
              />
              <Button variant="chat" size="icon" onClick={handleSend} disabled={!input.trim() || isTyping}>
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
