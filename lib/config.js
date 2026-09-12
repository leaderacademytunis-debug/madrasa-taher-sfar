// إعدادات المؤسسة والنظام البيداغوجي — كلها قابلة للتعديل من صفحة "الإعدادات"

export const SCHOOL = {
  nom: "المدرسة الابتدائية الطاهر صفر",
  ville: "حمام الأنف",
  delegation: "المندوبية الجهوية للتربية ببن عروس",
  annee: "2026-2027",
  directeur: "مدير المؤسسة",
  facebook: "",
};

// المجالات (المواد) — قابلة للإضافة والحذف
export const DOMAINES = [
  { id: "ar", nom: "اللغة العربية", court: "عربية", couleur: "#1d4ed8" },
  { id: "fr", nom: "اللغة الفرنسية", court: "فرنسية", couleur: "#7c3aed" },
  { id: "en", nom: "اللغة الإنجليزية", court: "إنجليزية", couleur: "#0891b2" },
  { id: "st", nom: "العلوم والتكنولوجيا", court: "علوم وتكنولوجيا", couleur: "#059669" },
  { id: "af", nom: "التنشئة الفنية", court: "تنشئة فنية", couleur: "#db2777" },
  { id: "so", nom: "التنشئة الاجتماعية", court: "تنشئة اجتماعية", couleur: "#b45309" },
  { id: "ep", nom: "التربية البدنية", court: "تربية بدنية", couleur: "#dc2626" },
];

export const NIVEAUX = [
  { id: 1, nom: "السنة الأولى" },
  { id: 2, nom: "السنة الثانية" },
  { id: 3, nom: "السنة الثالثة" },
  { id: 4, nom: "السنة الرابعة" },
  { id: 5, nom: "السنة الخامسة" },
  { id: 6, nom: "السنة السادسة" },
];

// الحجم الساعي الأسبوعي لكل مجال حسب المستوى (بالساعات) — قابل للتعديل
export const GRILLE = {
  1: { ar: 11, fr: 0, en: 0, st: 6, af: 2, so: 1, ep: 2 },
  2: { ar: 11, fr: 0, en: 0, st: 6, af: 2, so: 1, ep: 2 },
  3: { ar: 8, fr: 6, en: 0, st: 5, af: 2, so: 2, ep: 2 },
  4: { ar: 8, fr: 6, en: 0, st: 5, af: 2, so: 2, ep: 2 },
  5: { ar: 7, fr: 6, en: 2, st: 5, af: 2, so: 2, ep: 2 },
  6: { ar: 7, fr: 6, en: 2, st: 5, af: 2, so: 2, ep: 2 },
};

export const JOURS = [
  { id: "lun", nom: "الاثنين", pleine: true },
  { id: "mar", nom: "الثلاثاء", pleine: true },
  { id: "mer", nom: "الأربعاء", pleine: false },
  { id: "jeu", nom: "الخميس", pleine: true },
  { id: "ven", nom: "الجمعة", pleine: true },
  { id: "sam", nom: "السبت", pleine: false },
];

// الحصص الرسمية — الفترة الصباحية والمسائية (قابلة للتعديل)
export const SEANCES = [
  { id: "m1", periode: "matin", debut: "08:00", fin: "09:00" },
  { id: "m2", periode: "matin", debut: "09:00", fin: "10:00" },
  { id: "rec1", periode: "matin", debut: "10:00", fin: "10:15", pause: true, nom: "استراحة" },
  { id: "m3", periode: "matin", debut: "10:15", fin: "11:15" },
  { id: "m4", periode: "matin", debut: "11:15", fin: "12:15" },
  { id: "dej", periode: "midi", debut: "12:15", fin: "13:15", pause: true, nom: "راحة الغداء" },
  { id: "s1", periode: "apresmidi", debut: "13:15", fin: "14:15" },
  { id: "s2", periode: "apresmidi", debut: "14:15", fin: "15:15" },
];

export const NISAB = 25; // النصاب الأسبوعي للمعلم بالساعات

export const domaineById = (id) => DOMAINES.find((d) => d.id === id);
export const niveauNom = (n) => NIVEAUX.find((x) => x.id === n)?.nom || "";
export const seancesUtiles = () => SEANCES.filter((s) => !s.pause);
