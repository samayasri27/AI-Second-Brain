import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="relative"
      >
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Brain className="w-8 h-8 text-primary" />
        </div>
      </motion.div>
    </div>
  );
}
