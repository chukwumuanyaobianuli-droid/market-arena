import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPromptModal() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show modal when user logs in or visits
      setShowModal(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the PWA install prompt');
    }
    setDeferredPrompt(null);
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 bg-gray-900 text-white p-4 rounded-2xl shadow-2xl border border-gray-800 z-50 flex items-center justify-between animate-bounce-subtle">
      <div className="flex items-center space-x-3">
        <div className="p-2.5 bg-brand-600 rounded-xl">
          <Download className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="text-xs font-bold">Install Market Arena</h4>
          <p className="text-[10px] text-gray-400">Add to your phone screen for instant access!</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button 
          onClick={handleInstallClick} 
          className="bg-brand-600 hover:bg-brand-700 text-white text-xs px-3 py-1.5 rounded-xl font-bold cursor-pointer"
        >
          Install
        </button>
        <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white p-1 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}