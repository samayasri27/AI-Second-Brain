import { Upload, CheckSquare, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Activity } from '@/lib/api';

const iconMap = {
  upload: Upload,
  task: CheckSquare,
  chat: MessageSquare,
};

const colorMap = {
  upload: 'bg-primary/10 text-primary',
  task: 'bg-success/10 text-success',
  chat: 'bg-accent/10 text-accent',
};

interface ActivityItemProps {
  activity: Activity;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const Icon = iconMap[activity.type];
  
  return (
    <div className="flex items-start gap-3 py-3">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', colorMap[activity.type])}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
        {activity.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
        )}
      </div>
      <span className="text-xs text-muted-foreground flex-shrink-0">{activity.timestamp}</span>
    </div>
  );
}
