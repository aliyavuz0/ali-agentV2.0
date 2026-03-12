"use client";

import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";

// ═══ CONSTANTS ═══
const FILTER_META = [
  { key: "filter_1", label: "Finansal Kalite", role: "MOTOR", color: "#EF4444", icon: "⚙" },
  { key: "filter_2", label: "Makro & Likidite", role: "HAVA DURUMU", color: "#3B82F6", icon: "☁" },
  { key: "filter_3", label: "CANSLIM Momentum", role: "YAKIT", color: "#22C55E", icon: "⚡" },
  { key: "filter_4", label: "Değerleme & Risk", role: "EMNİYET KEMERİ", color: "#A855F7", icon: "🛡" },
];

const SUB_NAMES: Record<string, string> = {
  finansallar: "Finansallar", hendek: "Hendek (Moat)", potansiyel: "Potansiyel Analizi",
  gelir_kalitesi: "Gelir Kalitesi", musteri: "Müşteri Analizi", yonetim: "Yönetim & Kültür",
  hisse_performans: "Hisse Performansı", fcf: "Serbest Nakit Akışı",
  likidite_mb: "Likidite & MB Politikası", enflasyon_tahvil: "Enflasyon & Tahvil",
  sektorel_uyum: "Sektörel Uyum", buyuk_bahis: "Büyük Bahis Güveni",
  c_quarterly_eps: "C — Çeyreklik EPS", a_annual_eps: "A — Yıllık EPS (3Y)",
  n_new: "N — Yeni Ürün/Yönetim", s_supply_demand: "S — Arz & Talep",
  l_leader: "L — Lider/Takipçi", i_institutional: "I — Kurumsal Sponsorluk",
  m_market: "M — Piyasa Yönü", degerleme: "Değerleme", risk: "Sistematik Risk",
  dilusyon: "Dilüsyon", tam_growth: "TAM & Büyüme", makro_duyarlilik: "Makro Duyarlılık",
};

const REGIME_LABELS: Record<string, { label: string; color: string }> = {
  normal: { label: "Normal Piyasa", color: "#F59E0B" },
  bear: { label: "Ayı Piyasası", color: "#EF4444" },
  bull: { label: "Boğa Piyasası", color: "#22C55E" },
};

const EXIT_COLORS: Record<string, string> = {
  TEZ_CURUME: "#EF4444", DEGERLEME_BALONU: "#F97316",
  MAKRO_STOP: "#DC2626", MOMENTUM_KAYBI: "#A855F7",
};

const EXIT_LABELS: Record<string, string> = {
  TEZ_CURUME: "TEZ ÇÜRÜME", DEGERLEME_BALONU: "DEĞERLEME BALONU",
  MAKRO_STOP: "MAKRO STOP-LOSS", MOMENTUM_KAYBI: "MOMENTUM KAYBI",
};

const AUDIT_LABELS: Record<string, string> = {
  duplicate_check: "Mükerrer Puanlama", math_verification: "Matematik Sağlama",
  optimism_check: "İyimserlik Testi", thesis_conflict: "Tez Çelişkisi",
};

export default function Home() {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [expandedFilter, setExpandedFilter] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  // ═══ AUTH ═══
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

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "https://ali-agent-v2-0.vercel.app/auth/callback" },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);

    setHistory([]);
    setResult(null);
  };

  // ═══ HISTORY ═══
  const loadHistory = async (userId: string) => {
    const { data } = await supabase
      .from("analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
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
    const handleDelete = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation(); // Butona tıklayınca analizin açılmasını engeller
      if (!confirm("Bu analizi silmek istediğine emin misin?")) return;

      try {
        const res = await fetch(`/api/analyze/delete?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          setHistory(history.filter(item => item.id !== id));
          setOpenMenuId(null);
        }
      } catch (err) {
        console.error("Silme hatası:", err);
      }
    };

    const loadPastAnalysis = (item: any) => {
      setResult(item.full_result);
      setExpandedFilter(null);
    };

    // ═══ ANALYZE ═══
    const handleAnalyze = async () => {
      if (!ticker.trim()) return;
      setLoading(true);
      setError("");
      setResult(null);
      setExpandedFilter(null);

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker: ticker.trim().toUpperCase() }),
        });
        if (!res.ok) throw new Error("Analiz başarısız oldu");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setResult(data);
        if (user) saveAnalysis(data);
      } catch (err: any) {
        setError(err.message || "Bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    // ═══ HELPERS ═══
    const getFilterScore = (filterKey: string) => {
      if (!result) return 0;
      if (filterKey === "filter_1") return result.filter_1?.score_normalized ?? 0;
      return result[filterKey]?.score ?? 0;
    };

    const getScoreColor = (score: number) =>
      score >= 80 ? "text-green-500" : score >= 60 ? "text-yellow-500" : "text-red-500";

    const getBarColor = (score: number) =>
      score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500";

    const getBgColor = (score: number) =>
      score >= 80 ? "#22C55E" : score >= 60 ? "#F59E0B" : "#EF4444";

    const regime = result ? REGIME_LABELS[result.market_regime] || REGIME_LABELS.normal : null;

    // ═══ AUTH LOADING ═══
    if (authLoading) {
      return (
        <div className="min-h-screen bg-[#0A0908] flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-[#1A1610] border-t-red-500 rounded-full animate-spin" />
        </div>
      );
    }

    // ═══ LOGIN SCREEN ═══
    if (!user) {
      return (
        <div className="min-h-screen bg-[#0A0908] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center gap-3 mb-6 px-5 py-2 bg-[#0F0D0A] border border-[#1A1610] rounded-full">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-red-600 to-purple-700 flex items-center justify-center text-[11px] font-black text-white">A</div>
              <span className="font-mono text-xs font-bold tracking-[4px] text-red-500">ALİ AGENT V2.0</span>
            </div>
            <h1 className="text-4xl font-bold text-[#F0E8D0] mb-3">Dörtlü Süzgeç Analiz Motoru</h1>
            <p className="text-[#605030] mb-8">Hisse senetlerini AI ile acımasızca analiz et. 4 süzgeç, dinamik ağırlıklandırma, öz-denetim protokolü.</p>
            <button
              onClick={signInWithGoogle}
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#13110E] border border-[#2A2520] rounded-xl text-[#F0E8D0] font-semibold hover:border-[#4A4530] transition-colors cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google ile Giriş Yap
            </button>
            <p className="text-[#40382A] text-xs mt-6">Giriş yaparak analizlerini kaydedebilir ve geçmişine erişebilirsin.</p>
          </div>
        </div>
      );
    }

    // ═══ MAIN APP ═══
    return (
      <div className="min-h-screen bg-[#0A0908] text-[#E0D4B8] flex">

        {/* ═══ SIDEBAR ═══ */}
        <div className={`${sidebarOpen ? "w-72" : "w-0"} transition-all duration-300 overflow-hidden flex-shrink-0 border-r border-[#1A1610] bg-[#0D0B08]`}>
          <div className="w-72 h-screen flex flex-col">
            {/* User Profile */}
            <div className="p-4 border-b border-[#1A1610]">
              <div className="flex items-center gap-3">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-9 h-9 rounded-full" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-red-700 flex items-center justify-center text-white text-sm font-bold">
                    {user.email?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#D4C8A0] truncate">
                    {user.user_metadata?.full_name || user.email}
                  </p>
                  <p className="text-[10px] text-[#605030] truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={signOut}
                className="mt-3 w-full py-2 text-xs text-[#605030] hover:text-red-400 border border-[#1A1610] rounded-lg transition-colors cursor-pointer"
              >
                Çıkış Yap
              </button>
            </div>

            {/* New Analysis Button */}
            <div className="p-3">
              <button
                onClick={() => { setResult(null); setTicker(""); setError(""); setExpandedFilter(null); }}
                className="w-full py-3 bg-red-700/20 border border-red-700/30 rounded-lg text-red-400 text-sm font-bold hover:bg-red-700/30 transition-colors cursor-pointer"
              >
                + Yeni Analiz
              </button>
            </div>

            {/* History */}
            <div className="flex-1 overflow-y-auto px-3 pb-3">
              <p className="text-[10px] font-bold text-[#504020] tracking-widest mb-2 px-1">GEÇMİŞ ANALİZLER</p>
              {history.length === 0 ? (
                <p className="text-xs text-[#40382A] px-1">Henüz analiz yok.</p>
              ) : (
                {
                  history.length === 0 ? (
                    <p className="text-xs text-[#40382A] px-1">Henüz analiz yok.</p>
                  ) : (
                    history.map((item) => {
                      const scoreColor = item.final_score >= 80 ? "#22C55E" : item.final_score >= 60 ? "#F59E0B" : "#EF4444";
                      return (
                        <div
                          key={item.id}
                          className="relative w-full p-3 mb-1 rounded-lg hover:bg-[#13110E] transition-colors cursor-pointer group"
                          onClick={() => loadPastAnalysis(item)}
                        >
                          {/* Üç Nokta Butonu */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === item.id ? null : item.id);
                            }}
                            className="absolute top-3 right-2 p-1 hover:bg-[#1A1610] rounded-md opacity-0 group-hover:opacity-100 transition-all z-10"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#605030" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
                            </svg>
                          </button>

                          {/* Açılır Menü (Analizi Sil) */}
                          {openMenuId === item.id && (
                            <div className="absolute top-8 right-2 w-32 bg-[#0F0D0A] border border-[#1A1610] rounded-lg shadow-2xl z-50 overflow-hidden">
                              <button
                                onClick={(e) => handleDelete(e, item.id)}
                                className="w-full text-left px-3 py-2 text-[10px] font-bold text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                </svg>
                                ANALİZİ SİL
                              </button>
                            </div>
                          )}

                          {/* Analiz Bilgileri */}
                          <div className="flex justify-between items-center pr-6">
                            <span className="font-mono text-sm font-bold text-[#D4C8A0] group-hover:text-[#F0E8D0]">
                              {item.ticker}
                            </span>
                            <span className="font-mono text-sm font-bold" style={{ color: scoreColor }}>
                              {item.final_score?.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1 pr-6">
                            <span className="text-[10px] text-[#504020]">
                              {new Date(item.created_at).toLocaleDateString("tr-TR")}
                            </span>
                            <span className="text-[10px] font-bold" style={{ color: scoreColor }}>
                              {item.verdict === "MUKEMMEL" ? "MÜKEMMEL" : item.verdict === "KABULEDILEBILIR" ? "KABUL" : "TAVSİYE EDİLMEZ"}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )
                }
          </div>
          </div>
        </div>

        {/* ═══ MAIN CONTENT ═══ */}
        <div className="flex-1 overflow-y-auto">
          {/* Toggle Sidebar */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed top-4 left-4 z-50 w-8 h-8 bg-[#13110E] border border-[#2A2520] rounded-lg flex items-center justify-center text-[#605030] hover:text-[#D4C8A0] transition-colors cursor-pointer"
            style={{ left: sidebarOpen ? "296px" : "16px" }}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>

          <div className="max-w-3xl mx-auto px-4 py-12">
            {/* HEADER */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-3 mb-4 px-5 py-2 bg-[#0F0D0A] border border-[#1A1610] rounded-full">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-red-600 to-purple-700 flex items-center justify-center text-[11px] font-black text-white">A</div>
                <span className="font-mono text-xs font-bold tracking-[4px] text-red-500">ALİ AGENT V2.0</span>
              </div>
              <h1 className="text-4xl font-bold text-[#F0E8D0] mb-2">Dörtlü Süzgeç Analiz Motoru</h1>
              <p className="text-sm text-[#605030]">Ticker gir, AI verileri toplar ve 4 süzgeçten geçirir.</p>
            </div>

            {/* SEARCH */}
            <div className="flex gap-2 mb-8 bg-[#0D0B08] border border-[#1A1610] rounded-2xl p-1.5">
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                placeholder="AAPL, MSFT, NVDA..."
                disabled={loading}
                className="flex-1 px-5 py-4 bg-transparent text-xl font-mono font-bold text-[#F0E8D0] placeholder-[#40382A] outline-none tracking-widest"
              />
              <button
                onClick={handleAnalyze}
                disabled={loading || !ticker.trim()}
                className="px-8 py-4 bg-red-700 hover:bg-red-600 disabled:bg-[#1A1610] disabled:text-[#605030] text-white font-bold rounded-xl tracking-wider transition-all flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-[#605030] border-t-[#A08050] rounded-full animate-spin" /> ANALİZ...</>
                ) : "ANALİZ ET"}
              </button>
            </div>

            {/* LOADING */}
            {loading && (
              <div className="text-center py-16">
                <div className="w-12 h-12 border-2 border-[#1A1610] border-t-red-500 rounded-full animate-spin mx-auto mb-5" />
                <p className="text-[#605030] animate-pulse">Ali Agent çalışıyor... Veriler toplanıyor, süzgeçler puanlanıyor...</p>
                <p className="text-[#40382A] text-xs mt-2">Bu işlem 30-60 saniye sürebilir.</p>
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 mb-6">
                <p className="text-red-400 font-bold mb-1">Hata</p>
                <p className="text-[#C8A080] text-sm">{error}</p>
              </div>
            )}

            {/* RESULTS */}
            {result && !loading && (
              <div className="space-y-5">
                {/* Final Score */}
                <div className="text-center py-10 rounded-2xl border border-[#1A1610] bg-[#0D0B08]">
                  <p className="font-mono text-sm text-[#605030] tracking-widest mb-4">{result.ticker} — NİHAİ PUAN</p>
                  {regime && (
                    <div className="flex justify-center gap-2 mb-4">
                      <span className="px-3 py-1 rounded-md text-[11px] font-bold tracking-wider" style={{ backgroundColor: regime.color + "15", color: regime.color }}>
                        {regime.label.toUpperCase()}
                      </span>
                      {result.dxy_bonus && <span className="px-3 py-1 rounded-md text-[11px] font-bold tracking-wider bg-yellow-500/10 text-yellow-500">DXY BONUS +10</span>}
                    </div>
                  )}
                  <p className={`text-8xl font-mono font-black ${getScoreColor(result.final_score)}`}>{result.final_score?.toFixed(1)}</p>
                  <div className="inline-block mt-4 px-7 py-2.5 rounded-lg font-bold tracking-[3px] text-sm" style={{
                    backgroundColor: getBgColor(result.final_score) + "15",
                    color: getBgColor(result.final_score),
                    border: `1px solid ${getBgColor(result.final_score)}30`,
                  }}>
                    {result.verdict === "MUKEMMEL" ? "MÜKEMMEL" : result.verdict === "KABULEDILEBILIR" ? "KABULEDİLEBİLİR" : "TAVSİYE EDİLMEZ"}
                  </div>
                  {result.company_name && <p className="text-[#605030] text-sm mt-3">{result.company_name}</p>}

                  {result.barrier_triggered && (
                    <div className="mt-5 inline-block bg-red-500/10 border border-red-500/30 rounded-lg px-6 py-3">
                      <span className="text-red-500 font-bold text-sm">⛔ BARİYER AKTİF — Genel ortalama ne olursa olsun: TAVSİYE EDİLMEZ</span>
                    </div>
                  )}
                  {(result.special_label === "HARIKA_SIRKET_PAHALI_FIYAT" || (getFilterScore("filter_1") >= 75 && getFilterScore("filter_4") < 60)) && (
                    <div className="mt-3 inline-block bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-6 py-3">
                      <span className="text-yellow-500 font-bold text-sm">⚡ Harika Şirket, Pahalı Fiyat — Düzeltme Bekle</span>
                      <span className="text-yellow-500/60 text-xs block mt-1">Şirket kalitesi yüksek ama mevcut değerleme riskli.</span>
                    </div>
                  )}
                </div>

                {/* 4 Filter Cards */}
                <div className="grid grid-cols-2 gap-3">
                  {FILTER_META.map((fm, fi) => {
                    const score = getFilterScore(fm.key);
                    const isExpanded = expandedFilter === fi;
                    const filterData = result[fm.key];
                    const subs = filterData?.subcategories || {};
                    const isBarrier = score < 60;
                    return (
                      <div key={fi} onClick={() => setExpandedFilter(isExpanded ? null : fi)}
                        className={`bg-[#0D0B08] rounded-xl p-5 cursor-pointer transition-all duration-300 ${isExpanded ? "col-span-2" : ""}`}
                        style={{ border: `1px solid ${isBarrier ? "#EF444440" : isExpanded ? fm.color + "40" : "#1A1610"}` }}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{fm.icon}</span>
                            <div>
                              <p className="font-bold text-[#B8A870] text-sm">{fm.label}</p>
                              <p className="text-[10px] text-[#504020]">Rol: {fm.role} · w{fi + 1}={result.weights?.[`w${fi + 1}`] ?? "1.0"}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`font-mono font-black text-2xl ${getScoreColor(score)}`}>{score?.toFixed(1)}</span>
                            <p className="text-[10px] mt-1" style={{ color: fm.color + "80" }}>{isExpanded ? "▲ KAPAT" : "▼ DETAY"}</p>
                          </div>
                        </div>
                        <div className="h-1.5 bg-[#1A1610] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-700 ${getBarColor(score)}`} style={{ width: `${Math.min(score || 0, 100)}%` }} />
                        </div>
                        {isBarrier && <span className="inline-block mt-2 text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded">BARİYER</span>}
                        {isExpanded && Object.keys(subs).length > 0 && (
                          <div className="mt-5 pt-4 border-t border-[#1A1610]">
                            <div className={`grid gap-x-6 gap-y-1 ${Object.keys(subs).length > 4 ? "grid-cols-2" : "grid-cols-1"}`}>
                              {Object.entries(subs).map(([key, val]: [string, any]) => {
                                const pct = val.max > 0 ? (val.score / val.max) * 100 : 0;
                                const barClr = pct >= 70 ? "bg-green-500" : pct >= 45 ? "bg-yellow-500" : "bg-red-500";
                                return (
                                  <div key={key} className="mb-3">
                                    <div className="flex justify-between items-baseline mb-1">
                                      <span className="text-xs text-[#B8A870] font-semibold">{SUB_NAMES[key] || key}</span>
                                      <span className={`font-mono text-xs font-bold ${pct >= 70 ? "text-green-500" : pct >= 45 ? "text-yellow-500" : "text-red-500"}`}>{val.score}/{val.max}</span>
                                    </div>
                                    <div className="h-1 bg-[#1A1610] rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full ${barClr}`} style={{ width: `${pct}%` }} />
                                    </div>
                                    {val.details && <p className="text-[11px] text-[#605030] mt-1 leading-relaxed">{val.details}</p>}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Self Audit */}
                {result.self_audit && (
                  <div className="bg-[#0D0B08] border border-[#1A1610] rounded-xl p-6">
                    <h3 className="font-bold text-[#D4C8A0] mb-4 flex items-center gap-2">
                      <span className={result.barrier_triggered ? "text-red-500" : "text-green-500"}>{result.barrier_triggered ? "✗" : "✓"}</span>
                      Öz-Denetim Protokolü
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(result.self_audit).map(([key, val]: [string, any]) => (
                        <div key={key} className="flex gap-3 pb-3 border-b border-[#1A1610] last:border-0">
                          <span className="font-mono text-[10px] font-bold text-[#706040] min-w-[140px] pt-0.5">{AUDIT_LABELS[key] || key}</span>
                          <span className="text-xs text-[#A09060] leading-relaxed">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exit Signals */}
                {result.exit_signals?.some((s: any) => s.active) && (
                  <div className="bg-[#0D0B08] border border-red-500/20 rounded-xl p-6">
                    <h3 className="font-bold text-red-400 mb-4">⚠ Çıkış Stratejisi Sinyalleri</h3>
                    <div className="space-y-3">
                      {result.exit_signals.filter((s: any) => s.active).map((sig: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 pb-3 border-b border-[#1A1610] last:border-0">
                          <span className="font-mono text-[10px] font-bold px-3 py-1 rounded whitespace-nowrap"
                            style={{ backgroundColor: (EXIT_COLORS[sig.type] || "#EF4444") + "15", color: EXIT_COLORS[sig.type] || "#EF4444" }}>
                            {EXIT_LABELS[sig.type] || sig.type}
                          </span>
                          <span className="text-xs text-[#B8A870] leading-relaxed">{sig.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Commentary */}
                {result.commentary && (
                  <div className="bg-[#0D0B08] border border-[#1A1610] rounded-xl p-6">
                    <h3 className="font-bold text-[#D4C8A0] mb-3">Ali Agent Yorumu</h3>
                    <p className="text-sm text-[#B8A870] leading-[1.8] whitespace-pre-wrap">{result.commentary}</p>
                  </div>
                )}

                {/* Dynamic Weighting */}
                {result.weights && (
                  <div className="bg-[#0D0B08] border border-[#1A1610] rounded-xl p-6">
                    <h3 className="font-bold text-[#A09060] mb-3 text-sm">Dinamik Ağırlıklandırma Hesabı</h3>
                    <div className="font-mono text-xs text-[#706040] bg-[#090807] rounded-lg p-4 space-y-1">
                      <p>Rejim: <span style={{ color: regime?.color }}>{regime?.label}</span>
                        {result.regime_reason && <span className="text-[#504020]"> — {result.regime_reason}</span>}
                      </p>
                      <p className="text-[#A09060]">
                        ({getFilterScore("filter_1").toFixed(1)}×{result.weights.w1} + {getFilterScore("filter_2").toFixed(1)}×{result.weights.w2} + {getFilterScore("filter_3").toFixed(1)}×{result.weights.w3} + {getFilterScore("filter_4").toFixed(1)}×{result.weights.w4}) / ({result.weights.w1}+{result.weights.w2}+{result.weights.w3}+{result.weights.w4})
                      </p>
                      <p className={`font-bold ${getScoreColor(result.final_score)}`}>
                        = {result.final_score?.toFixed(2)} → {result.verdict === "MUKEMMEL" ? "MÜKEMMEL" : result.verdict === "KABULEDILEBILIR" ? "KABULEDİLEBİLİR" : "TAVSİYE EDİLMEZ"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 text-center">
                  <p className="text-[11px] text-red-400/70">⚠️ Bu analiz yatırım tavsiyesi niteliği taşımamaktadır. Yatırım kararları tamamen bireylerin kendi sorumluluğundadır.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }