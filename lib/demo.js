// بيانات تجريبية — تُستبدل بالبيانات الحقيقية من داخل المنصة
import { GRILLE } from "./config";

const NOMS_M = ["محمد الجويني","سامي بن عمار","نبيل الشابي","حاتم بوعزيزي","فتحي المرزوقي","رضا العياري","كمال بن صالح","أنيس التومي","لطفي الزموري","ماهر السديري"];
const NOMS_F = ["سنية بن رمضان","إيمان الحناوي","رجاء العشي","نجلاء بالريش","حياة التوكابري","سلمى قاسمي","نادية شعانبي","أميرة بن منصور","وفاء العياشي","خولة بنزيادة","هدى الحنشي","سيرين الجلاصي","مريم بوعبدلي"];

export function makeDemo() {
  // 16 قسما موزعة على المستويات
  const repartition = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 6, 6];
  const compteur = {};
  const classes = repartition.map((niveau, i) => {
    compteur[niveau] = (compteur[niveau] || 0) + 1;
    const court = ["", "الأولى", "الثانية", "الثالثة", "الرابعة", "الخامسة", "السادسة"][niveau];
    return {
      id: "c" + (i + 1),
      nom: `${court} ${["", "أ", "ب", "ج", "د"][compteur[niveau]]}`,
      niveau,
      effectif: 20 + ((i * 3) % 9),
      salle: "قاعة " + (i + 1),
      titulaire: null,
    };
  });

  // 23 معلما: 16 معلم أساس + 7 معلمي اختصاص
  const noms = [];
  for (let i = 0; i < 23; i++) noms.push(i % 2 === 0 ? NOMS_F[Math.floor(i / 2) % NOMS_F.length] : NOMS_M[Math.floor(i / 2) % NOMS_M.length]);

  const enseignants = [];
  for (let i = 0; i < 16; i++) {
    enseignants.push({
      id: "t" + (i + 1),
      nom: noms[i],
      grade: "معلم تطبيق",
      type: "base", // معلم أساس
      domaines: ["ar", "st", "so"],
      nisab: 25,
      tel: "",
      email: "",
      note: "",
    });
  }
  const specialites = [
    { d: ["fr"], g: "أستاذ فرنسية" },
    { d: ["fr"], g: "أستاذ فرنسية" },
    { d: ["en"], g: "أستاذ إنجليزية" },
    { d: ["ep"], g: "أستاذ تربية بدنية" },
    { d: ["ep"], g: "أستاذ تربية بدنية" },
    { d: ["af"], g: "أستاذ تربية فنية" },
    { d: ["af", "so"], g: "أستاذ تربية موسيقية" },
  ];
  specialites.forEach((s, i) => {
    enseignants.push({
      id: "t" + (17 + i),
      nom: noms[16 + i],
      grade: s.g,
      type: "specialiste",
      domaines: s.d,
      nisab: 22,
      tel: "",
      email: "",
      note: "",
    });
  });

  // إسناد أولي: كل معلم أساس لقسم
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
