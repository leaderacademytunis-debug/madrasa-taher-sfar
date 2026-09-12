"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { PageHead, DomaineBadge } from "@/components/ui";
import { chargeParEnseignant } from "@/lib/engine";
import { Plus, Trash2, Printer, Search } from "lucide-react";

export default function Enseignants() {
  const { state, ajouterEnseignant, majEnseignant, supprimerEnseignant } = useStore();
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState(null);
  const charge = chargeParEnseignant(state.affectations);

  const liste = state.enseignants.filter((e) => e.nom.includes(q) || (e.grade || "").includes(q));

  return (
    <div className="space-y-5">
      <PageHead titre="المعلمون" desc={`${state.enseignants.length} معلما — الاختصاصات والنُّصُب`}>
        <button className="btn-ghost" onClick={() => window.print()}><Printer size={16} /> طباعة</button>
        <button className="btn-primary" onClick={() => ajouterEnseignant({})}><Plus size={16} /> إضافة معلم</button>
      </PageHead>

      <div className="no-print card flex items-center gap-2 px-4 py-2">
        <Search size={16} className="text-slate-400" />
        <input className="w-full bg-transparent py-1 text-sm outline-none" placeholder="بحث بالاسم أو الرتبة…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="card overflow-hidden print-area">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">#</th>
                <th className="th">الاسم واللقب</th>
                <th className="th">الرتبة</th>
                <th className="th">الصنف</th>
                <th className="th">المجالات</th>
                <th className="th">النصاب</th>
                <th className="th">المُسند</th>
                <th className="th no-print"></th>
              </tr>
            </thead>
            <tbody>
              {liste.map((e, i) => {
                const h = charge[e.id] || 0;
                const etat = h > e.nisab ? "bg-rose-50 text-rose-700" : h === 0 ? "bg-slate-100 text-slate-500" : h < e.nisab - 6 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700";
                return (
                  <tr key={e.id} className="hover:bg-slate-50/60">
                    <td className="td text-slate-400">{i + 1}</td>
                    <td className="td font-semibold text-slate-800">
                      <input className="w-44 bg-transparent outline-none focus:bg-white" value={e.nom} onChange={(ev) => majEnseignant(e.id, { nom: ev.target.value })} />
                    </td>
                    <td className="td">
                      <input className="w-32 bg-transparent outline-none" value={e.grade || ""} onChange={(ev) => majEnseignant(e.id, { grade: ev.target.value })} />
                    </td>
                    <td className="td">
                      <select className="rounded-lg bg-slate-50 px-2 py-1 text-xs" value={e.type} onChange={(ev) => majEnseignant(e.id, { type: ev.target.value })}>
                        <option value="base">معلم أساس</option>
                        <option value="specialiste">معلم اختصاص</option>
                      </select>
                    </td>
                    <td className="td">
                      <div className="flex flex-wrap gap-1">
                        {e.domaines.map((d) => <DomaineBadge key={d} id={d} small />)}
                      </div>
                      <button className="no-print mt-1 text-[11px] text-brand-600" onClick={() => setEdit(e.id)}>تعديل المجالات</button>
                    </td>
                    <td className="td">
                      <input type="number" className="w-16 rounded-lg bg-slate-50 px-2 py-1 text-sm" value={e.nisab} onChange={(ev) => majEnseignant(e.id, { nisab: Number(ev.target.value) })} />
                    </td>
                    <td className="td"><span className={`badge ${etat}`}>{h} س</span></td>
                    <td className="td no-print">
                      <button className="text-rose-500 hover:text-rose-700" onClick={() => supprimerEnseignant(e.id)}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {edit && (
        <div className="no-print fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" onClick={() => setEdit(null)}>
          <div className="card w-full max-w-md p-5" onClick={(ev) => ev.stopPropagation()}>
            <h3 className="mb-4 font-display font-bold">مجالات {state.enseignants.find((x) => x.id === edit)?.nom}</h3>
            <div className="space-y-2">
              {state.domaines.map((d) => {
                const ens = state.enseignants.find((x) => x.id === edit);
                const on = ens.domaines.includes(d.id);
                return (
                  <label key={d.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 px-3 py-2 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => majEnseignant(edit, { domaines: on ? ens.domaines.filter((x) => x !== d.id) : [...ens.domaines, d.id] })}
                    />
                    <span className="text-sm" style={{ color: d.couleur }}>{d.nom}</span>
                  </label>
                );
              })}
            </div>
            <button className="btn-primary mt-4 w-full justify-center" onClick={() => setEdit(null)}>تم</button>
          </div>
        </div>
      )}
    </div>
  );
}
