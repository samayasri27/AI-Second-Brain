import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const tourSteps = [
  {
    title: 'Welcome to PersonalMind! 🧠',
    description: 'Your AI-powered second brain that remembers everything, organizes intelligently, and helps you achieve your goals.',
    image: '🎯',
  },
  {
    title: 'PARA Organization 📁',
    description: 'We use the PARA method to organize your knowledge: Projects (active work), Areas (responsibilities), Resources (references), and Archives (completed).',
    image: '📚',
  },
  {
    title: 'GTD Task Management ✅',
    description: 'Getting Things Done methodology helps you capture, organize, and complete tasks efficiently. Never miss a deadline again!',
    image: '⚡',
  },
  {
    title: 'Knowledge Graph 🕸️',
    description: 'See how your ideas connect! Our Zettelkasten-inspired graph shows relationships between topics, documents, and tasks.',
    image: '🔗',
  },
  {
    title: 'AI Insights 💡',
    description: 'Get personalized reflections, pattern detection, and smart suggestions based on your activity and goals.',
    image: '✨',
  },
  {
    title: 'Ready to Start! 🚀',
    description: 'Upload your first document, create a task, or chat with your AI brain. Let\'s build your second brain together!',
    image: '🎉',
  },
];

export function WelcomeTour({ isOpen, onClose }: WelcomeTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl"
          >
            <div className="glass-card rounded-3xl p-8 shadow-2xl border-2 border-primary/20">
              {/* Close Button */}
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-secondary transition-colors flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="text-center mb-8">
                <motion.div
                  key={currentStep}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-8xl mb-6"
                >
                  {step.image}
                </motion.div>

                <motion.div
                  key={`content-${currentStep}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    {step.title}
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                    {step.description}
                  </p>
                </motion.div>
              </div>

              {/* Progress Dots */}
              <div className="flex justify-center gap-2 mb-8">
                {tourSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'w-8 bg-primary'
                        : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-4">
                <Button
                  onClick={handlePrev}
                  variant="outline"
                  disabled={currentStep === 0}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>

                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  className="text-muted-foreground"
                >
                  Skip Tour
                </Button>

                <Button
                  onClick={handleNext}
                  className="gradient-primary border-0 gap-2"
                >
                  {isLastStep ? (
                    <>
                      Get Started
                      <Check className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
