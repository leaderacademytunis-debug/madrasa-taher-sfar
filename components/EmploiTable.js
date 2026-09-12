"use client";
import { forwardRef } from "react";
import { useStore } from "@/lib/store";
import { niveauNom } from "@/lib/config";

/**
 * جدول أوقات أنيق — يُستعمل للأقسام وللمعلمين، وقابل للتصدير كصورة.
 * mode: "classe" | "enseignant"
 */
const EmploiTable = forwardRef(function EmploiTable({ mode = "classe", cible, theme = "clair", onCase }, ref) {
  const { state } = useStore();
  const { jours, seances, emplois, classes, enseignants, domaines, school } = state;

  const seancesUtiles = seances.filter((s) => !s.pause);

  const cases = {};
  if (mode === "classe") {
    Object.entries(emplois[cible?.id] || {}).forEach(([k, v]) => (cases[k] = v));
  } else {
    Object.entries(emplois || {}).forEach(([cid, g]) => {
      Object.entries(g).forEach(([k, v]) => {
        if (v.enseignantId === cible?.id) cases[k] = { ...v, classeId: cid };
      });
    });
  }

  const sombre = theme === "sombre";
  const bg = sombre ? "#0f172a" : "#ffffff";
  const fg = sombre ? "#e2e8f0" : "#0f172a";
  const muted = sombre ? "#94a3b8" : "#64748b";
  const line = sombre ? "#1e293b" : "#e2e8f0";
  const head = sombre ? "#111f38" : "#f8fafc";

  const titre = mode === "classe"
    ? `جدول أوقات ${cible?.nom || ""}`
    : `جدول أوقات المعلم(ة) ${cible?.nom || ""}`;
  const soustitre = mode === "classe"
    ? `${niveauNom(cible?.niveau)} · ${cible?.effectif || 0} تلميذا · ${cible?.salle || ""}`
    : `${cible?.grade || ""}`;

  return (
    <div ref={ref} dir="rtl" style={{ background: bg, color: fg, padding: 28, borderRadius: 22, width: "100%", fontFamily: "Tajawal, system-ui, sans-serif" }}>
      {/* الترويسة */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: "#1e63db", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontFamily: "Cairo, sans-serif" }}>ط.ص</div>
        <div style={{ lineHeight: 1.35 }}>
          <div style={{ fontFamily: "Cairo, sans-serif", fontWeight: 800, fontSize: 20 }}>{titre}</div>
          <div style={{ fontSize: 13, color: muted }}>{school.nom} — {school.ville} · السنة الدراسية {school.annee}</div>
        </div>
        <div style={{ marginInlineStart: "auto", textAlign: "left", fontSize: 12, color: muted }}>
          <div>{soustitre}</div>
          <div>{school.delegation}</div>
        </div>
      </div>

      {/* الشبكة */}
      <div style={{ overflow: "hidden", borderRadius: 16, border: `1px solid ${line}` }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: head }}>
              <th style={{ padding: "10px 8px", borderInlineEnd: `1px solid ${line}`, color: muted, fontWeight: 700, width: 92 }}>الحصة</th>
              {jours.map((j) => (
                <th key={j.id} style={{ padding: "10px 8px", borderInlineEnd: `1px solid ${line}`, fontFamily: "Cairo, sans-serif", fontWeight: 700 }}>
                  {j.nom}
                  {!j.pleine && <div style={{ fontSize: 10, color: muted, fontWeight: 500 }}>صباحا فقط</div>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {seancesUtiles.map((s, si) => (
              <tr key={s.id} style={{ borderTop: `1px solid ${line}`, background: si % 2 ? (sombre ? "#0c1526" : "#fcfcfd") : "transparent" }}>
                <td style={{ padding: "8px", borderInlineEnd: `1px solid ${line}`, textAlign: "center", color: muted, fontVariantNumeric: "tabular-nums" }}>
                  <div style={{ fontWeight: 700, color: fg }}>{s.debut}</div>
                  <div style={{ fontSize: 10 }}>{s.fin}</div>
                </td>
                {jours.map((j) => {
                  const dispo = j.pleine || s.periode !== "apresmidi";
                  const key = j.id + "|" + s.id;
                  const v = cases[key];
                  const d = v ? domaines.find((x) => x.id === v.domaineId) : null;
                  const secondaire = v
                    ? mode === "classe"
                      ? enseignants.find((e) => e.id === v.enseignantId)?.nom
                      : classes.find((c) => c.id === v.classeId)?.nom
                    : null;
                  return (
                    <td
                      key={key}
                      onClick={onCase ? () => onCase(key, v) : undefined}
                      style={{
                        padding: 5,
                        borderInlineEnd: `1px solid ${line}`,
                        textAlign: "center",
                        background: !dispo ? (sombre ? "#0a1120" : "#f1f5f9") : "transparent",
                        cursor: onCase && dispo ? "pointer" : "default",
                        height: 52,
                      }}
                    >
                      {!dispo ? (
                        <span style={{ fontSize: 10, color: muted }}>—</span>
                      ) : v && d ? (
                        <div style={{ background: d.couleur + (sombre ? "33" : "16"), borderRadius: 10, padding: "6px 4px" }}>
                          <div style={{ fontWeight: 700, color: sombre ? "#fff" : d.couleur, fontSize: 12 }}>{d.court}</div>
                          <div style={{ fontSize: 10, color: muted, marginTop: 2 }}>{secondaire}</div>
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: sombre ? "#334155" : "#cbd5e1" }}>·</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14, fontSize: 11, color: muted }}>
        {domaines.map((d) => (
          <span key={d.id} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: d.couleur, display: "inline-block" }} />
            {d.nom}
          </span>
        ))}
        <span style={{ marginInlineStart: "auto" }}>مدير المؤسسة: {school.directeur}</span>
      </div>
    </div>
  );
});

export default EmploiTable;
