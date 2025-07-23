import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import CloseIcon from '@mui/icons-material/Close';
import GetAppIcon from '@mui/icons-material/GetApp';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import OfflinePinIcon from '@mui/icons-material/OfflinePin';
import SpeedIcon from '@mui/icons-material/Speed';
import IosShareIcon from '@mui/icons-material/IosShare';

const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone === true;

    // Check if user already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = localStorage.getItem('pwa-install-dismissed-time');
    
    // Show again after 7 days if dismissed
    const sevenDaysAgo = new Date().getTime() - (7 * 24 * 60 * 60 * 1000);
    const shouldShowAgain = dismissedTime && parseInt(dismissedTime) < sevenDaysAgo;

    if (!isInstalled && (!dismissed || shouldShowAgain)) {
      // For iOS, show custom instructions
      if (isIOSDevice) {
        setTimeout(() => setShowPrompt(true), 2000);
      } else {
        // For other browsers, listen for beforeinstallprompt
        const handler = (e) => {
          e.preventDefault();
          setDeferredPrompt(e);
          setTimeout(() => setShowPrompt(true), 2000);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
      }
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    localStorage.setItem('pwa-install-dismissed-time', new Date().getTime().toString());
  };

  const features = [
    { icon: <SpeedIcon className="w-5 h-5" />, text: "Lightning fast" },
    { icon: <OfflinePinIcon className="w-5 h-5" />, text: "Works offline" },
    { icon: <NotificationsActiveIcon className="w-5 h-5" />, text: "Push notifications" },
  ];

  return (
    <AnimatePresence>
      {showPrompt && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={handleDismiss}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
          >
            <div className="max-w-md w-full">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* Gradient header */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-5 relative">
                  <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                  >
                    <CloseIcon className="w-6 h-6" />
                  </button>
                  
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                      <PhoneIphoneIcon className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xl">Install CapRaise App</h3>
                      <p className="text-white/90 text-sm mt-1">Add to your home screen for the best experience</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Features */}
                  <div className="flex items-center justify-around mb-6">
                    {features.map((feature, index) => (
                      <div key={index} className="flex flex-col items-center text-center">
                        <div className="text-purple-600 mb-2">{feature.icon}</div>
                        <span className="text-xs text-gray-600">{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Install instructions or button */}
                  {isIOS ? (
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 mb-4 border border-purple-100">
                      <p className="text-sm text-gray-800 text-center mb-3 font-medium">
                        To install this app on your iPhone:
                      </p>
                      <div className="space-y-2.5 max-w-xs mx-auto">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-700 font-medium">1.</span>
                          <span className="text-xs text-gray-700">Tap</span>
                          <span className="inline-flex items-center px-2 py-1 rounded-lg bg-white shadow-sm border border-gray-200">
                            <IosShareIcon className="w-4 h-4 text-blue-500" />
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-700 font-medium">2.</span>
                          <span className="text-xs text-gray-700">Then tap</span>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white shadow-sm border border-gray-200 text-xs font-medium text-gray-700">
                            Add to Home Screen
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleInstall}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3.5 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 shadow-lg mb-3"
                    >
                      <GetAppIcon className="w-6 h-6" />
                      <span className="text-lg">Install App</span>
                    </button>
                  )}

                  {/* Skip button */}
                  <button
                    onClick={handleDismiss}
                    className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium py-2 transition-colors"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallPrompt; 