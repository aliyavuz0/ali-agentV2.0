import { NextRequest, NextResponse } from "next/server";

// Bu endpoint analiz verisini alıp PDF-ready HTML string döner.
// Client tarafında window.print() veya html2pdf ile PDF oluşturulur.
// Böylece server'da puppeteer gibi ağır dependency'lere gerek kalmaz.

export async function POST(request: NextRequest) {
  try {
    const { result, language = "TR" } = await request.json();
    if (!result) return NextResponse.json({ error: "Result gerekli" }, { status: 400 });

    const t = language === "EN" ? EN_TEXT : TR_TEXT;
    const score = Number(result.final_score) || 0;
    const scoreColor = score >= 80 ? "#22C55E" : score >= 60 ? "#F59E0B" : "#EF4444";
    const verdict = result.verdict === "MUKEMMEL" ? t.excellent
      : result.verdict === "KABULEDILEBILIR" ? t.acceptable
      : t.notRecommended;

    const regimeLabel = language === "EN"
      ? { normal: "Normal Market", bear: "Bear Market", bull: "Bull Market" }
      : { normal: "Normal Piyasa", bear: "Ayı Piyasası", bull: "Boğa Piyasası" };

    const filters = language === "EN"
      ? [
          { key: "filter_1", label: "Financial Quality", role: "ENGINE" },
          { key: "filter_2", label: "Macro & Liquidity", role: "WEATHER" },
          { key: "filter_3", label: "CANSLIM Momentum", role: "FUEL" },
          { key: "filter_4", label: "Valuation & Risk", role: "SAFETY BELT" },
        ]
      : [
          { key: "filter_1", label: "Finansal Kalite", role: "MOTOR" },
          { key: "filter_2", label: "Makro & Likidite", role: "HAVA DURUMU" },
          { key: "filter_3", label: "CANSLIM Momentum", role: "YAKIT" },
          { key: "filter_4", label: "Değerleme & Risk", role: "EMNİYET KEMERİ" },
        ];

    const getScore = (key: string) => {
      if (key === "filter_1") return Number(result.filter_1?.score_normalized ?? result.filter_1?.score) || 0;
      return Number(result[key]?.score) || 0;
    };

    const filterRows = filters.map((f) => {
      const s = getScore(f.key);
      const c = s >= 80 ? "#22C55E" : s >= 60 ? "#F59E0B" : "#EF4444";
      return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #1A1610;color:#B8A870;font-weight:600">${f.label}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #1A1610;color:#706040;font-size:11px">${f.role}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #1A1610;text-align:right;font-family:monospace;font-weight:800;color:${c}">${s.toFixed(1)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #1A1610">
            <div style="background:#1A1610;border-radius:4px;height:8px;overflow:hidden">
              <div style="background:${c};height:100%;width:${Math.min(s, 100)}%;border-radius:4px"></div>
            </div>
          </td>
        </tr>`;
    }).join("");

    // Subcategory details for each filter
    const subNames = language === "EN"
      ? { finansallar: "Financials", hendek: "Moat", potansiyel: "Potential", gelir_kalitesi: "Revenue Quality", musteri: "Customer", yonetim: "Management", hisse_performans: "Stock Perf.", fcf: "FCF", likidite_mb: "Liquidity & CB", enflasyon_tahvil: "Inflation & Bonds", sektorel_uyum: "Sector Align.", buyuk_bahis: "Big Bet", c_quarterly_eps: "C—EPS", a_annual_eps: "A—Annual EPS", n_new: "N—New", s_supply_demand: "S—Supply/Demand", l_leader: "L—Leader", i_institutional: "I—Institutional", m_market: "M—Market", degerleme: "Valuation", risk: "Risk", dilusyon: "Dilution", tam_growth: "TAM & Growth", makro_duyarlilik: "Macro Sensitivity" }
      : { finansallar: "Finansallar", hendek: "Hendek", potansiyel: "Potansiyel", gelir_kalitesi: "Gelir Kalitesi", musteri: "Müşteri", yonetim: "Yönetim", hisse_performans: "Hisse Perf.", fcf: "FCF", likidite_mb: "Likidite & MB", enflasyon_tahvil: "Enflasyon & Tahvil", sektorel_uyum: "Sektörel Uyum", buyuk_bahis: "Büyük Bahis", c_quarterly_eps: "C—EPS", a_annual_eps: "A—Yıllık EPS", n_new: "N—Yeni", s_supply_demand: "S—Arz/Talep", l_leader: "L—Lider", i_institutional: "I—Kurumsal", m_market: "M—Piyasa", degerleme: "Değerleme", risk: "Risk", dilusyon: "Dilüsyon", tam_growth: "TAM & Büyüme", makro_duyarlilik: "Makro Duyarlılık" };

    const subDetails = filters.map((f) => {
      const subs = result[f.key]?.subcategories;
      if (!subs || Object.keys(subs).length === 0) return "";
      const rows = Object.entries(subs).map(([key, val]: [string, any]) => {
        const pct = val.max > 0 ? (val.score / val.max) * 100 : 0;
        const c = pct >= 70 ? "#22C55E" : pct >= 45 ? "#F59E0B" : "#EF4444";
        return `<tr>
          <td style="padding:6px 8px;color:#A09060;font-size:11px">${(subNames as any)[key] || key}</td>
          <td style="padding:6px 8px;text-align:right;font-family:monospace;font-size:11px;color:${c};font-weight:700">${val.score}/${val.max}</td>
        </tr>`;
      }).join("");
      return `
        <div style="margin-bottom:16px">
          <h4 style="color:#D4C8A0;font-size:13px;margin:0 0 8px;font-weight:700">${f.label} (${f.role})</h4>
          <table style="width:100%;border-collapse:collapse">${rows}</table>
        </div>`;
    }).join("");

    // Self audit
    const auditSection = result.self_audit ? Object.entries(result.self_audit).map(([key, val]) => 
      `<p style="margin:4px 0;font-size:11px"><span style="color:#706040;font-weight:700">${key}:</span> <span style="color:#A09060">${val}</span></p>`
    ).join("") : "";

    // Commentary
    const commentarySection = result.commentary
      ? `<div style="margin-top:20px;padding:16px;background:#0D0B08;border:1px solid #1A1610;border-radius:8px">
           <h3 style="color:#D4C8A0;font-size:14px;margin:0 0 8px">${t.commentary}</h3>
           <p style="color:#B8A870;font-size:12px;line-height:1.8;white-space:pre-wrap">${result.commentary}</p>
         </div>`
      : "";

    // Weights
    const weightsSection = result.weights
      ? `<div style="margin-top:16px;padding:12px;background:#090807;border-radius:8px;font-family:monospace;font-size:11px;color:#706040">
           <p>${t.regime}: ${(regimeLabel as any)[result.market_regime] || "Normal"}</p>
           <p style="color:#A09060">(${getScore("filter_1").toFixed(1)}×${result.weights.w1} + ${getScore("filter_2").toFixed(1)}×${result.weights.w2} + ${getScore("filter_3").toFixed(1)}×${result.weights.w3} + ${getScore("filter_4").toFixed(1)}×${result.weights.w4}) / (${result.weights.w1}+${result.weights.w2}+${result.weights.w3}+${result.weights.w4})</p>
           <p style="color:${scoreColor};font-weight:800">= ${score.toFixed(2)} → ${verdict}</p>
         </div>`
      : "";

    const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>Ali Agent V2.0 — ${result.ticker} ${t.report}</title>
<style>
  @page { margin: 40px; size: A4; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0A0908; color: #E0D4B8; padding: 40px; max-width: 800px; margin: 0 auto; }
</style>
</head><body>

<!-- Header -->
<div style="text-align:center;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid #1A1610">
  <div style="display:inline-block;background:#0F0D0A;border:1px solid #1A1610;border-radius:20px;padding:6px 20px;margin-bottom:16px">
    <span style="font-family:monospace;font-size:12px;font-weight:800;color:#EF4444;letter-spacing:4px">ALİ AGENT V2.0</span>
  </div>
  <h1 style="font-size:28px;color:#F0E8D0;margin-bottom:4px">${result.ticker}${result.company_name ? ` — ${result.company_name}` : ""}</h1>
  <p style="color:#605030;font-size:12px">${new Date().toLocaleDateString(language === "TR" ? "tr-TR" : "en-US", { year: "numeric", month: "long", day: "numeric" })} · ${result._tier === "deep" ? t.deepAnalysis : t.quickAnalysis}</p>
</div>

<!-- Score -->
<div style="text-align:center;padding:32px;background:#0D0B08;border:1px solid #1A1610;border-radius:16px;margin-bottom:24px">
  <p style="font-family:monospace;font-size:12px;color:#605030;letter-spacing:3px;margin-bottom:8px">${t.finalScore}</p>
  <p style="font-size:64px;font-family:monospace;font-weight:900;color:${scoreColor};line-height:1">${score.toFixed(1)}</p>
  <div style="display:inline-block;margin-top:12px;padding:8px 24px;border-radius:8px;font-weight:800;font-size:14px;letter-spacing:3px;color:${scoreColor};background:${scoreColor}15;border:1px solid ${scoreColor}30">${verdict}</div>
  ${result.barrier_triggered ? `<div style="margin-top:12px;padding:8px 16px;background:#EF444415;border:1px solid #EF444430;border-radius:8px;display:inline-block"><span style="color:#EF4444;font-weight:700;font-size:12px">${t.barrier}</span></div>` : ""}
</div>

<!-- Filter Scores -->
<div style="background:#0D0B08;border:1px solid #1A1610;border-radius:12px;overflow:hidden;margin-bottom:24px">
  <table style="width:100%;border-collapse:collapse">
    <thead><tr style="background:#13110E">
      <th style="text-align:left;padding:10px 12px;color:#706040;font-size:11px;font-weight:600">${t.filter}</th>
      <th style="text-align:left;padding:10px 12px;color:#706040;font-size:11px;font-weight:600">${t.role}</th>
      <th style="text-align:right;padding:10px 12px;color:#706040;font-size:11px;font-weight:600">${t.score}</th>
      <th style="padding:10px 12px;width:120px"></th>
    </tr></thead>
    <tbody>${filterRows}</tbody>
  </table>
</div>

<!-- Subcategory Details -->
<div style="background:#0D0B08;border:1px solid #1A1610;border-radius:12px;padding:20px;margin-bottom:24px">
  <h3 style="color:#D4C8A0;font-size:14px;margin-bottom:16px;font-weight:700">${t.details}</h3>
  ${subDetails}
</div>

<!-- Self Audit -->
${auditSection ? `<div style="background:#0D0B08;border:1px solid #1A1610;border-radius:12px;padding:20px;margin-bottom:24px">
  <h3 style="color:#D4C8A0;font-size:14px;margin-bottom:12px;font-weight:700">${t.selfAudit}</h3>
  ${auditSection}
</div>` : ""}

<!-- Commentary -->
${commentarySection}

<!-- Weights -->
${weightsSection}

<!-- Disclaimer -->
<div style="margin-top:24px;padding:16px;background:#EF44440A;border:1px solid #EF44441A;border-radius:12px;text-align:center">
  <p style="color:#EF4444AA;font-size:10px">${t.disclaimer}</p>
</div>

<!-- Footer -->
<div style="text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #1A1610">
  <p style="color:#40382A;font-size:10px">Ali Agent V2.0 · ali-agent-v2-0.vercel.app · ${new Date().toISOString().split("T")[0]}</p>
</div>

</body></html>`;

    return NextResponse.json({ html });
  } catch (error: any) {
    console.error("PDF export hatası:", error);
    return NextResponse.json({ error: error.message || "PDF oluşturulamadı" }, { status: 500 });
  }
}

const TR_TEXT = {
  report: "Analiz Raporu", finalScore: "NİHAİ PUAN", excellent: "MÜKEMMEL",
  acceptable: "KABULEDİLEBİLİR", notRecommended: "TAVSİYE EDİLMEZ",
  barrier: "⛔ BARİYER AKTİF — TAVSİYE EDİLMEZ", filter: "Süzgeç", role: "Rol",
  score: "Puan", details: "Alt Kategori Detayları", selfAudit: "Öz-Denetim Protokolü",
  commentary: "Ali Agent Yorumu", regime: "Rejim", disclaimer: "⚠️ Bu analiz yatırım tavsiyesi niteliği taşımamaktadır. Yatırım kararları tamamen bireylerin kendi sorumluluğundadır.",
  deepAnalysis: "Derin Analiz", quickAnalysis: "Hızlı Analiz",
};

const EN_TEXT = {
  report: "Analysis Report", finalScore: "FINAL SCORE", excellent: "EXCELLENT",
  acceptable: "ACCEPTABLE", notRecommended: "NOT RECOMMENDED",
  barrier: "⛔ BARRIER ACTIVE — NOT RECOMMENDED", filter: "Filter", role: "Role",
  score: "Score", details: "Subcategory Details", selfAudit: "Self-Audit Protocol",
  commentary: "Ali Agent Commentary", regime: "Regime", disclaimer: "⚠️ This analysis does not constitute investment advice. Investment decisions are the sole responsibility of individuals.",
  deepAnalysis: "Deep Analysis", quickAnalysis: "Quick Analysis",
};
