import React, { useEffect, useState } from 'react';
import DailySugarTracker from './DailySugarTracker';
import { RefreshCcw, Calendar, ChevronRight, ClipboardList, Activity, Trash2, Apple, Coffee, Pizza, Croissant, IceCream, Carrot, Utensils, Cookie } from 'lucide-react';

const RISK_PILL = {
  HIGH:     'text-rose-600 bg-rose-50 border border-rose-100',
  MODERATE: 'text-amber-600 bg-amber-50 border border-amber-100',
  LOW:      'text-emerald-600 bg-emerald-50 border border-emerald-100',
};
const NUTRI_COLOR = { A: '#038141', B: '#85BB2F', C: '#FECB02', D: '#EE8100', E: '#E63E11' };

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function getFoodIcon(name) {
  const n = (name || '').toLowerCase();
  if (n.match(/juice|drink|water|soda|cola|beverage/)) return <Coffee size={24} strokeWidth={2.5} />;
  if (n.match(/chip|snack|dorito|lays|kurkure/)) return <Pizza size={24} strokeWidth={2.5} />;
  if (n.match(/biscuit|cookie|oreo/)) return <Cookie size={24} strokeWidth={2.5} />;
  if (n.match(/fruit|apple|mango|banana/)) return <Apple size={24} strokeWidth={2.5} />;
  if (n.match(/cream|dairy|milk|yogurt/)) return <IceCream size={24} strokeWidth={2.5} />;
  if (n.match(/veg|salad/)) return <Carrot size={24} strokeWidth={2.5} />;
  if (n.match(/bread|cake|pastry|bake/)) return <Croissant size={24} strokeWidth={2.5} />;
  return <Utensils size={24} strokeWidth={2.5} />;
}

export default function HistoryView({ sessionId, backendUrl, onProductClick }) {
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showYesterday, setShowYesterday] = useState(false);
  const [showOlder, setShowOlder] = useState(false);

  const fetchData = async (forceRefetch = false) => {
    // If not forcing refetch, try to load from sessionStorage first
    if (!forceRefetch) {
      const cachedHistory = sessionStorage.getItem(`nutriscan_history_${sessionId}`);
      const cachedSummary = sessionStorage.getItem(`nutriscan_summary_${sessionId}`);
      if (cachedHistory && cachedSummary) {
        setHistory(JSON.parse(cachedHistory));
        setSummary(JSON.parse(cachedSummary));
        setLoading(false);
        // We can optionally return here if we don't want background updates, 
        // but fetching in the background keeps it fresh. For hackathon, let's just 
        // skip fetching if we have cache, unless forceRefetch is true (Refresh button).
        return;
      }
    }

    setLoading(true);
    try {
      const headers = { 'x-session-id': sessionId };
      const [histRes, sumRes] = await Promise.all([
        fetch(`${backendUrl}/history`,                { headers }),
        fetch(`${backendUrl}/history/daily-summary`,  { headers }),
      ]);
      const histData = await histRes.json();
      const sumData  = await sumRes.json();
      
      const newHistory = histData.history || [];
      setHistory(newHistory);
      setSummary(sumData);

      // Save to sessionStorage
      if (sessionId) {
        sessionStorage.setItem(`nutriscan_history_${sessionId}`, JSON.stringify(newHistory));
        sessionStorage.setItem(`nutriscan_summary_${sessionId}`, JSON.stringify(sumData));
      }
    } catch (err) {
      console.error('History fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    const newHistory = history.filter(item => item._id !== id);
    setHistory(newHistory);
    // Update sessionStorage immediately
    if (sessionId) {
      sessionStorage.setItem(`nutriscan_history_${sessionId}`, JSON.stringify(newHistory));
    }
    
    try {
      await fetch(`${backendUrl}/history/${id}`, {
        method: 'DELETE',
        headers: { 'x-session-id': sessionId }
      });
      // Force refetch to ensure backend sync
      fetchData(true);
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  useEffect(() => { fetchData(); }, [sessionId, backendUrl]); // eslint-disable-line

  // ── Group History by Date ──
  const todayScans = [];
  const yesterdayScans = [];
  const olderScans = [];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  history.forEach(scan => {
    const d = new Date(scan.timestamp);
    if (d >= todayStart) {
      todayScans.push(scan);
    } else if (d >= yesterdayStart) {
      yesterdayScans.push(scan);
    } else {
      olderScans.push(scan);
    }
  });

  const renderScanItem = (scan) => (
    <div
      key={scan._id}
      onClick={() => {
         if (onProductClick && scan.barcode) onProductClick(scan.barcode);
      }}
      className="group bg-white rounded-2xl p-4 flex items-center gap-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all duration-200 cursor-pointer"
    >
      <div className="relative">
        {scan.nutriScore?.grade ? (
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-md ring-2 ring-white"
            style={{ backgroundColor: NUTRI_COLOR[scan.nutriScore.grade] || '#FECB02' }}
          >
            {getFoodIcon(scan.product_name)}
          </div>
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-gray-100 border-2 border-gray-50 flex-shrink-0 flex items-center justify-center text-gray-400">
            {getFoodIcon(scan.product_name)}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 pr-2">
        <p className="text-gray-900 font-black text-[15px] md:text-base leading-tight tracking-tight mb-1.5 whitespace-normal break-words">{scan.product_name || 'Unknown Product'}</p>
        
        <div className="flex items-center gap-2.5 flex-wrap">
          {scan.risk?.level && (
            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex-shrink-0 shadow-sm ${RISK_PILL[scan.risk.level]}`}>
              {scan.risk.level}
            </span>
          )}
          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{formatTime(scan.timestamp)}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={(e) => handleDelete(e, scan._id)}
          className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all duration-200 focus:outline-none opacity-0 group-hover:opacity-100"
          title="Delete scan"
        >
          <Trash2 size={14} strokeWidth={2.5} />
        </button>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-emerald-600 transition-all duration-200">
          <ChevronRight size={16} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-5 pt-2">
        <div className="h-10 bg-gray-100 rounded-xl w-48 animate-pulse mb-2" />
        <div className="h-48 bg-white border border-gray-100 rounded-[2rem] animate-pulse" />
        <div className="space-y-4 mt-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-white border border-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-6 pt-2 max-w-4xl mx-auto w-full">
      {/* ── Premium Header ── */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight mb-2">
            Health <span className="text-emerald-600">Log</span>
          </h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Activity size={14} className="text-emerald-500" />
            Track your dietary footprint
          </p>
        </div>
        <button 
          onClick={() => fetchData(true)} 
          className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all focus:outline-none flex-shrink-0"
        >
          <RefreshCcw size={16} strokeWidth={2.5} />
        </button>
      </div>

      <DailySugarTracker summary={summary} />

      {/* ── List Section ── */}
      <div className="mt-2">
        {history.length === 0 ? (
          <div className="bg-white border md:border-2 border-dashed border-gray-200 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
              <ClipboardList size={40} strokeWidth={1.5} />
            </div>
            <p className="text-gray-900 font-black text-2xl tracking-tight mb-2">It's quiet here</p>
            <p className="text-gray-400 text-sm font-medium px-6 leading-relaxed max-w-xs transition-opacity delay-150">
              Your scan history will automatically appear here once you start exploring items.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Today */}
            <div>
              <div className="flex items-center gap-2 mb-4 px-2">
                <Calendar size={16} className="text-emerald-500" />
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Today</h3>
                <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">{todayScans.length}</span>
              </div>
              {todayScans.length > 0 ? (
                <div className="space-y-3">{todayScans.map(renderScanItem)}</div>
              ) : (
                <p className="text-gray-400 text-sm italic px-2">No scans today.</p>
              )}
            </div>

            {/* Yesterday */}
            {yesterdayScans.length > 0 && (
              <div>
                <button 
                  onClick={() => setShowYesterday(!showYesterday)}
                  className="flex items-center gap-2 mb-4 px-2 hover:opacity-70 transition-opacity w-full text-left focus:outline-none"
                >
                  <Calendar size={16} className="text-gray-400" />
                  <h3 className="text-sm font-black text-gray-600 uppercase tracking-widest flex-1">Yesterday</h3>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                    {showYesterday ? 'Hide' : `Show (${yesterdayScans.length})`}
                  </span>
                </button>
                {showYesterday && <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">{yesterdayScans.map(renderScanItem)}</div>}
              </div>
            )}

            {/* Older */}
            {olderScans.length > 0 && (
              <div>
                <button 
                  onClick={() => setShowOlder(!showOlder)}
                  className="flex items-center gap-2 mb-4 px-2 hover:opacity-70 transition-opacity w-full text-left focus:outline-none border-t border-gray-100 pt-6"
                >
                  <Calendar size={16} className="text-gray-300" />
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex-1">Older Scans</h3>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                    {showOlder ? 'Hide' : `Show (${olderScans.length})`}
                  </span>
                </button>
                {showOlder && <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">{olderScans.map(renderScanItem)}</div>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
