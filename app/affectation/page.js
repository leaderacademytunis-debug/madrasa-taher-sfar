"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { PageHead, DomaineBadge } from "@/components/ui";
import { niveauNom } from "@/lib/config";
import { diagnostiquerAffectations, chargeParEnseignant } from "@/lib/engine";
import { Wand2, Printer, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function Affectation() {
  const { state, majAffectation, relancerAffectation } = useStore();
  const [vue, setVue] = useState("classes");
  const alertes = diagnostiquerAffectations(state);
  const charge = chargeParEnseignant(state.affectations);

  const candidats = (domaineId) => {
    const dedans = state.enseignants.filter((e) => e.domaines.includes(domaineId));
    const dehors = state.enseignants.filter((e) => !e.domaines.includes(domaineId));
    return [...dedans, ...dehors];
  };

  return (
    <div className="space-y-5">
      <PageHead titre="إسناد الأقسام والمجالات" desc="محرك آلي يوزّع 23 معلما على 16 قسما مع احترام النُّصُب والاختصاصات">
        <button className="btn-ghost" onClick={() => window.print()}><Printer size={16} /> طباعة</button>
        <button className="btn-primary" onClick={() => { if (confirm("سيُعاد توزيع كل الإسنادات آليا. هل تواصل؟")) relancerAffectation(); }}>
          <Wand2 size={16} /> إسناد آلي
        </button>
      </PageHead>

      <div className="no-print flex gap-2">
        <button className={vue === "classes" ? "btn-primary" : "btn-ghost"} onClick={() => setVue("classes")}>حسب الأقسام</button>
        <button className={vue === "ens" ? "btn-primary" : "btn-ghost"} onClick={() => setVue("ens")}>حسب المعلمين</button>
      </div>

      {alertes.length > 0 && (
        <div className="card-p">
          <div className="mb-3 flex items-center gap-2 font-display font-bold text-slate-800"><AlertTriangle size={17} className="text-amber-500" /> تنبيهات الإسناد ({alertes.length})</div>
          <ul className="grid gap-2 text-sm md:grid-cols-2">
            {alertes.map((a, i) => (
              <li key={i} className={`rounded-lg px-3 py-1.5 ${a.type === "danger" ? "bg-rose-50 text-rose-700" : a.type === "warn" ? "bg-amber-50 text-amber-700" : "bg-slate-50 text-slate-600"}`}>{a.texte}</li>
            ))}
          </ul>
        </div>
      )}
      {alertes.length === 0 && (
        <div className="card-p flex items-center gap-2 text-emerald-700"><CheckCircle2 size={18} /> الإسناد متوازن ومكتمل.</div>
      )}

      {vue === "classes" ? (
        <div className="grid gap-4 lg:grid-cols-2 print-area">
          {state.classes.map((c) => (
            <div key={c.id} className="card-p">
              <div className="mb-3 flex items-baseline justify-between">
                <h3 className="font-display text-lg font-bold text-slate-900">{c.nom}</h3>
                <span className="text-xs text-slate-500">{niveauNom(c.niveau)} · {c.effectif} تلميذا</span>
              </div>
              <table className="w-full">
                <tbody>
                  {state.affectations.filter((a) => a.classeId === c.id).map((a) => (
                    <tr key={a.id}>
                      <td className="td w-32"><DomaineBadge id={a.domaineId} small /></td>
                      <td className="td">
                        <select
                          className={`w-full rounded-lg px-2 py-1 text-sm ${a.enseignantId ? "bg-slate-50" : "bg-rose-50 text-rose-700"}`}
                          value={a.enseignantId || ""}
                          onChange={(e) => majAffectation(a.id, { enseignantId: e.target.value || null })}
                        >
                          <option value="">— غير مُسند —</option>
                          {candidats(a.domaineId).map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.nom} ({charge[e.id] || 0}/{e.nisab}س){e.domaines.includes(a.domaineId) ? "" : " ⚠"}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="td w-20">
                        <input type="number" className="w-16 rounded-lg bg-slate-50 px-2 py-1 text-sm" value={a.heures} onChange={(e) => majAffectation(a.id, { heures: Number(e.target.value) })} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden print-area">
          <table className="w-full">
            <thead>
              <tr><th className="th">المعلم</th><th className="th">الأقسام والمجالات</th><th className="th">المجموع</th></tr>
            </thead>
            <tbody>
              {state.enseignants.map((e) => {
                const mes = state.affectations.filter((a) => a.enseignantId === e.id);
                const h = charge[e.id] || 0;
                return (
                  <tr key={e.id}>
                    <td className="td font-semibold">{e.nom}<div className="text-xs font-normal text-slate-400">{e.grade}</div></td>
                    <td className="td">
                      <div className="flex flex-wrap gap-1">
                        {mes.length === 0 && <span className="text-xs text-slate-400">بدون إسناد</span>}
                        {mes.map((a) => (
                          <span key={a.id} className="badge bg-slate-100 text-slate-700">
                            {state.classes.find((c) => c.id === a.classeId)?.nom} · {state.domaines.find((d) => d.id === a.domaineId)?.court} · {a.heures}س
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="td"><span className={`badge ${h > e.nisab ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{h}/{e.nisab} س</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
