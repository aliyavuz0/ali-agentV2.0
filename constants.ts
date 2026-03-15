// ═══════════════════════════════════════════════════════════
// ALI AGENT V2.0 — DESIGN TOKENS & CONSTANTS
// Tüm renk, metin ve konfigürasyon değerleri buradan yönetilir.
// ═══════════════════════════════════════════════════════════

// ━━━ DESIGN TOKENS ━━━
export const COLORS = {
  bg: {
    primary: "#0A0908",
    secondary: "#0D0B08",
    tertiary: "#0F0D0A",
    elevated: "#13110E",
  },
  border: {
    subtle: "#1A1610",
    medium: "#2A2520",
    strong: "#4A4530",
  },
  text: {
    primary: "#F0E8D0",
    secondary: "#D4C8A0",
    muted: "#B8A870",
    dim: "#A09060",
    faint: "#706040",
    ghost: "#605030",
    invisible: "#504020",
    darkest: "#40382A",
  },
  accent: {
    red: "#EF4444",
    redHover: "#DC2626",
    redDark: "#991B1B",
    green: "#22C55E",
    yellow: "#F59E0B",
    blue: "#3B82F6",
    purple: "#A855F7",
    orange: "#F97316",
  },
  brand: {
    gradientFrom: "#DC2626",
    gradientTo: "#7C3AED",
  },
} as const;

// ━━━ FILTER METADATA ━━━
export const FILTER_META: Record<
  string,
  { key: string; label: string; role: string; color: string; icon: string }[]
> = {
  TR: [
    { key: "filter_1", label: "Finansal Kalite", role: "MOTOR", color: COLORS.accent.red, icon: "⚙" },
    { key: "filter_2", label: "Makro & Likidite", role: "HAVA DURUMU", color: COLORS.accent.blue, icon: "☁" },
    { key: "filter_3", label: "CANSLIM Momentum", role: "YAKIT", color: COLORS.accent.green, icon: "⚡" },
    { key: "filter_4", label: "Değerleme & Risk", role: "EMNİYET KEMERİ", color: COLORS.accent.purple, icon: "🛡" },
  ],
  EN: [
    { key: "filter_1", label: "Financial Quality", role: "ENGINE", color: COLORS.accent.red, icon: "⚙" },
    { key: "filter_2", label: "Macro & Liquidity", role: "WEATHER", color: COLORS.accent.blue, icon: "☁" },
    { key: "filter_3", label: "CANSLIM Momentum", role: "FUEL", color: COLORS.accent.green, icon: "⚡" },
    { key: "filter_4", label: "Valuation & Risk", role: "SAFETY BELT", color: COLORS.accent.purple, icon: "🛡" },
  ],
};

export const SUB_NAMES: Record<string, Record<string, string>> = {
  TR: {
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
  },
  EN: {
    finansallar: "Financials", hendek: "Moat Analysis", potansiyel: "Potential Analysis",
    gelir_kalitesi: "Revenue Quality", musteri: "Customer Analysis", yonetim: "Management & Culture",
    hisse_performans: "Stock Performance", fcf: "Free Cash Flow",
    likidite_mb: "Liquidity & CB Policy", enflasyon_tahvil: "Inflation & Bonds",
    sektorel_uyum: "Sector Alignment", buyuk_bahis: "Big Bet Confidence",
    c_quarterly_eps: "C — Quarterly EPS", a_annual_eps: "A — Annual EPS (3Y)",
    n_new: "N — New Product/Mgmt", s_supply_demand: "S — Supply & Demand",
    l_leader: "L — Leader/Laggard", i_institutional: "I — Institutional",
    m_market: "M — Market Direction", degerleme: "Valuation", risk: "Systematic Risk",
    dilusyon: "Dilution", tam_growth: "TAM & Growth", makro_duyarlilik: "Macro Sensitivity",
  },
};

export const REGIME_LABELS: Record<string, Record<string, { label: string; color: string }>> = {
  TR: {
    normal: { label: "Normal Piyasa", color: COLORS.accent.yellow },
    bear: { label: "Ayı Piyasası", color: COLORS.accent.red },
    bull: { label: "Boğa Piyasası", color: COLORS.accent.green },
  },
  EN: {
    normal: { label: "Normal Market", color: COLORS.accent.yellow },
    bear: { label: "Bear Market", color: COLORS.accent.red },
    bull: { label: "Bull Market", color: COLORS.accent.green },
  },
};

export const EXIT_COLORS: Record<string, string> = {
  TEZ_CURUME: COLORS.accent.red,
  DEGERLEME_BALONU: COLORS.accent.orange,
  MAKRO_STOP: COLORS.accent.redHover,
  MOMENTUM_KAYBI: COLORS.accent.purple,
};

export const EXIT_LABELS: Record<string, Record<string, string>> = {
  TR: {
    TEZ_CURUME: "TEZ ÇÜRÜME", DEGERLEME_BALONU: "DEĞERLEME BALONU",
    MAKRO_STOP: "MAKRO STOP-LOSS", MOMENTUM_KAYBI: "MOMENTUM KAYBI",
  },
  EN: {
    TEZ_CURUME: "THESIS DECAY", DEGERLEME_BALONU: "VALUATION BUBBLE",
    MAKRO_STOP: "MACRO STOP-LOSS", MOMENTUM_KAYBI: "MOMENTUM LOSS",
  },
};

export const AUDIT_LABELS: Record<string, Record<string, string>> = {
  TR: {
    duplicate_check: "Mükerrer Puanlama", math_verification: "Matematik Sağlama",
    optimism_check: "İyimserlik Testi", thesis_conflict: "Tez Çelişkisi",
  },
  EN: {
    duplicate_check: "Duplicate Scoring", math_verification: "Math Verification",
    optimism_check: "Optimism Check", thesis_conflict: "Thesis Conflict",
  },
};

// ━━━ UI TEXT (i18n) ━━━
export const UI_TEXT: Record<string, Record<string, string>> = {
  TR: {
    signOut: "Çıkış Yap", newAnalysis: "+ Yeni Analiz", pastAnalyses: "Geçmiş Analizler",
    noAnalysis: "Henüz analiz yok.", preferences: "Tercihler", clearHistory: "Geçmişi Temizle",
    title: "Dörtlü Süzgeç Analiz Motoru", subtitle: "Ticker gir, AI verileri toplar ve 4 süzgeçten geçirir.",
    analyze: "ANALİZ ET", analyzing: "ANALİZ EDİLİYOR...",
    loading1: "Ali Agent çalışıyor... Veriler toplanıyor, süzgeçler puanlanıyor...",
    loading2: "Bu işlem 30-60 saniye sürebilir.",
    error: "Hata", finalScore: "NİHAİ PUAN",
    excellent: "MÜKEMMEL", acceptable: "KABULEDİLEBİLİR", notRecommended: "TAVSİYE EDİLMEZ",
    barrier: "⛔ BARİYER AKTİF — Genel ortalama ne olursa olsun: TAVSİYE EDİLMEZ",
    radarTitle: "Stratejik Puan Dengesi",
    greatCompany: "⚡ Harika Şirket, Pahalı Fiyat — Düzeltme Bekle",
    greatCompanySub: "Şirket kalitesi yüksek ama mevcut değerleme riskli.",
    close: "▲ KAPAT", detail: "▼ DETAY", barrierLabel: "BARİYER",
    selfAudit: "Öz-Denetim Protokolü", exitSignals: "⚠ Çıkış Stratejisi Sinyalleri",
    commentary: "Ali Agent Yorumu", weightCalc: "Dinamik Ağırlıklandırma Hesabı",
    regime: "Rejim",
    disclaimer: "⚠️ Bu analiz yatırım tavsiyesi niteliği taşımamaktadır. Yatırım kararları tamamen bireylerin kendi sorumluluğundadır.",
    loginTitle: "Dörtlü Süzgeç Analiz Motoru",
    loginSubtitle: "Hisse senetlerini AI ile acımasızca analiz et. 4 süzgeç, dinamik ağırlıklandırma, öz-denetim protokolü.",
    loginBtn: "Google ile Giriş Yap",
    loginNote: "Giriş yaparak analizlerini kaydedebilir ve geçmişine erişebilirsin.",
    confirmDelete: "Bu analizi silmek istediğine emin misin?",
    confirmDeleteAll: "Tüm analiz geçmişini silmek istediğine emin misin? Bu işlem geri alınamaz!",
    deleteSuccess: "Tüm geçmiş başarıyla temizlendi.",
    deleteFail: "Silme işlemi başarısız oldu.",
    role: "Rol",
    shariaToggle: "Şer'i Uyum Analizi",
    shariaTitle: "Şer'i Uyum Analizi (AAOIFI)",
    shariaCompliant: "UYGUN",
    shariaNonCompliant: "UYGUN DEĞİL",
    shariaQuestionable: "ŞÜPHELİ",
    shariaBusinessActivity: "Faaliyet Taraması",
    shariaFinancialRatios: "Finansal Oran Taraması",
    shariaPurification: "Arındırma Oranı",
    shariaOverallStatus: "Genel Durum",
    shariaDetails: "Detaylar",
    shariaDebtRatio: "Borç / Piyasa Değeri",
    shariaInterestRatio: "Faiz Geliri / Toplam Gelir",
    shariaCashRatio: "Nakit & Menkul / Piyasa Değeri",
    shariaReceivablesRatio: "Alacaklar / Piyasa Değeri",
    shariaThreshold: "AAOIFI Eşik",
    shariaNotAvailable: "Şer'i analiz bu sonuç için mevcut değil.",
  },
  EN: {
    signOut: "Sign Out", newAnalysis: "+ New Analysis", pastAnalyses: "Past Analyses",
    noAnalysis: "No analyses yet.", preferences: "Preferences", clearHistory: "Clear History",
    title: "Four-Filter Analysis Engine", subtitle: "Enter a ticker, AI gathers data and runs 4 filters.",
    analyze: "ANALYZE", analyzing: "ANALYZING...",
    loading1: "Ali Agent is working... Gathering data, scoring filters...",
    loading2: "This may take 30-60 seconds.",
    error: "Error", finalScore: "FINAL SCORE",
    excellent: "EXCELLENT", acceptable: "ACCEPTABLE", notRecommended: "NOT RECOMMENDED",
    barrier: "⛔ BARRIER ACTIVE — Regardless of overall average: NOT RECOMMENDED",
    radarTitle: "Strategic Score Balance",
    greatCompany: "⚡ Great Company, Expensive Price — Wait for Correction",
    greatCompanySub: "Company quality is high but current valuation is risky.",
    close: "▲ CLOSE", detail: "▼ DETAIL", barrierLabel: "BARRIER",
    selfAudit: "Self-Audit Protocol", exitSignals: "⚠ Exit Strategy Signals",
    commentary: "Ali Agent Commentary", weightCalc: "Dynamic Weighting Calculation",
    regime: "Regime",
    disclaimer: "⚠️ This analysis does not constitute investment advice. Investment decisions are the sole responsibility of individuals.",
    loginTitle: "Four-Filter Analysis Engine",
    loginSubtitle: "Brutally analyze stocks with AI. 4 filters, dynamic weighting, self-audit protocol.",
    loginBtn: "Sign in with Google",
    loginNote: "Sign in to save your analyses and access your history.",
    confirmDelete: "Are you sure you want to delete this analysis?",
    confirmDeleteAll: "Are you sure you want to delete all analysis history? This cannot be undone!",
    deleteSuccess: "All history cleared successfully.",
    deleteFail: "Delete operation failed.",
    role: "Role",
    shariaToggle: "Shariah Compliance Analysis",
    shariaTitle: "Shariah Compliance (AAOIFI)",
    shariaCompliant: "COMPLIANT",
    shariaNonCompliant: "NON-COMPLIANT",
    shariaQuestionable: "QUESTIONABLE",
    shariaBusinessActivity: "Business Activity Screening",
    shariaFinancialRatios: "Financial Ratio Screening",
    shariaPurification: "Purification Ratio",
    shariaOverallStatus: "Overall Status",
    shariaDetails: "Details",
    shariaDebtRatio: "Debt / Market Cap",
    shariaInterestRatio: "Interest Income / Total Revenue",
    shariaCashRatio: "Cash & Securities / Market Cap",
    shariaReceivablesRatio: "Receivables / Market Cap",
    shariaThreshold: "AAOIFI Threshold",
    shariaNotAvailable: "Shariah analysis not available for this result.",
  },
};

// ━━━ SCORE HELPERS ━━━
export const getScoreColor = (score: number): string =>
  score >= 80 ? "text-green-500" : score >= 60 ? "text-yellow-500" : "text-red-500";

export const getBarColor = (score: number): string =>
  score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500";

export const getBgColor = (score: number): string =>
  score >= 80 ? "#22C55E" : score >= 60 ? "#F59E0B" : "#EF4444";

export const getFilterScore = (result: any, filterKey: string): number => {
  if (!result) return 0;
  if (filterKey === "filter_1") return Number(result.filter_1?.score_normalized ?? result.filter_1?.score) || 0;
  return Number(result[filterKey]?.score) || 0;
};
