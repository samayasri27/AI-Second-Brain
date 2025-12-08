import { motion } from 'framer-motion';
import { Brain, Zap, Database, Network } from 'lucide-react';

interface BrainStatusProps {
  stats: {
    totalDocs?: number;
    totalTasks?: number;
    recentTopics?: string[];
  } | null;
}

export function BrainStatus({ stats }: BrainStatusProps) {
  const metrics = [
    { 
      icon: Database, 
      label: 'Memory', 
      value: `${stats?.totalDocs || 0} docs`,
      status: 'active',
      color: 'text-blue-500'
    },
    { 
      icon: Zap, 
      label: 'Processing', 
      value: `${stats?.totalTasks || 0} tasks`,
      status: 'active',
      color: 'text-purple-500'
    },
    { 
      icon: Network, 
      label: 'Connections', 
      value: `${(stats?.recentTopics?.length || 0) * 8} links`,
      status: 'active',
      color: 'text-cyan-500'
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-4 mb-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center"
          >
            <Brain className="w-5 h-5 text-primary-foreground" />
          </motion.div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Brain Status</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">All systems operational</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50"
            >
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className="text-sm font-semibold text-foreground">{metric.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
