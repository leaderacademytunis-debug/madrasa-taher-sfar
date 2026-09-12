"use client";
import { forwardRef } from "react";
import { useStore } from "@/lib/store";
import { niveauNom, blocAutorise } from "@/lib/config";

/** أنماط أنيقة جاهزة للنشر */
export const THEMES = {
  royal: {
    nom: "أزرق ملكي",
    bandeau: "linear-gradient(120deg,#0b2e6b 0%,#1e63db 55%,#38bdf8 100%)",
    fond: "#ffffff",
    texte: "#0b1729",
    doux: "#5b6b83",
    ligne: "#e6ecf5",
    entete: "#f4f7fc",
    accent: "#1e63db",
    ruban: "#c9a227",
  },
  emeraude: {
    nom: "أخضر زيتوني",
    bandeau: "linear-gradient(120deg,#064e3b 0%,#0f766e 55%,#34d399 100%)",
    fond: "#ffffff",
    texte: "#04231c",
    doux: "#4b6b62",
    ligne: "#e3efea",
    entete: "#f2f9f6",
    accent: "#0f766e",
    ruban: "#c9a227",
  },
  sable: {
    nom: "كلاسيكي ذهبي",
    bandeau: "linear-gradient(120deg,#4b3418 0%,#8a6a21 40%,#a17d2a 65%,#e2c275 100%)",
    fond: "#fffdf8",
    texte: "#2a2118",
    doux: "#6f6152",
    ligne: "#ece2cf",
    entete: "#f9f3e7",
    accent: "#a17d2a",
    ruban: "#2a2118",
  },
  nuit: {
    nom: "ليلي فاخر",
    bandeau: "linear-gradient(120deg,#020617 0%,#111f3d 55%,#1e3a8a 100%)",
    fond: "#0b1220",
    texte: "#e8eefb",
    doux: "#8fa3c4",
    ligne: "#1b2942",
    entete: "#111c31",
    accent: "#60a5fa",
    ruban: "#c9a227",
  },
};

const EmploiTable = forwardRef(function EmploiTable({ mode = "classe", cible, theme = "royal", onCase }, ref) {
  const { state } = useStore();
  const { jours, blocs, emplois, classes, enseignants, domaines, school } = state;
  const T = THEMES[theme] || THEMES.royal;
  const sombre = theme === "nuit";

  const cases = {};
  if (mode === "classe") {
    Object.entries(emplois[cible?.id] || {}).forEach(([k, v]) => (cases[k] = v));
  } else {
    Object.entries(emplois || {}).forEach(([cid, g]) => {
      Object.entries(g).forEach(([k, cell]) => {
        (cell || []).forEach((v) => {
          if (v.enseignantId === cible?.id) cases[k] = [...(cases[k] || []), { ...v, classeId: cid }];
        });
      });
    });
  }

  const heures = Object.values(cases).reduce((s, c) => s + c.length, 0);
  const nomDom = (id) => domaines.find((d) => d.id === id);
  const utilises = [...new Set(Object.values(cases).flat().map((v) => v.domaineId))];

  const marqueJour = (jid) => {
    if (mode !== "classe") return "";
    const r = (cible?.regime || {})[jid];
    return r === "matin" ? "صباحا" : r === "apresmidi" ? "مساء" : r === "repos" ? "راحة" : "";
  };

  return (
    <div
      ref={ref}
      dir="rtl"
      style={{
        background: T.fond,
        color: T.texte,
        borderRadius: 26,
        overflow: "hidden",
        width: "100%",
        fontFamily: "Tajawal, system-ui, sans-serif",
        boxShadow: sombre ? "none" : "0 24px 60px -36px rgba(15,23,42,.45)",
        border: `1px solid ${T.ligne}`,
      }}
    >
      {/* الترويسة */}
      <div style={{ background: T.bandeau, color: "#fff", padding: "22px 26px 26px", position: "relative" }}>
        <div
          style={{
            position: "absolute", inset: 0, opacity: 0.14,
            backgroundImage:
              "radial-gradient(circle at 12% 20%, #fff 1.2px, transparent 1.3px), radial-gradient(circle at 60% 70%, #fff 1.2px, transparent 1.3px)",
            backgroundSize: "26px 26px, 34px 34px",
          }}
        />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 62, height: 62, borderRadius: "50%", display: "grid", placeItems: "center",
              background: "rgba(255,255,255,.14)", border: `2px solid ${T.ruban}`, fontFamily: "Cairo, sans-serif",
              fontWeight: 800, fontSize: 19, letterSpacing: 1,
            }}
          >
            ط.ص
          </div>
          <div style={{ lineHeight: 1.4 }}>
            <div style={{ fontFamily: "Cairo, sans-serif", fontWeight: 800, fontSize: 21 }}>{school.nom}</div>
            <div style={{ fontSize: 12.5, opacity: 0.9 }}>{school.delegation} — {school.ville}</div>
          </div>
          <div style={{ marginInlineStart: "auto", textAlign: "left" }}>
            <div style={{ fontSize: 11.5, opacity: 0.85, letterSpacing: 1 }}>السنة الدراسية</div>
            <div style={{ fontFamily: "Cairo, sans-serif", fontWeight: 700, fontSize: 16 }}>{school.annee}</div>
          </div>
        </div>

        <div style={{ position: "relative", marginTop: 20, display: "flex", alignItems: "flex-end", gap: 14, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.85, letterSpacing: 2 }}>جدول الأوقات الأسبوعي</div>
            <div style={{ fontFamily: "Cairo, sans-serif", fontWeight: 800, fontSize: 30, lineHeight: 1.25 }}>
              {mode === "classe" ? cible?.nom : cible?.nom}
            </div>
          </div>
          <div style={{ marginInlineStart: "auto", display: "flex", gap: 8 }}>
            {(mode === "classe"
              ? [niveauNom(cible?.niveau), `${cible?.effectif || 0} تلميذا`, `القاعة ${cible?.salle || "—"}`]
              : [cible?.grade || "معلم", `${heures} ساعة أسبوعيا`]
            ).map((x, i) => (
              <span key={i} style={{ background: "rgba(255,255,255,.16)", border: "1px solid rgba(255,255,255,.25)", borderRadius: 999, padding: "5px 12px", fontSize: 12 }}>
                {x}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* شريط ذهبي رفيع */}
      <div style={{ height: 3, background: T.ruban, opacity: 0.9 }} />

      {/* الجدول */}
      <div style={{ padding: "18px 20px 6px" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 5, tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th style={{ width: 104 }} />
              {blocs.map((b) => (
                <th key={b.id} style={{ padding: "9px 4px", background: T.entete, borderRadius: 12, color: T.accent, fontFamily: "Cairo, sans-serif", fontWeight: 700, fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
                  {b.debut}<span style={{ opacity: 0.5 }}> — </span>{b.fin}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jours.map((j) => {
              const marque = marqueJour(j.id);
              return (
                <tr key={j.id}>
                  <td style={{ padding: 0 }}>
                    <div style={{ background: T.entete, borderRadius: 12, padding: "10px 6px", textAlign: "center", borderInlineStart: `4px solid ${T.accent}` }}>
                      <div style={{ fontFamily: "Cairo, sans-serif", fontWeight: 700, fontSize: 13.5 }}>{j.nom}</div>
                      {marque && <div style={{ fontSize: 10, color: T.doux, marginTop: 2 }}>{marque}</div>}
                    </div>
                  </td>
                  {blocs.map((b) => {
                    const key = j.id + "|" + b.id;
                    const brut = cases[key] || [];
                    const cell =
                      brut.length === 2 && brut[0].domaineId === brut[1].domaineId && brut[0].enseignantId === brut[1].enseignantId
                        ? [{ ...brut[0], double: true }]
                        : brut;
                    const dispo = mode === "classe" ? blocAutorise((cible?.regime || {})[j.id], b) : true;
                    return (
                      <td
                        key={key}
                        onClick={onCase ? () => onCase(key, brut) : undefined}
                        style={{
                          padding: 0, height: 62, verticalAlign: "stretch",
                          cursor: onCase ? "pointer" : "default",
                        }}
                      >
                        {cell.length === 0 ? (
                          <div style={{
                            height: "100%", borderRadius: 12,
                            border: `1px dashed ${dispo ? T.ligne : "transparent"}`,
                            background: dispo ? "transparent" : (sombre ? "rgba(255,255,255,.03)" : "#f8fafc"),
                          }} />
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, height: "100%" }}>
                            {cell.map((v, i) => {
                              const d = nomDom(v.domaineId);
                              const c = d?.couleur || T.accent;
                              const second = mode === "classe"
                                ? enseignants.find((e) => e.id === v.enseignantId)
                                : classes.find((x) => x.id === v.classeId);
                              const secNom = mode === "classe"
                                ? (second && second.type === "specialiste" ? second.nom : "")
                                : second?.nom;
                              return (
                                <div
                                  key={i}
                                  style={{
                                    flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
                                    borderRadius: 12, padding: "4px 6px",
                                    background: sombre
                                      ? `linear-gradient(135deg, ${c}44, ${c}22)`
                                      : `linear-gradient(135deg, ${c}1f, ${c}0d)`,
                                    borderInlineStart: `3px solid ${c}`,
                                  }}
                                >
                                  <div style={{ fontFamily: "Cairo, sans-serif", fontWeight: 700, fontSize: 12.5, color: sombre ? "#fff" : c }}>
                                    {d?.court || v.domaineId}
                                  </div>
                                  {secNom && <div style={{ fontSize: 9.5, color: T.doux, marginTop: 1 }}>{secNom}</div>}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* التذييل */}
      <div style={{ padding: "10px 26px 20px", display: "flex", alignItems: "flex-end", gap: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: 11, color: T.doux, maxWidth: "68%" }}>
          {(utilises.length ? utilises : domaines.map((d) => d.id)).map((id) => {
            const d = nomDom(id);
            if (!d) return null;
            return (
              <span key={id} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 4, background: d.couleur, display: "inline-block" }} />
                {d.nom}
              </span>
            );
          })}
        </div>
        <div style={{ marginInlineStart: "auto", textAlign: "center", fontSize: 11, color: T.doux }}>
          <div style={{ borderTop: `1px dashed ${T.ligne}`, paddingTop: 6, minWidth: 170 }}>ختم وإمضاء مدير المؤسسة</div>
        </div>
      </div>
    </div>
  );
});

export default EmploiTable;
