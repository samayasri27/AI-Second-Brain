import { cn } from '@/lib/utils';
import { ChatMessage } from '@/lib/api';
import { User, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-3', isUser && 'flex-row-reverse')}
    >
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
        isUser ? 'bg-secondary' : 'gradient-primary'
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-secondary-foreground" />
        ) : (
          <Brain className="w-4 h-4 text-primary-foreground" />
        )}
      </div>
      <div className={cn(
        'max-w-[75%] rounded-2xl px-4 py-3',
        isUser ? 'bg-primary text-primary-foreground' : 'glass-card'
      )}>
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
    </motion.div>
  );
}
