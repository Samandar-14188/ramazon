import React, { useState, useEffect, useMemo } from 'react';
import { 
  Moon, CheckCircle2, BookOpen, 
  MapPin, Clock, RefreshCw,
  Plus, Minus, LayoutGrid,
  Download, Smartphone, Apple,
  Copy, Sparkles, ExternalLink, 
  Code2, Calendar, Heart, Share2
} from 'lucide-react';

const APP_ID = 'ramadan-pro-v2-final';

const App = () => {
  const [city] = useState("Toshkent");
  const [timings, setTimings] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [now, setNow] = useState(new Date());
  const [copyStatus, setCopyStatus] = useState(null);

  // State management for progress
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem(`${APP_ID}-progress`);
    const today = new Date().toLocaleDateString();
    if (saved) {
      const data = JSON.parse(saved);
      return data.date === today ? data : { 
        date: today, 
        prayers: { Bomdod: false, Peshin: false, Asr: false, Shom: false, Xufton: false }, 
        tasbeh: 0,
        quran_page: 0
      };
    }
    return { 
      date: today, 
      prayers: { Bomdod: false, Peshin: false, Asr: false, Shom: false, Xufton: false }, 
      tasbeh: 0,
      quran_page: 0
    };
  });

  // Clock Update
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // API Fetch
  useEffect(() => {
    const fetchTimings = async () => {
      try {
        const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=Toshkent&country=Uzbekistan&method=3`);
        const data = await res.json();
        setTimings(data.data.timings);
      } catch (err) {
        console.error("Vaqtlarni yuklashda xatolik:", err);
      }
    };
    fetchTimings();
  }, []);

  // Save Progress
  useEffect(() => {
    localStorage.setItem(`${APP_ID}-progress`, JSON.stringify(progress));
  }, [progress]);

  // Countdown Logic
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

  const formatMs = (ms) => {
    if (!ms) return "00:00:00";
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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

  const renderContent = () => {
    switch(activeTab) {
      case 'home':
        return (
          <div className="space-y-6 w-full max-w-4xl animate-in">
            {/* Hero Section */}
            <div className="bg-[#064e3b] rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
               <div className="flex justify-between items-start mb-10">
                  <div className="bg-white/10 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5 flex items-center gap-2">
                    <Sparkles size={12} className="text-emerald-300"/> Ramazon Rejasi
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase">
                    <MapPin size={14}/> {city}, O'zbekiston
                  </div>
               </div>
               
               <p className="text-xl md:text-3xl font-bold leading-relaxed mb-12 max-w-2xl italic">
                "Sizlarning eng yaxshingiz Qur'onni o'rganib, uni o'rgatganingizdir"
               </p>

               <div className="flex items-center gap-8">
                 <div className="flex flex-col">
                   <span className="text-5xl md:text-6xl font-black">{progress.quran_page} bet</span>
                   <span className="text-[10px] uppercase font-black tracking-widest opacity-40 mt-2">Bugun o'qildi</span>
                 </div>
                 <div className="flex gap-3">
                   <button 
                    onClick={() => setProgress(p => ({...p, quran_page: Math.max(0, p.quran_page - 1)}))} 
                    className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center border border-white/5 transition-all"
                   >
                     <Minus size={24}/>
                   </button>
                   <button 
                    onClick={() => setProgress(p => ({...p, quran_page: p.quran_page + 1}))} 
                    className="w-14 h-14 rounded-2xl bg-[#10b981] hover:bg-[#34d399] flex items-center justify-center shadow-lg transition-all"
                   >
                     <Plus size={24}/>
                   </button>
                 </div>
               </div>

               <div className="mt-10 pt-8 border-t border-white/10 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black opacity-40">Qolgan vaqt</span>
                    <span className="text-3xl font-black font-mono">{formatMs(countdown?.time)}</span>
                  </div>
                  <div className="bg-white/10 px-6 py-3 rounded-2xl text-xs font-black uppercase border border-white/5 flex items-center gap-2">
                    <Clock size={16} className="text-emerald-400"/>
                    {countdown?.label || "Ramazon Mubarak"}
                  </div>
               </div>
            </div>

            {/* Namoz Tracker */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="md:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-emerald-500"/> Kunlik Namozlar
                  </h3>
                  <div className="grid grid-cols-5 gap-3">
                    {Object.keys(progress.prayers).map(name => (
                      <button 
                        key={name}
                        onClick={() => setProgress(p => ({...p, prayers: {...p.prayers, [name]: !p.prayers[name]}}))}
                        className={`flex flex-col items-center p-4 rounded-2xl transition-all border-2 ${
                          progress.prayers[name] ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-transparent text-slate-300'
                        }`}
                      >
                        <span className="text-[9px] font-black uppercase mb-2 truncate w-full text-center">{name}</span>
                        {progress.prayers[name] ? <CheckCircle2 size={20}/> : <div className="w-5 h-5 rounded-full border-2 border-slate-200"/>}
                      </button>
                    ))}
                  </div>
               </div>
               <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jami Zikrlar</span>
                  <span className="text-5xl font-black text-emerald-600">{progress.tasbeh}</span>
                  <button onClick={() => setActiveTab('tasbeh')} className="mt-4 text-xs font-bold text-slate-400 flex items-center gap-1 hover:text-emerald-600 transition-colors">
                    Davom etish <ExternalLink size={12}/>
                  </button>
               </div>
            </div>

            {/* Prayer Times Table */}
            {timings && (
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                  <Calendar size={20} className="text-emerald-500"/> Namoz Vaqtlari
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {[
                    { key: "Fajr", label: "Bomdod" },
                    { key: "Sunrise", label: "Quyosh" },
                    { key: "Dhuhr", label: "Peshin" },
                    { key: "Asr", label: "Asr" },
                    { key: "Maghrib", label: "Shom" },
                    { key: "Isha", label: "Xufton" }
                  ].map(p => (
                    <div key={p.key} className="p-4 bg-slate-50 rounded-2xl text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{p.label}</p>
                      <p className="text-lg font-bold text-slate-800 font-mono">{timings[p.key]}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'duas':
        return (
          <div className="space-y-6 w-full max-w-4xl animate-in">
             <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                      <Heart size={20} fill="currentColor"/>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800">Saharlik Duosi</h3>
                  </div>
                  <button onClick={() => copyToClipboard("Navaytu an asuma sovma shahri ramazona minal fajri ilal mag'ribi, xolisan lillahi ta'ala.")} className="p-3 bg-slate-50 rounded-xl hover:bg-emerald-50 transition-colors group">
                    <Copy size={20} className={copyStatus?.includes("Navaytu") ? "text-emerald-500" : "text-slate-400 group-hover:text-emerald-500"}/>
                  </button>
                </div>
                <p className="text-xl md:text-2xl font-bold text-emerald-800 italic leading-relaxed mb-4">"Navaytu an asuma sovma shahri ramazona minal fajri ilal mag'ribi, xolisan lillahi ta'ala."</p>
                <p className="text-slate-500 font-medium">Ma'nosi: Ramazon oyining ro'zasini tongdan kun botguncha xolis Alloh uchun tutishni niyat qildim.</p>
             </div>

             <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                      <Share2 size={20} fill="currentColor"/>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800">Iftorlik Duosi</h3>
                  </div>
                  <button onClick={() => copyToClipboard("Allohumma laka sumtu va bika amantu va a'layka tavakkaltu va a'la rizqika aftartu.")} className="p-3 bg-slate-50 rounded-xl hover:bg-emerald-50 transition-colors group">
                    <Copy size={20} className={copyStatus?.includes("Allohumma") ? "text-emerald-500" : "text-slate-400 group-hover:text-emerald-500"}/>
                  </button>
                </div>
                <p className="text-xl md:text-2xl font-bold text-emerald-800 italic leading-relaxed mb-4">"Allohumma laka sumtu va bika amantu va a'layka tavakkaltu va a'la rizqika aftartu, faghfirli ma qoddamtu va ma axxortu birohmatika ya arhamar rohimin."</p>
                <p className="text-slate-500 font-medium">Ma'nosi: Ey Alloh, ushbu ro'zamni Sen uchun tutdim va Senga iymon keltirdim va Senga tavakkal qildim va bergan rizqing bilan iftor qildim.</p>
             </div>
          </div>
        );
      case 'tasbeh':
        return (
          <div className="w-full max-w-4xl flex flex-col items-center animate-in">
             <div className="bg-white w-full p-12 md:p-20 rounded-[3rem] border border-slate-100 shadow-xl flex flex-col items-center">
                <div className="flex flex-col items-center mb-10">
                   <h2 className="text-3xl font-black text-slate-800">Elektron Tasbeh</h2>
                   <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Zikr qilishda davom eting</p>
                </div>
                
                <div 
                  onClick={() => setProgress(p => ({...p, tasbeh: p.tasbeh + 1}))}
                  className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-slate-50 border-[12px] border-emerald-50 flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-inner group relative"
                >
                  <div className="absolute inset-0 bg-emerald-500/5 rounded-full scale-0 group-active:scale-100 transition-transform duration-300"></div>
                  <span className="text-7xl md:text-8xl font-black text-emerald-600 z-10">{progress.tasbeh}</span>
                </div>

                <div className="flex gap-4 mt-12">
                   <button onClick={() => setProgress(p => ({...p, tasbeh: 0}))} className="flex items-center gap-2 px-8 py-3 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-all">
                    <RefreshCw size={18}/> Nolga tushirish
                   </button>
                </div>
             </div>
          </div>
        );
      case 'download':
        return (
          <div className="w-full max-w-4xl animate-in">
             <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                
                <div className="flex items-center gap-4 mb-10 relative z-10">
                  <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Download size={32}/>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black italic">Ilovani Yuklash</h2>
                    <p className="text-slate-400 font-medium">Telefoningiz ekraniga joylab oling</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 hover:border-emerald-500/50 transition-colors">
                    <Apple className="mb-4 text-emerald-400" size={32}/>
                    <h3 className="text-xl font-bold mb-4">iOS (iPhone) uchun</h3>
                    <ul className="text-slate-400 text-sm space-y-4">
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                        <span>Saytni <span className="text-white font-bold">Safari</span> brauzerida oching.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                        <span>Pastki menyudagi <span className="text-white font-bold">"Ulashish" (Share)</span> tugmasini bosing.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0">3</span>
                        <span>Ro'yxatdan <span className="text-white font-bold text-emerald-400 italic">"Asosiy ekranga qo'shish"</span> bandini tanlang.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 hover:border-emerald-500/50 transition-colors">
                    <Smartphone className="mb-4 text-emerald-400" size={32}/>
                    <h3 className="text-xl font-bold mb-4">Android uchun</h3>
                    <ul className="text-slate-400 text-sm space-y-4">
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                        <span>Saytni <span className="text-white font-bold">Chrome</span> brauzerida oching.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                        <span>Tepadagi <span className="text-white font-bold">uch nuqtali</span> menyuni bosing.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0">3</span>
                        <span><span className="text-white font-bold text-emerald-400 italic">"Ilovani o'rnatish" (Install App)</span> tugmasini bosing.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-12 p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center relative z-10">
                   <p className="text-emerald-400 text-sm font-bold italic tracking-wide">
                     PWA texnologiyasi orqali ilova telefoningiz xotirasidan juda kam joy oladi va doimiy yangilanib turadi.
                   </p>
                </div>
             </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32 lg:pb-12 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-80 bg-white border-r border-slate-100 flex-col p-10 z-50">
        <div className="flex items-center gap-3 mb-16">
          <div className="w-12 h-12 bg-[#064e3b] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-900/20">
            <Moon size={28} fill="currentColor" />
          </div>
          <span className="text-2xl font-black tracking-tighter">Ramazon<span className="text-emerald-600">Pro</span></span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'home', label: 'Asosiy Sahifa', icon: LayoutGrid },
            { id: 'duas', label: 'Ramazon Duolari', icon: BookOpen },
            { id: 'tasbeh', label: 'Elektron Tasbeh', icon: RefreshCw },
            { id: 'download', label: 'Ilovani Yuklash', icon: Download }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${
                activeTab === item.id 
                ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} /> 
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-slate-100 flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
              <Code2 size={18} className="text-slate-400"/>
           </div>
           <div>
              <p className="text-sm font-black text-slate-800 leading-none">Samandar</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">Premium App</p>
           </div>
        </div>
      </aside>

      {/* Content Area */}
      <div className="lg:ml-80 flex flex-col items-center">
        {/* Mobile Header */}
        <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-5 sticky top-0 z-40 lg:hidden flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#064e3b] rounded-xl flex items-center justify-center text-white">
                <Moon size={20} fill="currentColor" />
              </div>
              <span className="text-xl font-black">Ramazon<span className="text-emerald-600">Pro</span></span>
            </div>
            <div className="bg-emerald-50 px-4 py-2 rounded-xl text-[10px] font-black text-emerald-700 uppercase tracking-widest">
              {city}
            </div>
        </header>

        <main className="w-full px-4 md:px-12 py-10 flex justify-center">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-8 left-6 right-6 bg-slate-900/95 backdrop-blur-2xl border border-white/10 p-3 flex items-center justify-around lg:hidden z-50 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[2.5rem]">
          {[
            { id: 'home', icon: LayoutGrid },
            { id: 'duas', icon: BookOpen },
            { id: 'tasbeh', icon: RefreshCw },
            { id: 'download', icon: Download }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 rounded-[1.8rem] transition-all duration-300 ${
                activeTab === tab.id 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 scale-110' 
                : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <tab.icon size={22} strokeWidth={2.5} />
            </button>
          ))}
      </nav>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@700&display=swap');
        
        body { 
          font-family: 'Plus Jakarta Sans', sans-serif; 
          -webkit-tap-highlight-color: transparent;
        }
        
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(15px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        
        .animate-in { 
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
        }

        /* Smooth scroll for mobile */
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
};

export default App;