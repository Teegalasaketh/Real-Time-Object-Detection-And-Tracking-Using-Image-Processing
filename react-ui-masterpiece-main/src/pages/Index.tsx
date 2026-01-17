import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Scan, Cpu, Layers, Video, Boxes, Target, Sparkles } from 'lucide-react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { FeatureCard } from '@/components/FeatureCard';
import { VideoUploadZone } from '@/components/VideoUploadZone';
import { ProcessingStatus } from '@/components/ProcessingStatus';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Button } from '@/components/ui/button';

type ProcessingState = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

const API_URL = 'http://localhost:8000';

const features = [
  {
    icon: Scan,
    title: 'Real-Time Detection',
    description: 'YOLOv8 provides lightning-fast object detection with impressive accuracy across 80+ object categories.',
  },
  {
    icon: Target,
    title: 'Object Tracking',
    description: 'ByteTrack algorithm maintains consistent object IDs across frames for reliable multi-object tracking.',
  },
  {
    icon: Cpu,
    title: 'CPU Optimized',
    description: 'Efficient processing on CPU hardware without requiring expensive GPU acceleration.',
  },
  {
    icon: Layers,
    title: 'Multiple Formats',
    description: 'Support for various video formats including MP4, AVI, and MOV with automatic transcoding.',
  },
  {
    icon: Boxes,
    title: 'Bounding Boxes',
    description: 'Clear visual annotations with confidence scores and class labels for each detected object.',
  },
  {
    icon: Video,
    title: 'Video Export',
    description: 'Download your processed videos with all detection overlays in browser-compatible MP4 format.',
  },
];

const Index = () => {
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [progress, setProgress] = useState(0);
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleFileSelect = useCallback(async (file: File) => {
    setProcessingState('uploading');
    setProgress(0);
    setResultVideoUrl(null);
    setErrorMessage('');

    try {
      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 30) {
            clearInterval(uploadInterval);
            return 30;
          }
          return prev + 5;
        });
      }, 200);

      const formData = new FormData();
      formData.append('file', file);

      setProgress(30);
      setProcessingState('processing');

      // Simulate processing progress
      const processInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(processInterval);
            return 90;
          }
          return prev + 2;
        });
      }, 500);

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(processInterval);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Processing failed');
      }

      const data = await response.json();
      setProgress(100);
      setResultVideoUrl(data.video_url);
      setProcessingState('complete');
    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
      setProcessingState('error');
    }
  }, []);

  const handleReset = () => {
    setProcessingState('idle');
    setProgress(0);
    setResultVideoUrl(null);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <HeroSection />

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful <span className="gradient-text">Features</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              State-of-the-art computer vision capabilities at your fingertips
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FeatureCard key={feature.title} {...feature} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload" className="py-24 relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(186_100%_50%_/_0.03)] to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary">Try it yourself</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Upload Your <span className="gradient-text">Video</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Drop your video file below and watch as our AI detects and tracks objects in real-time
            </p>
          </motion.div>

          <div className="max-w-2xl mx-auto space-y-6">
            {/* Upload Zone - only show when not complete */}
            {processingState !== 'complete' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <VideoUploadZone
                  onFileSelect={handleFileSelect}
                  isProcessing={processingState === 'uploading' || processingState === 'processing'}
                />
              </motion.div>
            )}

            {/* Processing Status */}
            {processingState !== 'idle' && processingState !== 'complete' && (
              <ProcessingStatus
                state={processingState}
                progress={progress}
                errorMessage={errorMessage}
              />
            )}

            {/* Error retry button */}
            {processingState === 'error' && (
              <div className="text-center">
                <Button variant="outline" onClick={handleReset}>
                  Try Again
                </Button>
              </div>
            )}

            {/* Video Player Result */}
            {processingState === 'complete' && resultVideoUrl && (
              <VideoPlayer
                videoUrl={resultVideoUrl}
                title="Detection Results"
                onReset={handleReset}
              />
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(186_100%_50%)] to-[hsl(230_80%_60%)] flex items-center justify-center">
                <Scan className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">VisionTrack</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with YOLOv8 • FastAPI • React
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Documentation
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                API
              </a>
              <a href="https://github.com/ultralytics/ultralytics" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
