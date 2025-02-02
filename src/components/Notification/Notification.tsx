import { useEffect } from 'react';
import './Notification.css';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

const getDurationByType = (type: NotificationProps['type']): number => {
  switch (type) {
    case 'error':
      return 5000; // Errors stay longer
    case 'warning':
      return 4000;
    case 'info':
      return 3000;
    case 'success':
      return 2000; // Success messages are quick
    default:
      return 3000;
  }
};

const getIconByType = (type: NotificationProps['type']): string => {
  switch (type) {
    case 'success':
      return '✓';
    case 'error':
      return '!';
    case 'warning':
      return '⚠';
    case 'info':
      return 'i';
    default:
      return '•';
  }
};

export function Notification({ message, type, onClose, duration }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration || getDurationByType(type));

    return () => clearTimeout(timer);
  }, [duration, type, onClose]);

  return (
    <div className={`notification ${type} slide-in`}>
      <span className="notification-icon">
        {getIconByType(type)}
      </span>
      <span className="notification-message">{message}</span>
      <button onClick={onClose} className="notification-close" aria-label="Close notification">
        ×
      </button>
    </div>
  );
} 