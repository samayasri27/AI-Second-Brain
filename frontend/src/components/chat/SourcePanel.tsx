import { Document } from '@/lib/api';
import { FileText, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SourcePanelProps {
  sources: Document[];
}

export function SourcePanel({ sources }: SourcePanelProps) {
  return (
    <div className="h-full flex flex-col border-l border-border bg-card/30">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Sources</h3>
        <p className="text-xs text-muted-foreground mt-1">Documents used for this answer</p>
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-3">
        <AnimatePresence>
          {sources.length > 0 ? (
            sources.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-lg p-3 hover:bg-accent/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{doc.category} • {doc.size}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No sources yet</p>
              <p className="text-xs text-muted-foreground mt-1">Ask a question to see related documents</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
