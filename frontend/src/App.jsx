import React, { useState, useCallback, useRef } from 'react';
import LoginPage          from './components/LoginPage';
import Scanner             from './components/Scanner';
import NutritionCard       from './components/NutritionCard';
import RiskBadge           from './components/RiskBadge';
import RiskExplanation     from './components/RiskExplanation';
import Alternatives        from './components/Alternatives';
import NutriScoreBadge     from './components/NutriScoreBadge';
import IngredientWarnings  from './components/IngredientWarnings';
import HistoryView         from './components/HistoryView';
import CompareView         from './components/CompareView';
import ProfilePage         from './components/ProfilePage';
import ProductCard         from './components/ProductCard';
import ManualEntry         from './components/ManualEntry';
import { ScanLine, History, ArrowLeftRight, Search, Camera, User, Activity, AlertTriangle, X, ChevronRight, Edit3, Salad, Sparkles } from 'lucide-react';

// Session ID
function getOrCreateSessionId() {
  let id = localStorage.getItem('sessionId');
  if (!id) {
    id = 'sess_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
    localStorage.setItem('sessionId', id);
  }
  return id;
}

const SESSION_ID  = getOrCreateSessionId();
const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const BACKEND_URL = baseUrl.replace(/\/+$/, '') + '/api';

// Tabs
const TABS = [
  { id: 'scan',    Icon: ScanLine,       label: 'Scan'    },
  { id: 'history', Icon: History,        label: 'History' },
  { id: 'compare', Icon: ArrowLeftRight, label: 'Compare' },
  { id: 'profile', Icon: User,           label: 'Profile' },
];

function App() {
  // Auth
  const [token,       setToken]       = useState(() => localStorage.getItem('sf_token') || null);
  const [authUser,    setAuthUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('sf_user')) || null; } catch { return null; }
  });

  const [tab,        setTab]        = useState('scan');
  const [screen,     setScreen]     = useState('scan'); // scan | loading | result | error
  const [product,    setProduct]    = useState(null);
  const [analysis,   setAnalysis]   = useState(null);
  const [errorMsg,   setErrorMsg]   = useState('');
  const [ageGroup,   setAgeGroup]   = useState(() => localStorage.getItem('ageGroup') || 'adult');
  const [isScanning, setIsScanning] = useState(false);
  const [featured,   setFeatured]   = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const searchAbortControllerRef = useRef(null);

  // SEO
  const getSEOMetadata = () => {
    let title = "NutriScan | Intelligent Food Analysis";
    let desc = "Instantly scan food labels to detect hidden risks, harmful additives, and nutritional insights tailored to your health profile.";
    
    if (tab === 'history') title = "Scan History | NutriScan";
    if (tab === 'compare') title = "Product Comparison | NutriScan";
    if (tab === 'profile') title = "Your Profile | NutriScan";
    
    if (screen === 'result' && product) {
      title = `${product.name || 'Product'} Analysis | NutriScan`;
      desc = `Deep dive into the ingredients and nutritional value of ${product.name}. Check for harmful additives and health risks.`;
    }
    
    return { title, desc };
  };
  const seo = getSEOMetadata();

  // Auth logic
  const handleAuth = useCallback((newToken, user) => {
    setToken(newToken);
    setAuthUser(user);
    if (user?.ageGroup) setAgeGroup(user.ageGroup);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('sf_token');
    localStorage.removeItem('sf_user');
    setToken(null);
    setAuthUser(null);
    setProduct(null);
    setAnalysis(null);
    setScreen('scan');
    setTab('scan');
  }, []);

  // Profile update handler
  const handleProfileUpdate = useCallback((newToken, updatedUser) => {
    setToken(newToken);
    setAuthUser(updatedUser);
    localStorage.setItem('sf_token', newToken);
    localStorage.setItem('sf_user',  JSON.stringify(updatedUser));
  }, []);

  // Fetch helper
  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'x-session-id': SESSION_ID,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }), [token]);

  // Fetch featured products
  React.useEffect(() => {
    if (!token) return; 
    fetch(`${BACKEND_URL}/scan/featured`, {
      headers: authHeaders(),
    })
      .then(res => res.json())
      .then(data => setFeatured(Array.isArray(data) ? data : []))
      .catch(err => console.error('Featured fetch failed:', err));
  }, [token, authHeaders]);

  // Require login
  if (!token || !authUser) {
    return <LoginPage onAuth={handleAuth} />;
  }

  const handleAgeGroupChange = (group) => {
    setAgeGroup(group);
    localStorage.setItem('ageGroup', group);
    fetch(`${BACKEND_URL}/user/profile`, {
      method:  'PATCH',
      headers: authHeaders(),
      body:    JSON.stringify({ ageGroup: group }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) handleAuth(data.token, data.user);
      })
      .catch(() => {});
  };

  const handleScan = async (barcodeText) => {
    setTab('scan');
    setScreen('loading');
    try {
      // Step 1 — fetch product
      const scanRes = await fetch(`${BACKEND_URL}/scan/barcode?barcode=${barcodeText}`, {
        headers: authHeaders(),
      });
      const scannedProduct = await scanRes.json();
      if (!scanRes.ok || scannedProduct.error) throw new Error(scannedProduct.error || 'Product not found');
      setProduct(scannedProduct);

      // Step 2 — analyse
      const analyseRes = await fetch(`${BACKEND_URL}/analyse`, {
        method:  'POST',
        headers: authHeaders(),
        body:    JSON.stringify({
          product:     scannedProduct,
          ageGroup,
          bmiCategory: authUser?.bmiCategory || null,
          userName:    authUser?.name        || null,
          conditions:  authUser?.conditions  || [],
        }),
      });
      const analysisData = await analyseRes.json();
      if (!analyseRes.ok || analysisData.error) throw new Error(analysisData.error || 'Analysis failed');

      setAnalysis(analysisData);
      setScreen('result');
    } catch (err) {
      setErrorMsg(err.message);
      setScreen('error');
    }
  };

  const reset = () => {
    setScreen('scan');
    setProduct(null);
    setAnalysis(null);
    setErrorMsg('');
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);

    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
    }

    if (q.length < 3) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const abortController = new AbortController();
    searchAbortControllerRef.current = abortController;

    try {
      const res = await fetch(`${BACKEND_URL}/scan/search?q=${encodeURIComponent(q)}`, {
        headers: authHeaders(),
        signal: abortController.signal
      });
      const data = await res.json();
      setSearchResults(Array.isArray(data) ? data : []);
      setSearching(false);
    } catch (err) {
      if (err.name === 'AbortError') {
        // Ignored aborted fetches
      } else {
        console.error('Search failed:', err);
        setSearching(false);
      }
    }
  };

  const handleManualAnalyze = async (manualProduct) => {
    setIsManualOpen(false);
    setScreen('loading');
    setTab('scan');
    try {
      const analyseRes = await fetch(`${BACKEND_URL}/analyse`, {
        method:  'POST',
        headers: authHeaders(),
        body:    JSON.stringify({
          product:     manualProduct,
          ageGroup,
          bmiCategory: authUser?.bmiCategory || null,
          userName:    authUser?.name        || null,
          conditions:  authUser?.conditions  || [],
        }),
      });
      const analysisData = await analyseRes.json();
      if (!analyseRes.ok || analysisData.error) throw new Error(analysisData.error || 'Analysis failed');

      setProduct(manualProduct);
      setAnalysis(analysisData);
      setScreen('result');
    } catch (err) {
      setErrorMsg(err.message);
      setScreen('error');
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-white font-sans flex flex-col md:flex-row overflow-hidden">
      <title>{seo.title}</title>
      <meta name="description" content={seo.desc} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.desc} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://nutriscan-food.vercel.app/" />
      <meta property="og:image" content="https://nutriscan-food.vercel.app/logo.png" />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-full bg-[#f4f7f4] border-r border-emerald-900/10 flex-shrink-0 z-20">
        <div className="p-8 flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-white">
            <img src="/nutriscan-logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">NutriScan</h1>
        </div>
        
        <nav className="flex-1 px-5 flex flex-col pb-6">
          <div className="space-y-2 flex-1">
            {TABS.filter(t => t.id !== 'profile').map(({ id, Icon, label }) => {
              const isActive = tab === id;
              return (
                <button
                  key={id}
                  onClick={() => { if (id === 'scan') reset(); setTab(id); }}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all text-left ${isActive ? 'bg-[#2d7637] text-white shadow-[0_4px_12px_rgba(45,118,55,0.3)]' : 'text-gray-600 hover:bg-emerald-900/5 hover:text-gray-900'}`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-sm tracking-wide">{id === 'scan' ? 'Dashboard' : label}</span>
                </button>
              );
            })}
          </div>
          
          <div className="mt-auto">
            {TABS.filter(t => t.id === 'profile').map(({ id, Icon, label }) => {
              const isActive = tab === id;
              return (
                <button
                  key={id}
                  onClick={() => { setTab(id); }}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all text-left ${isActive ? 'bg-[#2d7637] text-white shadow-[0_4px_12px_rgba(45,118,55,0.3)]' : 'text-gray-600 hover:bg-emerald-900/5 hover:text-gray-900'}`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-sm tracking-wide">{label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white">
        {/* Header */}
        <header className="flex items-center justify-between px-5 md:px-10 pt-4 md:pt-8 pb-3 md:pb-6 border-b border-gray-100 flex-shrink-0 bg-white z-10 w-full">
          <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-3">
            {/* Mobile Brand (Hidden on Desktop) */}
            <div className="flex md:hidden items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-white">
                <img src="/nutriscan-logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900 leading-tight tracking-tight">
                  NutriScan
                </h1>
                <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">INTELLIGENT HEALTH AI</p>
              </div>
            </div>

            {/* Desktop Page Title */}
            <div className="hidden md:block">
               <h2 className="text-2xl md:text-3xl font-black text-[#1e5c26] tracking-tight mb-1">
                 {tab === 'scan' && screen === 'scan' ? 'Health Overview' : tab.charAt(0).toUpperCase() + tab.slice(1)}
               </h2>
               <p className="text-gray-500 text-sm font-medium">Your nutritional analysis & insights</p>
            </div>

            {/* Greeting chip */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[11px] font-black flex-shrink-0">
              {(authUser.name || 'U').charAt(0).toUpperCase()}
            </div>
            <span className="text-gray-700 text-xs font-bold hidden sm:inline">Hi, {authUser.name.split(' ')[0]}</span>
            {authUser.bmiCategory && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md hidden sm:inline ${
                authUser.bmiCategory === 'Normal' ? 'bg-emerald-100 text-emerald-700' :
                authUser.bmiCategory === 'Overweight' ? 'bg-amber-100 text-amber-700' :
                authUser.bmiCategory === 'Obese' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                BMI {authUser.bmi}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full">
        <div className="w-full max-w-7xl mx-auto px-5 md:px-10 pt-5 pb-10">

        {/* SCAN TAB */}
        {tab === 'scan' && (
          <>
            {screen === 'scan' && (
              <div className="flex flex-col animate-in pb-10">
                {!isScanning ? (
                  <>
                    {/* Search bar */}
                    <div className="w-full max-w-4xl mx-auto mb-8 relative z-50">
                       <div className="relative group">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                          <input 
                            type="text" 
                            placeholder="Search products by name (e.g. Maggi, Oreo)..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full pl-11 pr-4 py-3 rounded-full border border-gray-300 bg-white shadow-sm focus:shadow-md focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm md:text-base"
                          />
                          {searching && (
                             <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <div className="w-4 h-4 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
                             </div>
                          )}
                       </div>

                       {/* Search results */}
                       {(searchResults.length > 0 || searching) && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                             <div className="max-h-80 overflow-y-auto p-2">
                                {searching ? (
                                   <div className="space-y-1 p-1">
                                      {[1, 2, 3].map(n => (
                                         <div key={n} className="flex items-center gap-4 p-3 animate-pulse">
                                            <div className="w-12 h-12 bg-gray-100 rounded-xl"></div>
                                            <div className="flex-1 space-y-3">
                                               <div className="h-3 bg-gray-100 rounded-full w-3/4"></div>
                                               <div className="h-2 bg-gray-50 rounded-full w-1/4"></div>
                                            </div>
                                         </div>
                                      ))}
                                   </div>
                                ) : (
                                   searchResults.map((res, i) => (
                                      <button 
                                        key={i}
                                        onClick={() => handleScan(res.barcode)}
                                        className="w-full p-3 flex items-center gap-4 hover:bg-gray-50 rounded-2xl transition-colors text-left"
                                      >
                                         {res.image_url ? (
                                            <img src={res.image_url} alt="" className="w-12 h-12 rounded-xl object-cover border border-gray-100" />
                                         ) : (
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400"><Search size={20}/></div>
                                         )}
                                         <div className="flex-1 min-w-0">
                                            <p className="text-base font-black text-gray-900 truncate">{res.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{res.brand}</p>
                                         </div>
                                         <ChevronRight size={20} className="text-gray-300" />
                                      </button>
                                   ))
                                )}
                             </div>
                          </div>
                       )}
                    </div>

                    {/* Hero */}
                    <div className="relative mb-8 mt-2 md:mt-6 w-full max-w-2xl mx-auto">
                       <div className="relative bg-white rounded-[2.5rem] p-6 md:p-10 text-center border-2 border-gray-900 shadow-[0_6px_0_0_#111827] overflow-hidden flex flex-col items-center">
                         
                         <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border-4 border-emerald-50 mb-3 md:mb-5">
                           <ScanLine size={32} className="text-emerald-600" />
                         </div>

                         <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-2 leading-tight tracking-tight">
                           Scan to Reveal Risks.
                         </h2>
                         <p className="text-gray-500 text-xs md:text-sm font-medium mb-2 max-w-xs mx-auto leading-relaxed">
                           Point your camera at any food barcode for an instant AI health breakdown.
                         </p>

                         {authUser?.bmiCategory && authUser.bmiCategory !== 'Normal' && (
                           <p className="text-[11px] text-emerald-600 font-bold mb-4 bg-emerald-50 px-3 py-1 rounded-full">
                             ✦ Personalised for your {authUser.bmiCategory} BMI profile
                           </p>
                         )}

                         <button
                           onClick={() => setIsScanning(true)}
                           className="w-full max-w-[280px] py-4 bg-emerald-600 text-white rounded-xl font-black text-base uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-transform hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 mb-6"
                         >
                           <Camera size={20} className="text-white" />
                           <span>Tap to Scan</span>
                         </button>

                         <button 
                           onClick={() => setIsManualOpen(true)}
                           className="mt-2 flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors group"
                         >
                            <Edit3 size={14} className="group-hover:rotate-12 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Can't scan? Enter Manually</span>
                         </button>

                       </div>
                    </div>

                    {/* Explore */}
                    <div className="flex items-center justify-between mb-6 px-1">
                       <div>
                         <h3 className="text-xl font-black text-gray-900 tracking-tight">Explore Snacks</h3>
                         <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Selected for your profile</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                      {featured.map((prod) => (
                        <ProductCard 
                          key={prod.barcode} 
                          product={prod} 
                          onClick={(barcode) => handleScan(barcode)} 
                        />
                      ))}
                    </div>

                    {featured.length === 0 && (
                      <div className="py-12 md:py-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[2rem] md:rounded-[3rem]">
                         <Search className="text-gray-200 mb-3 md:mb-5" size={36} />
                         <p className="text-gray-400 text-xs md:text-sm font-bold">Loading discovery feed...</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="relative">
                    <button 
                      onClick={() => setIsScanning(false)}
                      className="absolute top-4 left-4 z-20 w-10 h-10 glass rounded-xl flex items-center justify-center text-gray-900 border-white/60 shadow-lg active:scale-90 transition-all"
                    >
                      <ArrowLeftRight size={18} className="rotate-180" />
                    </button>
                    <Scanner onScan={(barcode) => {
                      setIsScanning(false);
                      handleScan(barcode);
                    }} />
                  </div>
                )}
              </div>
            )}

            {screen === 'loading' && (
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)] space-y-5">
                <div className="w-16 h-16 border-4 border-gray-100 border-t-emerald-500 rounded-full animate-spin" />
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Analysing…</h3>
                  <p className="text-gray-500 text-sm font-medium">Running AI risk assessment</p>
                </div>
              </div>
            )}

            {screen === 'error' && (
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)] space-y-4">
                <div className="w-20 h-20 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-center text-rose-500">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-black text-gray-900">Oops!</h3>
                <p className="text-gray-500 text-center px-8 text-sm font-medium leading-relaxed">{errorMsg}</p>
                <button
                  onClick={reset}
                  className="mt-4 px-8 py-3.5 bg-gray-900 text-white rounded-xl font-bold w-full max-w-[200px] active:scale-95 transition-transform shadow-lg shadow-gray-200"
                >
                  Try Again
                </button>
              </div>
            )}

            {screen === 'result' && product && analysis && (
              <div className="animate-in pb-4">
                <NutritionCard data={product} />
                <NutriScoreBadge grade={analysis.nutriScore?.grade} label={analysis.nutriScore?.label} />
                <RiskBadge level={analysis.risk.level} label={analysis.risk.label} />
                <IngredientWarnings warnings={analysis.ingredientWarnings} />
                <RiskExplanation explanation={analysis.explanation} signals={analysis.risk.signals} />
                <Alternatives alternatives={analysis.alternatives} />
                <button
                  onClick={reset}
                  className="mt-6 w-full py-4.5 bg-gray-900 text-white rounded-xl font-bold shadow-xl shadow-gray-200 hover:bg-black transition-all active:scale-[0.98]"
                >
                  Scan Another
                </button>
              </div>
            )}
          </>
        )}

        {tab === 'history' && (
          <div className="animate-in">
            <HistoryView 
              sessionId={SESSION_ID} 
              backendUrl={BACKEND_URL} 
              onProductClick={(barcode) => handleScan(barcode)}
            />
          </div>
        )}

        {tab === 'compare' && (
          <div className="animate-in">
            <CompareView 
              sessionId={SESSION_ID} 
              backendUrl={BACKEND_URL} 
              ageGroup={ageGroup} 
              conditions={authUser?.conditions || []} 
            />
          </div>
        )}

        {tab === 'profile' && (
          <div className="animate-in">
            <ProfilePage
              user={authUser}
              ageGroup={ageGroup}
              token={token}
              onAgeGroupChange={handleAgeGroupChange}
              onLogout={handleLogout}
              onProfileUpdate={handleProfileUpdate}
            />
          </div>
        )}
        </div>
      </main>

      {/* Bottom Nav (Mobile Only) */}
      <nav className="md:hidden shrink-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 z-40 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-stretch w-full max-w-lg mx-auto">
        {TABS.map(({ id, Icon, label }) => {
          const isActive = tab === id;
          return (
            <button
              key={id}
              id={`tab-${id}`}
              onClick={() => { if (id === 'scan') reset(); setTab(id); }}
              className={`flex-1 flex flex-col items-center justify-center py-4 md:py-5 gap-1.5 transition-all relative
                ${isActive ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/4 right-1/4 h-1 bg-emerald-500 rounded-b-full" />
              )}
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
            </button>
          );
        })}
        </div>
      </nav>
      
      <ManualEntry 
        isOpen={isManualOpen} 
        onClose={() => setIsManualOpen(false)} 
        onAnalyze={handleManualAnalyze} 
      />
      </div>
    </div>
  );
}

export default App;
