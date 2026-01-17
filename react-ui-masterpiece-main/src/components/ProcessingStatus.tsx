import { motion } from 'framer-motion';
import { Scan, CheckCircle2, Loader2 } from 'lucide-react';

type ProcessingState = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

interface ProcessingStatusProps {
  state: ProcessingState;
  progress?: number;
  errorMessage?: string;
}

export function ProcessingStatus({ state, progress = 0, errorMessage }: ProcessingStatusProps) {
  if (state === 'idle') return null;

  const statusConfig = {
    uploading: {
      icon: Loader2,
      title: 'Uploading Video',
      description: 'Preparing your video for analysis...',
      color: 'text-primary',
    },
    processing: {
      icon: Scan,
      title: 'Running YOLO Detection',
      description: 'Detecting and tracking objects in your video...',
      color: 'text-primary',
    },
    complete: {
      icon: CheckCircle2,
      title: 'Processing Complete',
      description: 'Your video is ready to view!',
      color: 'text-green-400',
    },
    error: {
      icon: Loader2,
      title: 'Processing Failed',
      description: errorMessage || 'Something went wrong. Please try again.',
      color: 'text-destructive',
    },
  };

  const config = statusConfig[state as keyof typeof statusConfig];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="flex items-center gap-4">
        {/* Animated icon */}
        <div className="relative">
          <motion.div
            className={`w-14 h-14 rounded-xl bg-secondary flex items-center justify-center ${config.color}`}
            animate={state === 'processing' ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: state === 'processing' ? Infinity : 0, ease: 'linear' }}
          >
            <Icon className={`w-7 h-7 ${state === 'uploading' ? 'animate-spin' : ''}`} />
          </motion.div>
          
          {/* Pulse rings for processing */}
          {state === 'processing' && (
            <>
              <motion.div
                className="absolute inset-0 rounded-xl border-2 border-primary"
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 1.5 }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-xl border-2 border-primary"
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 1.5 }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              />
            </>
          )}
        </div>

        {/* Status text */}
        <div className="flex-1">
          <h3 className={`font-semibold text-lg ${config.color}`}>{config.title}</h3>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
      </div>

      {/* Progress bar for uploading/processing */}
      {(state === 'uploading' || state === 'processing') && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full progress-bar rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Detection stats preview during processing */}
      {state === 'processing' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-border"
        >
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Frames Analyzed', value: '...' },
              { label: 'Objects Detected', value: '...' },
              { label: 'Tracks Created', value: '...' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-lg font-mono font-semibold text-primary">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
