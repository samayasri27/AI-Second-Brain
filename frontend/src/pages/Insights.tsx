import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, Calendar, Target, Sparkles, Brain } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Insight {
  id: string;
  type: 'reflection' | 'suggestion' | 'pattern' | 'achievement';
  title: string;
  content: string;
  date: string;
  icon: any;
}

const mockInsights: Insight[] = [
  {
    id: '1',
    type: 'reflection',
    title: 'Weekly Reflection',
    content: 'This week you focused heavily on Machine Learning topics. You completed 3 related tasks and uploaded 2 research papers. Consider connecting these learnings to your ongoing project.',
    date: '2024-12-06',
    icon: Brain,
  },
  {
    id: '2',
    type: 'suggestion',
    title: 'Suggested Action',
    content: 'You have several documents about React patterns but no active project using them. Consider starting a practical implementation to solidify your knowledge.',
    date: '2024-12-05',
    icon: Lightbulb,
  },
  {
    id: '3',
    type: 'pattern',
    title: 'Learning Pattern Detected',
    content: 'You tend to be most productive on Tuesday and Wednesday mornings. Try scheduling your most challenging tasks during these times.',
    date: '2024-12-04',
    icon: TrendingUp,
  },
  {
    id: '4',
    type: 'achievement',
    title: 'Milestone Reached',
    content: 'Congratulations! You\'ve completed 25 tasks this month and maintained a 90% on-time completion rate. Keep up the excellent work!',
    date: '2024-12-03',
    icon: Target,
  },
];

export default function Insights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { api } = await import('@/lib/api');
        const data = await api.getInsights();
        
        // Map backend data to frontend format with icons
        const iconMap = {
          reflection: Brain,
          suggestion: Lightbulb,
          pattern: TrendingUp,
          achievement: Target
        };
        
        const mappedInsights = data.map((insight: any) => ({
          ...insight,
          icon: iconMap[insight.type as keyof typeof iconMap] || Sparkles
        }));
        
        setInsights(mappedInsights.length > 0 ? mappedInsights : mockInsights);
      } catch (error) {
        console.error('Failed to fetch insights:', error);
        // Fallback to mock data if API fails
        setInsights(mockInsights);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInsights();
  }, []);

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'reflection': return 'from-blue-500 to-cyan-500';
      case 'suggestion': return 'from-purple-500 to-pink-500';
      case 'pattern': return 'from-orange-500 to-yellow-500';
      case 'achievement': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">AI Insights</h1>
        </div>
        <p className="text-muted-foreground">Personalized reflections and suggestions powered by AI</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-xl font-bold text-foreground">12 Activities</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Productivity</p>
              <p className="text-xl font-bold text-foreground">+15%</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Goals Met</p>
              <p className="text-xl font-bold text-foreground">8/10</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Insights List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className="glass-card p-6 hover:shadow-card transition-all cursor-pointer border-l-4 border-l-primary">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getInsightColor(insight.type)} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{insight.title}</h3>
                          <span className="text-xs text-muted-foreground capitalize">{insight.type}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{insight.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{insight.content}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Generate New Insight Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-center"
      >
        <button className="px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-medium hover:shadow-lg transition-all">
          <Sparkles className="w-4 h-4 inline mr-2" />
          Generate New Insights
        </button>
      </motion.div>
    </div>
  );
}
