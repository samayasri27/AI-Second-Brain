import { Task } from '@/lib/api';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskTableProps {
  tasks: Task[];
  onToggle: (id: string) => void;
}

export function TaskTable({ tasks, onToggle }: TaskTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
          <Calendar className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No tasks in this category</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'glass-card rounded-xl p-4 flex items-center gap-4 group transition-all',
              task.status === 'completed' && 'opacity-60'
            )}
          >
            <Checkbox
              checked={task.status === 'completed'}
              onCheckedChange={() => onToggle(task.id)}
              className="data-[state=checked]:bg-success data-[state=checked]:border-success"
            />
            
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm font-medium text-foreground',
                task.status === 'completed' && 'line-through text-muted-foreground'
              )}>
                {task.title}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className={cn(
                  'text-xs',
                  task.status === 'overdue' ? 'text-destructive font-medium' : 'text-muted-foreground'
                )}>
                  Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                {task.linkedDoc && (
                  <span className="flex items-center gap-1 text-xs text-primary">
                    <FileText className="w-3 h-3" />
                    {task.linkedDoc}
                  </span>
                )}
              </div>
            </div>
            
            <div className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              task.status === 'pending' && 'bg-warning/10 text-warning',
              task.status === 'overdue' && 'bg-destructive/10 text-destructive',
              task.status === 'completed' && 'bg-success/10 text-success'
            )}>
              {task.status}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
