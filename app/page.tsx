"use client";

import { useState, useEffect, MouseEvent } from "react";
import { supabase } from "./lib/supabase";
import { UI_TEXT } from "./lib/constants";
import LoginScreen from "./components/LoginScreen";
import Sidebar from "./components/Sidebar";
import AnalysisResult from "./components/AnalysisResult";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [language, setLanguage] = useState("TR");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTier, setActiveTier] = useState<"quick" | "deep">("deep");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<any[]>([]);

  const t = UI_TEXT[language] || UI_TEXT.TR;

  // ━━━ AUTH ━━━
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (session?.user) loadHistory(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadHistory(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Desktop: open sidebar by default
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setSidebarOpen(true); };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Listen for deep analysis upgrade from AnalysisResult CTA
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.ticker) {
        setTicker(detail.ticker);
        setTimeout(() => handleAnalyze("deep"), 100);
      }
    };
    window.addEventListener("triggerDeepAnalysis", handler);
    return () => window.removeEventListener("triggerDeepAnalysis", handler);
  }, [ticker, language]);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setHistory([]);
    setResult(null);
  };

  // ━━━ HISTORY ━━━
  const loadHistory = async (userId: string) => {
    const { data } = await supabase
      .from("analyses").select("*").eq("user_id", userId)
      .order("created_at", { ascending: false }).limit(20);
    if (data) setHistory(data);
  };

  const saveAnalysis = async (analysisResult: any) => {
    if (!user) return;
    const { error } = await supabase.from("analyses").insert({
      user_id: user.id,
      ticker: analysisResult.ticker,
      company_name: analysisResult.company_name,
      final_score: analysisResult.final_score,
      verdict: analysisResult.verdict,
      barrier_triggered: analysisResult.barrier_triggered,
      market_regime: analysisResult.market_regime,
      filter_1_score: analysisResult.filter_1?.score_normalized ?? analysisResult.filter_1?.score,
      filter_2_score: analysisResult.filter_2?.score,
      filter_3_score: analysisResult.filter_3?.score,
      filter_4_score: analysisResult.filter_4?.score,
      full_result: analysisResult,
    });
    if (!error) loadHistory(user.id);
  };

  const handleDelete = async (e: MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm(t.confirmDelete)) return;
    try {
      const res = await fetch(`/api/analyze/delete?id=${id}`, { method: "DELETE" });
      if (res.ok) { setHistory(history.filter((item) => item.id !== id)); setOpenMenuId(null); }
    } catch (err) { console.error("Delete error:", err); }
  };

  const handleDeleteAllHistory = async () => {
    if (!user || !confirm(t.confirmDeleteAll)) return;
    try {
      const res = await fetch(`/api/analyze/delete-all?userId=${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHistory([]);
      setShowSettings(false);
      alert(t.deleteSuccess);
    } catch (err) { console.error("Delete all error:", err); alert(t.deleteFail); }
  };

  // ━━━ ANALYZE ━━━
  const handleAnalyze = async (tier: "quick" | "deep" = "deep") => {
    if (!ticker.trim()) return;
    setActiveTier(tier);
    setLoading(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, language, tier }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed");
      if (data.error) throw new Error(data.error);
      setResult(data);
      if (user) saveAnalysis(data);
    } catch (err: any) { setError(err.message || "An error occurred"); }
    finally { setLoading(false); }
  };

  // ━━━ SCREENS ━━━
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0908] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#1A1610] border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <LoginScreen language={language} onSignIn={signInWithGoogle} />;

  return (
    <div className="min-h-screen bg-[#0A0908] text-[#E0D4B8] flex">
      <Sidebar
        user={user} language={language} isOpen={sidebarOpen} history={history}
        showSettings={showSettings} openMenuId={openMenuId} t={t}
        onToggle={() => setSidebarOpen(!sidebarOpen)} onSignOut={signOut}
        onToggleSettings={() => setShowSettings(!showSettings)}
        onLanguageToggle={() => setLanguage(language === "TR" ? "EN" : "TR")}
        onDeleteAll={handleDeleteAllHistory}
        onNewAnalysis={() => { setResult(null); setTicker(""); setError(""); }}
        onLoadAnalysis={(item) => setResult(item.full_result)}
        onDeleteItem={handleDelete}
        onToggleMenu={(id) => setOpenMenuId(openMenuId === id ? null : id)}
      />

      <div className="flex-1 overflow-y-auto min-w-0">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 bg-[#0A0908]/90 backdrop-blur-sm border-b border-[#1A1610]/50 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-9 h-9 bg-[#13110E] border border-[#2A2520] rounded-lg flex items-center justify-center text-[#605030] hover:text-[#D4C8A0] transition-colors cursor-pointer flex-shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-red-600 to-purple-700 flex items-center justify-center text-[9px] font-black text-white">A</div>
            <span className="font-mono text-[10px] font-bold tracking-[3px] text-red-500">ALİ AGENT</span>
          </div>
        </div>

        {/* Desktop sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex fixed top-4 z-30 w-8 h-8 bg-[#13110E] border border-[#2A2520] rounded-lg items-center justify-center text-[#605030] hover:text-[#D4C8A0] transition-colors cursor-pointer"
          style={{ left: sidebarOpen ? "296px" : "16px" }}
        >
          {sidebarOpen ? "◀" : "▶"}
        </button>

        <div className="max-w-3xl mx-auto px-4 py-6 sm:py-12">
          {/* Desktop header */}
          <div className="text-center mb-8 sm:mb-10 hidden sm:block">
            <div className="inline-flex items-center gap-3 mb-4 px-5 py-2 bg-[#0F0D0A] border border-[#1A1610] rounded-full">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-red-600 to-purple-700 flex items-center justify-center text-[11px] font-black text-white">A</div>
              <span className="font-mono text-xs font-bold tracking-[4px] text-red-500">ALİ AGENT V2.0</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#F0E8D0] mb-2">{t.title}</h1>
            <p className="text-sm text-[#605030]">{t.subtitle}</p>
          </div>

          {/* Mobile header */}
          <div className="text-center mb-6 sm:hidden">
            <h1 className="text-2xl font-bold text-[#F0E8D0] mb-1">{t.title}</h1>
            <p className="text-xs text-[#605030]">{t.subtitle}</p>
          </div>

          {/* Search */}
          <div className="mb-6 sm:mb-8">
            <div className="flex gap-2 bg-[#0D0B08] border border-[#1A1610] rounded-xl sm:rounded-2xl p-1 sm:p-1.5">
              <input
                type="text" value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze("quick")}
                placeholder="AAPL, MSFT, THYAO..."
                disabled={loading}
                className="flex-1 min-w-0 px-3 sm:px-5 py-3 sm:py-4 bg-transparent text-lg sm:text-xl font-mono font-bold text-[#F0E8D0] placeholder-[#40382A] outline-none tracking-wider sm:tracking-widest"
              />
              {/* Quick analyze button */}
              <button
                onClick={() => handleAnalyze("quick")}
                disabled={loading || !ticker.trim()}
                className="px-3 sm:px-5 py-3 sm:py-4 bg-[#1A1610] hover:bg-[#2A2520] disabled:opacity-40 text-[#D4C8A0] text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl tracking-wider transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 active:scale-[0.98] border border-[#2A2520]"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-[#605030] border-t-[#A08050] rounded-full animate-spin" />
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    <span className="hidden sm:inline">{language === "TR" ? "HIZLI" : "QUICK"}</span>
                  </>
                )}
              </button>
              {/* Deep analyze button */}
              <button
                onClick={() => handleAnalyze("deep")}
                disabled={loading || !ticker.trim()}
                className="px-3 sm:px-6 py-3 sm:py-4 bg-red-700 hover:bg-red-600 disabled:bg-[#1A1610] disabled:text-[#605030] text-white text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl tracking-wider transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 active:scale-[0.98]"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-[#605030] border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span className="hidden sm:inline">{language === "TR" ? "DERİN ANALİZ" : "DEEP ANALYSIS"}</span>
                  </>
                )}
              </button>
            </div>
            {/* Tier açıklaması */}
            <div className="flex justify-end gap-4 mt-2 px-1">
              <span className="text-[10px] text-[#504020]">
                <span className="text-[#605030]">⚡</span> {language === "TR" ? "Hızlı: ~10 sn, temel skor" : "Quick: ~10s, basic score"}
              </span>
              <span className="text-[10px] text-[#504020]">
                <span className="text-red-500/60">◉</span> {language === "TR" ? "Derin: ~60 sn, tam rapor" : "Deep: ~60s, full report"}
              </span>
            </div>
          </div>

          {/* States */}
          {loading && (
            <div className="text-center py-12 sm:py-16">
              <div className={`w-12 h-12 border-2 border-[#1A1610] rounded-full animate-spin mx-auto mb-5 ${
                activeTier === "quick" ? "border-t-[#A09060]" : "border-t-red-500"
              }`} />
              <p className="text-[#605030] animate-pulse text-sm sm:text-base px-4">
                {activeTier === "quick"
                  ? (language === "TR" ? "Hızlı analiz yapılıyor..." : "Running quick analysis...")
                  : t.loading1}
              </p>
              <p className="text-[#40382A] text-xs mt-2">
                {activeTier === "quick"
                  ? (language === "TR" ? "Bu işlem 5-10 saniye sürer." : "This takes about 5-10 seconds.")
                  : t.loading2}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 sm:p-5 mb-6">
              <p className="text-red-400 font-bold mb-1 text-sm">{t.error}</p>
              <p className="text-[#C8A080] text-xs sm:text-sm">{error}</p>
            </div>
          )}

          {result && !loading && <AnalysisResult result={result} language={language} />}
        </div>
      </div>
    </div>
  );
}
