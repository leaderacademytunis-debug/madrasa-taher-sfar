"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { PageHead, Stat } from "@/components/ui";
import { indicateurs, diagnostiquerAffectations, chargeParEnseignant } from "@/lib/engine";
import { AlertTriangle, CheckCircle2, Info, ArrowLeft } from "lucide-react";

const RACCOURCIS = [
  { href: "/affectation", t: "إسناد الأقسام", d: "توزيع المجالات على 23 معلما" },
  { href: "/emplois", t: "جداول الأوقات", d: "توليد وطباعة ونشر" },
  { href: "/appel", t: "دفتر المناداة", d: "الحضور اليومي للتلاميذ" },
  { href: "/remplacements", t: "التعويض الذكي", d: "تغطية غياب معلم في دقائق" },
];

export default function Dashboard() {
  const { state } = useStore();
  const ind = indicateurs(state);
  const alertes = diagnostiquerAffectations(state);
  const charge = chargeParEnseignant(state.affectations);
  const today = new Date().toISOString().slice(0, 10);
  const j = state.journal[today] || {};
  const taches = j.taches || [];

  const icone = { danger: AlertTriangle, warn: Info, info: Info };
  const couleur = { danger: "text-rose-600 bg-rose-50", warn: "text-amber-600 bg-amber-50", info: "text-slate-500 bg-slate-50" };

  return (
    <div className="space-y-6">
      <PageHead titre={`أهلا بك، ${state.school.directeur}`} desc={`${state.school.nom} — السنة الدراسية ${state.school.annee}`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="الأقسام" valeur={ind.nbClasses} sous={`${ind.nbEleves} تلميذا`} />
        <Stat label="المعلمون" valeur={ind.nbEnseignants} couleur="green" sous={`نسبة استغلال النصاب ${ind.tauxCharge}%`} />
        <Stat label="ساعات مُسندة" valeur={ind.heuresTotal + "س"} couleur="amber" sous={`مُبرمجة في الجداول: ${ind.heuresPlacees}`} />
        <Stat label="تغطية الجداول" valeur={ind.tauxEmploi + "%"} couleur={ind.tauxEmploi > 95 ? "green" : "rose"} sous="من الساعات المسندة" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-p lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display font-bold text-slate-800">تنبيهات المنصة</h2>
            <span className="badge bg-slate-100 text-slate-600">{alertes.length}</span>
          </div>
          {alertes.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 size={18} /> لا توجد تنبيهات — الإسناد والجداول سليمة.</div>
          ) : (
            <ul className="space-y-2 max-h-80 overflow-auto pl-1">
              {alertes.slice(0, 30).map((a, i) => {
                const Icon = icone[a.type];
                return (
                  <li key={i} className={`flex items-start gap-2 rounded-xl px-3 py-2 text-sm ${couleur[a.type]}`}>
                    <Icon size={16} className="mt-0.5 shrink-0" />
                    <span>{a.texte}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="card-p">
          <h2 className="mb-4 font-display font-bold text-slate-800">مهام اليوم</h2>
          {taches.length === 0 ? (
            <p className="text-sm text-slate-400">لم تُسجّل مهام لهذا اليوم.</p>
          ) : (
            <ul className="space-y-2">
              {taches.slice(0, 6).map((t) => (
                <li key={t.id} className="flex items-center gap-2 text-sm">
                  <span className={`h-2 w-2 rounded-full ${t.fait ? "bg-emerald-500" : "bg-amber-400"}`} />
                  <span className={t.fait ? "line-through text-slate-400" : "text-slate-700"}>{t.texte}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/journal" className="btn-soft mt-4 w-full justify-center">فتح دفتر العمل اليومي</Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {RACCOURCIS.map((r) => (
          <Link key={r.href} href={r.href} className="card-p group hover:border-brand-200 hover:shadow-md transition">
            <div className="font-display font-bold text-slate-800 group-hover:text-brand-700">{r.t}</div>
            <div className="mt-1 text-xs text-slate-500">{r.d}</div>
            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-brand-600">دخول <ArrowLeft size={14} /></div>
          </Link>
        ))}
      </div>

      <div className="card-p">
        <h2 className="mb-4 font-display font-bold text-slate-800">توازن النُّصُب بين المعلمين</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {state.enseignants.map((e) => {
            const h = charge[e.id] || 0;
            const pct = Math.min(100, Math.round((h / (e.nisab || 25)) * 100));
            const c = h > (e.nisab || 25) ? "bg-rose-500" : pct > 80 ? "bg-emerald-500" : "bg-amber-400";
            return (
              <div key={e.id}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">{e.nom}</span>
                  <span className="text-slate-500">{h}س / {e.nisab}س</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100"><div className={`h-2 rounded-full ${c}`} style={{ width: pct + "%" }} /></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
