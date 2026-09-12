"use client";
import { useStore } from "@/lib/store";

export function PageHead({ titre, desc, children }) {
  return (
    <div className="no-print mb-6 flex flex-wrap items-end gap-4">
      <div>
        <h1 className="title">{titre}</h1>
        {desc && <p className="subtitle mt-1">{desc}</p>}
      </div>
      <div className="mr-auto flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function Stat({ label, valeur, sous, couleur = "brand" }) {
  const map = {
    brand: "bg-brand-50 text-brand-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  };
  return (
    <div className="card-p">
      <div className={`badge ${map[couleur]}`}>{label}</div>
      <div className="mt-3 font-display text-3xl font-extrabold text-slate-900">{valeur}</div>
      {sous && <div className="mt-1 text-xs text-slate-500">{sous}</div>}
    </div>
  );
}

export function DomaineBadge({ id, small }) {
  const { state } = useStore();
  const d = state.domaines.find((x) => x.id === id);
  if (!d) return null;
  return (
    <span
      className={`badge ${small ? "text-[10px] px-1.5" : ""}`}
      style={{ background: d.couleur + "18", color: d.couleur }}
    >
      {small ? d.court : d.nom}
    </span>
  );
}

export function Vide({ texte }) {
  return <div className="card-p text-center text-sm text-slate-400">{texte}</div>;
}
