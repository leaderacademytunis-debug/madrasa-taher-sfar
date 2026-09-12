"use client";
import { useRef } from "react";
import { useStore } from "@/lib/store";
import { PageHead } from "@/components/ui";
import { NIVEAUX } from "@/lib/config";
import { Download, Upload, RotateCcw, Plus, Trash2 } from "lucide-react";

export default function Parametres() {
  const { state, patch, reset, remplacerTout } = useStore();
  const fileRef = useRef(null);

  const setSchool = (k, v) => patch((s) => ({ school: { ...s.school, [k]: v } }));
  const setGrille = (niveau, dom, v) => patch((s) => ({ grille: { ...s.grille, [niveau]: { ...s.grille[niveau], [dom]: Number(v) } } }));
  const setBloc = (id, k, v) => patch((s) => ({ blocs: s.blocs.map((x) => (x.id === id ? { ...x, [k]: v } : x)) }));
  const setJour = (id, k, v) => patch((s) => ({ jours: s.jours.map((x) => (x.id === id ? { ...x, [k]: v } : x)) }));
  const setDomaine = (id, k, v) => patch((s) => ({ domaines: s.domaines.map((x) => (x.id === id ? { ...x, [k]: v } : x)) }));

  const exporter = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `نسخة-احتياطية-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const importer = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try { remplacerTout(JSON.parse(r.result)); alert("تم استرجاع البيانات ✅"); }
      catch { alert("الملف غير صالح"); }
    };
    r.readAsText(f);
  };

  return (
    <div className="space-y-5">
      <PageHead titre="الإعدادات" desc="بيانات المؤسسة، المجالات، التوقيت الأسبوعي، والنسخ الاحتياطية">
        <button className="btn-ghost" onClick={exporter}><Download size={16} /> نسخة احتياطية</button>
        <button className="btn-ghost" onClick={() => fileRef.current?.click()}><Upload size={16} /> استرجاع</button>
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={importer} />
        <button className="btn-danger" onClick={() => confirm("سيُمحى كل شيء ويعود للبيانات التجريبية. متأكد؟") && reset()}><RotateCcw size={16} /> تصفير</button>
      </PageHead>

      <div className="card-p">
        <h2 className="mb-4 font-display font-bold text-slate-800">بيانات المؤسسة</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[["nom", "اسم المدرسة"], ["ville", "المدينة"], ["delegation", "المندوبية"], ["annee", "السنة الدراسية"], ["directeur", "اسم المدير"], ["facebook", "رابط صفحة الفيسبوك"]].map(([k, l]) => (
            <div key={k}>
              <span className="label">{l}</span>
              <input className="input" value={state.school[k] || ""} onChange={(e) => setSchool(k, e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div className="card-p">
        <h2 className="mb-4 font-display font-bold text-slate-800">المجالات</h2>
        <div className="space-y-2">
          {state.domaines.map((d) => (
            <div key={d.id} className="flex items-center gap-3">
              <input type="color" className="h-9 w-10 rounded-lg border border-slate-200" value={d.couleur} onChange={(e) => setDomaine(d.id, "couleur", e.target.value)} />
              <input className="input flex-1" value={d.nom} onChange={(e) => setDomaine(d.id, "nom", e.target.value)} />
              <input className="input w-40" value={d.court} onChange={(e) => setDomaine(d.id, "court", e.target.value)} placeholder="اختصار" />
              <button className="text-rose-400 hover:text-rose-600" onClick={() => patch((s) => ({ domaines: s.domaines.filter((x) => x.id !== d.id) }))}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <button
          className="btn-soft mt-3"
          onClick={() => {
            const id = prompt("رمز المجال بالحروف اللاتينية (مثال: math)");
            if (!id) return;
            patch((s) => ({ domaines: [...s.domaines, { id, nom: "مجال جديد", court: "جديد", couleur: "#334155" }] }));
          }}
        ><Plus size={15} /> إضافة مجال</button>
      </div>

      <div className="card-p overflow-x-auto">
        <h2 className="mb-1 font-display font-bold text-slate-800">التوزيع الأسبوعي للساعات حسب المستوى</h2>
        <p className="mb-4 text-xs text-slate-500">هذه القيم هي أساس الإسناد وتوليد الجداول. عدّلها لتطابق المناشير الرسمية.</p>
        <table className="w-full min-w-[640px]">
          <thead>
            <tr>
              <th className="th">المستوى</th>
              {state.domaines.map((d) => <th key={d.id} className="th text-center">{d.court}</th>)}
              <th className="th text-center">المجموع</th>
            </tr>
          </thead>
          <tbody>
            {NIVEAUX.map((n) => {
              const g = state.grille[n.id] || {};
              const total = state.domaines.reduce((s, d) => s + Number(g[d.id] || 0), 0);
              return (
                <tr key={n.id}>
                  <td className="td font-semibold">{n.nom}</td>
                  {state.domaines.map((d) => (
                    <td key={d.id} className="td text-center">
                      <input type="number" className="w-14 rounded-lg bg-slate-50 px-2 py-1 text-center text-sm" value={g[d.id] ?? 0} onChange={(e) => setGrille(n.id, d.id, e.target.value)} />
                    </td>
                  ))}
                  <td className="td text-center"><span className="badge bg-brand-50 text-brand-700">{total}س</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card-p">
          <h2 className="mb-1 font-display font-bold text-slate-800">أيام العمل</h2>
          <p className="mb-3 text-xs text-slate-500">نظام المدرسة: خمسة أيام. توقيت كل قسم (صباحي/مسائي) يُضبط من صفحة الأقسام.</p>
          {state.jours.map((j) => (
            <div key={j.id} className="flex items-center justify-between border-b border-slate-100 py-2 text-sm">
              <input className="font-semibold text-slate-700 bg-transparent outline-none" value={j.nom} onChange={(e) => setJour(j.id, "nom", e.target.value)} />
              <span className="text-xs text-slate-400">{j.id}</span>
            </div>
          ))}
        </div>

        <div className="card-p">
          <h2 className="mb-1 font-display font-bold text-slate-800">الحصص</h2>
          <p className="mb-3 text-xs text-slate-500">الحصة من ساعتين تقبل مادتين؛ حصة 12-13 مادة واحدة.</p>
          {state.blocs.map((b) => (
            <div key={b.id} className="flex flex-wrap items-center gap-2 border-b border-slate-100 py-2">
              <input className="input w-16 text-center" value={b.debut} onChange={(e) => setBloc(b.id, "debut", e.target.value)} />
              <span className="text-slate-400">—</span>
              <input className="input w-16 text-center" value={b.fin} onChange={(e) => setBloc(b.id, "fin", e.target.value)} />
              <select className="input w-32" value={b.periode} onChange={(e) => setBloc(b.id, "periode", e.target.value)}>
                <option value="matin">صباحية</option>
                <option value="apresmidi">مسائية</option>
              </select>
              <select className="input w-28" value={b.capacite} onChange={(e) => setBloc(b.id, "capacite", Number(e.target.value))}>
                <option value={1}>مادة واحدة</option>
                <option value={2}>مادتان</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
