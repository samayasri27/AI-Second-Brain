import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FocusModeProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FocusMode({ isOpen, onClose }: FocusModeProps) {
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    } else if (time === 0) {
      setIsRunning(false);
      // Switch mode when timer ends
      if (mode === 'focus') {
        setMode('break');
        setTime(5 * 60); // 5 minute break
      } else {
        setMode('focus');
        setTime(25 * 60); // 25 minute focus
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, time, mode]);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  const handleReset = () => {
    setIsRunning(false);
    setTime(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="glass-card rounded-2xl p-8 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-foreground">
                  {mode === 'focus' ? '🎯 Focus Time' : '☕ Break Time'}
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg hover:bg-secondary transition-colors flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Timer */}
              <div className="text-center mb-8">
                <motion.div
                  key={`${minutes}-${seconds}`}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-7xl font-bold text-foreground mb-4 font-mono"
                >
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </motion.div>
                <p className="text-muted-foreground">
                  {mode === 'focus' 
                    ? 'Stay focused on your current task' 
                    : 'Take a break and recharge'}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full gradient-primary"
                    initial={{ width: '100%' }}
                    animate={{ 
                      width: `${(time / (mode === 'focus' ? 25 * 60 : 5 * 60)) * 100}%` 
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setIsRunning(!isRunning)}
                  className="flex-1 gradient-primary border-0"
                  size="lg"
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Start
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="lg"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
