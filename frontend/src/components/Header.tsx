import { motion } from 'framer-motion';
import { Eye, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(186_100%_50%)] to-[hsl(230_80%_60%)] flex items-center justify-center">
            <Eye className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">VisionTrack</h1>
            <p className="text-xs text-muted-foreground">YOLOv8 Detection</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#upload" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Try It
          </a>
        </nav>

        <Button variant="outline" size="sm" asChild>
          <a href="#" target="_blank" rel="noopener noreferrer">
            <Github className="w-4 h-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </Button>
      </div>
    </motion.header>
  );
}
