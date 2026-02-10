'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Zap, Shield } from 'lucide-react';

export default function LoadingAnimation() {
  return null;

  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="text-center max-w-md mx-auto px-4">
        {/* Logo with animation */}
        <div className="mb-8 relative">
          <div className="w-20 h-20 mx-auto relative">
            <div className="absolute inset-0 bg-blue-600 rounded-full animate-pulse-glow"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white animate-pulse" />
            </div>
            <div className="absolute -inset-2 border-2 border-blue-400/30 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Loading text */}
        <h2 className="text-2xl font-semibold text-white mb-4 animate-fade-in-up">
          Inventra Factura
        </h2>
        
        <p className="text-gray-400 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Preparando todo para ti...
        </p>

        {/* Progress bar */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
              style={{ width: `${Math.min(progress, 100)}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{Math.round(Math.min(progress, 100))}%</p>
        </div>

        {/* Loading features */}
        <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            <span>Inicializando sistema de facturación</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            <span>Cargando plantillas profesionales</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
            <span>Preparando dashboard</span>
          </div>
        </div>

        {/* Floating icons */}
        <div className="absolute top-10 left-10 text-blue-400 opacity-50 animate-bounce" style={{ animationDelay: '0s' }}>
          <Zap size={24} />
        </div>
        <div className="absolute top-20 right-10 text-purple-400 opacity-50 animate-bounce" style={{ animationDelay: '0.5s' }}>
          <Shield size={24} />
        </div>
        <div className="absolute bottom-10 left-20 text-green-400 opacity-50 animate-bounce" style={{ animationDelay: '1s' }}>
          <Sparkles size={20} />
        </div>
      </div>
    </div>
  );
}
