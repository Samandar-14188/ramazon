import React, { useState, useEffect, useMemo } from 'react';
import { 
  Moon, Sun, CheckCircle2, BookOpen, 
  MapPin, Clock, Calendar, Bell, 
  ChevronDown, RefreshCw, AlertCircle,
  Plus, Minus, Info, Heart, LayoutGrid,
  Download, Smartphone, Apple, Monitor,
  Volume2, Copy, Code2, Sparkles, Share2,
  ExternalLink, ShieldCheck, Zap
} from 'lucide-react';

const APP_ID = 'ramadan-pro-samandar';

const UZBEKISTAN_CITIES = [
  "Toshkent", "Andijon", "Buxoro", "Farg'ona", "Jizzax", "Namangan", 
  "Navoiy", "Qarshi", "Nukus", "Samarqand", "Guliston", "Termiz", "Xiva"
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
        tasbeh: 0 
      };
    }
    return { 
      date: today, 
      prayers: { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false }, 
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
    const dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    setCopyStatus(text);
    setTimeout(() => setCopyStatus(null), 2000);
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
                title: "Saharlik duosi", 
                text: "Navaytu an asuma sovma shahri ramazona minal fajri ilal mag'ribi, xolisan lillahi ta'ala. Allohu akbar.",
                trans: "Ramazon oyining ro'zasini tongdan kun botguncha xolis Alloh uchun tutishni niyat qildim."
              },
              { 
                title: "Iftorlik duosi", 
                text: "Allohumma laka sumtu va bika amantu va 'alayka tavakkaltu va 'ala rizqika aftartu, fag'firli ya g'offaru ma qoddamtu va ma axxortu.",
                trans: "Ey Alloh, Sen uchun ro'za tutdim, Senga iymon keltirdim va bergan rizqing bilan iftor qildim."
              }
            ].map((dua, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative group">
                <div className="flex justify-between items-start mb-4">
                   <h4 className="text-lg font-black text-slate-800">{dua.title}</h4>
                   <button onClick={() => copyToClipboard(dua.text)} className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                      {copyStatus === dua.text ? <CheckCircle2 size={18} className="text-emerald-500"/> : <Copy size={18}/>}
                   </button>
                </div>
                <p className="text-emerald-700 font-medium leading-relaxed mb-4 text-lg">"{dua.text}"</p>
                <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-500 border-l-4 border-emerald-400">
                  {dua.trans}
                </div>
              </div>
            ))}
          </div>
        );
      case 'tasbeh':
        return (
          <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col items-center animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-slate-800 mb-8">Zikrlar</h3>
            <div 
              onClick={() => {
                setProgress(p => ({...p, tasbeh: p.tasbeh + 1}));
                if (navigator.vibrate) navigator.vibrate(50);
              }}
              className="w-64 h-64 rounded-full bg-slate-50 border-[12px] border-emerald-50 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all shadow-inner relative select-none group"
            >
              <span className="text-7xl font-black text-emerald-600 group-hover:scale-110 transition-transform">{progress.tasbeh}</span>
              <div className="absolute inset-2 border border-emerald-100 rounded-full animate-pulse"></div>
            </div>
            <button 
              onClick={() => setProgress(p => ({...p, tasbeh: 0}))}
              className="mt-10 flex items-center gap-2 text-slate-400 font-bold hover:text-rose-500 transition-all"
            >
              <RefreshCw size={16} /> Tozalash
            </button>
          </div>
        );
      case 'download':
        return (
          <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-500">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-3xl font-black mb-4 flex items-center gap-3">
                  <Smartphone size={32} /> Ilovani O'rnatish
                </h3>
                <p className="opacity-90 leading-relaxed text-emerald-50 max-w-lg mb-6">
                  "Ramazon Pro" ilovasini App Store yoki Play Marketdan qidirmasdan, to'g'ridan-to'g'ri telefoningizga o'rnatib oling. Bu Web App (PWA) bo'lib, telefoningiz xotirasini deyarli egallamaydi.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md">
                    <ShieldCheck size={14} className="text-emerald-300" /> Xavfsiz
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md">
                    <Zap size={14} className="text-amber-300" /> Tezkor
                  </div>
                </div>
              </div>
              <Download size={180} className="absolute -bottom-10 -right-10 text-white/10 rotate-12" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* iOS Qo'llanma */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-800 mb-6">
                  <Apple size={28} />
                </div>
                <h4 className="text-xl font-black text-slate-800 mb-4">iPhone / iOS uchun</h4>
                <ul className="space-y-4">
                  {[
                    { step: 1, text: "Safari brauzerida ushbu saytni oching" },
                    { step: 2, text: "Pastki menyudagi 'Ulashish' (Share) tugmasini bosing", icon: <Share2 size={16} /> },
                    { step: 3, text: "Ro'yxatdan 'Ekranga qo'shish' (Add to Home Screen) tanlang", icon: <Plus size={16} /> },
                    { step: 4, text: "Yuqoridagi 'Qo'shish' tugmasini bosing" }
                  ].map((item) => (
                    <li key={item.step} className="flex gap-4">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 text-xs font-black flex items-center justify-center border border-emerald-100">{item.step}</span>
                      <p className="text-sm text-slate-600 flex items-center gap-2">
                        {item.text} {item.icon && <span className="p-1 bg-slate-100 rounded text-slate-800">{item.icon}</span>}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Android Qo'llanma */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
                  <Smartphone size={28} />
                </div>
                <h4 className="text-xl font-black text-slate-800 mb-4">Android uchun</h4>
                <ul className="space-y-4">
                  {[
                    { step: 1, text: "Chrome brauzerida saytni oching" },
                    { step: 2, text: "O'ng tomondagi 'Uch nuqta' menyusiga kiring" },
                    { step: 3, text: "'Ilovani o'rnatish' (Install App) tugmasini bosing" },
                    { step: 4, text: "Tasdiqlash oynasida 'O'rnatish' ni tanlang" }
                  ].map((item) => (
                    <li key={item.step} className="flex gap-4">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 text-xs font-black flex items-center justify-center border border-emerald-100">{item.step}</span>
                      <p className="text-sm text-slate-600">{item.text}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Kompyuter uchun */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm md:col-span-2">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <Monitor size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-800">Kompyuter (Desktop) uchun</h4>
                    <p className="text-sm text-slate-500 mt-1">Chrome yoki Edge brauzerida manzil qatorining o'ng chetida paydo bo'lgan o'rnatish belgisini bosing.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex gap-5 items-start">
               <div className="p-3 bg-white rounded-2xl shadow-sm text-amber-600">
                  <Info size={24}/>
               </div>
               <div>
                  <h5 className="font-black text-amber-900 mb-1 text-lg">Nima uchun o'rnatish kerak?</h5>
                  <p className="text-sm text-amber-800/70 leading-relaxed">
                    Ilovani o'rnatganingizdan so'ng u oflayn rejimda ham ishlaydi, brauzer orqali qidirib o'tirmaysiz va har doim bir tugma masofasida bo'ladi. Hech qanday ortiqcha reklamalarsiz va tezkor.
                  </p>
               </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6 animate-in fade-in duration-700">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-emerald-50 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400"></div>
              {loading ? (
                <div className="py-12 animate-pulse space-y-4">
                  <div className="h-16 w-64 bg-slate-100 mx-auto rounded-2xl"></div>
                  <div className="h-6 w-32 bg-slate-50 mx-auto rounded-full"></div>
                </div>
              ) : (
                <>
                  <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                    {countdown?.label || "Ramazon Muborak"}
                  </div>
                  <h2 className="text-6xl font-black text-slate-800 font-mono tracking-tighter mb-8 tabular-nums">
                    {formatMs(countdown?.time)}
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-3xl bg-amber-50/50">
                      <Sun size={20} className="text-amber-500 mx-auto mb-2" />
                      <p className="text-[10px] font-bold text-amber-800/40 uppercase">Saharlik</p>
                      <p className="text-xl font-black text-amber-900">{timings?.Fajr}</p>
                    </div>
                    <div className="p-4 rounded-3xl bg-indigo-50/50">
                      <Moon size={20} className="text-indigo-500 mx-auto mb-2" />
                      <p className="text-[10px] font-bold text-indigo-800/40 uppercase">Iftorlik</p>
                      <p className="text-xl font-black text-indigo-900">{timings?.Maghrib}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
               <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-6">
                  <CheckCircle2 size={20} className="text-emerald-500"/> Kundalik Amallar
               </h3>
               <div className="grid grid-cols-5 gap-2">
                  {Object.keys(progress.prayers).map(name => (
                    <button 
                      key={name}
                      onClick={() => togglePrayer(name)}
                      className={`flex flex-col items-center p-3 rounded-2xl transition-all border-2 ${
                        progress.prayers[name] 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                        : 'bg-slate-50 border-transparent text-slate-300'
                      }`}
                    >
                      <span className="text-[8px] font-black uppercase mb-1">{name.slice(0,3)}</span>
                      {progress.prayers[name] ? <CheckCircle2 size={16}/> : <div className="w-4 h-4 rounded-full border-2 border-slate-200"/>}
                    </button>
                  ))}
               </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32 lg:pb-10">
      {/* Yon Panel (Desktop) */}
      <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-slate-200 flex-col p-8 z-50">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Moon size={28} fill="currentColor" />
          </div>
          <span className="text-xl font-black text-slate-800">Ramazon<br/><span className="text-emerald-600 text-xs tracking-widest uppercase">Muborak</span></span>
        </div>
        
        <div className="space-y-2 flex-1">
          {[
            { id: 'home', label: 'Asosiy', icon: LayoutGrid },
            { id: 'duas', label: 'Duolar', icon: BookOpen },
            { id: 'tasbeh', label: 'Tasbeh', icon: RefreshCw },
            { id: 'download', label: 'O\'rnatish', icon: Download }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${
                activeTab === item.id ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              <item.icon size={22} /> {item.label}
            </button>
          ))}
        </div>

        {/* Developer Badge */}
        <div className="pt-6 border-t border-slate-100">
           <div className="bg-slate-900 rounded-[2rem] p-5 text-white relative overflow-hidden group">
              <div className="relative z-10">
                 <p className="text-[9px] uppercase tracking-widest text-emerald-400 font-black mb-1">Dasturchi</p>
                 <h4 className="text-sm font-black mb-1">Samandar Nabiyev</h4>
                 <div className="flex items-center gap-2 opacity-50 text-[10px]">
                    <Code2 size={12}/> <span>Full-stack Developer</span>
                 </div>
              </div>
              <Sparkles size={40} className="absolute -bottom-2 -right-2 text-white/5 rotate-12" />
           </div>
        </div>
      </nav>

      <div className="lg:pl-72">
        <header className="bg-emerald-900 text-white pt-12 pb-24 px-6 md:px-12 relative overflow-hidden">
          <div className="max-w-4xl mx-auto flex justify-between items-end relative z-10">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 mb-3 font-bold text-xs uppercase tracking-widest">
                <MapPin size={14} /> {city}
              </div>
              <h1 className="text-4xl font-black mb-6">Xush kelibsiz!</h1>
              <div className="relative inline-block">
                <select 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)}
                  className="appearance-none bg-white/10 border border-white/20 rounded-2xl pl-4 pr-10 py-3 font-bold text-white outline-none cursor-pointer hover:bg-white/20 transition-all"
                >
                  {UZBEKISTAN_CITIES.map(c => <option key={c} value={c} className="text-slate-800">{c}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" size={16} />
              </div>
            </div>
            <div className="text-right hidden sm:block">
               <p className="text-xl font-bold">{new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' })}</p>
               <p className="text-sm opacity-60">Ramazon 1446</p>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 md:px-8 -mt-12 pb-10 relative z-20">
          {renderContent()}

          {/* Mobile Badge */}
          <div className="mt-12 mb-20 lg:hidden flex justify-center">
            <div className="bg-white px-8 py-5 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center">
               <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Dasturchi</span>
               <div className="flex items-center gap-2 text-slate-800 font-black">
                 Samandar Nabiyev <Code2 size={16} className="text-emerald-500" />
               </div>
               <p className="text-[10px] text-slate-400 mt-2">v2.1 • 2025</p>
            </div>
          </div>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 p-5 flex items-center justify-around lg:hidden z-[100] rounded-t-[2.5rem] shadow-2xl">
          {[
            { id: 'home', icon: LayoutGrid },
            { id: 'duas', icon: BookOpen },
            { id: 'tasbeh', icon: RefreshCw },
            { id: 'download', icon: Download }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-3 rounded-2xl transition-all ${
                activeTab === tab.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'
              }`}
            >
              <tab.icon size={24} />
            </button>
          ))}
        </nav>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        body { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
};

export default App;