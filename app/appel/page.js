"use client";
import { useMemo, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { PageHead } from "@/components/ui";
import { niveauNom } from "@/lib/config";
import { uid } from "@/lib/engine";
import { Printer, Upload, Check, X, Clock, Users, FileJson } from "lucide-react";

export default function Appel() {
  const { state, setEleves, setPresence, setPresencesClasse, importerListes } = useStore();
  const fileRef = useRef(null);
  const [classeId, setClasseId] = useState(state.classes[0]?.id);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [coller, setColler] = useState(false);
  const [texte, setTexte] = useState("");

  const classe = state.classes.find((c) => c.id === classeId);
  const eleves = state.eleves[classeId] || [];
  const jour = state.presences[date]?.[classeId] || {};

  const stats = useMemo(() => {
    const p = eleves.filter((e) => (jour[e.id] || "P") === "P").length;
    const a = eleves.filter((e) => jour[e.id] === "A").length;
    const r = eleves.filter((e) => jour[e.id] === "R").length;
    return { p, a, r };
  }, [eleves, jour]);

  const importer = () => {
    const liste = texte
      .split("\n")
      .map((l) => l.replace(/^\s*\d+[\.\-\)]?\s*/, "").trim())
      .filter(Boolean)
      .map((nom) => ({ id: uid("e"), nom }));
    setEleves(classeId, liste);
    setTexte("");
    setColler(false);
  };

  const marquerTous = (v) => {
    const obj = {};
    eleves.forEach((e) => (obj[e.id] = v));
    setPresencesClasse(date, classeId, obj);
  };

  const cumulAbsences = (eleveId) =>
    Object.values(state.presences).filter((j) => j[classeId]?.[eleveId] === "A").length;

  return (
    <div className="space-y-5">
      <PageHead titre="دفتر المناداة" desc="حضور يومي رقمي لكل قسم + نسخة ورقية للطباعة">
        <button className="btn-ghost" onClick={() => window.print()}><Printer size={16} /> طباعة الدفتر</button>
        <button className="btn-ghost" onClick={() => fileRef.current?.click()}><FileJson size={16} /> استيراد كل القوائم</button>
        <input
          ref={fileRef} type="file" accept="application/json" className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = () => {
              try { importerListes(JSON.parse(r.result)); alert("تم استيراد القوائم ✅"); }
              catch { alert("الملف غير صالح"); }
            };
            r.readAsText(f);
            e.target.value = "";
          }}
        />
        <button className="btn-primary" onClick={() => setColler(true)}><Upload size={16} /> إدراج قائمة التلاميذ</button>
      </PageHead>

      <div className="no-print card-p flex flex-wrap items-end gap-3">
        <div className="min-w-48">
          <span className="label">القسم</span>
          <select className="input" value={classeId} onChange={(e) => setClasseId(e.target.value)}>
            {state.classes.map((c) => <option key={c.id} value={c.id}>{c.nom} — {niveauNom(c.niveau)}</option>)}
          </select>
        </div>
        <div>
          <span className="label">التاريخ</span>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={() => marquerTous("P")}><Check size={15} /> الكل حاضر</button>
          <button className="btn-ghost" onClick={() => marquerTous("A")}><X size={15} /> الكل غائب</button>
        </div>
        <div className="mr-auto flex gap-2 text-xs">
          <span className="badge bg-emerald-50 text-emerald-700">حاضر {stats.p}</span>
          <span className="badge bg-rose-50 text-rose-700">غائب {stats.a}</span>
          <span className="badge bg-amber-50 text-amber-700">متأخر {stats.r}</span>
        </div>
      </div>

      {eleves.length === 0 ? (
        <div className="card-p text-center">
          <Users className="mx-auto mb-2 text-slate-300" size={32} />
          <p className="text-sm text-slate-500">لا توجد قائمة تلاميذ لهذا القسم بعد.</p>
          <button className="btn-primary mt-3" onClick={() => setColler(true)}>إدراج القائمة الآن</button>
        </div>
      ) : (
        <div className="card overflow-hidden print-area">
          <div className="hidden print:block px-5 pt-5">
            <div className="text-center font-bold">{state.school.nom} — {state.school.ville}</div>
            <div className="text-center text-sm">دفتر المناداة — {classe?.nom} — {date}</div>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th className="th w-12">#</th>
                <th className="th">الاسم واللقب</th>
                <th className="th w-64 no-print">الحالة</th>
                <th className="th w-28">مجموع الغيابات</th>
                <th className="th hidden print:table-cell w-40">الإمضاء / الملاحظة</th>
              </tr>
            </thead>
            <tbody>
              {eleves.map((e, i) => {
                const v = jour[e.id] || "P";
                const cum = cumulAbsences(e.id);
                return (
                  <tr key={e.id} className={v === "A" ? "bg-rose-50/40" : ""}>
                    <td className="td text-slate-400">{i + 1}</td>
                    <td className="td font-semibold text-slate-800">{e.nom}</td>
                    <td className="td no-print">
                      <div className="flex gap-1">
                        {[["P", "حاضر", "emerald"], ["A", "غائب", "rose"], ["R", "متأخر", "amber"]].map(([k, lbl, col]) => (
                          <button
                            key={k}
                            onClick={() => setPresence(date, classeId, e.id, k)}
                            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                              v === k ? `bg-${col}-600 text-white` : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                            style={v === k ? { background: col === "emerald" ? "#059669" : col === "rose" ? "#e11d48" : "#d97706", color: "#fff" } : {}}
                          >
                            {lbl}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="td">
                      <span className={`badge ${cum >= 5 ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"}`}>
                        <Clock size={12} className="ml-1" /> {cum}
                      </span>
                    </td>
                    <td className="td hidden print:table-cell"></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {coller && (
        <div className="no-print fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" onClick={() => setColler(false)}>
          <div className="card w-full max-w-lg p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-bold">إدراج قائمة تلاميذ {classe?.nom}</h3>
            <p className="mt-1 text-xs text-slate-500">الصق الأسماء، اسما في كل سطر. الأرقام في بداية السطر تُحذف تلقائيا.</p>
            <textarea className="input mt-3 h-56 font-mono text-sm" value={texte} onChange={(e) => setTexte(e.target.value)} placeholder={"1 أركان عبد النصير\n2 فرح السديري\n…"} />
            <div className="mt-3 flex gap-2">
              <button className="btn-primary flex-1 justify-center" onClick={importer}>إدراج</button>
              <button className="btn-ghost" onClick={() => setColler(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
