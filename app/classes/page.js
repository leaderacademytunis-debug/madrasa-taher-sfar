"use client";
import { useStore } from "@/lib/store";
import { PageHead } from "@/components/ui";
import { NIVEAUX, niveauNom, REGIME_A, REGIME_B, REGIME_PLEIN } from "@/lib/config";
import { besoins } from "@/lib/engine";
import { Plus, Trash2, Printer, Users, Sun, Moon, CalendarRange } from "lucide-react";

const COULEUR_REGIME = {
  matin: "bg-amber-100 text-amber-800",
  apresmidi: "bg-indigo-100 text-indigo-800",
  plein: "bg-emerald-100 text-emerald-800",
  repos: "bg-slate-100 text-slate-400",
};
const SUIVANT = { matin: "apresmidi", apresmidi: "plein", plein: "repos", repos: "matin" };
const LETTRE = { matin: "ص", apresmidi: "م", plein: "كامل", repos: "—" };

export default function Classes() {
  const { state, ajouterClasse, majClasse, supprimerClasse } = useStore();

  const appliquer = (c, modele) => majClasse(c.id, { regime: { ...modele } });

  return (
    <div className="space-y-5">
      <PageHead titre="الأقسام" desc={`${state.classes.length} قسما — ${state.classes.reduce((s, c) => s + Number(c.effectif || 0), 0)} تلميذا · نظام الفوجين صباحي/مسائي`}>
        <button className="btn-ghost" onClick={() => window.print()}><Printer size={16} /> طباعة</button>
        <button className="btn-primary" onClick={() => ajouterClasse({})}><Plus size={16} /> إضافة قسم</button>
      </PageHead>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {state.classes.map((c) => {
          const total = besoins(c, state.grille).reduce((s, b) => s + b.heures, 0);
          const tit = state.enseignants.find((e) => e.id === c.titulaire);
          const regime = c.regime || {};
          return (
            <div key={c.id} className="card-p">
              <div className="flex items-start justify-between">
                <div>
                  <input className="w-40 font-display text-lg font-bold text-slate-900 bg-transparent outline-none" value={c.nom} onChange={(e) => majClasse(c.id, { nom: e.target.value })} />
                  <div className="text-xs text-slate-500">{niveauNom(c.niveau)}</div>
                </div>
                <button className="no-print text-rose-400 hover:text-rose-600" onClick={() => supprimerClasse(c.id)}><Trash2 size={15} /></button>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="label">المستوى</span>
                    <select className="input" value={c.niveau} onChange={(e) => majClasse(c.id, { niveau: Number(e.target.value) })}>
                      {NIVEAUX.map((n) => <option key={n.id} value={n.id}>{n.nom}</option>)}
                    </select>
                  </div>
                  <div>
                    <span className="label">القاعة</span>
                    <input className="input" value={c.salle || ""} onChange={(e) => majClasse(c.id, { salle: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="label">عدد التلاميذ</span>
                    <input type="number" className="input" value={c.effectif} onChange={(e) => majClasse(c.id, { effectif: Number(e.target.value) })} />
                  </div>
                  <div>
                    <span className="label">معلم القسم</span>
                    <select className="input" value={c.titulaire || ""} onChange={(e) => majClasse(c.id, { titulaire: e.target.value || null })}>
                      <option value="">— غير محدّد —</option>
                      {state.enseignants.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* نظام الفوج */}
              <div className="mt-4">
                <span className="label">التوقيت الأسبوعي (اضغط اليوم لتغييره)</span>
                <div className="flex gap-1">
                  {state.jours.map((j) => {
                    const v = regime[j.id] || "plein";
                    return (
                      <button
                        key={j.id}
                        className={`flex-1 rounded-lg px-1 py-1.5 text-[11px] font-semibold ${COULEUR_REGIME[v]}`}
                        onClick={() => majClasse(c.id, { regime: { ...regime, [j.id]: SUIVANT[v] } })}
                        title={j.nom}
                      >
                        <div>{j.nom.replace("ال", "")}</div>
                        <div className="text-[10px] font-normal">{LETTRE[v]}</div>
                      </button>
                    );
                  })}
                </div>
                <div className="no-print mt-2 flex gap-1 text-[11px]">
                  <button className="btn-ghost !px-2 !py-1" onClick={() => appliquer(c, REGIME_A)}><Sun size={12} /> فوج أ</button>
                  <button className="btn-ghost !px-2 !py-1" onClick={() => appliquer(c, REGIME_B)}><Moon size={12} /> فوج ب</button>
                  <button className="btn-ghost !px-2 !py-1" onClick={() => appliquer(c, REGIME_PLEIN)}><CalendarRange size={12} /> أيام كاملة</button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Users size={13} /> {tit ? tit.nom : "بدون معلم أساس"}</span>
                <span className="badge bg-brand-50 text-brand-700">{total} س/أسبوع</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
