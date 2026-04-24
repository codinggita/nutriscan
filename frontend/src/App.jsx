import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ScanLine, Camera, History, ArrowLeftRight, User, X } from 'lucide-react';
import ProductCard from './components/ProductCard';
import ProfilePage from './components/ProfilePage';
import HistoryView from './components/HistoryView';
import CompareView from './components/CompareView';
import Scanner from './components/Scanner';

// Static Data for the "Landing Page"
const MOCK_PRODUCTS = [
  {
    barcode: '123456',
    name: 'Classic Potato Chips',
    brand: 'Lay\'s',
    image_url: 'https://images.openfoodfacts.org/images/products/841/019/900/2115/front_en.15.400.jpg',
    per100g: { calories_kcal: 536, sugar_g: 0.5, fat_g: 35 }
  },
  {
    barcode: '789012',
    name: 'Oats & Honey Granola Bar',
    brand: 'Nature Valley',
    image_url: 'https://images.openfoodfacts.org/images/products/001/600/026/4617/front_en.68.400.jpg',
    per100g: { calories_kcal: 440, sugar_g: 28, fat_g: 14 }
  },
  {
    barcode: '345678',
    name: 'Greek Yogurt (Plain)',
    brand: 'Chobani',
    image_url: 'https://images.openfoodfacts.org/images/products/081/829/001/1435/front_en.24.400.jpg',
    per100g: { calories_kcal: 59, sugar_g: 3.6, fat_g: 0.4 }
  },
  {
    barcode: '901234',
    name: 'Dark Chocolate (85%)',
    brand: 'Lindt',
    image_url: 'https://images.openfoodfacts.org/images/products/304/692/002/9759/front_en.112.400.jpg',
    per100g: { calories_kcal: 584, sugar_g: 11, fat_g: 46 }
  }
];

const TABS = [
  { id: 'scan',    Icon: ScanLine,       label: 'Scan'    },
  { id: 'history', Icon: History,        label: 'History' },
  { id: 'compare', Icon: ArrowLeftRight, label: 'Compare' },
  { id: 'profile', Icon: User,           label: 'Profile' },
];

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

function Home() {
  const [activeTab, setActiveTab] = useState('scan');
  const [screen, setScreen] = useState('home'); // 'home' or 'scan'
  const [sessionId] = useState('demo-session');
  const [ageGroup] = useState('adult');

  const handleScan = (barcode) => {
    console.log('Scanned:', barcode);
    setScreen('home');
    // Here we would typically fetch product and show result
    alert(`Scanned Barcode: ${barcode}\n(AI analysis pending backend connection)`);
  };

  return (
    <div className="h-[100dvh] w-full bg-white font-sans flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-5 md:px-10 pt-4 md:pt-5 pb-3 md:pb-4 border-b border-gray-100 flex-shrink-0 bg-white z-10 w-full">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 leading-tight tracking-tight">
              NutriScan <span className="text-emerald-500">AI</span>
            </h1>
            <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">POWERED BY GEMINI</p>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[11px] font-black flex-shrink-0">
              H
            </div>
            <span className="text-gray-700 text-xs font-bold hidden sm:inline">Hi, Harshit</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full">
        <div className="w-full max-w-7xl mx-auto px-5 md:px-10 pt-5 pb-10">
          
          {activeTab === 'scan' && (
            <div className="flex flex-col animate-in pb-10">
              {screen === 'home' ? (
                <>
                  {/* Hero Section */}
                  <div className="relative mb-8 mt-2 md:mt-6 w-full max-w-2xl mx-auto">
                    <div className="relative bg-white rounded-[2.5rem] p-6 md:p-10 text-center border-2 border-gray-900 shadow-[0_6px_0_0_#111827] overflow-hidden flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border-4 border-emerald-50 mb-3 md:mb-5">
                        <ScanLine size={32} className="text-emerald-600" />
                      </div>
                      <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-2 leading-tight tracking-tight">
                        Scan to Reveal Risks.
                      </h2>
                      <p className="text-gray-500 text-xs md:text-sm font-medium mb-4 max-w-xs mx-auto leading-relaxed">
                        Point your camera at any food barcode for an instant AI health breakdown.
                      </p>
                      <button
                        onClick={() => setScreen('scan')}
                        className="w-full max-w-[280px] py-4 bg-emerald-600 text-white rounded-xl font-black text-base uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-transform hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                      >
                        <Camera size={20} className="text-white" />
                        <span>Tap to Scan</span>
                      </button>
                    </div>
                  </div>

                  {/* Explore Grid */}
                  <div className="flex items-center justify-between mb-6 px-1">
                    <div>
                      <h3 className="text-xl font-black text-gray-900 tracking-tight">Explore Snacks</h3>
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Static Discovery Feed</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {MOCK_PRODUCTS.map((prod) => (
                      <ProductCard 
                        key={prod.barcode} 
                        product={prod} 
                        onClick={(barcode) => console.log('Scan:', barcode)} 
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-6 animate-in">
                  <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">AI Barcode Scanner</h2>
                    <button onClick={() => setScreen('home')} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  <Scanner onScan={handleScan} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <HistoryView 
              sessionId={sessionId} 
              backendUrl={BACKEND_URL} 
              onProductClick={(barcode) => console.log('View Product:', barcode)} 
            />
          )}

          {activeTab === 'profile' && <ProfilePage />}

          {activeTab === 'compare' && (
            <CompareView 
              sessionId={sessionId} 
              backendUrl={BACKEND_URL} 
              ageGroup={ageGroup} 
            />
          )}

        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="shrink-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 z-40 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-stretch w-full max-w-lg mx-auto">
          {TABS.map(({ id, Icon, label }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  if (id === 'scan') setScreen('home');
                }}
                className={`flex-1 flex flex-col items-center justify-center py-4 md:py-5 gap-1.5 transition-all relative
                  ${isActive ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/4 right-1/4 h-1 bg-emerald-500 rounded-b-full" />
                )}
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}

export default App;
