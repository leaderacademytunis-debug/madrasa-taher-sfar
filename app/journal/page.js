"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { PageHead } from "@/components/ui";
import { uid } from "@/lib/engine";
import { Plus, Printer, Trash2, CheckCircle2, Circle, CalendarCheck, Eye, UserX, Mail } from "lucide-react";

const MODELES = [
  "استقبال التلاميذ ومراقبة الدخول",
  "متابعة المناوبة بالساحة",
  "زيارة صفية",
  "متابعة الغيابات وتعميرها بالمنظومة",
  "مجلس معلمين / اجتماع بيداغوجي",
  "متابعة النظافة والصحة المدرسية",
  "استقبال الأولياء",
  "مراسلة المندوبية",
  "متابعة المطعم المدرسي",
  "إعداد تقرير نهاية اليوم",
];

export default function Journal() {
  const { state, majJournal } = useStore();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const j = state.journal[date] || {};
  const taches = j.taches || [];
  const visites = j.visites || [];
  const absences = j.absences || [];
  const [txt, setTxt] = useState("");

  const set = (k, v) => majJournal(date, { [k]: v });

  const ajouterTache = (t) => {
    if (!t.trim()) return;
    set("taches", [...taches, { id: uid("tk"), texte: t.trim(), fait: false }]);
    setTxt("");
  };

  const fait = taches.filter((t) => t.fait).length;

  return (
    <div className="space-y-5">
      <PageHead titre="العمل اليومي للمدير" desc="مهام اليوم، الزيارات الصفية، غيابات الإطار، والمراسلات — في ورقة واحدة">
        <input type="date" className="input w-auto" value={date} onChange={(e) => setDate(e.target.value)} />
        <button className="btn-ghost" onClick={() => window.print()}><Printer size={16} /> طباعة اليوم</button>
      </PageHead>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* المهام */}
        <div className="card-p lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display font-bold text-slate-800"><CalendarCheck size={18} /> مهام اليوم</h2>
            <span className="badge bg-brand-50 text-brand-700">{fait}/{taches.length}</span>
          </div>

          <div className="no-print mb-3 flex gap-2">
            <input className="input" placeholder="أضف مهمة…" value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ajouterTache(txt)} />
            <button className="btn-primary" onClick={() => ajouterTache(txt)}><Plus size={16} /></button>
          </div>

          <div className="no-print mb-4 flex flex-wrap gap-1.5">
            {MODELES.map((m) => (
              <button key={m} className="badge bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-700" onClick={() => ajouterTache(m)}>+ {m}</button>
            ))}
          </div>

          <ul className="space-y-2">
            {taches.length === 0 && <li className="text-sm text-slate-400">لا مهام مسجلة لهذا اليوم.</li>}
            {taches.map((t) => (
              <li key={t.id} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2">
                <button onClick={() => set("taches", taches.map((x) => (x.id === t.id ? { ...x, fait: !x.fait } : x)))}>
                  {t.fait ? <CheckCircle2 size={18} className="text-emerald-600" /> : <Circle size={18} className="text-slate-300" />}
                </button>
                <span className={`flex-1 text-sm ${t.fait ? "text-slate-400 line-through" : "text-slate-700"}`}>{t.texte}</span>
                <button className="no-print text-slate-300 hover:text-rose-500" onClick={() => set("taches", taches.filter((x) => x.id !== t.id))}><Trash2 size={15} /></button>
              </li>
            ))}
          </ul>
        </div>

        {/* غيابات الإطار */}
        <div className="card-p">
          <h2 className="mb-3 flex items-center gap-2 font-display font-bold text-slate-800"><UserX size={18} /> غيابات الإطار</h2>
          <select
            className="input no-print"
            value=""
            onChange={(e) => e.target.value && set("absences", [...absences, { id: uid("ab"), enseignantId: e.target.value, motif: "" }])}
          >
            <option value="">+ تسجيل غياب معلم…</option>
            {state.enseignants.map((x) => <option key={x.id} value={x.id}>{x.nom}</option>)}
          </select>
          <ul className="mt-3 space-y-2">
            {absences.length === 0 && <li className="text-sm text-slate-400">لا غيابات.</li>}
            {absences.map((a) => (
              <li key={a.id} className="rounded-xl bg-rose-50 px-3 py-2">
                <div className="flex items-center justify-between text-sm font-semibold text-rose-800">
                  {state.enseignants.find((e) => e.id === a.enseignantId)?.nom}
                  <button className="no-print text-rose-400" onClick={() => set("absences", absences.filter((x) => x.id !== a.id))}><Trash2 size={14} /></button>
                </div>
                <input className="mt-1 w-full bg-transparent text-xs outline-none" placeholder="السبب / التعويض…" value={a.motif} onChange={(e) => set("absences", absences.map((x) => (x.id === a.id ? { ...x, motif: e.target.value } : x)))} />
              </li>
            ))}
          </ul>
        </div>

        {/* الزيارات الصفية */}
        <div className="card-p lg:col-span-2">
          <h2 className="mb-3 flex items-center gap-2 font-display font-bold text-slate-800"><Eye size={18} /> الزيارات الصفية</h2>
          <button
            className="btn-soft no-print mb-3"
            onClick={() => set("visites", [...visites, { id: uid("v"), classeId: state.classes[0]?.id, enseignantId: state.enseignants[0]?.id, obs: "" }])}
          >
            <Plus size={15} /> زيارة جديدة
          </button>
          {visites.length === 0 && <p className="text-sm text-slate-400">لا زيارات مسجلة.</p>}
          <div className="space-y-3">
            {visites.map((v) => (
              <div key={v.id} className="rounded-xl border border-slate-100 p-3">
                <div className="flex flex-wrap gap-2">
                  <select className="input w-40" value={v.classeId} onChange={(e) => set("visites", visites.map((x) => (x.id === v.id ? { ...x, classeId: e.target.value } : x)))}>
                    {state.classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                  <select className="input w-52" value={v.enseignantId} onChange={(e) => set("visites", visites.map((x) => (x.id === v.id ? { ...x, enseignantId: e.target.value } : x)))}>
                    {state.enseignants.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                  <button className="no-print mr-auto text-slate-300 hover:text-rose-500" onClick={() => set("visites", visites.filter((x) => x.id !== v.id))}><Trash2 size={15} /></button>
                </div>
                <textarea className="input mt-2 h-20" placeholder="ملاحظات الزيارة والتوصيات…" value={v.obs} onChange={(e) => set("visites", visites.map((x) => (x.id === v.id ? { ...x, obs: e.target.value } : x)))} />
              </div>
            ))}
          </div>
        </div>

        {/* المراسلات والملاحظات */}
        <div className="card-p">
          <h2 className="mb-3 flex items-center gap-2 font-display font-bold text-slate-800"><Mail size={18} /> مراسلات وملاحظات</h2>
          <textarea className="input h-56" placeholder="الواردات، الصادرات، ملاحظات عامة…" value={j.notes || ""} onChange={(e) => set("notes", e.target.value)} />
        </div>
      </div>
    </div>
  );
}
