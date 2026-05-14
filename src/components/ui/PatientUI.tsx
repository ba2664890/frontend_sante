import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const BentoCard: React.FC<BentoCardProps> = ({ children, className, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white p-8 rounded-lg shadow-ultra-soft border border-sahara-rose transition-all duration-300",
        onClick && "cursor-pointer hover:translate-y-[-4px] hover:shadow-lg",
        className
      )}
    >
      {children}
    </div>
  );
};

export const GlassPanel: React.FC<BentoCardProps> = ({ children, className, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "glass p-8 rounded-lg shadow-ultra-soft flex items-center gap-6",
        onClick && "cursor-pointer hover:shadow-lg transition-all",
        className
      )}
    >
      {children}
    </div>
  );
};

interface IconBoxProps {
  icon: string;
  className?: string;
  variant?: 'rose' | 'green' | 'highest';
}

export const IconBox: React.FC<IconBoxProps> = ({ icon, className, variant = 'rose' }) => {
  const variants = {
    rose: 'bg-sahara-rose text-compassion-rose',
    green: 'bg-atlantic-sage text-wellness-green',
    highest: 'bg-surface-container-highest text-on-surface-variant',
  };

  return (
    <div className={cn(
      "w-12 h-12 rounded-full flex items-center justify-center",
      variants[variant],
      className
    )}>
      <span className="material-symbols-outlined">{icon}</span>
    </div>
  );
};
