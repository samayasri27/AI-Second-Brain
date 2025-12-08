import { useState, useEffect } from 'react';
import { api, UserProfile } from '@/lib/api';
import { User, Target, FileText, CheckSquare, MessageSquare, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="h-48 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!profile) return null;

  const progressStats = [
    { label: 'Documents Processed', value: profile.progress.docsProcessed, max: 100, icon: FileText },
    { label: 'Tasks Completed', value: profile.progress.tasksCompleted, max: 50, icon: CheckSquare },
    { label: 'Chat Sessions', value: profile.progress.chatSessions, max: 200, icon: MessageSquare },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-8 mb-8"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center">
            <User className="w-12 h-12 text-primary-foreground" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-foreground">{profile.name}</h1>
            <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {profile.template}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Focus Areas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-accent" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Focus Areas</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.focusAreas.map((area, index) => (
            <motion.span
              key={area}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium"
            >
              {area}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* Progress Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Progress Summary</h2>
        </div>
        
        <div className="space-y-6">
          {progressStats.map((stat, index) => {
            const Icon = stat.icon;
            const percentage = Math.round((stat.value / stat.max) * 100);
            
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{stat.label}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{stat.value} / {stat.max}</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
