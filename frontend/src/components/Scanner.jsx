import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

export default function Scanner({ onScan }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    let codeReader = null;
    let isActive = true;

    async function startScanner() {
      codeReader = new BrowserMultiFormatReader();
      try {
        const devices = await codeReader.listVideoInputDevices();
        if (devices.length > 0) {
          const selectedDeviceId = devices[devices.length - 1].deviceId;
          if (!isActive) return;
          codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (result, err) => {
            if (result) onScan(result.getText());
            if (err && !(err instanceof NotFoundException)) console.warn("Scan warning:", err);
          });
        } else setError("No cameras found");
      } catch (err) {
        if (!isActive) setError("Camera disabled or unavailable");
      }
    }

    startScanner();
    return () => { isActive = false; if (codeReader) codeReader.reset(); };
  }, [onScan]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) onScan(manualCode.trim());
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="relative aspect-[4/5] bg-gray-200 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col items-center justify-center border-4 border-white ring-1 ring-gray-100">
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover grayscale-[0.5]"></video>
        
        {/* Scan Area Overlay */}
        <div className="absolute inset-x-12 top-1/4 bottom-1/3 border-2 border-emerald-400/80 rounded-2xl shadow-[0_0_0_4000px_rgba(255,255,255,0.3)] flex items-center justify-center backdrop-grayscale-[0.5]">
          <div className="w-full h-0.5 bg-emerald-500 animate-scan"></div>
          
          <div className="absolute -top-1 -left-1 w-8 h-8 border-t-[3px] border-l-[3px] border-emerald-500 rounded-tl-xl"></div>
          <div className="absolute -top-1 -right-1 w-8 h-8 border-t-[3px] border-r-[3px] border-emerald-500 rounded-tr-xl"></div>
          <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-[3px] border-l-[3px] border-emerald-500 rounded-bl-xl"></div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-[3px] border-r-[3px] border-emerald-500 rounded-br-xl"></div>
        </div>

        <div className="z-10 mt-auto mb-12 glass px-6 py-4 rounded-[1.5rem] text-gray-900 flex items-center gap-3 shadow-xl border border-white">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-black tracking-widest text-[11px] uppercase text-emerald-900">AI Scanner Active</span>
        </div>
      </div>

      <form onSubmit={handleManualSubmit} className="flex gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
        <input 
          type="text" value={manualCode} onChange={(e) => setManualCode(e.target.value)}
          placeholder="Enter numeric barcode..." 
          className="flex-1 px-5 py-3.5 bg-transparent focus:outline-none text-gray-900 font-bold placeholder-gray-300 text-sm"
        />
        <button type="submit" className="px-7 py-3.5 bg-gray-900 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:scale-95 transition-transform active:scale-90 shadow-lg shadow-gray-200">
          Scan
        </button>
      </form>
    </div>
  );
}
