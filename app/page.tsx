"use client";

import { useState, useEffect, MouseEvent } from "react";
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
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setHistory([]);
    setResult(null);
  };

  // ═══ HISTORY & ACTIONS ═══
  const loadHistory = async (userId: string) => {
    const { data } = await supabase
      .from("analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setHistory(data);
  };

  const handleDelete = async (e: MouseEvent, id: string) => {
    e.stopPropagation();
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

  const loadPastAnalysis = (item: any) => {
    setResult(item.full_result);
    setExpandedFilter(null);
  };

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0908] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#1A1610] border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0908] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center gap-3 mb-6 px-5 py-2 bg-[#0F0D0A] border border-[#1A1610] rounded-full">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-red-600 to-purple-700 flex items-center justify-center text-[11px] font-black text-white">A</div>
            <span className="font-mono text-xs font-bold tracking-[4px] text-red-500">ALİ AGENT V2.0</span>
          </div>
          <h1 className="text-4xl font-bold text-[#F0E8D0] mb-3">Dörtlü Süzgeç Analiz Motoru</h1>
          <button onClick={signInWithGoogle} className="inline-flex items-center gap-3 px-8 py-4 bg-[#13110E] border border-[#2A2520] rounded-xl text-[#F0E8D0] font-semibold hover:border-[#4A4530] transition-colors cursor-pointer">
            Google ile Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0908] text-[#E0D4B8] flex">
      {/* SIDEBAR */}
      <div className={`${sidebarOpen ? "w-72" : "w-0"} transition-all duration-300 overflow-hidden flex-shrink-0 border-r border-[#1A1610] bg-[#0D0B08]`}>
        <div className="w-72 h-screen flex flex-col">
          <div className="p-4 border-b border-[#1A1610]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-700 flex items-center justify-center text-white text-sm font-bold">
                {user.email?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#D4C8A0] truncate">{user.email}</p>
              </div>
            </div>
            <button onClick={signOut} className="mt-3 w-full py-2 text-xs text-[#605030] hover:text-red-400 border border-[#1A1610] rounded-lg transition-colors cursor-pointer">Çıkış Yap</button>
          </div>

          <div className="p-3">
            <button onClick={() => { setResult(null); setTicker(""); setError(""); setExpandedFilter(null); }} className="w-full py-3 bg-red-700/20 border border-red-700/30 rounded-lg text-red-400 text-sm font-bold hover:bg-red-700/30 transition-colors cursor-pointer">+ Yeni Analiz</button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-3">
            <p className="text-[10px] font-bold text-[#504020] tracking-widest mb-2 px-1">GEÇMİŞ ANALİZLER</p>
            {history.length === 0 ? (
              <p className="text-xs text-[#40382A] px-1">Henüz analiz yok.</p>
            ) : (
              history.map((item) => {
                const scoreColor = item.final_score >= 80 ? "#22C55E" : item.final_score >= 60 ? "#F59E0B" : "#EF4444";
                return (
                  <div key={item.id} className="relative p-3 mb-1 rounded-lg hover:bg-[#13110E] transition-colors cursor-pointer group" onClick={() => loadPastAnalysis(item)}>
                    <div className="flex justify-between items-center pr-6">
                      <span className="font-mono text-sm font-bold text-[#D4C8A0]">{item.ticker}</span>
                      <span className="font-mono text-sm font-bold" style={{ color: scoreColor }}>{item.final_score?.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1 pr-6">
                      <span className="text-[10px] text-[#504020]">{new Date(item.created_at).toLocaleDateString("tr-TR")}</span>
                    </div>
                    {/* Üç Nokta Menüsü */}
                    <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === item.id ? null : item.id); }} className="absolute top-3 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#605030" strokeWidth="2.5"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                    </button>
                    {openMenuId === item.id && (
                      <div className="absolute top-8 right-2 w-32 bg-[#0F0D0A] border border-[#1A1610] rounded-lg shadow-2xl z-50">
                        <button onClick={(e) => handleDelete(e, item.id)} className="w-full text-left px-3 py-2 text-[10px] font-bold text-red-500 hover:bg-red-500/10 flex items-center gap-2">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                          SİL
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="fixed top-4 left-4 z-50 w-8 h-8 bg-[#13110E] border border-[#2A2520] rounded-lg flex items-center justify-center text-[#605030]" style={{ left: sidebarOpen ? "296px" : "16px" }}>{sidebarOpen ? "◀" : "▶"}</button>
        <div className="max-w-3xl mx-auto px-4 py-12">
          {/* Arama, Sonuçlar ve Grafiklerin olduğu bölüm (Senin orijinal kodundaki yapıyı korudum) */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-[#F0E8D0] mb-2">Analiz Motoru</h1>
            <div className="flex gap-2 mt-8 bg-[#0D0B08] border border-[#1A1610] rounded-2xl p-1.5">
              <input type="text" value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} className="flex-1 px-5 py-4 bg-transparent font-bold text-[#F0E8D0] outline-none" placeholder="TICKER GIR..." />
              <button onClick={handleAnalyze} className="px-8 py-4 bg-red-700 text-white font-bold rounded-xl cursor-pointer">ANALİZ ET</button>
            </div>
          </div>

          {loading && <div className="text-center py-16 animate-pulse">Analiz ediliyor...</div>}
          {error && <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-xl text-red-400">{error}</div>}

          {result && !loading && (
            <div className="space-y-6">
              {/* Puan Kartı */}
              <div className="text-center py-10 rounded-2xl border border-[#1A1610] bg-[#0D0B08]">
                <p className="text-8xl font-black" style={{ color: getBgColor(result.final_score) }}>{result.final_score?.toFixed(1)}</p>
                <p className="mt-4 font-bold tracking-widest">{result.verdict}</p>
              </div>

              {/* Filtreler */}
              <div className="grid grid-cols-2 gap-4">
                {FILTER_META.map((fm, fi) => (
                  <div key={fi} className="bg-[#0D0B08] p-5 rounded-xl border border-[#1A1610]">
                    <p className="text-xs font-bold text-[#605030]">{fm.label}</p>
                    <p className={`text-2xl font-black ${getScoreColor(getFilterScore(fm.key))}`}>{getFilterScore(fm.key).toFixed(1)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}