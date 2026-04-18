import React, { useState, useRef, useEffect, useCallback } from 'react';

export function BeforeAfterSlider({ beforeSrc, afterSrc, beforeLabel = 'Avant', afterLabel = 'Après ✅', height = 340, landscape = false, isMobile = false, onOpen }) {
  const [pos, setPos] = useState(75);
  const [dragging, setDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [autoAnimDone, setAutoAnimDone] = useState(false);
  const containerRef = useRef(null);
  const didDragRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;
    setContainerWidth(containerRef.current.offsetWidth);
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) setContainerWidth(entry.contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const getPos = useCallback((clientX) => {
    if (!containerRef.current) return 50;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return Math.round((x / rect.width) * 100);
  }, []);

  const onMouseDown = (e) => { e.preventDefault(); setDragging(true); setAutoAnimDone(true); didDragRef.current = false; };
  const onMouseMove = useCallback((e) => { if (dragging) { setPos(getPos(e.clientX)); didDragRef.current = true; } }, [dragging, getPos]);
  const onMouseUp   = useCallback(() => setDragging(false), []);
  const onTouchMove = useCallback((e) => { if (dragging) { e.preventDefault(); setPos(getPos(e.touches[0].clientX)); didDragRef.current = true; } }, [dragging, getPos]);

  const handleContainerClick = () => {
    if (!didDragRef.current && onOpen) onOpen();
    didDragRef.current = false;
  };

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
    };
  }, [onMouseMove, onMouseUp, onTouchMove]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !autoAnimDone) {
        let start = null;
        const from = 75, to = 45, duration = 1600;
        const step = (ts) => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / duration, 1);
          const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
          setPos(Math.round(from + (to - from) * ease));
          if (p < 1) requestAnimationFrame(step);
          else setAutoAnimDone(true);
        };
        setTimeout(() => requestAnimationFrame(step), 700);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [autoAnimDone]);

  const FRAME = 8;
  const innerWidth = containerWidth > 0 ? containerWidth - 2 * FRAME : 0;

  return (
    <div ref={containerRef} onClick={handleContainerClick} style={{ position: 'relative', width: '100%', height: landscape ? 0 : `${height}px`, paddingBottom: landscape ? '56.25%' : 0, borderRadius: '14px', overflow: 'hidden', cursor: dragging ? 'grabbing' : (onOpen ? 'zoom-in' : 'grab'), userSelect: 'none', touchAction: 'none', background: '#f0f0f0' }}>
      <div style={{ position: 'absolute', inset: `${FRAME}px`, overflow: 'hidden', borderRadius: '8px' }}>
        <img src={afterSrc} alt="Après" draggable={false}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', background: '#ffffff' }} />
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', width: `${pos}%` }}>
          <img src={beforeSrc} alt="Avant" draggable={false}
            style={{ position: 'absolute', inset: 0, width: innerWidth > 0 ? `${innerWidth}px` : '100%', height: '100%', objectFit: 'contain', maxWidth: 'none', background: '#e8e8e8' }} />
        </div>
      </div>
      <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)', color: '#f87171', fontSize: isMobile ? '13px' : '11px', fontWeight: 700, padding: isMobile ? '5px 12px' : '4px 10px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '1px', zIndex: 5 }}>
        {beforeLabel}
      </div>
      <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(16,185,129,.8)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: isMobile ? '13px' : '11px', fontWeight: 700, padding: isMobile ? '5px 12px' : '4px 10px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '1px', zIndex: 5 }}>
        {afterLabel}
      </div>
      <div style={{ position: 'absolute', top: `${FRAME}px`, bottom: `${FRAME}px`, left: `${pos}%`, width: isMobile ? '1.5px' : '2px', background: '#fff', transform: 'translateX(-50%)', boxShadow: '0 0 8px rgba(0,0,0,.5)', pointerEvents: 'none', zIndex: 4 }} />
      <div onMouseDown={onMouseDown} onTouchStart={(e) => { setDragging(true); setAutoAnimDone(true); didDragRef.current = false; setPos(getPos(e.touches[0].clientX)); }}
        style={{ position: 'absolute', top: '50%', left: `${pos}%`, transform: 'translate(-50%,-50%)', width: isMobile ? '28px' : '36px', height: isMobile ? '28px' : '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 2px 12px rgba(124,58,237,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: dragging ? 'grabbing' : 'grab', zIndex: 10, border: '2px solid rgba(255,255,255,.3)' }}>
        <span style={{ color: '#fff', fontSize: isMobile ? '11px' : '14px', userSelect: 'none', lineHeight: 1 }}>⇔</span>
      </div>
    </div>
  );
}

export function BeforeAfterModal({ beforeSrc, afterSrc, onClose, isMobile = false }) {
  const sliderWrapRef = useRef(null);
  const [sliderH, setSliderH] = useState(0);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!isMobile || !sliderWrapRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setSliderH(Math.round(e.contentRect.height));
    });
    ro.observe(sliderWrapRef.current);
    return () => ro.disconnect();
  }, [isMobile]);

  if (isMobile) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#000', display: 'flex', flexDirection: 'column' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '14px', right: '14px', zIndex: 20, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)', color: '#fff', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', lineHeight: 1 }}>✕</button>
        <div ref={sliderWrapRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
          {sliderH > 0 && <BeforeAfterSlider beforeSrc={beforeSrc} afterSrc={afterSrc} height={sliderH} isMobile={true} />}
        </div>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,.45)', fontSize: '12px', margin: '0 0 12px', paddingBottom: 'env(safe-area-inset-bottom,0px)' }}>⇔ Glisse pour comparer</p>
      </div>
    );
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '900px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '-14px', right: '-14px', zIndex: 10, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', lineHeight: 1 }}>✕</button>
        <BeforeAfterSlider beforeSrc={beforeSrc} afterSrc={afterSrc} landscape={true} />
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,.45)', fontSize: '12px', marginTop: '10px', marginBottom: 0 }}>⇔ Glisse pour comparer · Clic hors image ou Échap pour fermer</p>
      </div>
    </div>
  );
}
