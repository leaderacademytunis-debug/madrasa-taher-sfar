"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { SCHOOL, DOMAINES, GRILLE, JOURS, SEANCES } from "./config";
import { makeDemo, ELEVES_DEMO } from "./demo";
import { autoAffecter, genererEmplois, uid } from "./engine";

const KEY = "madrasa-taher-sfar-v1";

function etatInitial() {
  const { classes, enseignants } = makeDemo();
  const base = {
    school: SCHOOL,
    domaines: DOMAINES,
    grille: GRILLE,
    jours: JOURS,
    seances: SEANCES,
    classes,
    enseignants,
    affectations: [],
    emplois: {},
    eleves: { [classes[0].id]: ELEVES_DEMO.map((nom, i) => ({ id: "e" + (i + 1), nom })) },
    presences: {},
    journal: {},
    modeles: [],
  };
  base.affectations = autoAffecter(base);
  base.emplois = genererEmplois(base).emplois;
  return base;
}

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [state, setState] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setState(raw ? JSON.parse(raw) : etatInitial());
    } catch {
      setState(etatInitial());
    }
  }, []);

  useEffect(() => {
    if (state) {
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
    }
  }, [state]);

  const api = useMemo(() => {
    const patch = (p) => setState((s) => ({ ...s, ...(typeof p === "function" ? p(s) : p) }));
    return {
      patch,
      reset: () => setState(etatInitial()),
      remplacerTout: (data) => setState(data),

      // معلمون
      ajouterEnseignant: (e) => patch((s) => ({ enseignants: [...s.enseignants, { id: uid("t"), nom: "معلم جديد", grade: "معلم", type: "base", domaines: ["ar"], nisab: 25, ...e }] })),
      majEnseignant: (id, e) => patch((s) => ({ enseignants: s.enseignants.map((x) => (x.id === id ? { ...x, ...e } : x)) })),
      supprimerEnseignant: (id) => patch((s) => ({
        enseignants: s.enseignants.filter((x) => x.id !== id),
        affectations: s.affectations.map((a) => (a.enseignantId === id ? { ...a, enseignantId: null } : a)),
      })),

      // أقسام
      ajouterClasse: (c) => patch((s) => ({ classes: [...s.classes, { id: uid("c"), nom: "قسم جديد", niveau: 1, effectif: 25, salle: "", titulaire: null, ...c }] })),
      majClasse: (id, c) => patch((s) => ({ classes: s.classes.map((x) => (x.id === id ? { ...x, ...c } : x)) })),
      supprimerClasse: (id) => patch((s) => ({
        classes: s.classes.filter((x) => x.id !== id),
        affectations: s.affectations.filter((a) => a.classeId !== id),
      })),

      // إسناد
      majAffectation: (id, a) => patch((s) => ({ affectations: s.affectations.map((x) => (x.id === id ? { ...x, ...a } : x)) })),
      relancerAffectation: () => setState((s) => ({ ...s, affectations: autoAffecter(s) })),

      // جداول
      genererEmplois: () => setState((s) => ({ ...s, emplois: genererEmplois(s).emplois })),
      majCase: (classeId, key, val) => patch((s) => ({
        emplois: { ...s.emplois, [classeId]: { ...(s.emplois[classeId] || {}), [key]: val } },
      })),
      viderCase: (classeId, key) => patch((s) => {
        const g = { ...(s.emplois[classeId] || {}) };
        delete g[key];
        return { emplois: { ...s.emplois, [classeId]: g } };
      }),

      // تلاميذ
      setEleves: (classeId, liste) => patch((s) => ({ eleves: { ...s.eleves, [classeId]: liste } })),

      // مناداة
      setPresence: (date, classeId, eleveId, valeur) => patch((s) => {
        const jour = s.presences[date] || {};
        const cls = jour[classeId] || {};
        return { presences: { ...s.presences, [date]: { ...jour, [classeId]: { ...cls, [eleveId]: valeur } } } };
      }),
      setPresencesClasse: (date, classeId, obj) => patch((s) => ({
        presences: { ...s.presences, [date]: { ...(s.presences[date] || {}), [classeId]: obj } },
      })),

      // العمل اليومي
      majJournal: (date, data) => patch((s) => ({ journal: { ...s.journal, [date]: { ...(s.journal[date] || {}), ...data } } })),
    };
  }, []);

  if (!state) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-400">جارٍ تحميل المنصة…</div>
    );
  }
  return <Ctx.Provider value={{ state, ...api }}>{children}</Ctx.Provider>;
}

export const useStore = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore خارج StoreProvider");
  return v;
};
