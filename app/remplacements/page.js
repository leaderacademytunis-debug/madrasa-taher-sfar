"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { PageHead, DomaineBadge } from "@/components/ui";
import { propositionsRemplacement } from "@/lib/engine";
import { UserCheck, Printer, Copy, Check } from "lucide-react";

export default function Remplacements() {
  const { state } = useStore();
  const [ensId, setEnsId] = useState(state.enseignants[0]?.id);
  const [jour, setJour] = useState(state.jours[0]?.id);
  const [copie, setCopie] = useState(false);

  const ens = state.enseignants.find((e) => e.id === ensId);
  const res = propositionsRemplacement(state, ensId, jour);

  const texte = () => {
    const l = [`تنظيم التعويض — ${ens?.nom} — يوم ${state.jours.find((j) => j.id === jour)?.nom}`];
    res.forEach((r) => {
      const c = state.classes.find((x) => x.id === r.cours.classeId);
      const p = r.propositions[0];
      l.push(`${r.slot.debut}-${r.slot.fin} | ${c?.nom} | ${state.domaines.find((d) => d.id === r.cours.domaineId)?.nom} → ${p ? p.nom : "لا يوجد متاح"}`);
    });
    return l.join("\n");
  };

  const copier = async () => {
    await navigator.clipboard.writeText(texte());
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  };

  return (
    <div className="space-y-5">
      <PageHead titre="التعويض الذكي" desc="غاب معلم؟ المنصة تعرض حصصه وتقترح المعلمين المتفرغين في نفس التوقيت">
        <button className="btn-ghost" onClick={copier}>{copie ? <Check size={16} /> : <Copy size={16} />} نسخ خطة التعويض</button>
        <button className="btn-ghost" onClick={() => window.print()}><Printer size={16} /> طباعة</button>
      </PageHead>

      <div className="no-print card-p flex flex-wrap items-end gap-3">
        <div className="min-w-56">
          <span className="label">المعلم الغائب</span>
          <select className="input" value={ensId} onChange={(e) => setEnsId(e.target.value)}>
            {state.enseignants.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
          </select>
        </div>
        <div className="min-w-40">
          <span className="label">اليوم</span>
          <select className="input" value={jour} onChange={(e) => setJour(e.target.value)}>
            {state.jours.map((j) => <option key={j.id} value={j.id}>{j.nom}</option>)}
          </select>
        </div>
      </div>

      {res.length === 0 ? (
        <div className="card-p text-sm text-slate-500">لا حصص لهذا المعلم في اليوم المختار.</div>
      ) : (
        <div className="space-y-3 print-area">
          {res.map((r, i) => {
            const c = state.classes.find((x) => x.id === r.cours.classeId);
            return (
              <div key={i} className="card-p">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="badge bg-slate-100 text-slate-700 font-mono">{r.slot.debut} — {r.slot.fin}</span>
                  <span className="font-display font-bold text-slate-800">{c?.nom}</span>
                  <DomaineBadge id={r.cours.domaineId} small />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.propositions.length === 0 && <span className="text-sm text-rose-600">لا يوجد معلم متفرغ — يُقترح تجميع القسم أو تعديل التوقيت.</span>}
                  {r.propositions.map((p, k) => {
                    const spec = p.domaines.includes(r.cours.domaineId);
                    return (
                      <div key={p.id} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${k === 0 ? "bg-emerald-50 text-emerald-800" : "bg-slate-50 text-slate-600"}`}>
                        <UserCheck size={15} />
                        <span className="font-semibold">{p.nom}</span>
                        <span className="text-xs">{spec ? "· من الاختصاص" : "· خارج الاختصاص"}</span>
                        {k === 0 && <span className="badge bg-emerald-600 text-white text-[10px]">الأنسب</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
