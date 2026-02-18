import React, { useState, useEffect, useMemo } from 'react';
import { 
  Moon, Sun, CheckCircle2, BookOpen, 
  MapPin, Clock, Calendar, Bell, 
  ChevronDown, RefreshCw, AlertCircle,
  Plus, Minus, Info, Heart, LayoutGrid,
  Settings, User, MessageCircle, Copy, Volume2, Share2
} from 'lucide-react';

const APP_ID = 'ramadan-pro-ultimate-v1';

const UZBEKISTAN_CITIES = [
  "Toshkent", "Andijon", "Buxoro", "Farg'ona", "Jizzax", "Namangan", 
  "Navoiy", "Qarshi", "Nukus", "Samarqand", "Guliston", "Termiz", "Xiva"
];

const DAILY_QUOTES = [
  { text: "Ramazon sabr oyidir, sabrning mukofoti esa Jannatdir.", source: "Hadis" },
  { text: "Sizlarga Ramazon oyi keldi. U muborak oydir...", source: "Hadis" },
  { text: "Ro'za tutinglar, sog'lom bo'lasizlar.", source: "Hadis" },
  { text: "Kim iymon bilan, savob umidida Ramazon ro'zasini tutsa, o'tgan gunohlari mag'firat qilinadi.", source: "Buxoriy rivoyati" }
];

const App = () => {
  const [city, setCity] = useState(() => localStorage.getItem(`${APP_ID}-city`) || "Toshkent");
  const [timings, setTimings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [now, setNow] = useState(new Date());
  const [copyStatus, setCopyStatus] = useState(null);

  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem(`${APP_ID}-progress`);
    const today = new Date().toLocaleDateString();
    if (saved) {
      const data = JSON.parse(saved);
      return data.date === today ? data : { 
        date: today, 
        prayers: { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false }, 
        quran: 0, 
        tasbeh: 0 
      };
    }
    return { 
      date: today, 
      prayers: { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false }, 
      quran: 0, 
      tasbeh: 0 
    };
  });

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchTimings = async (targetCity) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/timingsByCity?city=${targetCity}&country=Uzbekistan&method=3`
      );
      const data = await response.json();
      setTimings(data.data.timings);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimings(city);
    localStorage.setItem(`${APP_ID}-city`, city);
  }, [city]);

  useEffect(() => {
    localStorage.setItem(`${APP_ID}-progress`, JSON.stringify(progress));
  }, [progress]);

  const countdown = useMemo(() => {
    if (!timings) return null;
    const parseTime = (timeStr) => {
      const [h, m] = timeStr.split(':');
      const d = new Date();
      d.setHours(parseInt(h), parseInt(m), 0);
      return d;
    };
    const shom = parseTime(timings.Maghrib);
    const bomdod = parseTime(timings.Fajr);
    
    if (now < bomdod) return { label: "Saharlikgacha", time: bomdod - now };
    if (now < shom) return { label: "Iftorlikgacha", time: shom - now };
    return { label: "Iftorlik bo'ldi", time: null };
  }, [timings, now]);

  const togglePrayer = (name) => {
    setProgress(p => ({
      ...p,
      prayers: { ...p.prayers, [name]: !p.prayers[name] }
    }));
  };

  const copyToClipboard = (text) => {
    document.execCommand('copy'); // iFrame restriction friendly
    const dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    setCopyStatus(text);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'uz-UZ';
    window.speechSynthesis.speak(utterance);
  };

  const formatMs = (ms) => {
    if (!ms) return "00:00:00";
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'duas':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            {[
              { 
                title: "Saharlik duosi (Og'iz yopish)", 
                text: "Navaytu an asuma sovma shahri ramazona minal fajri ilal mag'ribi, xolisan lillahi ta'ala. Allohu akbar.",
                trans: "Ramazon oyining ro'zasini tongdan kun botguncha xolis Alloh uchun tutishni niyat qildim."
              },
              { 
                title: "Iftorlik duosi (Og'iz ochish)", 
                text: "Allohumma laka sumtu va bika amantu va 'alayka tavakkaltu va 'ala rizqika aftartu, fag'firli ya g'offaru ma qoddamtu va ma axxortu.",
                trans: "Ey Alloh, Sen uchun ro'za tutdim, Senga iymon keltirdim, Senga tavakkal qildim va bergan rizqing bilan iftor qildim."
              }
            ].map((dua, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative group">
                <div className="flex justify-between items-start mb-4">
                   <h4 className="text-lg font-black text-slate-800">{dua.title}</h4>
                   <div className="flex gap-2">
                     <button onClick={() => speak(dua.text)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100"><Volume2 size={18}/></button>
                     <button onClick={() => copyToClipboard(dua.text)} className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100">
                        {copyStatus === dua.text ? <CheckCircle2 size={18} className="text-emerald-500"/> : <Copy size={18}/>}
                     </button>
                   </div>
                </div>
                <p className="text-emerald-700 font-medium leading-relaxed mb-4 text-lg">"{dua.text}"</p>
                <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-500 border-l-4 border-emerald-400">
                  <span className="font-bold text-slate-700 block mb-1 uppercase text-[10px]">Ma'nosi</span>
                  {dua.trans}
                </div>
              </div>
            ))}
          </div>
        );
      case 'tasbeh':
        return (
          <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col items-center animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-slate-800 mb-2">Zikrlar</h3>
            <div className="flex gap-2 mb-8">
               {['Subhanalloh', 'Alhamdulillah', 'Allohu Akbar'].map(z => (
                 <button key={z} className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-bold text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all">{z}</button>
               ))}
            </div>
            <div 
              onClick={() => {
                setProgress(p => ({...p, tasbeh: p.tasbeh + 1}));
                if ('vibrate' in navigator) navigator.vibrate(50);
              }}
              className="w-72 h-72 rounded-full bg-slate-50 border-[16px] border-emerald-50 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all shadow-inner relative select-none"
            >
              <span className="text-8xl font-black text-emerald-600">{progress.tasbeh}</span>
              <div className="absolute inset-2 border border-emerald-100 rounded-full animate-pulse"></div>
            </div>
            <button 
              onClick={() => setProgress(p => ({...p, tasbeh: 0}))}
              className="mt-10 flex items-center gap-2 text-slate-400 font-bold hover:text-rose-500 transition-all"
            >
              <RefreshCw size={16} /> Hisobni yangilash
            </button>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 animate-in slide-in-from-right-4 duration-500">
            <h3 className="text-2xl font-black text-slate-800 mb-6">Ilova sozlamalari</h3>
            <div className="space-y-4">
              <div className="p-5 bg-slate-50 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-700">Bildirishnomalar</p>
                  <p className="text-xs text-slate-400">Namoz vaqtlari va eslatmalar</p>
                </div>
                <div className="w-12 h-6 bg-emerald-500 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl flex items-center justify-between">
                 <div>
                    <p className="font-bold text-slate-700">Tungi rejim</p>
                    <p className="text-xs text-slate-400">Avtomatik o'tish</p>
                 </div>
                 <div className="w-12 h-6 bg-slate-200 rounded-full relative"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
              </div>
              <div className="pt-10 text-center">
                 <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4"><Heart fill="currentColor"/></div>
                 <p className="text-sm font-bold text-slate-800">Ramazon PRO v2.0</p>
                 <p className="text-xs text-slate-400 px-10">Ushbu ilova Ramazon oyida sizga yordamchi bo'lishi niyatida yaratildi.</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6 animate-in fade-in duration-700">
            {/* Countdown Card */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-emerald-50 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400"></div>
              {loading ? (
                <div className="py-12 animate-pulse space-y-4">
                  <div className="h-4 w-32 bg-slate-100 mx-auto rounded-full"></div>
                  <div className="h-16 w-64 bg-slate-100 mx-auto rounded-2xl"></div>
                </div>
              ) : (
                <>
                  <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                    {countdown?.label || "Ramazon Muborak"}
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black text-slate-800 font-mono tracking-tighter mb-8 tabular-nums">
                    {formatMs(countdown?.time)}
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center p-4 rounded-3xl bg-amber-50/50 group-hover:scale-105 transition-transform">
                      <Sun size={20} className="text-amber-500 mb-2" />
                      <span className="text-[10px] font-bold text-amber-800/40 uppercase">Saharlik</span>
                      <span className="text-xl font-black text-amber-900">{timings?.Fajr}</span>
                    </div>
                    <div className="flex flex-col items-center p-4 rounded-3xl bg-indigo-50/50 group-hover:scale-105 transition-transform">
                      <Moon size={20} className="text-indigo-500 mb-2" />
                      <span className="text-[10px] font-bold text-indigo-800/40 uppercase">Iftorlik</span>
                      <span className="text-xl font-black text-indigo-900">{timings?.Maghrib}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Daily Wisdom */}
            <div className="bg-slate-900 text-white p-6 rounded-[2rem] relative overflow-hidden">
               <div className="relative z-10">
                 <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Kun hikmati</p>
                 <p className="text-sm md:text-base font-medium italic opacity-90 leading-relaxed">"{DAILY_QUOTES[now.getDate() % DAILY_QUOTES.length].text}"</p>
                 <p className="text-[10px] mt-2 opacity-50">— {DAILY_QUOTES[now.getDate() % DAILY_QUOTES.length].source}</p>
               </div>
               <div className="absolute top-0 right-0 p-4 opacity-10"><BookOpen size={80}/></div>
            </div>

            {/* Prayer Checklist */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-emerald-500"/> Amallar
                 </h3>
                 <span className="text-[10px] font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-500">
                   {Object.values(progress.prayers).filter(Boolean).length}/5 Namoz
                 </span>
               </div>
               <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {Object.keys(progress.prayers).map(name => (
                    <button 
                      key={name}
                      onClick={() => togglePrayer(name)}
                      className={`flex flex-col items-center p-3 rounded-2xl transition-all border-2 ${
                        progress.prayers[name] 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                        : 'bg-slate-50 border-transparent text-slate-400'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase mb-1">{name === 'Fajr' ? 'Bom' : name === 'Dhuhr' ? 'Pes' : name === 'Asr' ? 'Asr' : name === 'Maghrib' ? 'Sho' : 'Xuf'}</span>
                      {progress.prayers[name] ? <CheckCircle2 size={16}/> : <div className="w-4 h-4 rounded-full border-2 border-slate-200"/>}
                    </button>
                  ))}
               </div>
            </div>

            {/* Quran Stats */}
            <div className="bg-emerald-600 text-white p-8 rounded-[2.5rem] shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-70 mb-1">Qur'on mutolaasi</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">{progress.quran}</span>
                    <span className="text-xs font-bold opacity-70">sahifa</span>
                  </div>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => setProgress(p => ({...p, quran: Math.max(0, p.quran - 1)}))} className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30"><Minus size={18}/></button>
                   <button onClick={() => setProgress(p => ({...p, quran: p.quran + 1}))} className="w-10 h-10 bg-white rounded-xl text-emerald-700 flex items-center justify-center hover:bg-emerald-50"><Plus size={18}/></button>
                </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 lg:pb-0">
      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 flex-col p-8 z-50">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Moon size={28} fill="currentColor" />
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tight">Ramazon<br/><span className="text-emerald-600 text-sm uppercase tracking-widest">Pro Edition</span></span>
        </div>
        <div className="space-y-2">
          {[
            { id: 'home', label: 'Asosiy', icon: LayoutGrid },
            { id: 'duas', label: 'Duolar', icon: BookOpen },
            { id: 'tasbeh', label: 'Tasbeh', icon: RefreshCw },
            { id: 'settings', label: 'Sozlamalar', icon: Settings }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${
                activeTab === item.id ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <item.icon size={22} /> {item.label}
            </button>
          ))}
        </div>
        <div className="mt-auto p-4 bg-slate-50 rounded-2xl">
           <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Sizning Shahar</p>
           <div className="flex items-center justify-between text-sm font-bold text-slate-700">
              {city} <MapPin size={14}/>
           </div>
        </div>
      </nav>

      <div className="lg:pl-64">
        {/* Modern Header */}
        <header className="bg-emerald-900 text-white pt-12 pb-24 px-6 md:px-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
          <div className="max-w-4xl mx-auto flex justify-between items-end relative z-10">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 mb-3 font-bold text-xs uppercase tracking-[0.3em]">
                <MapPin size={14} /> Ramazon 2025
              </div>
              <h1 className="text-3xl md:text-4xl font-black mb-4">Assalomu Alaykum</h1>
              <select 
                value={city} 
                onChange={(e) => setCity(e.target.value)}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2 font-bold text-white outline-none focus:ring-2 ring-emerald-400"
              >
                {UZBEKISTAN_CITIES.map(c => <option key={c} value={c} className="text-slate-800">{c}</option>)}
              </select>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-5xl font-black text-emerald-400 opacity-20 mb-[-10px]">1446</p>
              <p className="text-xl font-bold">{new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' })}</p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="max-w-4xl mx-auto px-4 md:px-8 -mt-12 pb-20 relative z-20">
          {renderContent()}
        </main>

        {/* Mobile Bottom Navigation - Improved Aesthetics */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-slate-100 p-3 flex items-center justify-around lg:hidden z-[100] rounded-t-[2.5rem] shadow-2xl">
          {[
            { id: 'home', label: 'Bosh', icon: LayoutGrid },
            { id: 'duas', label: 'Duo', icon: BookOpen },
            { id: 'tasbeh', label: 'Zikr', icon: RefreshCw },
            { id: 'settings', label: 'Soz', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all relative ${
                activeTab === tab.id ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              {activeTab === tab.id && <div className="absolute top-0 w-1 h-1 bg-emerald-600 rounded-full"></div>}
              <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .font-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        select { -webkit-appearance: none; appearance: none; }
        body { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
};

export default App;