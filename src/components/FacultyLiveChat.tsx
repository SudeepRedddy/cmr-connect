import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Send, Check, X, User, Clock } from 'lucide-react';

interface ChatSession {
  id: string;
  student_id: string;
  faculty_id: string | null;
  status: string;
  topic: string | null;
  department: string | null;
  created_at: string;
  accepted_at: string | null;
}

interface ChatMessage {
  id: string;
  message: string;
  sender_id: string;
  sender_role: string;
  created_at: string;
}

interface FacultyLiveChatProps {
  facultyUserId: string;
  facultyDepartment: string;
}

const FacultyLiveChat = ({ facultyUserId, facultyDepartment }: FacultyLiveChatProps) => {
  const [pendingSessions, setPendingSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [studentName, setStudentName] = useState('Student');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch pending sessions for this department
  useEffect(() => {
    const fetchPendingSessions = async () => {
      const { data } = await supabase
        .from('live_chat_sessions')
        .select('*')
        .eq('department', facultyDepartment)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });
      
      if (data) setPendingSessions(data);
    };

    fetchPendingSessions();

    // Subscribe to new pending sessions
    const channel = supabase
      .channel('pending-sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_chat_sessions',
          filter: `department=eq.${facultyDepartment}`
        },
        () => {
          fetchPendingSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [facultyDepartment]);

  // Subscribe to messages for active session
  useEffect(() => {
    if (!activeSession) return;

    const channel = supabase
      .channel(`faculty-messages-${activeSession.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_chat_messages',
          filter: `session_id=eq.${activeSession.id}`
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
        .eq('session_id', activeSession.id)
        .order('created_at', { ascending: true });
      
      if (data) setMessages(data);
    };

    // Fetch student name
    const fetchStudentName = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', activeSession.student_id)
        .single();
      
      if (data) setStudentName(data.full_name || 'Student');
    };

    fetchMessages();
    fetchStudentName();

    // Subscribe to session updates
    const sessionChannel = supabase
      .channel(`faculty-session-${activeSession.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'live_chat_sessions',
          filter: `id=eq.${activeSession.id}`
        },
        (payload) => {
          const updated = payload.new as ChatSession;
          if (updated.status === 'closed') {
            toast({ title: "Chat Ended", description: "The student has ended the chat" });
            setActiveSession(null);
            setMessages([]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(sessionChannel);
    };
  }, [activeSession, toast]);

  const handleAcceptSession = async (session: ChatSession) => {
    try {
      const { error } = await supabase
        .from('live_chat_sessions')
        .update({
          status: 'active',
          faculty_id: facultyUserId,
          accepted_at: new Date().toISOString()
        })
        .eq('id', session.id);

      if (error) throw error;

      setActiveSession({ ...session, status: 'active', faculty_id: facultyUserId, accepted_at: new Date().toISOString() });
      setPendingSessions(prev => prev.filter(s => s.id !== session.id));
      toast({ title: "Chat Started", description: "You are now connected with the student" });
    } catch (error) {
      console.error('Error accepting session:', error);
      toast({ title: "Error", description: "Failed to accept chat", variant: "destructive" });
    }
  };

  const handleDeclineSession = async (session: ChatSession) => {
    try {
      await supabase
        .from('live_chat_sessions')
        .update({ status: 'declined' })
        .eq('id', session.id);

      setPendingSessions(prev => prev.filter(s => s.id !== session.id));
    } catch (error) {
      console.error('Error declining session:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeSession) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const { error } = await supabase
        .from('live_chat_messages')
        .insert({
          session_id: activeSession.id,
          sender_id: facultyUserId,
          sender_role: 'faculty',
          message: messageText
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
      setNewMessage(messageText);
    }
  };

  const handleEndChat = async () => {
    if (!activeSession) return;

    await supabase
      .from('live_chat_sessions')
      .update({ status: 'closed', closed_at: new Date().toISOString() })
      .eq('id', activeSession.id);

    setActiveSession(null);
    setMessages([]);
    toast({ title: "Chat Ended", description: "The chat session has been closed" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Live Student Chat
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!activeSession ? (
          <div className="space-y-4">
            {pendingSessions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No pending chat requests
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {pendingSessions.length} pending request(s)
                </p>
                {pendingSessions.map((session) => (
                  <div 
                    key={session.id} 
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{session.topic || 'General Query'}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(session.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeclineSession(session)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleAcceptSession(session)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{studentName}</p>
                  <p className="text-xs text-muted-foreground">{activeSession.topic}</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>

            <div className="h-[300px] overflow-y-auto space-y-2 p-2 border rounded-lg">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender_role === 'faculty' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    msg.sender_role === 'faculty' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
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

            <Button variant="outline" onClick={handleEndChat} className="w-full">
              End Chat
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FacultyLiveChat;
