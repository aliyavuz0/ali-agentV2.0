"use client";

import { useState } from "react";

const FILTER_META = [
  { key: "filter_1", label: "Finansal Kalite", role: "MOTOR", color: "#EF4444", icon: "⚙" },
  { key: "filter_2", label: "Makro & Likidite", role: "HAVA DURUMU", color: "#3B82F6", icon: "☁" },
  { key: "filter_3", label: "CANSLIM Momentum", role: "YAKIT", color: "#22C55E", icon: "⚡" },
  { key: "filter_4", label: "Değerleme & Risk", role: "EMNİYET KEMERİ", color: "#A855F7", icon: "🛡" },
];

const SUB_NAMES: Record<string, string> = {
  finansallar: "Finansallar",
  hendek: "Hendek (Moat)",
  potansiyel: "Potansiyel Analizi",
  gelir_kalitesi: "Gelir Kalitesi",
  musteri: "Müşteri Analizi",
  yonetim: "Yönetim & Kültür",
  hisse_performans: "Hisse Performansı",
  fcf: "Serbest Nakit Akışı",
  likidite_mb: "Likidite & MB Politikası",
  enflasyon_tahvil: "Enflasyon & Tahvil",
  sektorel_uyum: "Sektörel Uyum",
  buyuk_bahis: "Büyük Bahis Güveni",
  c_quarterly_eps: "C — Çeyreklik EPS",
  a_annual_eps: "A — Yıllık EPS (3Y)",
  n_new: "N — Yeni Ürün/Yönetim",
  s_supply_demand: "S — Arz & Talep",
  l_leader: "L — Lider/Takipçi",
  i_institutional: "I — Kurumsal Sponsorluk",
  m_market: "M — Piyasa Yönü",
  degerleme: "Değerleme",
  risk: "Sistematik Risk",
  dilusyon: "Dilüsyon",
  tam_growth: "TAM & Büyüme",
  makro_duyarlilik: "Makro Duyarlılık",
};

const REGIME_LABELS: Record<string, { label: string; color: string }> = {
  normal: { label: "Normal Piyasa", color: "#F59E0B" },
  bear: { label: "Ayı Piyasası", color: "#EF4444" },
  bull: { label: "Boğa Piyasası", color: "#22C55E" },
};

const EXIT_COLORS: Record<string, string> = {
  TEZ_CURUME: "#EF4444",
  DEGERLEME_BALONU: "#F97316",
  MAKRO_STOP: "#DC2626",
  MOMENTUM_KAYBI: "#A855F7",
};

const EXIT_LABELS: Record<string, string> = {
  TEZ_CURUME: "TEZ ÇÜRÜME",
  DEGERLEME_BALONU: "DEĞERLEME BALONU",
  MAKRO_STOP: "MAKRO STOP-LOSS",
  MOMENTUM_KAYBI: "MOMENTUM KAYBI",
};

const AUDIT_LABELS: Record<string, string> = {
  duplicate_check: "Mükerrer Puanlama",
  math_verification: "Matematik Sağlama",
  optimism_check: "İyimserlik Testi",
  thesis_conflict: "Tez Çelişkisi",
};

export default function Home() {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [expandedFilter, setExpandedFilter] = useState<number | null>(null);

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
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const getFilterScore = (filterKey: string) => {
    if (!result) return 0;
    if (filterKey === "filter_1") return result.filter_1?.score_normalized ?? 0;
    return result[filterKey]?.score ?? 0;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const regime = result ? REGIME_LABELS[result.market_regime] || REGIME_LABELS.normal : null;

  return (
    <main className="min-h-screen bg-[#0A0908] text-[#E0D4B8]">
      <div className="max-w-4xl mx-auto px-4 py-12">

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
            className="px-8 py-4 bg-red-700 hover:bg-red-600 disabled:bg-[#1A1610] disabled:text-[#605030] text-white font-bold rounded-xl tracking-wider transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#605030] border-t-[#A08050] rounded-full animate-spin" />
                ANALİZ...
              </>
            ) : "ANALİZ ET"}
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-12 h-12 border-3 border-[#1A1610] border-t-red-500 rounded-full animate-spin mx-auto mb-5" />
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

            {/* FINAL SCORE */}
            <div className="text-center py-10 rounded-2xl border border-[#1A1610] bg-[#0D0B08]">
              <div className="flex justify-center items-center gap-4 mb-4">
                <span className="font-mono text-sm text-[#605030] tracking-widest">
                  {result.ticker} — NİHAİ PUAN
                </span>
              </div>
              {regime && (
                <div className="flex justify-center gap-2 mb-4">
                  <span
                    className="px-3 py-1 rounded-md text-[11px] font-bold tracking-wider"
                    style={{ backgroundColor: regime.color + "15", color: regime.color }}
                  >
                    {regime.label.toUpperCase()}
                  </span>
                  {result.dxy_bonus && (
                    <span className="px-3 py-1 rounded-md text-[11px] font-bold tracking-wider bg-yellow-500/10 text-yellow-500">
                      DXY BONUS +10
                    </span>
                  )}
                </div>
              )}
              <p className={`text-8xl font-mono font-black ${getScoreColor(result.final_score)}`}>
                {result.final_score?.toFixed(1)}
              </p>
              <div
                className="inline-block mt-4 px-7 py-2.5 rounded-lg font-bold tracking-[3px] text-sm"
                style={{
                  backgroundColor: (result.final_score >= 80 ? "#22C55E" : result.final_score >= 60 ? "#F59E0B" : "#EF4444") + "15",
                  color: result.final_score >= 80 ? "#22C55E" : result.final_score >= 60 ? "#F59E0B" : "#EF4444",
                  border: `1px solid ${(result.final_score >= 80 ? "#22C55E" : result.final_score >= 60 ? "#F59E0B" : "#EF4444")}30`,
                }}
              >
                {result.verdict === "MUKEMMEL" ? "MÜKEMMEL" :
                  result.verdict === "KABULEDILEBILIR" ? "KABULEDİLEBİLİR" : "TAVSİYE EDİLMEZ"}
              </div>
              {result.company_name && (
                <p className="text-[#605030] text-sm mt-3">{result.company_name}</p>
              )}

              {result.barrier_triggered && (
                <div className="mt-5 inline-block bg-red-500/10 border border-red-500/30 rounded-lg px-6 py-3">
                  <span className="text-red-500 font-bold text-sm">
                    ⛔ BARİYER AKTİF — Genel ortalama ne olursa olsun: TAVSİYE EDİLMEZ
                  </span>
                </div>
              )}
              {(result.special_label === "HARIKA_SIRKET_PAHALI_FIYAT" || (getFilterScore("filter_1") >= 75 && getFilterScore("filter_4") < 60)) && (
                <div className="mt-3 inline-block bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-6 py-3">
                  <span className="text-yellow-500 font-bold text-sm">
                    ⚡ Harika Şirket, Pahalı Fiyat — Düzeltme Bekle
                  </span>
                  <span className="text-yellow-500/60 text-xs block mt-1">
                    Şirket kalitesi yüksek ama mevcut değerleme riskli. Fiyat düzeltmesi beklenebilir.
                  </span>
                </div>
              )}
            </div>

            {/* 4 FILTER CARDS */}
            <div className="grid grid-cols-2 gap-3">
              {FILTER_META.map((fm, fi) => {
                const score = getFilterScore(fm.key);
                const isExpanded = expandedFilter === fi;
                const filterData = result[fm.key];
                const subs = filterData?.subcategories || {};
                const isBarrier = score < 60;

                return (
                  <div
                    key={fi}
                    onClick={() => setExpandedFilter(isExpanded ? null : fi)}
                    className={`bg-[#0D0B08] rounded-xl p-5 cursor-pointer transition-all duration-300 ${isExpanded ? "col-span-2" : ""
                      }`}
                    style={{
                      border: `1px solid ${isBarrier ? "#EF444440" : isExpanded ? fm.color + "40" : "#1A1610"}`,
                    }}
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{fm.icon}</span>
                        <div>
                          <p className="font-bold text-[#B8A870] text-sm">{fm.label}</p>
                          <p className="text-[10px] text-[#504020]">
                            Rol: {fm.role} · w{fi + 1}={result.weights?.[`w${fi + 1}`] ?? "1.0"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-mono font-black text-2xl ${getScoreColor(score)}`}>
                          {score?.toFixed(1)}
                        </span>
                        <p className="text-[10px] mt-1" style={{ color: fm.color + "80" }}>
                          {isExpanded ? "▲ KAPAT" : "▼ DETAY"}
                        </p>
                      </div>
                    </div>

                    {/* Score Bar */}
                    <div className="h-1.5 bg-[#1A1610] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${getBarColor(score)}`}
                        style={{ width: `${Math.min(score || 0, 100)}%` }}
                      />
                    </div>

                    {isBarrier && (
                      <span className="inline-block mt-2 text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded">
                        BARİYER
                      </span>
                    )}

                    {/* Expanded Subcategories */}
                    {isExpanded && Object.keys(subs).length > 0 && (
                      <div className="mt-5 pt-4 border-t border-[#1A1610]">
                        <div className={`grid gap-x-6 gap-y-1 ${Object.keys(subs).length > 4 ? "grid-cols-2" : "grid-cols-1"}`}>
                          {Object.entries(subs).map(([key, val]: [string, any]) => {
                            const pct = val.max > 0 ? (val.score / val.max) * 100 : 0;
                            const barClr = pct >= 70 ? "bg-green-500" : pct >= 45 ? "bg-yellow-500" : "bg-red-500";
                            return (
                              <div key={key} className="mb-3">
                                <div className="flex justify-between items-baseline mb-1">
                                  <span className="text-xs text-[#B8A870] font-semibold">
                                    {SUB_NAMES[key] || key}
                                  </span>
                                  <span className={`font-mono text-xs font-bold ${pct >= 70 ? "text-green-500" : pct >= 45 ? "text-yellow-500" : "text-red-500"}`}>
                                    {val.score}/{val.max}
                                  </span>
                                </div>
                                <div className="h-1 bg-[#1A1610] rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${barClr}`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                {val.details && (
                                  <p className="text-[11px] text-[#605030] mt-1 leading-relaxed">
                                    {val.details}
                                  </p>
                                )}
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

            {/* SELF AUDIT */}
            {result.self_audit && (
              <div className="bg-[#0D0B08] border border-[#1A1610] rounded-xl p-6">
                <h3 className="font-bold text-[#D4C8A0] mb-4 flex items-center gap-2">
                  <span className={result.barrier_triggered ? "text-red-500" : "text-green-500"}>
                    {result.barrier_triggered ? "✗" : "✓"}
                  </span>
                  Öz-Denetim Protokolü
                </h3>
                <div className="space-y-3">
                  {Object.entries(result.self_audit).map(([key, val]: [string, any]) => (
                    <div key={key} className="flex gap-3 pb-3 border-b border-[#1A1610] last:border-0">
                      <span className="font-mono text-[10px] font-bold text-[#706040] min-w-[140px] pt-0.5">
                        {AUDIT_LABELS[key] || key}
                      </span>
                      <span className="text-xs text-[#A09060] leading-relaxed">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EXIT SIGNALS */}
            {result.exit_signals?.some((s: any) => s.active) && (
              <div className="bg-[#0D0B08] border border-red-500/20 rounded-xl p-6">
                <h3 className="font-bold text-red-400 mb-4">⚠ Çıkış Stratejisi Sinyalleri</h3>
                <div className="space-y-3">
                  {result.exit_signals
                    .filter((s: any) => s.active)
                    .map((sig: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 pb-3 border-b border-[#1A1610] last:border-0">
                        <span
                          className="font-mono text-[10px] font-bold px-3 py-1 rounded whitespace-nowrap"
                          style={{
                            backgroundColor: (EXIT_COLORS[sig.type] || "#EF4444") + "15",
                            color: EXIT_COLORS[sig.type] || "#EF4444",
                          }}
                        >
                          {EXIT_LABELS[sig.type] || sig.type}
                        </span>
                        <span className="text-xs text-[#B8A870] leading-relaxed">{sig.message}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* COMMENTARY */}
            {result.commentary && (
              <div className="bg-[#0D0B08] border border-[#1A1610] rounded-xl p-6">
                <h3 className="font-bold text-[#D4C8A0] mb-3">Ali Agent Yorumu</h3>
                <p className="text-sm text-[#B8A870] leading-[1.8] whitespace-pre-wrap">
                  {result.commentary}
                </p>
              </div>
            )}

            {/* DYNAMIC WEIGHTING */}
            {result.weights && (
              <div className="bg-[#0D0B08] border border-[#1A1610] rounded-xl p-6">
                <h3 className="font-bold text-[#A09060] mb-3 text-sm">Dinamik Ağırlıklandırma Hesabı</h3>
                <div className="font-mono text-xs text-[#706040] bg-[#090807] rounded-lg p-4 space-y-1">
                  <p>
                    Rejim:{" "}
                    <span style={{ color: regime?.color }}>{regime?.label}</span>
                    {result.regime_reason && (
                      <span className="text-[#504020]"> — {result.regime_reason}</span>
                    )}
                  </p>
                  <p className="text-[#A09060]">
                    ({getFilterScore("filter_1").toFixed(1)}×{result.weights.w1} +{" "}
                    {getFilterScore("filter_2").toFixed(1)}×{result.weights.w2} +{" "}
                    {getFilterScore("filter_3").toFixed(1)}×{result.weights.w3} +{" "}
                    {getFilterScore("filter_4").toFixed(1)}×{result.weights.w4}) /{" "}
                    ({result.weights.w1}+{result.weights.w2}+{result.weights.w3}+{result.weights.w4})
                  </p>
                  <p className={`font-bold ${getScoreColor(result.final_score)}`}>
                    = {result.final_score?.toFixed(2)} →{" "}
                    {result.verdict === "MUKEMMEL" ? "MÜKEMMEL" :
                      result.verdict === "KABULEDILEBILIR" ? "KABULEDİLEBİLİR" : "TAVSİYE EDİLMEZ"}
                  </p>
                </div>
              </div>
            )}

            {/* DISCLAIMER */}
            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 text-center">
              <p className="text-[11px] text-red-400/70">
                ⚠️ Bu analiz yatırım tavsiyesi niteliği taşımamaktadır. Yatırım kararları tamamen bireylerin kendi sorumluluğundadır.
              </p>
            </div>

            {/* NEW ANALYSIS */}
            <button
              onClick={() => {
                setResult(null);
                setTicker("");
                setError("");
                setExpandedFilter(null);
              }}
              className="w-full py-4 bg-[#0D0B08] border border-[#1A1610] rounded-xl text-[#706040] text-sm font-semibold hover:border-[#2A2520] transition-colors cursor-pointer"
            >
              ↺ Yeni Analiz Başlat
            </button>
          </div>
        )}
      </div>
    </main>
  );
}