import { Document } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Calendar, HardDrive, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentPreviewModalProps {
  document: Document | null;
  open: boolean;
  onClose: () => void;
}

const categoryLabels = {
  projects: 'Projects',
  areas: 'Areas',
  resources: 'Resources',
  archives: 'Archives',
};

const categoryColors = {
  projects: 'bg-primary/10 text-primary',
  areas: 'bg-success/10 text-success',
  resources: 'bg-warning/10 text-warning',
  archives: 'bg-muted text-muted-foreground',
};

export function DocumentPreviewModal({ document, open, onClose }: DocumentPreviewModalProps) {
  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <span className="truncate">{document.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Uploaded:</span>
              <span className="text-foreground">{document.uploadedAt}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <HardDrive className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Size:</span>
              <span className="text-foreground">{document.size}</span>
            </div>
          </div>
          
          {/* Category */}
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Category:</span>
            <span className={cn('text-xs font-medium px-2 py-1 rounded-full', categoryColors[document.category])}>
              {categoryLabels[document.category]}
            </span>
          </div>
          
          {/* Preview placeholder */}
          <div className="mt-6 p-8 rounded-xl bg-muted/50 border border-border flex flex-col items-center justify-center">
            <FileText className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Document preview</p>
            <p className="text-xs text-muted-foreground mt-1">Full preview coming soon</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
