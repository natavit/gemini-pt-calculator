import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

interface ToastProps {
    message: string | null;
    type?: 'success' | 'error' | 'info';
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [message, duration, onClose]);

    if (!message) return null;

    const bgStyles = {
        success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        error: 'bg-rose-50 border-rose-200 text-rose-800',
        info: 'bg-slate-50 border-slate-200 text-slate-800',
    };

    const iconStyles = {
        success: 'text-emerald-500',
        error: 'text-rose-500',
        info: 'text-blue-500',
    };

    const Icon = type === 'success' ? CheckCircle : AlertCircle;

    return (
        <div className={`fixed top-4 right-4 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg shadow-slate-200/50 animate-in slide-in-from-top-2 fade-in duration-300 max-w-sm ${bgStyles[type]}`}>
            <Icon className={`w-5 h-5 flex-shrink-0 ${iconStyles[type]}`} />
            <p className="text-sm font-medium">{message}</p>
            <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full transition-colors ml-2">
                <X size={14} />
            </button>
        </div>
    );
};

export default Toast;
