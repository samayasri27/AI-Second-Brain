import { useEffect, useState } from 'react';
import { FileText, CheckSquare, Clock, Tag, Upload, MessageSquare, Plus, Zap, Brain, TrendingUp, Target, HelpCircle, Network, Sparkles, Activity as ActivityIcon } from 'lucide-react';
import { api, DashboardStats, Activity } from '@/lib/api';
import { ActivityItem } from '@/components/ui/activity-item';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FocusMode } from '@/components/FocusMode';
import { WelcomeTour } from '@/components/WelcomeTour';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { NeuralBackground } from '@/components/NeuralBackground';
import { BrainStatus } from '@/components/BrainStatus';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [focusModeOpen, setFocusModeOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const navigate = useNavigate();

  // Show tour on first visit
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('personalmind-tour-seen');
    if (!hasSeenTour) {
      setTourOpen(true);
    }
  }, []);

  const handleTourClose = () => {
    setTourOpen(false);
    localStorage.setItem('personalmind-tour-seen', 'true');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getDashboard();
        setStats(data.stats);
        setActivities(data.activities);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcut({ key: 'f', ctrl: true }, () => setFocusModeOpen(true));
  useKeyboardShortcut({ key: 'k', ctrl: true }, () => navigate('/knowledge'));
  useKeyboardShortcut({ key: 'c', ctrl: true, shift: true }, () => navigate('/chat'));
  useKeyboardShortcut({ key: 't', ctrl: true }, () => navigate('/tasks'));
  useKeyboardShortcut({ key: '?', shift: true }, () => setShortcutsOpen(true));

  const quickActions = [
    { icon: Upload, label: 'Upload Document', action: () => navigate('/knowledge'), color: 'from-blue-500 to-cyan-500', description: 'Add to knowledge base' },
    { icon: MessageSquare, label: 'Ask BrainChat', action: () => navigate('/chat'), color: 'from-purple-500 to-pink-500', description: 'Query your brain' },
    { icon: Plus, label: 'Add Task', action: () => navigate('/tasks'), color: 'from-orange-500 to-red-500', description: 'Create new task' },
    { icon: Zap, label: 'View Insights', action: () => navigate('/insights'), color: 'from-green-500 to-emerald-500', description: 'AI suggestions' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="relative"
        >
          <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="w-10 h-10 text-primary" />
          </div>
        </motion.div>
      </div>
    );
  }

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Neural Network Background */}
      <NeuralBackground />
      
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Brain Status Bar */}
        <BrainStatus stats={stats} />

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.div 
                className="relative"
                animate={{ 
                  boxShadow: [
                    '0 0 0 0 rgba(59, 130, 246, 0.4)',
                    '0 0 0 20px rgba(59, 130, 246, 0)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center relative">
                  <Brain className="w-8 h-8 text-primary-foreground" />
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-white/20"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-1">{greeting}</h1>
                <p className="text-lg text-muted-foreground">Your AI Second Brain is active and learning</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShortcutsOpen(true)}
                variant="outline"
                size="icon"
                title="Keyboard Shortcuts"
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setFocusModeOpen(true)}
                className="gradient-primary border-0 hover-lift"
              >
                <Target className="w-4 h-4 mr-2" />
                Focus Mode
              </Button>
            </div>
          </div>

          {/* Neural Network Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: FileText, label: 'Documents', value: stats?.totalDocs || 0, color: 'from-blue-500 to-cyan-500', trend: '+12%' },
              { icon: CheckSquare, label: 'Active Tasks', value: stats?.totalTasks || 0, color: 'from-purple-500 to-pink-500', trend: '5 due' },
              { icon: Network, label: 'Connections', value: stats?.recentTopics.length * 8 || 0, color: 'from-orange-500 to-red-500', trend: '+23%' },
              { icon: Sparkles, label: 'Insights', value: stats?.upcomingDeadlines || 0, color: 'from-green-500 to-emerald-500', trend: 'New' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="glass-card rounded-2xl p-6 hover:shadow-card transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                  <div className={`w-full h-full bg-gradient-to-br ${stat.color} rounded-full blur-2xl`} />
                </div>
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <span className="text-xs text-primary font-medium">{stat.trend}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ActivityIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground">Neural Activity</h2>
                <p className="text-sm text-muted-foreground">Recent brain activity</p>
              </div>
              <span className="text-xs text-muted-foreground">Last 7 days</span>
            </div>
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  <ActivityItem activity={activity} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Knowledge Network */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Topics Network */}
            <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Network className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Knowledge Network</h3>
                  <p className="text-xs text-muted-foreground">Connected topics</p>
                </div>
              </div>
              <div className="space-y-2">
                {stats?.recentTopics.map((topic, index) => (
                  <motion.div
                    key={topic}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-background/50 hover:bg-background transition-all cursor-pointer group"
                  >
                    <div className="w-2 h-2 rounded-full gradient-primary group-hover:scale-150 transition-transform" />
                    <span className="text-sm font-medium text-foreground flex-1">{topic}</span>
                    <span className="text-xs text-muted-foreground">{Math.floor(Math.random() * 10) + 3} links</span>
                  </motion.div>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate('/graph')}
              >
                View Full Graph
              </Button>
            </div>

            {/* AI Insight */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card rounded-2xl p-6 border-2 border-primary/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">AI Insight</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Your learning pattern shows strong focus on ML topics. Your brain has formed {stats?.recentTopics.length || 0} major knowledge clusters. Consider connecting these to your active projects!
                </p>
                <Button 
                  size="sm" 
                  className="w-full gradient-primary border-0"
                  onClick={() => navigate('/insights')}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  View All Insights
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Quick Actions - Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
              <p className="text-sm text-muted-foreground">Boost your productivity</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.05 }}
                onClick={action.action}
                className="glass-card rounded-xl p-5 hover:shadow-card transition-all group text-left relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                  <div className={`w-full h-full bg-gradient-to-br ${action.color} rounded-full blur-2xl`} />
                </div>
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      <FocusMode isOpen={focusModeOpen} onClose={() => setFocusModeOpen(false)} />
      <WelcomeTour isOpen={tourOpen} onClose={handleTourClose} />
      <KeyboardShortcuts isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}
