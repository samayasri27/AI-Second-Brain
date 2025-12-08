import { Document } from '@/lib/api';
import { FileText, File, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface DocumentCardProps {
  document: Document;
  onClick?: () => void;
  delay?: number;
}

const typeColors = {
  pdf: 'bg-destructive/10 text-destructive',
  markdown: 'bg-primary/10 text-primary',
  unknown: 'bg-muted text-muted-foreground',
};

export function DocumentCard({ document, onClick, delay = 0 }: DocumentCardProps) {
  const colorClass = typeColors[document.type as keyof typeof typeColors] || typeColors.unknown;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      onClick={onClick}
      className="glass-card rounded-xl p-4 hover:shadow-card transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start gap-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colorClass)}>
          {document.type === 'pdf' ? (
            <FileText className="w-5 h-5" />
          ) : (
            <File className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
            {document.name}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {document.uploadedAt} • {document.size}
          </p>
        </div>
        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-all">
          <MoreVertical className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </motion.div>
  );
}
