import React from 'react';
import clsx from 'clsx';

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  change?: string;
  changeType?: 'increase' | 'decrease';
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'primary',
  change,
  changeType,
  className,
}) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-700',
    success: 'bg-success-50 text-success-700',
    warning: 'bg-warning-50 text-warning-700',
    error: 'bg-error-50 text-error-700',
    info: 'bg-info-50 text-info-700',
  };

  const changeColorClasses = {
    increase: 'text-success-600',
    decrease: 'text-error-600',
  };

  return (
    <div className={clsx('card', className)}>
      <div className="flex items-center">
        <div className={clsx('p-3 rounded-lg', colorClasses[color])}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change && (
            <div className="flex items-center mt-1">
              <span
                className={clsx(
                  'text-sm font-medium',
                  changeType && changeColorClasses[changeType]
                )}
              >
                {change}
              </span>
              <span className="text-sm text-gray-500 ml-1">par rapport au mois dernier</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;