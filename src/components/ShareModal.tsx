import React from 'react';
import { TrendingUp, X, Zap, Download, AlertTriangle } from 'lucide-react';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string | null;
    modelId: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, imageSrc, modelId }) => {
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-500" /> Share Estimate
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-8 bg-slate-100/50 flex flex-col items-center justify-center">
                    <div className="relative shadow-2xl shadow-slate-300 rounded-lg overflow-hidden border border-slate-200 bg-white mb-6">
                        {imageSrc ? (
                            <img src={imageSrc} alt="Dashboard Preview" className="max-h-[40vh] max-w-full object-contain mx-auto" />
                        ) : (
                            <div className="p-12 text-slate-400 flex flex-col items-center">
                                <div className="animate-spin mb-4"><Zap size={24} /></div>
                                <p>Generating preview...</p>
                            </div>
                        )}
                    </div>

                    {/* Disclaimer / Caution Note */}
                    {/* Disclaimer / Caution Note */}
                    <div className="max-w-xl w-full bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 text-amber-900/80 mt-4">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-500" />
                        <div className="text-[10px] leading-relaxed">
                            <strong className="font-bold block mb-0.5 text-amber-900">Disclaimer</strong>
                            This estimation is provided for reference purposes only and relies on public pricing data which may change.
                            Actual costs may vary based on specific usage patterns, region, and applicable discounts.
                            Please validate with official Google Cloud documentation or sales representatives for 100% accuracy.
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                        Cancel
                    </button>
                    <a
                        href={imageSrc || '#'}
                        download={`${modelId}-pt-${Date.now()}.png`}
                        className={`px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-blue-200 ${!imageSrc ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        <Download size={16} /> Download Image
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
