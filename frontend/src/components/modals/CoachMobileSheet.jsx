import React, { useState, useEffect, useRef } from 'react';
import ChatCoach from '../../ChatCoach';

export default function CoachMobileSheet({
  isOpen,
  onClose,
  glicemia,
  meal,
  coach,
  usaHack1,
  usaHack2,
  impostazioni,
  datiCurva,
  piccoStd,
  piccoOpt,
  tPiccoStd,
  tPiccoOpt,
  tirStd,
  tirOpt,
  aiConfig
}) {
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dragStartYRef = useRef(0);
  const currentDragYRef = useRef(0);
  const closingTimeoutRef = useRef(null);

  // Gestione apertura / chiusura e blocco scroll body
  useEffect(() => {
    if (isOpen) {
      // Se c'è un timer di chiusura pendente, annullalo subito
      if (closingTimeoutRef.current) {
        clearTimeout(closingTimeoutRef.current);
        closingTimeoutRef.current = null;
      }

      // Resetta tutti gli stati per l'apertura pulita
      setIsClosing(false);
      setDragOffsetY(0);
      setIsDragging(false);

      // Blocca lo scorrimento del corpo pagina
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      // Attiva transizione di ingresso al frame successivo
      const raf = requestAnimationFrame(() => {
        setMounted(true);
      });

      return () => {
        // Ripristina sempre lo scroll normale del body
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
        cancelAnimationFrame(raf);
      };
    } else {
      // Quando isOpen è false, ripulisci lo stato
      setMounted(false);
      setIsClosing(false);
      setDragOffsetY(0);
      setIsDragging(false);
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
  }, [isOpen]);

  // Gestione chiusura fluida con animazione di discesa (slide down)
  const triggerClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setIsDragging(false);
    setDragOffsetY(0);

    if (closingTimeoutRef.current) {
      clearTimeout(closingTimeoutRef.current);
    }

    closingTimeoutRef.current = setTimeout(() => {
      setIsClosing(false);
      setMounted(false);
      onClose();
    }, 280);
  };

  // Gesture di trascinamento verso il basso (Swipe to Close)
  const handleTouchStart = (e) => {
    dragStartYRef.current = e.touches[0].clientY;
    currentDragYRef.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    currentDragYRef.current = e.touches[0].clientY;
    const deltaY = currentDragYRef.current - dragStartYRef.current;

    if (deltaY > 0) {
      // Movimento verso il basso (1:1 col dito)
      setDragOffsetY(deltaY);
    } else {
      // Movimento verso l'alto: leggera resistenza elastica
      setDragOffsetY(deltaY * 0.15);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Se trascinato verso il basso per più di 90px -> chiudi
    if (dragOffsetY > 90) {
      triggerClose();
    } else {
      // Altrimenti fai rimbalzare il modal di nuovo in posizione iniziale
      setDragOffsetY(0);
    }
  };

  if (!isOpen) return null;

  // Calcolo opacità del backdrop durante il trascinamento
  const backdropProgress = isDragging ? Math.max(0.15, 1 - dragOffsetY / 350) : 1;
  const isSheetVisible = mounted && !isClosing;

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end overscroll-contain select-none"
      style={{ touchAction: 'none' }}
    >
      {/* Sfondo semitrasparente / Backdrop con blur */}
      <div
        onClick={triggerClose}
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 ${
          isSheetVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          opacity: isDragging ? backdropProgress : undefined,
          touchAction: 'none'
        }}
      />

      {/* Cassetto / Bottom Sheet Modale */}
      <div
        className="relative z-10 w-full bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] h-[85vh] overflow-hidden border-t border-slate-200"
        style={{
          transform: isDragging
            ? `translateY(${Math.max(0, dragOffsetY)}px)`
            : isSheetVisible
            ? 'translateY(0%)'
            : 'translateY(100%)',
          transition: isDragging
            ? 'none'
            : 'transform 280ms cubic-bezier(0.32, 0.72, 0, 1)',
          touchAction: 'auto',
          overscrollBehavior: 'contain'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Maniglia di trascinamento interattiva per chiusura verso il basso */}
        <div
          className="w-full pt-3 pb-2.5 flex flex-col justify-center items-center bg-slate-50 border-b border-slate-100 cursor-grab active:cursor-grabbing shrink-0 select-none"
          style={{ touchAction: 'none' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1.5 rounded-full bg-slate-300 hover:bg-slate-400 transition" />
          <span className="text-[10px] text-slate-400 font-medium mt-1">
            Trascina in basso o tocca fuori per chiudere
          </span>
        </div>

        {/* Componente ChatCoach */}
        <div className="flex-1 overflow-hidden flex flex-col overscroll-contain">
          <ChatCoach
            glicemia={glicemia}
            meal={meal}
            coach={coach}
            usaHack1={usaHack1}
            usaHack2={usaHack2}
            impostazioni={impostazioni}
            datiCurva={datiCurva}
            piccoStd={piccoStd}
            piccoOpt={piccoOpt}
            tPiccoStd={tPiccoStd}
            tPiccoOpt={tPiccoOpt}
            tirStd={tirStd}
            tirOpt={tirOpt}
            aiConfig={aiConfig}
            className="h-full border-0 rounded-none shadow-none"
            onChiudi={triggerClose}
          />
        </div>
      </div>
    </div>
  );
}
