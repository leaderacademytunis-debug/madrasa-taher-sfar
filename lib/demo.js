// بيانات تجريبية مبنية على واقع المدرسة (16 قسما، 23 معلما، نظام الفوجين)
import { GRILLE, REGIME_A, REGIME_B, REGIME_PLEIN } from "./config";

const NOMS_M = ["محمد الجويني","سامي بن عمار","نبيل الشابي","حاتم بوعزيزي","فتحي المرزوقي","رضا العياري","كمال بن صالح","أنيس التومي","لطفي الزموري","ماهر السديري"];
const NOMS_F = ["سنية بن رمضان","إيمان الحناوي","رجاء العشي","نجلاء بالريش","حياة التوكابري","سلمى قاسمي","نادية شعانبي","أميرة بن منصور","وفاء العياشي","خولة بنزيادة","هدى الحنشي","سيرين الجلاصي","مريم بوعبدلي"];

// أسماء أقسام على نمط المدرسة (تميز، تفوق…) — تُعدَّل من صفحة الأقسام
const SUFFIXES = ["تميز", "تفوق", "إبداع", "نجاح"];

export function makeDemo() {
  const repartition = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 6, 6];
  const compteur = {};
  const classes = repartition.map((niveau, i) => {
    compteur[niveau] = (compteur[niveau] || 0) + 1;
    const court = ["", "الأولى", "الثانية", "الثالثة", "الرابعة", "الخامسة", "السادسة"][niveau];
    const rang = compteur[niveau];
    return {
      id: "c" + (i + 1),
      nom: `${court} ${SUFFIXES[(rang - 1) % SUFFIXES.length]}`,
      niveau,
      effectif: 20 + ((i * 3) % 9),
      salle: (niveau <= 2 ? "ب " : "أ ") + rang,
      titulaire: null,
      // المستويات 1 و2 بنظام الفوجين، والبقية أيام كاملة
      regime: niveau <= 2 ? (rang % 2 ? { ...REGIME_A } : { ...REGIME_B }) : { ...REGIME_PLEIN },
    };
  });

  const noms = [];
  for (let i = 0; i < 23; i++) noms.push(i % 2 === 0 ? NOMS_F[Math.floor(i / 2) % NOMS_F.length] : NOMS_M[Math.floor(i / 2) % NOMS_M.length]);

  const enseignants = [];
  for (let i = 0; i < 16; i++) {
    enseignants.push({
      id: "t" + (i + 1),
      nom: noms[i],
      grade: "معلم تطبيق",
      type: "base",
      domaines: ["ar", "math", "eveil", "islam", "social"],
      nisab: 18,
      tel: "",
      email: "",
      note: "",
    });
  }
  const specialites = [
    { d: ["fr"], g: "أستاذ فرنسية", n: 18 },
    { d: ["fr"], g: "أستاذ فرنسية", n: 18 },
    { d: ["en"], g: "أستاذ إنجليزية", n: 18 },
    { d: ["sport"], g: "أستاذ تربية بدنية", n: 20 },
    { d: ["sport"], g: "أستاذ تربية بدنية", n: 20 },
    { d: ["plast", "techno"], g: "أستاذ تربية تشكيلية وتكنولوجية", n: 18 },
    { d: ["music", "plast"], g: "أستاذ تربية موسيقية", n: 18 },
  ];
  specialites.forEach((s, i) => {
    enseignants.push({
      id: "t" + (17 + i),
      nom: noms[16 + i],
      grade: s.g,
      type: "specialiste",
      domaines: s.d,
      nisab: s.n,
      tel: "",
      email: "",
      note: "",
    });
  });

  classes.forEach((c, i) => (c.titulaire = enseignants[i].id));
  return { classes, enseignants };
}

export function besoinsClasse(classe) {
  const g = GRILLE[classe.niveau] || {};
  return Object.entries(g).filter(([, h]) => h > 0).map(([domaine, heures]) => ({ domaine, heures }));
}

// قائمة تجريبية لتلاميذ القسم الأول (مستخرجة من قائمة رسمية) — لتجربة دفتر المناداة
export const ELEVES_DEMO = [
  "أركان عبد النصير","فرح السديري","إياد بنزيادة","فداء بالريش","رحمة الحناوي","محمد الجويني",
  "ياسمين التوكابري","إلين الحنشي","آمنة العشي","أريج بن منصور","ساجد العياري","جوري قاسمي",
  "علي الزموري","خديجة العياشي","عبد العزيز قاسمي","مالك شعانبي",
];
