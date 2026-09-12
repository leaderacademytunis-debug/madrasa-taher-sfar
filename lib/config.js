// إعدادات المؤسسة والنظام البيداغوجي — مطابقة لجداول المدرسة الفعلية
// (خمسة أيام، حصص من ساعتين: 08-10 / 10-12 / 12-13 / 13-15 / 15-17، ونظام الفوجين صباحي/مسائي)

export const SCHOOL = {
  nom: "المدرسة الابتدائية الطاهر صفر",
  ville: "حمام الأنف",
  delegation: "المندوبية الجهوية للتربية ببن عروس",
  annee: "2026/2027",
  directeur: "مدير المؤسسة",
  facebook: "",
};

// المواد كما تُكتب في جداول المدرسة
export const DOMAINES = [
  { id: "ar", nom: "عربية", court: "عربية", couleur: "#1d4ed8" },
  { id: "math", nom: "رياضيات", court: "رياضيات", couleur: "#0f766e" },
  { id: "eveil", nom: "إيقاظ علمي", court: "إيقاظ", couleur: "#059669" },
  { id: "islam", nom: "تربية إسلامية", court: "إسلامية", couleur: "#065f46" },
  { id: "fr", nom: "فرنسية", court: "فرنسية", couleur: "#7c3aed" },
  { id: "en", nom: "إنجليزية", court: "إنجليزية", couleur: "#0891b2" },
  { id: "social", nom: "تنشئة اجتماعية", court: "اجتماعية", couleur: "#b45309" },
  { id: "plast", nom: "تربية تشكيلية", court: "تشكيلية", couleur: "#db2777" },
  { id: "music", nom: "تربية موسيقية", court: "موسيقية", couleur: "#c026d3" },
  { id: "techno", nom: "تربية تكنولوجية", court: "تكنولوجية", couleur: "#475569" },
  { id: "sport", nom: "تربية بدنية", court: "بدنية", couleur: "#dc2626" },
];

export const NIVEAUX = [
  { id: 1, nom: "السنة الأولى" },
  { id: 2, nom: "السنة الثانية" },
  { id: 3, nom: "السنة الثالثة" },
  { id: 4, nom: "السنة الرابعة" },
  { id: 5, nom: "السنة الخامسة" },
  { id: 6, nom: "السنة السادسة" },
];

// الحجم الساعي الأسبوعي لكل مادة حسب المستوى (ساعات) — قابل للتعديل من الإعدادات
export const GRILLE = {
  1: { ar: 9, math: 5, eveil: 1, islam: 1, plast: 1, music: 1, techno: 1, sport: 1 },
  2: { ar: 9, math: 5, eveil: 1, islam: 1, plast: 1, music: 1, techno: 1, sport: 1 },
  3: { ar: 8, math: 5, fr: 6, eveil: 1, islam: 1, plast: 1, music: 1, techno: 1, sport: 1 },
  4: { ar: 8, math: 5, fr: 6, eveil: 1, islam: 1, plast: 1, music: 1, techno: 1, sport: 1 },
  5: { ar: 7, math: 5, fr: 6, en: 2, eveil: 2, islam: 1, social: 2, plast: 1, music: 1, sport: 1 },
  6: { ar: 7, math: 5, fr: 6, en: 2, eveil: 2, islam: 1, social: 2, plast: 1, music: 1, sport: 1 },
};

export const JOURS = [
  { id: "lun", nom: "الاثنين" },
  { id: "mar", nom: "الثلاثاء" },
  { id: "mer", nom: "الأربعاء" },
  { id: "jeu", nom: "الخميس" },
  { id: "ven", nom: "الجمعة" },
];

// الحصص: كل حصة ساعتان (تقبل مادتين) عدا 12-13 فساعة واحدة
export const BLOCS = [
  { id: "b1", debut: "08", fin: "10", periode: "matin", capacite: 2 },
  { id: "b2", debut: "10", fin: "12", periode: "matin", capacite: 2 },
  { id: "b3", debut: "12", fin: "13", periode: "apresmidi", capacite: 1 },
  { id: "b4", debut: "13", fin: "15", periode: "apresmidi", capacite: 2 },
  { id: "b5", debut: "15", fin: "17", periode: "apresmidi", capacite: 2 },
];

// نظام الفوجين: كل قسم صباحي أو مسائي في كل يوم (أو يوم كامل للمستويات العليا)
export const REGIMES = [
  { id: "matin", nom: "صباحي (08-12)" },
  { id: "apresmidi", nom: "مسائي (12-17)" },
  { id: "plein", nom: "يوم كامل" },
  { id: "repos", nom: "راحة" },
];

export const REGIME_A = { lun: "matin", mar: "apresmidi", mer: "matin", jeu: "apresmidi", ven: "matin" };
export const REGIME_B = { lun: "apresmidi", mar: "matin", mer: "apresmidi", jeu: "matin", ven: "apresmidi" };
export const REGIME_PLEIN = { lun: "plein", mar: "plein", mer: "plein", jeu: "plein", ven: "plein" };

export const NISAB = 18; // نصاب معلم الدرجة الأولى (قابل للتعديل لكل معلم)

export const domaineById = (id) => DOMAINES.find((d) => d.id === id);
export const niveauNom = (n) => NIVEAUX.find((x) => x.id === n)?.nom || "";

// هل هذه الحصة متاحة لهذا القسم في هذا اليوم؟
export function blocAutorise(regimeJour, bloc) {
  if (!regimeJour || regimeJour === "repos") return false;
  if (regimeJour === "plein") return true;
  return bloc.periode === regimeJour;
}
