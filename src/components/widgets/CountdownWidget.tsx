import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { getDaysLeft, formatDate } from '../../utils/dateUtils';

interface CountdownWidgetProps {
  title: string;
  dueDate: string;
  description: string;
  type: 'homework' | 'exam' | 'event';
}

const CountdownWidget: React.FC<CountdownWidgetProps> = ({ title, dueDate, description, type }) => {
  const [daysLeft, setDaysLeft] = useState(getDaysLeft(dueDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setDaysLeft(getDaysLeft(dueDate));
    }, 1000 * 60 * 60); // Update every hour

    return () => clearInterval(interval);
  }, [dueDate]);

  const getColorClasses = () => {
    if (daysLeft < 0) return 'bg-red-500 text-white';
    if (daysLeft <= 1) return 'bg-red-100 text-red-800 border-red-200';
    if (daysLeft <= 3) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getIconClasses = () => {
    if (daysLeft < 0) return 'text-white';
    if (daysLeft <= 1) return 'text-red-500';
    if (daysLeft <= 3) return 'text-amber-500';
    return 'text-blue-500';
  };

  return (
    <div className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${getColorClasses()}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {type === 'exam' ? (
            <Calendar className={`h-5 w-5 ${getIconClasses()}`} />
          ) : (
            <Clock className={`h-5 w-5 ${getIconClasses()}`} />
          )}
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
      </div>
      
      <div className="mb-2">
        <p className="text-sm opacity-90">{description}</p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs opacity-75">{formatDate(dueDate)}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">
            {daysLeft < 0 ? 'OVERDUE' : daysLeft === 0 ? 'TODAY' : `${daysLeft}d`}
          </div>
          {daysLeft >= 0 && (
            <p className="text-xs opacity-75">
              {daysLeft === 0 ? 'Due today' : daysLeft === 1 ? 'Due tomorrow' : 'days left'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CountdownWidget;