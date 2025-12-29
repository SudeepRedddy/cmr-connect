import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, Mic, MicOff, GraduationCap, Users, Volume2, VolumeX, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import LiveChatModal from './LiveChatModal';
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
  showLiveChatButton?: boolean;
  images?: string[];
};

type UserRole = 'student' | 'faculty' | 'visitor';

interface ChatbotProps {
  userRole?: UserRole;
  userId?: string;
}

const Chatbot = ({ userRole = 'visitor', userId }: ChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [showLiveChatModal, setShowLiveChatModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Browser TTS fallback function
  const speakWithBrowserTTS = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: "Voice Not Supported",
        description: "Your browser doesn't support text-to-speech",
        variant: "destructive"
      });
      setIsSpeaking(false);
      setCurrentPlayingId(null);
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    // Clean text for better speech
    const cleanText = text
      .replace(/[*#_`]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
      .replace(/\n+/g, '. ')
      .replace(/[-•]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 1500);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.volume = 1.0;

    const voices = synth.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Google') || 
      v.name.includes('Natural') || 
      v.name.includes('Premium') ||
      (v.lang.includes('en') && v.name.includes('Female'))
    ) || voices.find(v => v.lang.includes('en')) || voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentPlayingId(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentPlayingId(null);
    };

    synth.speak(utterance);
  }, [toast]);

  // TTS function - tries ElevenLabs first, falls back to browser TTS
  const speakTextDirect = useCallback(async (text: string) => {
    // Stop any ongoing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    setIsSpeaking(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) {
        console.warn('ElevenLabs TTS failed, falling back to browser TTS');
        speakWithBrowserTTS(text);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsSpeaking(false);
        setCurrentPlayingId(null);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      
      audio.onerror = () => {
        setIsSpeaking(false);
        setCurrentPlayingId(null);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      
      await audio.play();
    } catch (error) {
      console.error('ElevenLabs TTS error, using browser fallback:', error);
      speakWithBrowserTTS(text);
    }
  }, [speakWithBrowserTTS]);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsSpeaking(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessages: Record<UserRole, string> = {
        student: "Welcome back! 👋 I'm your CMRCET AI Assistant. Ask me about courses, timetable, placements, faculty, exam schedules, or request to connect with a faculty member!",
        faculty: "Welcome! 👋 I'm here to assist you with teaching resources, research info, and administrative queries about CMRCET.",
        visitor: "Welcome to CMRCET! 👋 I'm your AI Assistant. Ask me about admissions, courses, placements, campus facilities, or anything about our college!"
      };
      const welcomeMsg = welcomeMessages[userRole];
      setMessages([{ id: '1', role: 'assistant', content: welcomeMsg }]);
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
  }, [toast]);

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
    stopSpeaking();

    try {
      const conversationHistory = messages.map(msg => ({ role: msg.role, content: msg.content }));
      const { data, error } = await supabase.functions.invoke('college-chatbot', {
        body: { message: userInput, role: userRole, conversationHistory }
      });

      if (error || data?.error) throw new Error(data?.error || error?.message);

      const assistantMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: data.response,
        showLiveChatButton: data.suggestLiveChat && userRole === 'student',
        images: data.images
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Log analytics
      await supabase.from('chatbot_analytics').insert({ user_role: userRole, question: userInput, response: data.response });
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMsg = "I apologize, but I'm having trouble connecting. Please try again or contact +91-40-64635858.";
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMsg
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRequestLiveChat = () => {
    if (!userId) {
      toast({ title: "Login Required", description: "Please login as a student to connect with faculty", variant: "destructive" });
      navigate('/login?type=student');
      return;
    }
    setShowLiveChatModal(true);
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
            <div className="flex items-center gap-1">
              <button onClick={() => { stopSpeaking(); setIsOpen(false); }} className="w-8 h-8 rounded-full hover:bg-primary-foreground/10 flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm'}`}>
                  <div className="text-sm whitespace-pre-wrap prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  {/* Display images if present */}
                  {message.images && message.images.length > 0 && (
                    <div className="mt-3 grid gap-2">
                      {message.images.map((img, idx) => (
                        <img 
                          key={idx}
                          src={img}
                          alt={`CMRCET related image ${idx + 1}`}
                          className="rounded-lg w-full max-h-40 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(img, '_blank')}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                {/* Speaker button for assistant messages */}
                {message.role === 'assistant' && (
                  <button
                    onClick={() => {
                      if (isSpeaking && currentPlayingId === message.id) {
                        stopSpeaking();
                        setCurrentPlayingId(null);
                      } else {
                        setCurrentPlayingId(message.id);
                        speakTextDirect(message.content);
                      }
                    }}
                    className={`mt-1 ml-1 p-1.5 rounded-full hover:bg-muted transition-colors ${
                      isSpeaking && currentPlayingId === message.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                    }`}
                    title={isSpeaking && currentPlayingId === message.id ? "Stop speaking" : "Listen to this response"}
                  >
                    {isSpeaking && currentPlayingId === message.id ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                )}
                {message.showLiveChatButton && (
                  <div className="flex justify-start pl-2 mt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleRequestLiveChat}
                      className="text-xs"
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      Connect with Faculty
                    </Button>
                  </div>
                )}
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

          {userRole === 'student' && (
            <div className="px-4 py-2 border-t border-border bg-muted/50">
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full text-xs"
                onClick={handleRequestLiveChat}
              >
                <UserPlus className="w-3 h-3 mr-1" />
                Request Live Chat with Faculty
              </Button>
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

      {showLiveChatModal && userId && (
        <LiveChatModal 
          isOpen={showLiveChatModal}
          onClose={() => setShowLiveChatModal(false)}
          studentId={userId}
        />
      )}
    </>
  );
};

export default Chatbot;
