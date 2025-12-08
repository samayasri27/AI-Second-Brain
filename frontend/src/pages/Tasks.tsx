import { useState, useEffect } from 'react';
import { api, Task } from '@/lib/api';
import { TaskTable } from '@/components/tasks/TaskTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, AlertTriangle, CheckCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

const tabs = [
  { key: 'today', label: 'Today', icon: Calendar },
  { key: 'upcoming', label: 'Upcoming', icon: Clock },
  { key: 'overdue', label: 'Overdue', icon: AlertTriangle },
  { key: 'done', label: 'Done', icon: CheckCircle },
] as const;

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Task['category']>('today');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await api.getTasks();
        setTasks(data);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleToggle = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const newCategory = newStatus === 'completed' ? 'done' : 'today';

    try {
      await api.updateTask(id, { status: newStatus, category: newCategory });
      setTasks(prev => prev.map(t => 
        t.id === id 
          ? { ...t, status: newStatus, category: newCategory }
          : t
      ));
      toast({
        title: newStatus === 'completed' ? 'Task completed!' : 'Task reopened',
        description: task.title,
      });
    } catch (error) {
      toast({
        title: 'Failed to update task',
        variant: 'destructive',
      });
    }
  };

  const filteredTasks = tasks.filter(task => task.category === activeTab);

  const taskCounts = {
    today: tasks.filter(t => t.category === 'today').length,
    upcoming: tasks.filter(t => t.category === 'upcoming').length,
    overdue: tasks.filter(t => t.category === 'overdue').length,
    done: tasks.filter(t => t.category === 'done').length,
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage your tasks using GTD methodology</p>
        </div>
        <Button className="gradient-primary border-0">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-4 mb-8"
      >
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const count = taskCounts[tab.key];
          const isActive = activeTab === tab.key;
          
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`glass-card rounded-xl p-4 text-left transition-all ${
                isActive ? 'ring-2 ring-primary' : 'hover:shadow-card'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${
                  tab.key === 'overdue' ? 'text-destructive' : 
                  tab.key === 'done' ? 'text-success' : 'text-primary'
                }`} />
                <span className="text-xs font-medium text-muted-foreground">{tab.label}</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">{count}</p>
            </button>
          );
        })}
      </motion.div>

      {/* Task Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Task['category'])}>
        <TabsList className="mb-6 bg-secondary/50 p-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.key} value={tab.key}>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <TaskTable tasks={filteredTasks} onToggle={handleToggle} />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
