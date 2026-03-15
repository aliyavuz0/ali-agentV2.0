"use client";

import { useState } from "react";
import {
  PolarGrid, Radar, RadarChart, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from "recharts";
import {
  FILTER_META, SUB_NAMES, REGIME_LABELS, EXIT_COLORS, EXIT_LABELS, AUDIT_LABELS,
  UI_TEXT, getScoreColor, getBarColor, getBgColor, getFilterScore,
} from "../lib/constants";

interface AnalysisResultProps {
  result: any;
  language: string;
}

export default function AnalysisResult({ result, language }: AnalysisResultProps) {
  const [expandedFilter, setExpandedFilter] = useState<number | null>(null);

  const t = UI_TEXT[language] || UI_TEXT.TR;
  const filters = FILTER_META[language] || FILTER_META.TR;
  const subs = SUB_NAMES[language] || SUB_NAMES.TR;
  const regimes = REGIME_LABELS[language] || REGIME_LABELS.TR;
  const exitLbls = EXIT_LABELS[language] || EXIT_LABELS.TR;
  const auditLbls = AUDIT_LABELS[language] || AUDIT_LABELS.TR;

  const regime = regimes[result.market_regime] || regimes.normal;
  const score = Number(result.final_score) || 0;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ━━━ Final Score Card ━━━ */}
      <div className="text-center py-8 sm:py-10 rounded-2xl border border-[#1A1610] bg-[#0D0B08]">
        <p className="font-mono text-xs sm:text-sm text-[#605030] tracking-widest mb-3">
          {result.ticker} — {t.finalScore}
        </p>

        {/* Tier badge */}
        {result._tier && (
          <div className="flex justify-center mb-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${
              result._tier === "deep"
                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                : "bg-[#2A2520] text-[#A09060] border border-[#3A3530]"
            }`}>
              {result._tier === "deep" ? (
                <>{language === "TR" ? "◉ DERİN ANALİZ" : "◉ DEEP ANALYSIS"}{result._cached ? (language === "TR" ? " · ÖNBELLEK" : " · CACHED") : ""}</>
              ) : (
                <>{language === "TR" ? "⚡ HIZLI ANALİZ" : "⚡ QUICK ANALYSIS"}{result._cached ? (language === "TR" ? " · ÖNBELLEK" : " · CACHED") : ""}</>
              )}
            </span>
          </div>
        )}

        {/* Regime badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
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

        {/* Big score */}
        <p className={`text-6xl sm:text-8xl font-mono font-black ${getScoreColor(score)}`}>
          {score?.toFixed(1)}
        </p>

        {/* Verdict badge */}
        <div
          className="inline-block mt-4 px-5 sm:px-7 py-2.5 rounded-lg font-bold tracking-[2px] sm:tracking-[3px] text-xs sm:text-sm"
          style={{
            backgroundColor: getBgColor(score) + "15",
            color: getBgColor(score),
            border: `1px solid ${getBgColor(score)}30`,
          }}
        >
          {result.verdict === "MUKEMMEL" ? t.excellent
            : result.verdict === "KABULEDILEBILIR" ? t.acceptable
            : t.notRecommended}
        </div>

        {result.company_name && (
          <p className="text-[#605030] text-sm mt-3">{result.company_name}</p>
        )}

        {/* Barrier warning */}
        {result.barrier_triggered && (
          <div className="mt-5 mx-4 sm:mx-0 inline-block bg-red-500/10 border border-red-500/30 rounded-lg px-4 sm:px-6 py-3">
            <span className="text-red-500 font-bold text-xs sm:text-sm">{t.barrier}</span>
          </div>
        )}

        {/* Radar Chart */}
        <div className="mt-6 px-4">
          <h3 className="text-center text-[10px] font-bold text-[#504020] tracking-[3px] uppercase mb-4 text-red-500">
            {t.radarTitle}
          </h3>
          <div className="h-[220px] sm:h-[280px] w-full max-w-md mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                cx="50%" cy="50%" outerRadius="75%"
                data={filters.map((f) => ({
                  subject: f.role.split(" ")[0],
                  A: getFilterScore(result, f.key),
                  fullMark: 100,
                }))}
              >
                <PolarGrid stroke="#1A1610" />
                <PolarAngleAxis dataKey="subject" stroke="#605030" fontSize={10} fontWeight="bold" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Ali Agent" dataKey="A" stroke="#EF4444" fill="#EF4444" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Great company expensive price label */}
        {(result.special_label === "HARIKA_SIRKET_PAHALI_FIYAT" ||
          (getFilterScore(result, "filter_1") >= 75 && getFilterScore(result, "filter_4") < 60)) && (
          <div className="mt-3 mx-4 sm:mx-0 inline-block bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 sm:px-6 py-3">
            <span className="text-yellow-500 font-bold text-xs sm:text-sm">{t.greatCompany}</span>
            <span className="text-yellow-500/60 text-xs block mt-1">{t.greatCompanySub}</span>
          </div>
        )}
      </div>

      {/* ━━━ 4 Filter Cards ━━━ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filters.map((fm, fi) => {
          const filterScore = getFilterScore(result, fm.key);
          const isExpanded = expandedFilter === fi;
          const filterData = result[fm.key];
          const subData = filterData?.subcategories || {};
          const isBarrier = filterScore < 60;

          return (
            <div
              key={fi}
              onClick={() => setExpandedFilter(isExpanded ? null : fi)}
              className={`bg-[#0D0B08] rounded-xl p-4 sm:p-5 cursor-pointer transition-all duration-300 ${
                isExpanded ? "sm:col-span-2" : ""
              }`}
              style={{
                border: `1px solid ${isBarrier ? "#EF444440" : isExpanded ? fm.color + "40" : "#1A1610"}`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <span className="text-lg sm:text-xl flex-shrink-0">{fm.icon}</span>
                  <div className="min-w-0">
                    <p className="font-bold text-[#B8A870] text-xs sm:text-sm truncate">{fm.label}</p>
                    <p className="text-[9px] sm:text-[10px] text-[#504020] truncate">
                      {t.role}: {fm.role} · w{fi + 1}={result.weights?.[`w${fi + 1}`] ?? "1.0"}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className={`font-mono font-black text-xl sm:text-2xl ${getScoreColor(filterScore)}`}>
                    {filterScore?.toFixed(1)}
                  </span>
                  <p className="text-[9px] sm:text-[10px] mt-1" style={{ color: fm.color + "80" }}>
                    {isExpanded ? t.close : t.detail}
                  </p>
                </div>
              </div>

              {/* Score bar */}
              <div className="h-1.5 bg-[#1A1610] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${getBarColor(filterScore)}`}
                  style={{ width: `${Math.min(filterScore || 0, 100)}%` }}
                />
              </div>

              {isBarrier && (
                <span className="inline-block mt-2 text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded">
                  {t.barrierLabel}
                </span>
              )}

              {/* Expanded subcategories */}
              {isExpanded && Object.keys(subData).length > 0 && (
                <div className="mt-5 pt-4 border-t border-[#1A1610]">
                  <div className={`grid gap-x-4 sm:gap-x-6 gap-y-1 ${
                    Object.keys(subData).length > 4 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
                  }`}>
                    {Object.entries(subData).map(([key, val]: [string, any]) => {
                      const pct = val.max > 0 ? (val.score / val.max) * 100 : 0;
                      const barClr = pct >= 70 ? "bg-green-500" : pct >= 45 ? "bg-yellow-500" : "bg-red-500";
                      return (
                        <div key={key} className="mb-3">
                          <div className="flex justify-between items-baseline mb-1 gap-2">
                            <span className="text-xs text-[#B8A870] font-semibold truncate">
                              {subs[key] || key}
                            </span>
                            <span className={`font-mono text-xs font-bold flex-shrink-0 ${
                              pct >= 70 ? "text-green-500" : pct >= 45 ? "text-yellow-500" : "text-red-500"
                            }`}>
                              {val.score}/{val.max}
                            </span>
                          </div>
                          <div className="h-1 bg-[#1A1610] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${barClr}`} style={{ width: `${pct}%` }} />
                          </div>
                          {val.details && (
                            <p className="text-[10px] sm:text-[11px] text-[#605030] mt-1 leading-relaxed">
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

      {/* ━━━ Sharia Compliance Card ━━━ */}
      {result.sharia_analysis && (
        <div className="bg-[#0D0B08] border border-[#1A1610] rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#D4C8A0] flex items-center gap-2 text-sm sm:text-base">
              <span className="text-lg">☪</span>
              {t.shariaTitle}
            </h3>
            {/* Status badge */}
            <span className={`px-3 py-1.5 rounded-lg text-[11px] font-black tracking-wider ${
              result.sharia_analysis.sharia_status === "COMPLIANT" || result.sharia_analysis.sharia_status === "UYGUN"
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : result.sharia_analysis.sharia_status === "QUESTIONABLE" || result.sharia_analysis.sharia_status === "SUPHELI"
                ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}>
              {result.sharia_analysis.sharia_status === "COMPLIANT" || result.sharia_analysis.sharia_status === "UYGUN"
                ? t.shariaCompliant
                : result.sharia_analysis.sharia_status === "QUESTIONABLE" || result.sharia_analysis.sharia_status === "SUPHELI"
                ? t.shariaQuestionable
                : t.shariaNonCompliant}
            </span>
          </div>

          {/* Business Activity Screening */}
          {result.sharia_analysis.business_activity && (
            <div className="mb-4">
              <p className="text-[10px] font-bold text-[#504020] tracking-widest uppercase mb-2">
                {t.shariaBusinessActivity}
              </p>
              <div className="bg-[#090807] rounded-lg p-3 space-y-2">
                {result.sharia_analysis.business_activity.primary_sector && (
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-[#706040]">{language === "TR" ? "Ana Sektör" : "Primary Sector"}</span>
                    <span className="text-[11px] text-[#B8A870] font-semibold">{result.sharia_analysis.business_activity.primary_sector}</span>
                  </div>
                )}
                {result.sharia_analysis.business_activity.haram_revenue_percentage != null && (
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-[#706040]">{language === "TR" ? "Haram Gelir %" : "Haram Revenue %"}</span>
                    <span className={`text-[11px] font-bold font-mono ${
                      result.sharia_analysis.business_activity.haram_revenue_percentage <= 5 ? "text-green-400" : "text-red-400"
                    }`}>
                      %{result.sharia_analysis.business_activity.haram_revenue_percentage}
                    </span>
                  </div>
                )}
                {result.sharia_analysis.business_activity.status && (
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-[#706040]">{t.shariaOverallStatus}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      result.sharia_analysis.business_activity.status === "PASS" || result.sharia_analysis.business_activity.status === "GECTI"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                    }`}>
                      {result.sharia_analysis.business_activity.status}
                    </span>
                  </div>
                )}
                {result.sharia_analysis.business_activity.details && (
                  <p className="text-[10px] text-[#605030] leading-relaxed mt-1 border-t border-[#1A1610] pt-2">
                    {result.sharia_analysis.business_activity.details}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Financial Ratios */}
          {result.sharia_analysis.financial_ratios && (
            <div className="mb-4">
              <p className="text-[10px] font-bold text-[#504020] tracking-widest uppercase mb-2">
                {t.shariaFinancialRatios}
              </p>
              <div className="bg-[#090807] rounded-lg p-3 space-y-2.5">
                {(() => {
                  const ratios = result.sharia_analysis.financial_ratios;
                  const ratioItems = [
                    { key: "debt_to_market_cap", label: t.shariaDebtRatio, threshold: "< 30%" },
                    { key: "interest_income_ratio", label: t.shariaInterestRatio, threshold: "< 5%" },
                    { key: "cash_and_securities_ratio", label: t.shariaCashRatio, threshold: "< 30%" },
                    { key: "receivables_ratio", label: t.shariaReceivablesRatio, threshold: "< 45%" },
                  ];
                  return ratioItems.map(({ key, label, threshold }) => {
                    const val = ratios[key];
                    if (val == null) return null;
                    const numVal = typeof val === "object" ? val.value : val;
                    const passed = typeof val === "object" ? val.status === "PASS" || val.status === "GECTI" : true;
                    return (
                      <div key={key}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[11px] text-[#B8A870]">{label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-[#504020]">{t.shariaThreshold}: {threshold}</span>
                            <span className={`font-mono text-[11px] font-bold ${passed ? "text-green-400" : "text-red-400"}`}>
                              {typeof numVal === "number" ? `%${numVal.toFixed(1)}` : numVal}
                            </span>
                          </div>
                        </div>
                        <div className="h-1 bg-[#1A1610] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${passed ? "bg-green-500" : "bg-red-500"}`}
                            style={{ width: `${Math.min(typeof numVal === "number" ? numVal : 0, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  }).filter(Boolean);
                })()}
                {result.sharia_analysis.financial_ratios?.status && (
                  <div className="flex justify-between items-center pt-2 border-t border-[#1A1610]">
                    <span className="text-[11px] text-[#706040]">{t.shariaOverallStatus}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      result.sharia_analysis.financial_ratios.status === "PASS" || result.sharia_analysis.financial_ratios.status === "GECTI"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                    }`}>
                      {result.sharia_analysis.financial_ratios.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Purification Ratio */}
          {result.sharia_analysis.purification_ratio != null && (
            <div className="mb-4">
              <p className="text-[10px] font-bold text-[#504020] tracking-widest uppercase mb-2">
                {t.shariaPurification}
              </p>
              <div className="bg-[#090807] rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#B8A870]">
                    {language === "TR" ? "Temettü / Gelirden arındırılması gereken oran" : "Dividend / Income purification percentage"}
                  </span>
                  <span className="font-mono text-lg font-black text-yellow-400">
                    %{typeof result.sharia_analysis.purification_ratio === "number"
                      ? result.sharia_analysis.purification_ratio.toFixed(2)
                      : result.sharia_analysis.purification_ratio}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Overall Details / Summary */}
          {result.sharia_analysis.details && (
            <div className="bg-[#090807] rounded-lg p-3">
              <p className="text-[10px] font-bold text-[#504020] tracking-widest uppercase mb-1.5">{t.shariaDetails}</p>
              <p className="text-[11px] text-[#A09060] leading-relaxed">{result.sharia_analysis.details}</p>
            </div>
          )}

          {/* Overall verdict summary if present */}
          {result.sharia_analysis.overall_summary && (
            <div className="bg-[#090807] rounded-lg p-3 mt-3">
              <p className="text-[11px] text-[#A09060] leading-relaxed">{result.sharia_analysis.overall_summary}</p>
            </div>
          )}
        </div>
      )}

      {/* ━━━ Self Audit ━━━ */}
      {result.self_audit && (
        <div className="bg-[#0D0B08] border border-[#1A1610] rounded-xl p-4 sm:p-6">
          <h3 className="font-bold text-[#D4C8A0] mb-4 flex items-center gap-2 text-sm sm:text-base">
            <span className={result.barrier_triggered ? "text-red-500" : "text-green-500"}>
              {result.barrier_triggered ? "✗" : "✓"}
            </span>
            {t.selfAudit}
          </h3>
          <div className="space-y-3">
            {Object.entries(result.self_audit).map(([key, val]: [string, any]) => (
              <div key={key} className="flex flex-col sm:flex-row gap-1 sm:gap-3 pb-3 border-b border-[#1A1610] last:border-0">
                <span className="font-mono text-[10px] font-bold text-[#706040] sm:min-w-[140px] pt-0.5">
                  {auditLbls[key] || key}
                </span>
                <span className="text-[11px] sm:text-xs text-[#A09060] leading-relaxed">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ━━━ Exit Signals ━━━ */}
      {result.exit_signals?.some((s: any) => s.active) && (
        <div className="bg-[#0D0B08] border border-red-500/20 rounded-xl p-4 sm:p-6">
          <h3 className="font-bold text-red-400 mb-4 text-sm sm:text-base">{t.exitSignals}</h3>
          <div className="space-y-3">
            {result.exit_signals.filter((s: any) => s.active).map((sig: any, i: number) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pb-3 border-b border-[#1A1610] last:border-0">
                <span
                  className="font-mono text-[10px] font-bold px-3 py-1 rounded whitespace-nowrap self-start"
                  style={{
                    backgroundColor: (EXIT_COLORS[sig.type] || "#EF4444") + "15",
                    color: EXIT_COLORS[sig.type] || "#EF4444",
                  }}
                >
                  {exitLbls[sig.type] || sig.type}
                </span>
                <span className="text-[11px] sm:text-xs text-[#B8A870] leading-relaxed">{sig.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ━━━ Commentary ━━━ */}
      {result.commentary && (
        <div className="bg-[#0D0B08] border border-[#1A1610] rounded-xl p-4 sm:p-6">
          <h3 className="font-bold text-[#D4C8A0] mb-3 text-sm sm:text-base">{t.commentary}</h3>
          <p className="text-xs sm:text-sm text-[#B8A870] leading-[1.8] whitespace-pre-wrap">
            {result.commentary}
          </p>
        </div>
      )}

      {/* ━━━ Dynamic Weighting ━━━ */}
      {result.weights && (
        <div className="bg-[#0D0B08] border border-[#1A1610] rounded-xl p-4 sm:p-6">
          <h3 className="font-bold text-[#A09060] mb-3 text-xs sm:text-sm">{t.weightCalc}</h3>
          <div className="font-mono text-[10px] sm:text-xs text-[#706040] bg-[#090807] rounded-lg p-3 sm:p-4 space-y-1 overflow-x-auto">
            <p>
              {t.regime}: <span style={{ color: regime.color }}>{regime.label}</span>
              {result.regime_reason && <span className="text-[#504020]"> — {result.regime_reason}</span>}
            </p>
            <p className="text-[#A09060] break-all">
              ({getFilterScore(result, "filter_1").toFixed(1)}×{result.weights.w1} +{" "}
              {getFilterScore(result, "filter_2").toFixed(1)}×{result.weights.w2} +{" "}
              {getFilterScore(result, "filter_3").toFixed(1)}×{result.weights.w3} +{" "}
              {getFilterScore(result, "filter_4").toFixed(1)}×{result.weights.w4}) / (
              {result.weights.w1}+{result.weights.w2}+{result.weights.w3}+{result.weights.w4})
            </p>
            <p className={`font-bold ${getScoreColor(score)}`}>
              = {score?.toFixed(2)} →{" "}
              {result.verdict === "MUKEMMEL" ? t.excellent
                : result.verdict === "KABULEDILEBILIR" ? t.acceptable
                : t.notRecommended}
            </p>
          </div>
        </div>
      )}

      {/* ━━━ Disclaimer ━━━ */}
      <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 text-center">
        <p className="text-[10px] sm:text-[11px] text-red-400/70">{t.disclaimer}</p>
      </div>

      {/* ━━━ PDF Export Button ━━━ */}
      <div className="flex justify-center">
        <button
          onClick={async () => {
            try {
              const res = await fetch("/api/export-pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ result, language }),
              });
              const data = await res.json();
              if (!res.ok || !data.html) throw new Error(data.error || "PDF oluşturulamadı");

              // Open in new tab for print-to-PDF
              const w = window.open("", "_blank");
              if (w) {
                w.document.write(data.html);
                w.document.close();
                // Auto-trigger print dialog after brief delay
                setTimeout(() => w.print(), 500);
              }
            } catch (err) {
              console.error("PDF export error:", err);
              alert(language === "TR" ? "PDF oluşturulurken hata oluştu." : "Error creating PDF.");
            }
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#13110E] border border-[#2A2520] rounded-xl text-[#A09060] text-xs font-bold hover:border-[#4A4530] hover:text-[#D4C8A0] transition-all cursor-pointer active:scale-[0.98]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {language === "TR" ? "PDF OLARAK İNDİR" : "DOWNLOAD PDF"}
        </button>
      </div>

      {/* ━━━ Quick → Deep Upgrade CTA ━━━ */}
      {result._tier === "quick" && (
        <div className="bg-gradient-to-r from-red-500/5 to-purple-500/5 border border-[#2A2520] rounded-xl p-5 text-center">
          <p className="text-sm font-bold text-[#D4C8A0] mb-2">
            {language === "TR"
              ? "Daha detaylı analiz ister misin?"
              : "Want a more detailed analysis?"}
          </p>
          <p className="text-[11px] text-[#706040] mb-4">
            {language === "TR"
              ? "Derin analiz, Perplexity + Claude ile internet'ten canlı veri toplayarak 4 süzgeci detaylı puanlar."
              : "Deep analysis uses Perplexity + Claude to gather live data from the internet and score all 4 filters in detail."}
          </p>
          <button
            onClick={() => {
              const event = new CustomEvent("triggerDeepAnalysis", { detail: { ticker: result.ticker } });
              window.dispatchEvent(event);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-700 hover:bg-red-600 text-white text-sm font-bold rounded-xl tracking-wider transition-all cursor-pointer active:scale-[0.98]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {language === "TR" ? "DERİN ANALİZ YAP" : "RUN DEEP ANALYSIS"}
          </button>
        </div>
      )}
    </div>
  );
}
