"use client";
import { useStore } from "@/lib/store";
import { PageHead } from "@/components/ui";
import { NIVEAUX, niveauNom } from "@/lib/config";
import { besoins } from "@/lib/engine";
import { Plus, Trash2, Printer, Users } from "lucide-react";

export default function Classes() {
  const { state, ajouterClasse, majClasse, supprimerClasse } = useStore();

  return (
    <div className="space-y-5">
      <PageHead titre="الأقسام" desc={`${state.classes.length} قسما — ${state.classes.reduce((s, c) => s + Number(c.effectif || 0), 0)} تلميذا`}>
        <button className="btn-ghost" onClick={() => window.print()}><Printer size={16} /> طباعة</button>
        <button className="btn-primary" onClick={() => ajouterClasse({})}><Plus size={16} /> إضافة قسم</button>
      </PageHead>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {state.classes.map((c) => {
          const total = besoins(c, state.grille).reduce((s, b) => s + b.heures, 0);
          const tit = state.enseignants.find((e) => e.id === c.titulaire);
          return (
            <div key={c.id} className="card-p">
              <div className="flex items-start justify-between">
                <div>
                  <input className="w-24 font-display text-lg font-bold text-slate-900 bg-transparent outline-none" value={c.nom} onChange={(e) => majClasse(c.id, { nom: e.target.value })} />
                  <div className="text-xs text-slate-500">{niveauNom(c.niveau)}</div>
                </div>
                <button className="no-print text-rose-400 hover:text-rose-600" onClick={() => supprimerClasse(c.id)}><Trash2 size={15} /></button>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div>
                  <span className="label">المستوى</span>
                  <select className="input" value={c.niveau} onChange={(e) => majClasse(c.id, { niveau: Number(e.target.value) })}>
                    {NIVEAUX.map((n) => <option key={n.id} value={n.id}>{n.nom}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="label">العدد</span>
                    <input type="number" className="input" value={c.effectif} onChange={(e) => majClasse(c.id, { effectif: Number(e.target.value) })} />
                  </div>
                  <div>
                    <span className="label">القاعة</span>
                    <input className="input" value={c.salle || ""} onChange={(e) => majClasse(c.id, { salle: e.target.value })} />
                  </div>
                </div>
                <div>
                  <span className="label">معلم القسم</span>
                  <select className="input" value={c.titulaire || ""} onChange={(e) => majClasse(c.id, { titulaire: e.target.value || null })}>
                    <option value="">— غير محدّد —</option>
                    {state.enseignants.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
                  </select>
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
