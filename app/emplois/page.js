"use client";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { useStore } from "@/lib/store";
import { PageHead } from "@/components/ui";
import EmploiTable from "@/components/EmploiTable";
import { genererEmplois } from "@/lib/engine";
import { Wand2, Printer, ImageDown, Layers, Palette, Eraser } from "lucide-react";

export default function Emplois() {
  const store = useStore();
  const { state } = store;
  const [mode, setMode] = useState("classe");
  const [cibleId, setCibleId] = useState(state.classes[0]?.id);
  const [theme, setTheme] = useState("clair");
  const [msg, setMsg] = useState("");
  const [edition, setEdition] = useState(false);
  const ref = useRef(null);

  const cible = mode === "classe"
    ? state.classes.find((c) => c.id === cibleId) || state.classes[0]
    : state.enseignants.find((e) => e.id === cibleId) || state.enseignants[0];

  const changerMode = (m) => {
    setMode(m);
    setCibleId(m === "classe" ? state.classes[0]?.id : state.enseignants[0]?.id);
  };

  const generer = () => {
    const { restes } = genererEmplois(state);
    store.genererEmplois();
    setMsg(restes.length ? `تم التوليد — ${restes.reduce((s, r) => s + r.nb, 0)} ساعة لم تُبرمج (تعارض في التوقيت).` : "تم توليد كل الجداول بنجاح ✅");
    setTimeout(() => setMsg(""), 6000);
  };

  const exporterPng = async () => {
    if (!ref.current) return;
    const url = await toPng(ref.current, { pixelRatio: 2, backgroundColor: theme === "sombre" ? "#0f172a" : "#ffffff" });
    const a = document.createElement("a");
    a.download = `جدول-${cible?.nom || "أوقات"}.png`;
    a.href = url;
    a.click();
  };

  const exporterTout = async () => {
    const liste = mode === "classe" ? state.classes : state.enseignants;
    for (const c of liste) {
      setCibleId(c.id);
      await new Promise((r) => setTimeout(r, 350));
      if (!ref.current) continue;
      const url = await toPng(ref.current, { pixelRatio: 2, backgroundColor: theme === "sombre" ? "#0f172a" : "#ffffff" });
      const a = document.createElement("a");
      a.download = `جدول-${c.nom}.png`;
      a.href = url;
      a.click();
      await new Promise((r) => setTimeout(r, 250));
    }
  };

  const clicCase = (key) => {
    if (!edition || mode !== "classe") return;
    if (confirm("حذف محتوى هذه الحصة؟")) store.viderCase(cible.id, key);
  };

  return (
    <div className="space-y-5">
      <PageHead titre="جداول الأوقات" desc="توليد آلي حسب نظام الحصص التونسي — عرض بالقسم أو بالمعلم، وتصدير صور جاهزة للنشر">
        <button className="btn-ghost" onClick={() => window.print()}><Printer size={16} /> طباعة</button>
        <button className="btn-ghost" onClick={exporterPng}><ImageDown size={16} /> صورة PNG</button>
        <button className="btn-ghost" onClick={exporterTout}><Layers size={16} /> تصدير الكل</button>
        <button className="btn-primary" onClick={generer}><Wand2 size={16} /> توليد الجداول</button>
      </PageHead>

      {msg && <div className="no-print card-p bg-emerald-50 text-sm text-emerald-800">{msg}</div>}

      <div className="no-print card-p flex flex-wrap items-end gap-3">
        <div className="flex gap-2">
          <button className={mode === "classe" ? "btn-primary" : "btn-ghost"} onClick={() => changerMode("classe")}>جداول الأقسام</button>
          <button className={mode === "ens" ? "btn-primary" : "btn-ghost"} onClick={() => changerMode("ens")}>جداول المعلمين</button>
        </div>
        <div className="min-w-52">
          <span className="label">{mode === "classe" ? "القسم" : "المعلم"}</span>
          <select className="input" value={cibleId} onChange={(e) => setCibleId(e.target.value)}>
            {(mode === "classe" ? state.classes : state.enseignants).map((x) => (
              <option key={x.id} value={x.id}>{x.nom}</option>
            ))}
          </select>
        </div>
        <button className="btn-ghost" onClick={() => setTheme(theme === "clair" ? "sombre" : "clair")}>
          <Palette size={16} /> {theme === "clair" ? "نسخة داكنة" : "نسخة فاتحة"}
        </button>
        {mode === "classe" && (
          <button className={edition ? "btn-danger" : "btn-ghost"} onClick={() => setEdition(!edition)}>
            <Eraser size={16} /> {edition ? "إيقاف التعديل اليدوي" : "تعديل يدوي"}
          </button>
        )}
      </div>

      <div className="print-area">
        <EmploiTable ref={ref} mode={mode === "classe" ? "classe" : "enseignant"} cible={cible} theme={theme} onCase={clicCase} />
      </div>

      <div className="no-print card-p text-xs leading-relaxed text-slate-500">
        نصيحة: «تصدير الكل» ينزّل صور جداول كل الأقسام (أو كل المعلمين) الواحدة تلو الأخرى — جاهزة مباشرة لصفحة الفيسبوك.
        غيّر أوقات الحصص وأيام العمل من صفحة <b>الإعدادات</b> ثم أعد التوليد.
      </div>
    </div>
  );
}
