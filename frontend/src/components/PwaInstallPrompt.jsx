import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, WifiOff, Info, HelpCircle } from 'lucide-react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem('gluco_pwa_dismissed') === 'true';
  });
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    // Rileva se è già in modalità standalone (app già installata)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
    } else {
      setShowGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('gluco_pwa_dismissed', 'true');
  };

  // Se è offline, mostra sempre l'indicatore di modalità offline autonoma
  if (!isOnline) {
    return (
      <div className="bg-amber-500 text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-sm animate-in slide-in-from-top duration-200">
        <WifiOff className="w-3.5 h-3.5" />
        <span>Sei offline — GlucoTwin sta funzionando con il motore fisiologico locale autonomo.</span>
      </div>
    );
  }

  // Non mostrare se già installata o se l'utente ha chiuso il banner
  if (isInstalled || isDismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-teal-800 text-white px-4 py-2 text-xs shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4 text-teal-100" />
          </div>
          <div className="truncate">
            <span className="font-bold mr-1.5">Installa GlucoTwin:</span>
            <span className="text-teal-100 hidden sm:inline">
              Usalo come app sul tuo dispositivo, a schermo intero e 100% offline.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1 rounded-lg bg-white text-teal-800 font-bold hover:bg-teal-50 transition shadow-2xs flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <Download className="w-3.5 h-3.5 text-teal-700" />
            <span>Installa App</span>
          </button>

          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg hover:bg-white/10 text-teal-200 hover:text-white transition cursor-pointer"
            title="Nascondi avviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Finestra Guida Rapida Installazione (per Desktop/iPhone/Android quando il prompt nativo non è immediato) */}
      {showGuide && (
        <div className="max-w-2xl mx-auto mt-2 p-3.5 rounded-2xl bg-teal-900/95 border border-teal-500/50 text-xs text-teal-100 shadow-xl space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-teal-700/60 pb-1.5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-teal-300" />
              Come installare GlucoTwin sul tuo dispositivo:
            </span>
            <button onClick={() => setShowGuide(false)} className="text-teal-300 hover:text-white cursor-pointer font-bold">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] pt-1">
            <div className="bg-teal-950/50 p-2.5 rounded-xl border border-teal-800">
              <strong className="text-white block mb-0.5">🖥️ Desktop (Chrome / Edge):</strong>
              Clicca l'icona <span className="underline font-bold">Installa ⤓</span> all'estrema destra della barra degli indirizzi in alto, oppure menu <strong>⋮ &gt; Trasmetti, salva e condividi &gt; Installa GlucoTwin</strong>.
            </div>
            <div className="bg-teal-950/50 p-2.5 rounded-xl border border-teal-800">
              <strong className="text-white block mb-0.5">📱 iPhone / iPad (Safari):</strong>
              Tocca il pulsante <strong>Condividi</strong> in basso (icona con quadrato e freccia verso l'alto ⎋) e seleziona <strong>"Aggiungi alla schermata Home"</strong>.
            </div>
            <div className="bg-teal-950/50 p-2.5 rounded-xl border border-teal-800">
              <strong className="text-white block mb-0.5">🤖 Android (Chrome):</strong>
              Tocca il menu in alto a destra (<strong>⋮</strong>) e seleziona <strong>"Installa app"</strong> o <strong>"Aggiungi a schermata Home"</strong>.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
