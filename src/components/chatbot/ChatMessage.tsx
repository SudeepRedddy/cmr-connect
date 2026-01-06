import { useState } from 'react';
import { Copy, Check, ThumbsUp, ThumbsDown, Volume2, VolumeX } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import SuggestedQuestions from './SuggestedQuestions';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessageProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: string[];
  suggestions?: string[];
  timestamp: Date;
  onSuggestionClick?: (question: string) => void;
  onSpeak?: (text: string) => void;
  onStopSpeaking?: () => void;
  isSpeaking?: boolean;
  isCurrentlySpeaking?: boolean;
  disabled?: boolean;
}

const ChatMessage = ({
  id,
  role,
  content,
  images,
  suggestions,
  timestamp,
  onSuggestionClick,
  onSpeak,
  onStopSpeaking,
  isSpeaking,
  isCurrentlySpeaking,
  disabled,
}: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({ title: 'Copied!', description: 'Message copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  const handleFeedback = async (rating: 'positive' | 'negative') => {
    if (feedback) return; // Already submitted
    
    setFeedback(rating);
    
    try {
      await supabase.from('chatbot_feedback').insert({
        message_id: id,
        rating,
      });
      toast({ 
        title: rating === 'positive' ? 'Thanks for the feedback!' : 'Sorry to hear that',
        description: rating === 'positive' ? 'Glad I could help!' : 'We\'ll work on improving.',
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const relativeTime = formatDistanceToNow(timestamp, { addSuffix: true });

  return (
    <div className={`flex flex-col ${role === 'user' ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          role === 'user'
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted text-foreground rounded-bl-sm'
        }`}
      >
        <div className="text-sm whitespace-pre-wrap prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>

        {/* Display images if present */}
        {images && images.length > 0 && (
          <div className="mt-3 grid gap-2">
            {images.map((img, idx) => (
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

      {/* Timestamp */}
      <span className="text-[10px] text-muted-foreground mt-1 px-1">{relativeTime}</span>

      {/* Action buttons for assistant messages */}
      {role === 'assistant' && (
        <div className="flex items-center gap-1 mt-1 ml-1">
          {/* Voice button */}
          <button
            onClick={() => {
              if (isCurrentlySpeaking) {
                onStopSpeaking?.();
              } else {
                onSpeak?.(content);
              }
            }}
            disabled={isSpeaking && !isCurrentlySpeaking}
            className={`p-1.5 rounded-full hover:bg-muted transition-colors disabled:opacity-50 ${
              isCurrentlySpeaking ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
            }`}
            title={isCurrentlySpeaking ? 'Stop speaking' : 'Listen to this response'}
          >
            {isCurrentlySpeaking ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground"
            title="Copy message"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Feedback buttons */}
          <button
            onClick={() => handleFeedback('positive')}
            disabled={!!feedback}
            className={`p-1.5 rounded-full hover:bg-muted transition-colors ${
              feedback === 'positive' ? 'text-green-500' : 'text-muted-foreground'
            } disabled:cursor-default`}
            title="Helpful"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleFeedback('negative')}
            disabled={!!feedback}
            className={`p-1.5 rounded-full hover:bg-muted transition-colors ${
              feedback === 'negative' ? 'text-red-500' : 'text-muted-foreground'
            } disabled:cursor-default`}
            title="Not helpful"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Suggested follow-up questions */}
      {role === 'assistant' && suggestions && suggestions.length > 0 && (
        <SuggestedQuestions
          suggestions={suggestions}
          onSelect={onSuggestionClick || (() => {})}
          disabled={disabled}
        />
      )}
    </div>
  );
};

export default ChatMessage;
