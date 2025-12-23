import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Send, Loader2, User, Clock, CheckCircle, XCircle } from 'lucide-react';

interface LiveChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
}

interface ChatMessage {
  id: string;
  message: string;
  sender_id: string;
  sender_role: string;
  created_at: string;
}

interface ChatSession {
  id: string;
  status: string;
  topic: string | null;
  department: string | null;
  faculty_id: string | null;
  created_at: string;
}

const departments = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'];

const LiveChatModal = ({ isOpen, onClose, studentId }: LiveChatModalProps) => {
  const [step, setStep] = useState<'select' | 'waiting' | 'chatting'>('select');
  const [department, setDepartment] = useState('');
  const [topic, setTopic] = useState('');
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Subscribe to session updates
  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel(`session-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'live_chat_sessions',
          filter: `id=eq.${session.id}`
        },
        (payload) => {
          const updatedSession = payload.new as ChatSession;
          setSession(updatedSession);
          if (updatedSession.status === 'active') {
            setStep('chatting');
            toast({ title: "Faculty Connected!", description: "A faculty member has joined the chat" });
          } else if (updatedSession.status === 'closed') {
            toast({ title: "Chat Ended", description: "The chat session has been closed" });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, toast]);

  // Subscribe to messages
  useEffect(() => {
    if (!session || step !== 'chatting') return;

    const channel = supabase
      .channel(`messages-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_chat_messages',
          filter: `session_id=eq.${session.id}`
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMsg]);
        }
      )
      .subscribe();

    // Fetch existing messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('live_chat_messages')
        .select('*')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true });
      
      if (data) setMessages(data);
    };
    fetchMessages();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, step]);

  const handleStartChat = async () => {
    if (!department || !topic.trim()) {
      toast({ title: "Missing Info", description: "Please select department and enter a topic", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('live_chat_sessions')
        .insert({
          student_id: studentId,
          department,
          topic: topic.trim(),
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      
      setSession(data);
      setStep('waiting');
      toast({ title: "Request Sent", description: "Waiting for a faculty member to accept..." });
    } catch (error) {
      console.error('Error creating session:', error);
      toast({ title: "Error", description: "Failed to start chat request", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const { error } = await supabase
        .from('live_chat_messages')
        .insert({
          session_id: session.id,
          sender_id: studentId,
          sender_role: 'student',
          message: messageText
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
      setNewMessage(messageText);
    }
  };

  const handleClose = async () => {
    if (session && session.status !== 'closed') {
      await supabase
        .from('live_chat_sessions')
        .update({ status: 'closed', closed_at: new Date().toISOString() })
        .eq('id', session.id);
    }
    setStep('select');
    setSession(null);
    setMessages([]);
    setDepartment('');
    setTopic('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {step === 'select' && 'Connect with Faculty'}
            {step === 'waiting' && 'Waiting for Faculty'}
            {step === 'chatting' && 'Live Chat'}
          </DialogTitle>
        </DialogHeader>

        {step === 'select' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Department</label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Topic / Query</label>
              <Input 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What do you need help with?"
              />
            </div>
            <Button onClick={handleStartChat} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Request Live Chat
            </Button>
          </div>
        )}

        {step === 'waiting' && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <p className="text-center text-muted-foreground">
              Waiting for a {department} faculty member to accept your chat request...
            </p>
            <p className="text-sm text-muted-foreground">Topic: {topic}</p>
            <Button variant="outline" onClick={handleClose}>
              Cancel Request
            </Button>
          </div>
        )}

        {step === 'chatting' && (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg mb-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Faculty - {department}</p>
                <p className="text-xs text-muted-foreground">{topic}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="w-3 h-3" />
                Connected
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px] max-h-[300px] p-2 border rounded-lg">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender_role === 'student' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    msg.sender_role === 'student' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2 mt-4">
              <Input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
              />
              <Button size="icon" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <Button variant="outline" onClick={handleClose} className="mt-2">
              <XCircle className="w-4 h-4 mr-2" />
              End Chat
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LiveChatModal;
