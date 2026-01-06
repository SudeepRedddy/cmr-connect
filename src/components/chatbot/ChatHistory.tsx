import { useState, useEffect } from 'react';
import { History, Trash2, MessageSquare, ChevronLeft, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatHistoryProps {
  userId?: string;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  currentConversationId?: string;
}

const ChatHistory = ({ userId, onSelectConversation, onNewConversation, currentConversationId }: ChatHistoryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchConversations();
    }
  }, [isOpen, userId]);

  const fetchConversations = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    try {
      await supabase.from('chat_conversations').delete().eq('id', conversationId);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  if (!userId) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full hover:bg-primary-foreground/10 flex items-center justify-center"
        title="Chat History"
      >
        <History className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute top-10 right-0 w-72 max-h-80 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
          <div className="flex items-center justify-between p-3 border-b border-border bg-muted/50">
            <div className="flex items-center gap-2">
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium">Chat History</span>
            </div>
            <button
              onClick={() => {
                onNewConversation();
                setIsOpen(false);
              }}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
            >
              <Plus className="w-3 h-3" />
              New
            </button>
          </div>

          <div className="overflow-y-auto max-h-60">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">No conversations yet</div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between p-3 hover:bg-muted cursor-pointer border-b border-border/50 ${
                    currentConversationId === conv.id ? 'bg-primary/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm truncate">{conv.title || 'Untitled conversation'}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, conv.id)}
                    className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
