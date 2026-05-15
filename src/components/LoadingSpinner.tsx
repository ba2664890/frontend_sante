import React from 'react';
import { clsx } from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fullPage?: boolean;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  fullPage = false,
  message = "Préparation de votre espace santé..."
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-6 animate-fade-in">
      <div className={clsx('relative flex items-center justify-center', sizeClasses[size], className)}>
        {/* Anneau extérieur pulsant */}
        <div className="absolute inset-[-12px] border-2 border-compassion-rose/20 rounded-full animate-ping opacity-20"></div>
        
        {/* Spinner principal stylisé */}
        <div className="absolute inset-0 border-4 border-transparent border-t-compassion-rose border-r-compassion-rose/40 rounded-full animate-spin"></div>
        
        {/* Cercle central avec icône */}
        <div className="w-full h-full bg-white rounded-full shadow-lg flex items-center justify-center relative z-10 border border-sahara-rose">
          <span className={clsx(
            "material-symbols-outlined text-compassion-rose animate-pulse",
            size === 'xl' ? 'text-4xl' : size === 'lg' ? 'text-3xl' : 'text-xl'
          )}>
            favorite
          </span>
        </div>
      </div>
      
      {message && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-compassion-rose font-headline text-lg font-bold tracking-tight animate-pulse">
            {message}
          </p>
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 bg-compassion-rose/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-compassion-rose/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-compassion-rose/40 rounded-full animate-bounce"></div>
          </div>
        </div>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-br from-sahara-rose/20 via-transparent to-atlantic-sage/10 pointer-events-none"></div>
        <div className="bg-white/90 p-12 rounded-[40px] shadow-2xl border border-white/20 backdrop-blur-xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;