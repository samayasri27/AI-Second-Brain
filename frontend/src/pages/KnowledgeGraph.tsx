import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Network, Zap, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface GraphNode {
  id: string;
  label: string;
  type: 'topic' | 'document' | 'task';
  connections: number;
}

const mockNodes: GraphNode[] = [
  { id: '1', label: 'Machine Learning', type: 'topic', connections: 8 },
  { id: '2', label: 'React Patterns', type: 'topic', connections: 5 },
  { id: '3', label: 'System Design', type: 'topic', connections: 6 },
  { id: '4', label: 'Project Management', type: 'topic', connections: 4 },
  { id: '5', label: 'ML Research Paper', type: 'document', connections: 3 },
  { id: '6', label: 'Q4 Project Plan', type: 'document', connections: 4 },
  { id: '7', label: 'Review proposal', type: 'task', connections: 2 },
];

export default function KnowledgeGraph() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'topic' | 'document' | 'task'>('all');

  useEffect(() => {
    setTimeout(() => setNodes(mockNodes), 300);
  }, []);

  const filteredNodes = nodes.filter(node => {
    const matchesSearch = node.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || node.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'topic': return 'from-blue-500 to-cyan-500';
      case 'document': return 'from-purple-500 to-pink-500';
      case 'task': return 'from-orange-500 to-red-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Network className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Knowledge Graph</h1>
        </div>
        <p className="text-muted-foreground">Visualize connections between your ideas, documents, and tasks</p>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 mb-8"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'topic', 'document', 'task'] as const).map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(type)}
              className={selectedType === type ? 'gradient-primary border-0' : ''}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Graph Visualization */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-8 mb-8 min-h-[500px] relative overflow-hidden"
      >
        {/* SVG Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Graph Nodes */}
        <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredNodes.map((node, index) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="relative group"
            >
              {/* Connection Lines (decorative) */}
              {index > 0 && (
                <div className="absolute -left-3 top-1/2 w-6 h-0.5 bg-gradient-to-r from-transparent to-primary/30" />
              )}
              
              {/* Node Card */}
              <div className="glass-card rounded-xl p-4 hover:shadow-card transition-all cursor-pointer border-2 border-transparent hover:border-primary/50">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getNodeColor(node.type)} flex items-center justify-center mb-3`}>
                  {node.type === 'topic' && <Zap className="w-6 h-6 text-white" />}
                  {node.type === 'document' && <Network className="w-6 h-6 text-white" />}
                  {node.type === 'task' && <Filter className="w-6 h-6 text-white" />}
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-2">{node.label}</h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="capitalize">{node.type}</span>
                  <span>{node.connections} links</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredNodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Network className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No nodes found</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Nodes</h3>
          <p className="text-3xl font-bold text-foreground">{nodes.length}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Connections</h3>
          <p className="text-3xl font-bold text-foreground">
            {nodes.reduce((sum, node) => sum + node.connections, 0)}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Most Connected</h3>
          <p className="text-lg font-semibold text-foreground">
            {nodes.sort((a, b) => b.connections - a.connections)[0]?.label || 'N/A'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
