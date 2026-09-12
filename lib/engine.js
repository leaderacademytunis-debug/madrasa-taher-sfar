import { GRILLE, JOURS, BLOCS, blocAutorise } from "./config";

export const uid = (p = "x") => p + Math.random().toString(36).slice(2, 9);

/** كل الخانات الزمنية: يوم × حصة × رتبة الساعة داخل الحصة */
export function creneaux(jours = JOURS, blocs = BLOCS) {
  const out = [];
  blocs.forEach((b) => {
    for (let i = 0; i < (b.capacite || 1); i++) {
      jours.forEach((j) => out.push({ jour: j.id, bloc: b.id, index: i, periode: b.periode, debut: b.debut, fin: b.fin }));
    }
  });
  return out;
}

export function besoins(classe, grille = GRILLE) {
  const g = grille[classe.niveau] || {};
  return Object.entries(g)
    .filter(([, h]) => h > 0)
    .map(([domaine, heures]) => ({ domaine, heures }));
}

/* ---------- 1) الإسناد ---------- */

export function chargeParEnseignant(affectations) {
  const m = {};
  affectations.forEach((a) => (m[a.enseignantId] = (m[a.enseignantId] || 0) + Number(a.heures || 0)));
  return m;
}

export function autoAffecter(state) {
  const { classes, enseignants, grille } = state;
  const affectations = [];
  const charge = {};
  const add = (t, h) => (charge[t] = (charge[t] || 0) + h);
  const libre = (t, h) => {
    const ens = enseignants.find((e) => e.id === t);
    return ens && (charge[t] || 0) + h <= (ens.nisab || 18);
  };

  classes.forEach((classe) => {
    besoins(classe, grille).forEach(({ domaine, heures }) => {
      let choisi = null;
      const tit = enseignants.find((e) => e.id === classe.titulaire);
      if (tit && tit.domaines.includes(domaine) && libre(tit.id, heures)) choisi = tit;
      if (!choisi) {
        const cands = enseignants
          .filter((e) => e.domaines.includes(domaine) && libre(e.id, heures))
          .sort((a, b) => (charge[a.id] || 0) - (charge[b.id] || 0));
        choisi = cands[0] || null;
      }
      if (!choisi) {
        const cands = enseignants
          .filter((e) => libre(e.id, heures))
          .sort((a, b) => (charge[a.id] || 0) - (charge[b.id] || 0));
        choisi = cands[0] || null;
      }
      affectations.push({ id: uid("a"), classeId: classe.id, domaineId: domaine, enseignantId: choisi ? choisi.id : null, heures });
      if (choisi) add(choisi.id, heures);
    });
  });
  return affectations;
}

export function diagnostiquerAffectations(state) {
  const { affectations, enseignants, classes, grille, domaines = [] } = state;
  const nomDom = (id) => domaines.find((d) => d.id === id)?.nom || id;
  const alertes = [];
  const charge = chargeParEnseignant(affectations);

  affectations.filter((a) => !a.enseignantId).forEach((a) => {
    const c = classes.find((x) => x.id === a.classeId);
    alertes.push({ type: "danger", texte: `مادة بدون معلم: ${nomDom(a.domaineId)} — ${c ? c.nom : ""}` });
  });

  enseignants.forEach((e) => {
    const h = charge[e.id] || 0;
    const n = e.nisab || 18;
    if (h > n) alertes.push({ type: "danger", texte: `${e.nom}: تجاوز النصاب (${h}س / ${n}س)` });
    else if (h === 0) alertes.push({ type: "warn", texte: `${e.nom}: بدون إسناد` });
    else if (h < n * 0.6) alertes.push({ type: "info", texte: `${e.nom}: نقص واضح في النصاب (${h}س / ${n}س)` });
  });

  affectations.forEach((a) => {
    const e = enseignants.find((x) => x.id === a.enseignantId);
    if (e && !e.domaines.includes(a.domaineId)) {
      const c = classes.find((x) => x.id === a.classeId);
      alertes.push({ type: "warn", texte: `${e.nom} أُسندت له مادة خارج اختصاصه (${nomDom(a.domaineId)} — ${c?.nom || ""})` });
    }
  });

  classes.forEach((c) => {
    besoins(c, grille).forEach((n) => {
      const total = affectations.filter((a) => a.classeId === c.id && a.domaineId === n.domaine).reduce((s, a) => s + Number(a.heures || 0), 0);
      if (total !== n.heures) alertes.push({ type: "warn", texte: `${c.nom}: ${nomDom(n.domaine)} ${total}س بدل ${n.heures}س` });
    });
  });

  return alertes;
}

/* ---------- 2) توليد جداول الأوقات ----------
   emplois[classeId]["jour|bloc"] = [ {domaineId, enseignantId}, ... ]  (حسب سعة الحصة)
*/

export function genererEmplois(state) {
  const { classes, affectations, jours, blocs } = state;
  const slots = creneaux(jours, blocs);
  const occup = {}; // enseignantId|jour|bloc|index
  const emplois = {};

  const unites = {};
  classes.forEach((c) => {
    const list = [];
    affectations.filter((a) => a.classeId === c.id).forEach((a) => {
      for (let i = 0; i < Number(a.heures || 0); i++) list.push({ domaineId: a.domaineId, enseignantId: a.enseignantId });
    });
    const poids = {};
    list.forEach((u) => (poids[u.domaineId] = (poids[u.domaineId] || 0) + 1));
    // المواد الكبرى أولا (عربية ثم رياضيات…) لتوضع في أوائل الحصص
    list.sort((a, b) => (poids[b.domaineId] || 0) - (poids[a.domaineId] || 0));
    unites[c.id] = list;
    emplois[c.id] = {};
  });

  slots.forEach((slot) => {
    const bloc = blocs.find((b) => b.id === slot.bloc);
    classes.forEach((c) => {
      const pool = unites[c.id];
      if (!pool || pool.length === 0) return;
      const regime = (c.regime || {})[slot.jour];
      if (!blocAutorise(regime, bloc)) return;

      const key = slot.jour + "|" + slot.bloc;
      const cell = emplois[c.id][key] || [];
      if (cell.length > slot.index) return; // ممتلئة

      const dejaJour = Object.entries(emplois[c.id])
        .filter(([k]) => k.startsWith(slot.jour + "|"))
        .flatMap(([, v]) => v.map((x) => x.domaineId));

      const occupe = (u) => occup[u.enseignantId + "|" + slot.jour + "|" + slot.bloc + "|" + slot.index];
      const memeHeure = (u) => cell.some((x) => x.enseignantId === u.enseignantId && x.domaineId === u.domaineId);

      // تفضيل إتمام الحصة بنفس المادة الكبرى (عربية 8-10 مثلا) كما في جداول المدرسة
      let idx = -1;
      if (cell.length > 0) {
        const precedent = cell[cell.length - 1];
        const restantes = pool.filter((u) => u.domaineId === precedent.domaineId).length;
        const nbJour = dejaJour.filter((d) => d === precedent.domaineId).length;
        if (restantes > 0 && nbJour < 2) {
          idx = pool.findIndex((u) => u.domaineId === precedent.domaineId && u.enseignantId && !occupe(u));
        }
      }

      if (idx === -1) idx = pool.findIndex((u) => {
        if (!u.enseignantId || occupe(u) || memeHeure(u)) return false;
        const nb = dejaJour.filter((d) => d === u.domaineId).length;
        return nb < 3;
      });
      if (idx === -1) idx = pool.findIndex((u) => u.enseignantId && !occupe(u));
      if (idx === -1) return;

      const u = pool.splice(idx, 1)[0];
      emplois[c.id][key] = [...cell, u];
      occup[u.enseignantId + "|" + slot.jour + "|" + slot.bloc + "|" + slot.index] = true;
    });
  });

  const restes = Object.entries(unites)
    .filter(([, v]) => v.length > 0)
    .map(([cid, v]) => ({ classeId: cid, nb: v.length }));

  return { emplois, restes };
}

/** جدول معلم: { "jour|bloc": [ {domaineId, classeId} ] } */
export function emploiEnseignant(emplois, enseignantId) {
  const out = {};
  Object.entries(emplois || {}).forEach(([classeId, grille]) => {
    Object.entries(grille).forEach(([key, cell]) => {
      (cell || []).forEach((v) => {
        if (v.enseignantId === enseignantId) {
          out[key] = [...(out[key] || []), { domaineId: v.domaineId, classeId, enseignantId }];
        }
      });
    });
  });
  return out;
}

/* ---------- 3) التعويض الذكي ---------- */

export function propositionsRemplacement(state, enseignantId, jourId) {
  const { emplois, enseignants, blocs } = state;
  const mine = emploiEnseignant(emplois, enseignantId);
  const res = [];
  blocs.forEach((b) => {
    const key = jourId + "|" + b.id;
    const cell = mine[key];
    if (!cell || cell.length === 0) return;
    const occupes = new Set();
    Object.values(emplois || {}).forEach((g) => (g[key] || []).forEach((v) => occupes.add(v.enseignantId)));
    cell.forEach((cours) => {
      const dispo = enseignants
        .filter((e) => e.id !== enseignantId && !occupes.has(e.id))
        .sort((a, x) => (x.domaines.includes(cours.domaineId) ? 1 : 0) - (a.domaines.includes(cours.domaineId) ? 1 : 0));
      res.push({ bloc: b, cours, propositions: dispo.slice(0, 4) });
    });
  });
  return res;
}

/* ---------- 4) المؤشرات ---------- */

export function indicateurs(state) {
  const { classes, enseignants, affectations, emplois } = state;
  const charge = chargeParEnseignant(affectations);
  const totalH = Object.values(charge).reduce((a, b) => a + b, 0);
  const capacite = enseignants.reduce((s, e) => s + (e.nisab || 18), 0);
  const placees = Object.values(emplois || {}).reduce(
    (s, g) => s + Object.values(g).reduce((n, cell) => n + (cell?.length || 0), 0),
    0
  );
  return {
    nbClasses: classes.length,
    nbEnseignants: enseignants.length,
    nbEleves: classes.reduce((s, c) => s + Number(c.effectif || 0), 0),
    tauxCharge: capacite ? Math.round((totalH / capacite) * 100) : 0,
    heuresPlacees: placees,
    heuresTotal: totalH,
    tauxEmploi: totalH ? Math.round((placees / totalH) * 100) : 0,
  };
}
