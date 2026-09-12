"use client";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { useStore } from "@/lib/store";
import { PageHead } from "@/components/ui";
import { ImageDown, Copy, Check, Megaphone } from "lucide-react";

const MODELES = [
  {
    id: "emploi",
    nom: "نشر جداول الأوقات",
    titre: "جداول الأوقات جاهزة",
    texte: "أولياءنا الكرام، تجدون رفقته جداول أوقات أقسام مدرستنا للسنة الدراسية {annee}.\nنرجو الاطلاع عليها وتمكين أبنائكم من احترام التوقيت.\nشكرا لثقتكم 🌿",
  },
  {
    id: "rentree",
    nom: "إعلان عودة مدرسية",
    titre: "عودة مدرسية موفقة",
    texte: "تتشرف {ecole} بالإعلان عن انطلاق الدروس يوم ....... على الساعة .......\nنتمنى لأبنائنا التلاميذ سنة دراسية موفقة مليئة بالنجاح 🎒",
  },
  {
    id: "parents",
    nom: "اجتماع أولياء",
    titre: "دعوة إلى اجتماع الأولياء",
    texte: "يشرفنا دعوتكم إلى اجتماع الأولياء يوم ....... على الساعة ....... بقاعة .......\nحضوركم يساهم في نجاح أبنائنا 🤝",
  },
  {
    id: "felicitation",
    nom: "تهنئة وتشجيع",
    titre: "مبروك لتلاميذنا",
    texte: "نبارك لتلاميذ مدرستنا نتائجهم المتميزة، ونشكر الإطار التربوي والأولياء على المجهود المبذول 👏",
  },
  {
    id: "rappel",
    nom: "تذكير إداري",
    titre: "إعلام",
    texte: "نُعلم الأولياء الكرام أن ....... \nنشكركم على تفهمكم.",
  },
];

const THEMES = [
  { id: "bleu", from: "#1e63db", to: "#0ea5e9" },
  { id: "vert", from: "#059669", to: "#84cc16" },
  { id: "violet", from: "#7c3aed", to: "#db2777" },
  { id: "nuit", from: "#0f172a", to: "#1e3a8a" },
];

export default function Publication() {
  const { state } = useStore();
  const [modele, setModele] = useState(MODELES[0]);
  const [titre, setTitre] = useState(MODELES[0].titre);
  const [texte, setTexte] = useState(MODELES[0].texte.replace("{annee}", state.school.annee).replace("{ecole}", state.school.nom));
  const [theme, setTheme] = useState(THEMES[0]);
  const [copie, setCopie] = useState(false);
  const ref = useRef(null);

  const choisir = (m) => {
    setModele(m);
    setTitre(m.titre);
    setTexte(m.texte.replace("{annee}", state.school.annee).replace("{ecole}", state.school.nom));
  };

  const exporter = async () => {
    if (!ref.current) return;
    const url = await toPng(ref.current, { pixelRatio: 2 });
    const a = document.createElement("a");
    a.download = `منشور-${modele.nom}.png`;
    a.href = url;
    a.click();
  };

  const postFacebook = `${titre}\n\n${texte}\n\n📍 ${state.school.nom} — ${state.school.ville}\n#المدرسة_الابتدائية_الطاهر_صفر #حمام_الأنف #التعليم_الابتدائي`;

  const copier = async () => {
    await navigator.clipboard.writeText(postFacebook);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  };

  return (
    <div className="space-y-5">
      <PageHead titre="النشر على الفيسبوك" desc="بطاقة صورة أنيقة + نص منشور جاهز للنسخ">
        <button className="btn-ghost" onClick={copier}>{copie ? <Check size={16} /> : <Copy size={16} />} نسخ نص المنشور</button>
        <button className="btn-primary" onClick={exporter}><ImageDown size={16} /> تحميل الصورة</button>
      </PageHead>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="card-p">
            <span className="label">النموذج</span>
            <div className="flex flex-wrap gap-2">
              {MODELES.map((m) => (
                <button key={m.id} className={m.id === modele.id ? "btn-primary" : "btn-ghost"} onClick={() => choisir(m)}>{m.nom}</button>
              ))}
            </div>
            <div className="mt-4">
              <span className="label">لون البطاقة</span>
              <div className="flex gap-2">
                {THEMES.map((t) => (
                  <button key={t.id} onClick={() => setTheme(t)} className={`h-9 w-9 rounded-xl border-2 ${theme.id === t.id ? "border-slate-900" : "border-transparent"}`} style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }} />
                ))}
              </div>
            </div>
            <div className="mt-4">
              <span className="label">العنوان</span>
              <input className="input" value={titre} onChange={(e) => setTitre(e.target.value)} />
            </div>
            <div className="mt-3">
              <span className="label">النص</span>
              <textarea className="input h-40" value={texte} onChange={(e) => setTexte(e.target.value)} />
            </div>
          </div>

          <div className="card-p">
            <div className="mb-2 flex items-center gap-2 font-display font-bold text-slate-800"><Megaphone size={17} /> نص المنشور</div>
            <pre className="whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">{postFacebook}</pre>
          </div>
        </div>

        {/* البطاقة */}
        <div>
          <div ref={ref} dir="rtl" style={{ width: "100%", aspectRatio: "1/1", background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`, borderRadius: 28, padding: 40, color: "#fff", display: "flex", flexDirection: "column", fontFamily: "Tajawal, sans-serif" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 54, height: 54, borderRadius: 18, background: "rgba(255,255,255,.2)", display: "grid", placeItems: "center", fontWeight: 800, fontFamily: "Cairo, sans-serif" }}>ط.ص</div>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontWeight: 700, fontFamily: "Cairo, sans-serif" }}>{state.school.nom}</div>
                <div style={{ fontSize: 13, opacity: 0.85 }}>{state.school.ville} · {state.school.annee}</div>
              </div>
            </div>

            <div style={{ marginTop: "auto" }}>
              <div style={{ fontFamily: "Cairo, sans-serif", fontWeight: 800, fontSize: 40, lineHeight: 1.25 }}>{titre}</div>
              <div style={{ marginTop: 16, fontSize: 18, lineHeight: 1.9, whiteSpace: "pre-wrap", opacity: 0.95 }}>{texte}</div>
            </div>

            <div style={{ marginTop: "auto", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,.25)", fontSize: 13, opacity: 0.85, display: "flex", justifyContent: "space-between" }}>
              <span>{state.school.delegation}</span>
              <span>إدارة المؤسسة</span>
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-slate-400">مقاس مربع 1:1 — مثالي لمنشورات الفيسبوك</p>
        </div>
      </div>
    </div>
  );
}
