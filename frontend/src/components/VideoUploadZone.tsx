// frontend/src/components/VideoUploadZone.tsx
import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Video, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoUploadZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  disabled?: boolean;
}

export function VideoUploadZone({ onFileSelect, isProcessing, disabled }: VideoUploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    setError(null);
    
    if (!file.type.startsWith('video/')) {
      setError('Please upload a video file');
      return false;
    }
    
    // 500MB limit
    if (file.size > 500 * 1024 * 1024) {
      setError('File size must be less than 500MB');
      return false;
    }
    
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const clearSelection = () => {
    setSelectedFile(null);
    setError(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="relative">
      <motion.div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "dropzone relative min-h-[280px] flex flex-col items-center justify-center p-8 cursor-pointer",
          isDragActive && "active",
          disabled && "pointer-events-none opacity-50"
        )}
        animate={{
          scale: isDragActive ? 1.02 : 1,
          borderColor: isDragActive ? 'hsl(186 100% 50%)' : 'hsl(222 30% 18%)',
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Background grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-30 rounded-xl pointer-events-none" />
        
        {/* Scan line effect when dragging */}
        <AnimatePresence>
          {isDragActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none"
            >
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent scan-line" />
            </motion.div>
          )}
        </AnimatePresence>

       <input
  type="file"
  accept="video/*"
  onChange={handleFileInput}
  className="absolute inset-0 z-50 opacity-0 cursor-pointer"
  disabled={isProcessing}
/>


      <div className="pointer-events-none">
        <AnimatePresence mode="wait">
          {selectedFile ? (
            <motion.div
              key="selected"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative z-10 flex flex-col items-center gap-4"
            >
              <div className="relative">
                <motion.div
                  className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center"
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 0 }}
                >
                  <Video className="w-10 h-10 text-primary" />
                </motion.div>
                {!isProcessing && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearSelection();
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive flex items-center justify-center hover:bg-destructive/80 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="text-center">
                <p className="font-medium text-foreground truncate max-w-[200px]">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative z-10 flex flex-col items-center gap-4 text-center"
            >
              <motion.div
                className="w-20 h-20 rounded-2xl bg-secondary/50 flex items-center justify-center"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Upload className="w-10 h-10 text-muted-foreground" />
              </motion.div>
              
              <div>
                <p className="text-lg font-medium text-foreground mb-1">
                  {isDragActive ? 'Drop your video here' : 'Drag & drop your video'}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse • MP4, AVI, MOV up to 500MB
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 flex items-center gap-2 text-destructive text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
