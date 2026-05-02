import React, { useState } from 'react';
import { ArrowLeftRight, Trophy, Zap, Search, HelpCircle, AlertCircle, Info, ChevronRight, BarChart3 } from 'lucide-react';

const NUTRI_COLOR = { A: '#038141', B: '#85BB2F', C: '#FECB02', D: '#EE8100', E: '#E63E11' };

const NUTRIENTS = [
  { key: 'sugar_g', label: 'Sugar', unit: 'g', isBad: true },
  { key: 'fat_g', label: 'Fat', unit: 'g', isBad: true },
  { key: 'sodium_mg', label: 'Sodium', unit: 'mg', isBad: true },
  { key: 'calories_kcal', label: 'Calories', unit: 'kcal', isBad: true },
  { key: 'protein_g', label: 'Protein', unit: 'g', isBad: false },
  { key: 'fiber_g', label: 'Fiber', unit: 'g', isBad: false },
];

const SAMPLE_PAIRS = [
  {
    name: 'Kurkure Masala Munch vs Maggi 2-Minute Noodles Masala',
    barcodes: ['8901058851335', '8901764000037'],
    icon: '🔥'
  }
];

function NutrientRow({ label, unit, v1, v2, winner, isBad }) {
  const p1Better = winner === 'product1';
  const p2Better = winner === 'product2';

  return (
    <div className="group flex flex-col md:flex-row md:items-center py-5 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 px-4 transition-colors">
      {/* Product 1 Value */}
      <div className="flex-1 flex items-center justify-end gap-3 order-2 md:order-1">
        <span className={`text-lg font-black ${p1Better ? 'text-emerald-600' : 'text-gray-400 opacity-60'}`}>
          {typeof v1 === 'number' ? v1.toFixed(label === 'Sodium' || label === 'Calories' ? 0 : 1) : '–'}{unit}
        </span>
        <div className={`w-2 h-2 rounded-full ${p1Better ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-transparent'}`} />
      </div>

      {/* Nutrient Label */}
      <div className="w-full md:w-32 flex flex-col items-center justify-center order-1 md:order-2 mb-3 md:mb-0">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <div className="h-0.5 w-8 bg-gray-100 mt-1" />
      </div>

      {/* Product 2 Value */}
      <div className="flex-1 flex items-center gap-3 order-3">
        <div className={`w-2 h-2 rounded-full ${p2Better ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-transparent'}`} />
        <span className={`text-lg font-black ${p2Better ? 'text-emerald-600' : 'text-gray-400 opacity-60'}`}>
          {typeof v2 === 'number' ? v2.toFixed(label === 'Sodium' || label === 'Calories' ? 0 : 1) : '–'}{unit}
        </span>
      </div>
    </div>
  );
}

export default function CompareView({ sessionId, backendUrl, ageGroup }) {
  const [barcode1, setBarcode1] = useState('');
  const [barcode2, setBarcode2] = useState('');
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  
  const [searchQuery1, setSearchQuery1] = useState('');
  const [searchQuery2, setSearchQuery2] = useState('');
  const [results1, setResults1] = useState([]);
  const [results2, setResults2] = useState([]);
  const [searching1, setSearching1] = useState(false);
  const [searching2, setSearching2] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (q, idx) => {
    const setQuery = idx === 1 ? setSearchQuery1 : setSearchQuery2;
    const setResults = idx === 1 ? setResults1 : setResults2;
    const setSearching = idx === 1 ? setSearching1 : setSearching2;

    setQuery(q);
    if (q.length < 3) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`${backendUrl}/scan/search?q=${encodeURIComponent(q)}`, {
        headers: { 'x-session-id': sessionId }
      });
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const selectProduct = (prod, idx) => {
    if (idx === 1) {
      setBarcode1(prod.barcode);
      setName1(prod.name);
      setSearchQuery1(prod.name);
      setResults1([]);
    } else {
      setBarcode2(prod.barcode);
      setName2(prod.name);
      setSearchQuery2(prod.name);
      setResults2([]);
    }
  };

  const handleCompare = async (e) => {
    if (e) e.preventDefault();
    if (!barcode1.trim() || !barcode2.trim()) return;
    setLoading(true); setError(''); setResult(null);

    try {
      const headers = { 'x-session-id': sessionId };
      const [r1, r2] = await Promise.all([
        fetch(`${backendUrl}/scan/barcode?barcode=${barcode1.trim()}`, { headers }),
        fetch(`${backendUrl}/scan/barcode?barcode=${barcode2.trim()}`, { headers }),
      ]);
      const [p1, p2] = await Promise.all([r1.json(), r2.json()]);

      if (p1.error) throw new Error(`Product 1: ${p1.error}`);
      if (p2.error) throw new Error(`Product 2: ${p2.error}`);

      const compareRes = await fetch(`${backendUrl}/compare`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ product1: p1, product2: p2, ageGroup }),
      });
      const data = await compareRes.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-200">
              <ArrowLeftRight size={24} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Dual Scan Analysis</h2>
          </div>
          <p className="text-gray-500 font-bold text-sm">Real-time side-by-side nutritional showdown powered by AI.</p>
        </div>

        <div className="flex gap-2">
          {SAMPLE_PAIRS.map((pair, i) => (
            <button
              key={i}
              onClick={() => { 
                setBarcode1(pair.barcodes[0]); 
                setBarcode2(pair.barcodes[1]);
                // Set queries to match the pair names for the UI
                const [n1, n2] = pair.name.split(' vs ');
                setSearchQuery1(n1);
                setSearchQuery2(n2);
              }}
              className="bg-white border-2 border-gray-900 rounded-xl px-4 py-2.5 text-[11px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2 group"
            >
              <span>{pair.icon}</span> 
              <span className="flex items-center">
                {pair.name.split(' vs ').map((part, index) => (
                  <React.Fragment key={index}>
                    {part}
                    {index === 0 && <span className="text-emerald-500 mx-1.5 scale-125 inline-block font-black italic">VS</span>}
                  </React.Fragment>
                ))}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── INPUT SECTION ── */}
      {!result && (
        <div className="bg-white border-4 border-gray-900 rounded-[2.5rem] p-6 md:p-8 mb-8 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row items-center gap-6">
              {[
                { value: searchQuery1, results: results1, searching: searching1, label: 'Product 1', idx: 1 },
                { value: searchQuery2, results: results2, searching: searching2, label: 'Product 2', idx: 2 },
              ].map(({ value, results, searching, label, idx }) => (
                <React.Fragment key={label}>
                  <div className="flex-1 w-full relative">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">{label}</label>
                    <div className="relative group">
                      <input
                        type="text" 
                        value={value} 
                        onChange={e => handleSearch(e.target.value, idx)}
                        placeholder="Search product name..."
                        className="w-full pl-11 pr-10 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:bg-white outline-none text-sm font-bold tracking-tight placeholder-gray-400 transition-all"
                      />
                      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                      {searching && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Results Dropdown */}
                    {results.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-900 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="max-h-60 overflow-y-auto p-2 custom-scrollbar">
                          {results.map((res, i) => (
                            <button 
                              key={i}
                              onClick={() => selectProduct(res, idx)}
                              className="w-full p-2.5 flex items-center gap-3 hover:bg-emerald-50 rounded-xl transition-colors text-left group"
                            >
                              <div className="w-10 h-10 rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100">
                                {res.image_url ? (
                                  <img src={res.image_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300"><Search size={14}/></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-gray-900 truncate group-hover:text-emerald-700">{res.name}</p>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{res.brand}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                {idx === 0 && (
                  <div className="hidden md:flex items-center justify-center pt-5">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 border border-gray-200">VS</div>
                  </div>
                )}
              </React.Fragment>
            ))}

            <div className="w-full md:w-auto pt-0 md:pt-5">
              <button
                onClick={handleCompare}
                disabled={loading || !barcode1.trim() || !barcode2.trim()}
                className="w-full md:w-40 py-3 bg-gray-900 text-white rounded-xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 shadow-xl hover:bg-emerald-600 transition-all disabled:opacity-20 active:scale-95"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Compare'}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <div className="mt-8 bg-red-50 border-2 border-red-500 text-red-500 rounded-3xl p-6 text-sm font-black text-center shadow-xl shadow-red-100">{error}</div>}

      {/* ── RESULTS ── */}
      {result && (
        <div className="animate-in slide-in-from-bottom-10 duration-700">

          <div className="flex justify-center mb-8">
            <button onClick={() => setResult(null)} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-black uppercase tracking-widest text-gray-500 transition-all">
              ← Back to Selection
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative mb-12">
            {/* VS DIVIDER */}
            <div className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-16 h-16 bg-gray-900 border-4 border-white rounded-full items-center justify-center text-white font-black text-xl shadow-2xl">
              VS
            </div>

            {(['product1', 'product2']).map((pk) => {
              const d = result[pk];
              const isWinner = result.overallWinner === pk;
              return (
                <div key={pk} className={`bg-white border-4 rounded-[2.5rem] p-10 flex flex-col items-center transition-all relative ${isWinner ? 'border-emerald-500' : 'border-gray-900'}`}>
                  {isWinner && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-white font-black px-6 py-2 rounded-2xl shadow-xl flex items-center gap-2 border-2 border-white scale-110">
                      <Trophy size={16} fill="white" /> HEALTHIER PICK
                    </div>
                  )}

                  {d.nutriScore?.grade && (
                    <div className="w-20 h-20 rounded-3xl flex items-center justify-center font-black text-white text-4xl mb-8 shadow-2xl transform rotate-3" style={{ backgroundColor: NUTRI_COLOR[d.nutriScore.grade] }}>
                      {d.nutriScore.grade}
                    </div>
                  )}

                  <h3 className="text-2xl font-black text-gray-900 text-center mb-2 leading-tight px-4">{d.name}</h3>
                  <p className="text-gray-400 text-[11px] font-black uppercase tracking-widest">Selected Candidate</p>
                </div>
              );
            })}
          </div>

          {/* Detailed Stats Card */}
          <div className="bg-white border-4 border-gray-900 rounded-[2.5rem] overflow-hidden mb-12">
            <div className="bg-gray-50 border-b-2 border-gray-100 p-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white border-2 border-gray-900 rounded-2xl flex items-center justify-center">
                  <BarChart3 size={24} />
                </div>
                <h4 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Metric Showdown</h4>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500" /> <span className="text-[10px] font-black text-gray-400 uppercase">Better</span></div>
              </div>
            </div>

            <div className="p-4 md:p-8">
              <div className="bg-white divide-y-0">
                {NUTRIENTS.map(({ key, label, unit, isBad }) => {
                  const row = result.comparison?.[key];
                  if (!row) return null;
                  return <NutrientRow key={key} label={label} unit={row.unit || unit} v1={row.product1} v2={row.product2} winner={row.winner} isBad={isBad} />;
                })}
              </div>
            </div>
          </div>

          {/* AI Verdict Card */}
          {result.verdict && (
            <div className="bg-emerald-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden border-4 border-white">
              <div className="absolute right-0 top-0 p-12 opacity-10 rotate-12">
                <Zap size={160} fill="white" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                    <Zap size={20} className="text-white" fill="white" />
                  </div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-100">Deep AI Verdict</h4>
                </div>
                <p className="text-2xl font-black leading-tight tracking-tight max-w-4xl">{result.verdict}</p>
                <div className="mt-8 flex items-center gap-2 text-emerald-200 text-[10px] font-black uppercase tracking-widest">
                  <Info size={14} /> Based on complex nutritional scoring & user health profile
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
