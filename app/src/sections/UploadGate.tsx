import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet, AlertCircle, Loader2, Upload } from 'lucide-react';
import { translations, type Language } from '@/lib/translations';

interface UploadGateProps {
  onFileParsed: (file: File) => void;
  isLoading: boolean;
  error: string | null;
  language: Language;
}

export function UploadGate({ onFileParsed, isLoading, error, language }: UploadGateProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[language].uploadGate;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        onFileParsed(files[0]);
      }
    },
    [onFileParsed]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileParsed(files[0]);
      }
    },
    [onFileParsed]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: '#0A0A0A' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Radial gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-[480px] px-6">
        <motion.div
          className="text-center mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
            <span className="text-white text-2xl font-bold">P</span>
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#F5F5F5' }}>
            Padel Analytics
          </h1>
          <p className="text-sm" style={{ color: '#71717A' }}>{t.subtitle}</p>
        </motion.div>

        {/* Drop zone */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="relative"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div
            className="rounded-xl p-12 text-center cursor-pointer transition-all duration-200"
            style={{
              border: `2px dashed ${isDragOver ? '#10B981' : error ? '#EF4444' : '#2A2A2A'}`,
              background: isDragOver ? 'rgba(16, 185, 129, 0.05)' : error ? 'rgba(239, 68, 68, 0.05)' : '#141414',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />

            {isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#10B981' }} />
                <div>
                  <p className="text-base font-medium" style={{ color: '#F5F5F5' }}>{t.processing}</p>
                  <p className="text-xs mt-1" style={{ color: '#71717A' }}>{t.processingSteps}</p>
                </div>
              </div>
            ) : (
              <>
                {error ? (
                  <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#EF4444' }} />
                ) : (
                  <FileSpreadsheet className="w-12 h-12 mx-auto mb-4" style={{ color: '#10B981' }} />
                )}
                <h2 className="text-xl font-semibold mb-2" style={{ color: error ? '#EF4444' : '#F5F5F5' }}>
                  {error ? t.errorTitle : t.importTitle}
                </h2>
                <p className="text-sm mb-1" style={{ color: '#A1A1AA' }}>
                  {error || t.dropPrompt}
                </p>
                <p className="text-xs mb-6" style={{ color: '#71717A' }}>
                  {t.instructions}
                </p>
                {!error && (
                  <button
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-colors"
                    style={{ background: '#10B981', color: '#0A0A0A' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick();
                    }}
                  >
                    <Upload className="w-4 h-4" />
                    {t.browseFile}
                  </button>
                )}
                {error && (
                  <button
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-colors mt-4"
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid #EF4444' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick();
                    }}
                  >
                    {t.tryAgain}
                  </button>
                )}
              </>
            )}
          </div>
        </motion.div>

        <motion.p
          className="text-center text-xs mt-6"
          style={{ color: '#71717A' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {t.footerNote}
        </motion.p>
      </div>
    </motion.div>
  );
}
