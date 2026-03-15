import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { result, language = "TR" } = await request.json();
    if (!result) return NextResponse.json({ error: "Result gerekli" }, { status: 400 });

    const t = language === "EN" ? EN : TR;

    // Score calculation — server-side guarantee
    const s1 = Number(result.filter_1?.score_normalized ?? result.filter_1?.score) || 0;
    const s2 = Number(result.filter_2?.score) || 0;
    const s3 = Number(result.filter_3?.score) || 0;
    const s4 = Number(result.filter_4?.score) || 0;
    const w1 = Number(result.weights?.w1) || 1;
    const w2 = Number(result.weights?.w2) || 1;
    const w3 = Number(result.weights?.w3) || 1;
    const w4 = Number(result.weights?.w4) || 1;
    const totalW = w1 + w2 + w3 + w4;
    const score = Number(result.final_score) || (totalW > 0 ? (s1*w1+s2*w2+s3*w3+s4*w4)/totalW : 0);
    const scoreColor = score >= 80 ? "#16a34a" : score >= 60 ? "#ca8a04" : "#dc2626";
    const scoreBg = score >= 80 ? "#f0fdf4" : score >= 60 ? "#fefce8" : "#fef2f2";
    const verdict = result.verdict === "MUKEMMEL" ? t.excellent : result.verdict === "KABULEDILEBILIR" ? t.acceptable : t.notRecommended;
    const regime = language === "EN"
      ? { normal: "Normal Market", bear: "Bear Market", bull: "Bull Market" }
      : { normal: "Normal Piyasa", bear: "Ayı Piyasası", bull: "Boğa Piyasası" };

    const filters = [
      { key: "filter_1", label: language==="EN"?"Financial Quality":"Finansal Kalite", role: language==="EN"?"ENGINE":"MOTOR", score: s1 },
      { key: "filter_2", label: language==="EN"?"Macro & Liquidity":"Makro & Likidite", role: language==="EN"?"WEATHER":"HAVA DURUMU", score: s2 },
      { key: "filter_3", label: language==="EN"?"CANSLIM Momentum":"CANSLIM Momentum", role: language==="EN"?"FUEL":"YAKIT", score: s3 },
      { key: "filter_4", label: language==="EN"?"Valuation & Risk":"Değerleme & Risk", role: language==="EN"?"SAFETY BELT":"EMNİYET KEMERİ", score: s4 },
    ];

    const subNames: Record<string,string> = language === "EN"
      ? { finansallar:"Financials",hendek:"Moat",potansiyel:"Potential",gelir_kalitesi:"Revenue Quality",musteri:"Customer",yonetim:"Management",hisse_performans:"Stock Perf.",fcf:"FCF",likidite_mb:"Liquidity & CB",enflasyon_tahvil:"Inflation & Bonds",sektorel_uyum:"Sector Alignment",buyuk_bahis:"Big Bet",c_quarterly_eps:"C—Quarterly EPS",a_annual_eps:"A—Annual EPS",n_new:"N—New",s_supply_demand:"S—Supply/Demand",l_leader:"L—Leader",i_institutional:"I—Institutional",m_market:"M—Market",degerleme:"Valuation",risk:"Risk",dilusyon:"Dilution",tam_growth:"TAM & Growth",makro_duyarlilik:"Macro Sensitivity" }
      : { finansallar:"Finansallar",hendek:"Hendek (Moat)",potansiyel:"Potansiyel",gelir_kalitesi:"Gelir Kalitesi",musteri:"Müşteri",yonetim:"Yönetim",hisse_performans:"Hisse Perf.",fcf:"Serbest Nakit Akışı",likidite_mb:"Likidite & MB",enflasyon_tahvil:"Enflasyon & Tahvil",sektorel_uyum:"Sektörel Uyum",buyuk_bahis:"Büyük Bahis",c_quarterly_eps:"C—Çeyreklik EPS",a_annual_eps:"A—Yıllık EPS",n_new:"N—Yeni Ürün",s_supply_demand:"S—Arz & Talep",l_leader:"L—Lider",i_institutional:"I—Kurumsal",m_market:"M—Piyasa",degerleme:"Değerleme",risk:"Sistematik Risk",dilusyon:"Dilüsyon",tam_growth:"TAM & Büyüme",makro_duyarlilik:"Makro Duyarlılık" };

    // Filter summary rows
    const filterTableRows = filters.map(f => {
      const c = f.score >= 80 ? "#16a34a" : f.score >= 60 ? "#ca8a04" : "#dc2626";
      const bg = f.score >= 80 ? "#f0fdf4" : f.score >= 60 ? "#fefce8" : "#fef2f2";
      return `<tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#111">${f.label}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:12px">${f.role}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:center">
          <span style="background:${bg};color:${c};font-weight:800;font-family:monospace;padding:4px 12px;border-radius:6px;font-size:14px">${f.score.toFixed(1)}</span>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;width:140px">
          <div style="background:#e5e7eb;border-radius:999px;height:8px;overflow:hidden">
            <div style="background:${c};height:100%;width:${Math.min(f.score,100)}%;border-radius:999px"></div>
          </div>
        </td>
      </tr>`;
    }).join("");

    // Subcategory detail sections
    const subSections = filters.map(f => {
      const subs = result[f.key]?.subcategories;
      if (!subs || Object.keys(subs).length === 0) return "";
      const rows = Object.entries(subs).map(([k, v]: [string, any]) => {
        const pct = v.max > 0 ? (v.score/v.max)*100 : 0;
        const c = pct >= 70 ? "#16a34a" : pct >= 45 ? "#ca8a04" : "#dc2626";
        return `<tr>
          <td style="padding:6px 0;color:#374151;font-size:13px">${subNames[k]||k}</td>
          <td style="padding:6px 0;text-align:right;font-family:monospace;font-size:13px;font-weight:700;color:${c}">${v.score}/${v.max}</td>
          <td style="padding:6px 0 6px 12px;width:80px"><div style="background:#e5e7eb;border-radius:999px;height:5px;overflow:hidden"><div style="background:${c};height:100%;width:${pct}%;border-radius:999px"></div></div></td>
        </tr>`;
      }).join("");
      return `<div style="margin-bottom:20px">
        <h4 style="font-size:13px;font-weight:700;color:#111;margin:0 0 8px;padding-bottom:6px;border-bottom:2px solid ${filters.find(x=>x.key===f.key)!.score >= 80 ? '#16a34a' : filters.find(x=>x.key===f.key)!.score >= 60 ? '#ca8a04' : '#dc2626'}">${f.label}</h4>
        <table style="width:100%;border-collapse:collapse">${rows}</table>
      </div>`;
    }).join("");

    // Self audit
    const auditHtml = result.self_audit ? Object.entries(result.self_audit).map(([k, v]) =>
      `<div style="margin-bottom:10px;padding:10px 12px;background:#f9fafb;border-radius:6px;border-left:3px solid #6b7280">
        <p style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;margin:0 0 4px">${k.replace(/_/g," ")}</p>
        <p style="font-size:12px;color:#374151;margin:0;line-height:1.6">${v}</p>
      </div>`
    ).join("") : "";

    const date = new Date().toLocaleDateString(language === "TR" ? "tr-TR" : "en-US", { year:"numeric",month:"long",day:"numeric" });
    const tierLabel = result._tier === "deep" ? t.deep : t.quick;

    const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>Ali Agent V2.0 — ${result.ticker} ${t.report}</title>
<style>
  @page { margin: 32px 40px; size: A4; }
  @media print { body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, sans-serif; color: #111; background: #fff; padding: 40px; max-width: 780px; margin: 0 auto; font-size: 14px; line-height: 1.5; }
  .page-break { page-break-before: always; }
</style>
</head><body>

<!-- ━━━ HEADER ━━━ -->
<div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:2px solid #111;margin-bottom:28px">
  <div>
    <div style="display:inline-block;background:#111;color:#fff;padding:4px 14px;border-radius:4px;font-size:11px;font-weight:800;letter-spacing:3px;font-family:monospace;margin-bottom:8px">ALI AGENT V2.0</div>
    <h1 style="font-size:26px;font-weight:800;color:#111;margin:4px 0 2px">${result.ticker}${result.company_name ? ` — ${result.company_name}` : ""}</h1>
    <p style="color:#6b7280;font-size:13px">${date} · ${tierLabel}</p>
  </div>
  <div style="text-align:right">
    <div style="background:${scoreBg};border:2px solid ${scoreColor};border-radius:12px;padding:12px 24px;display:inline-block">
      <p style="font-size:11px;color:#6b7280;font-weight:600;margin-bottom:2px">${t.finalScore}</p>
      <p style="font-size:36px;font-weight:900;font-family:monospace;color:${scoreColor};line-height:1">${score.toFixed(1)}</p>
    </div>
  </div>
</div>

<!-- ━━━ VERDICT + REGIME ━━━ -->
<div style="display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap">
  <span style="background:${scoreBg};color:${scoreColor};font-weight:800;padding:6px 20px;border-radius:6px;font-size:13px;letter-spacing:2px">${verdict}</span>
  <span style="background:#f3f4f6;color:#374151;font-weight:600;padding:6px 16px;border-radius:6px;font-size:12px">${(regime as any)[result.market_regime] || regime.normal}</span>
  ${result.barrier_triggered ? `<span style="background:#fef2f2;color:#dc2626;font-weight:700;padding:6px 16px;border-radius:6px;font-size:12px">${t.barrier}</span>` : ""}
</div>

<!-- ━━━ FILTER SUMMARY TABLE ━━━ -->
<table style="width:100%;border-collapse:collapse;margin-bottom:28px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
  <thead><tr style="background:#f9fafb">
    <th style="text-align:left;padding:10px 16px;font-size:12px;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb">${t.filter}</th>
    <th style="text-align:left;padding:10px 16px;font-size:12px;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb">${t.role}</th>
    <th style="text-align:center;padding:10px 16px;font-size:12px;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb">${t.score}</th>
    <th style="padding:10px 16px;border-bottom:1px solid #e5e7eb"></th>
  </tr></thead>
  <tbody>${filterTableRows}</tbody>
</table>

<!-- ━━━ SUBCATEGORY DETAILS ━━━ -->
<div style="margin-bottom:28px">
  <h3 style="font-size:15px;font-weight:700;color:#111;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid #e5e7eb">${t.details}</h3>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px 32px">
    ${subSections}
  </div>
</div>

<!-- ━━━ SELF AUDIT ━━━ -->
${auditHtml ? `<div style="margin-bottom:28px">
  <h3 style="font-size:15px;font-weight:700;color:#111;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #e5e7eb">${t.selfAudit}</h3>
  ${auditHtml}
</div>` : ""}

<!-- ━━━ COMMENTARY ━━━ -->
${result.commentary ? `<div style="margin-bottom:28px;padding:20px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb">
  <h3 style="font-size:15px;font-weight:700;color:#111;margin-bottom:10px">${t.commentary}</h3>
  <p style="font-size:13px;color:#374151;line-height:1.8;white-space:pre-wrap">${result.commentary}</p>
</div>` : ""}

<!-- ━━━ WEIGHTING FORMULA ━━━ -->
<div style="padding:16px;background:#f3f4f6;border-radius:8px;font-family:monospace;font-size:12px;color:#6b7280;margin-bottom:28px">
  <p><strong style="color:#374151">${t.regime}:</strong> ${(regime as any)[result.market_regime] || "Normal"}</p>
  <p style="margin-top:4px">(${s1.toFixed(1)}×${w1} + ${s2.toFixed(1)}×${w2} + ${s3.toFixed(1)}×${w3} + ${s4.toFixed(1)}×${w4}) / (${w1}+${w2}+${w3}+${w4})</p>
  <p style="margin-top:4px;color:${scoreColor};font-weight:800;font-size:14px">= ${score.toFixed(2)} → ${verdict}</p>
</div>

<!-- ━━━ DISCLAIMER ━━━ -->
<div style="padding:14px 20px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;text-align:center;margin-bottom:20px">
  <p style="color:#991b1b;font-size:11px">${t.disclaimer}</p>
</div>

<!-- ━━━ FOOTER ━━━ -->
<div style="text-align:center;padding-top:16px;border-top:1px solid #e5e7eb">
  <p style="color:#9ca3af;font-size:10px">Ali Agent V2.0 · ali-agent-v2-0.vercel.app · ${new Date().toISOString().split("T")[0]}</p>
</div>

</body></html>`;

    return NextResponse.json({ html });
  } catch (error: any) {
    console.error("PDF export hatası:", error);
    return NextResponse.json({ error: error.message || "PDF oluşturulamadı" }, { status: 500 });
  }
}

const TR = {
  report:"Analiz Raporu", finalScore:"NİHAİ PUAN", excellent:"MÜKEMMEL",
  acceptable:"KABULEDİLEBİLİR", notRecommended:"TAVSİYE EDİLMEZ",
  barrier:"BARİYER AKTİF", filter:"Süzgeç", role:"Rol", score:"Puan",
  details:"Alt Kategori Detayları", selfAudit:"Öz-Denetim Protokolü",
  commentary:"Ali Agent Yorumu", regime:"Rejim",
  disclaimer:"⚠️ Bu analiz yatırım tavsiyesi niteliği taşımamaktadır. Yatırım kararları tamamen bireylerin kendi sorumluluğundadır.",
  deep:"Derin Analiz", quick:"Hızlı Analiz",
};

const EN = {
  report:"Analysis Report", finalScore:"FINAL SCORE", excellent:"EXCELLENT",
  acceptable:"ACCEPTABLE", notRecommended:"NOT RECOMMENDED",
  barrier:"BARRIER ACTIVE", filter:"Filter", role:"Role", score:"Score",
  details:"Subcategory Details", selfAudit:"Self-Audit Protocol",
  commentary:"Ali Agent Commentary", regime:"Regime",
  disclaimer:"⚠️ This analysis does not constitute investment advice. Investment decisions are the sole responsibility of individuals.",
  deep:"Deep Analysis", quick:"Quick Analysis",
};
