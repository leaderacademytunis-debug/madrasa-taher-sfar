import { GRILLE, JOURS, SEANCES } from "./config";

export const uid = (p = "x") => p + Math.random().toString(36).slice(2, 9);

export function creneaux(jours = JOURS, seances = SEANCES) {
  const out = [];
  jours.forEach((j) => {
    seances.forEach((s) => {
      if (s.pause) return;
      if (!j.pleine && s.periode === "apresmidi") return;
      out.push({ jour: j.id, jourNom: j.nom, seance: s.id, debut: s.debut, fin: s.fin, periode: s.periode });
    });
  });
  return out;
}

// ترتيب التعبئة: حصة بحصة عبر كل الأيام (حتى تتوزع الدروس على الأسبوع كله)
function creneauxEquilibres(jours, seances) {
  const utiles = seances.filter((s) => !s.pause);
  const out = [];
  utiles.forEach((s) => {
    jours.forEach((j) => {
      if (!j.pleine && s.periode === "apresmidi") return;
      out.push({ jour: j.id, seance: s.id, periode: s.periode });
    });
  });
  return out;
}

export function besoins(classe, grille = GRILLE) {
  const g = grille[classe.niveau] || {};
  return Object.entries(g)
    .filter(([, h]) => h > 0)
    .map(([domaine, heures]) => ({ domaine, heures }));
}

/* ---------- 1) الإسناد: توزيع الأقسام والمجالات على المعلمين ---------- */

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
    return ens && (charge[t] || 0) + h <= (ens.nisab || 25);
  };

  classes.forEach((classe) => {
    besoins(classe, grille).forEach(({ domaine, heures }) => {
      let choisi = null;
      // 1) معلم القسم إن كان المجال من اختصاصه
      const tit = enseignants.find((e) => e.id === classe.titulaire);
      if (tit && tit.domaines.includes(domaine) && libre(tit.id, heures)) choisi = tit;
      // 2) أقل المعلمين المختصين عبئا
      if (!choisi) {
        const cands = enseignants
          .filter((e) => e.domaines.includes(domaine) && libre(e.id, heures))
          .sort((a, b) => (charge[a.id] || 0) - (charge[b.id] || 0));
        choisi = cands[0] || null;
      }
      // 3) أي معلم متاح (تنبيه لاحقا: خارج الاختصاص)
      if (!choisi) {
        const cands = enseignants
          .filter((e) => libre(e.id, heures))
          .sort((a, b) => (charge[a.id] || 0) - (charge[b.id] || 0));
        choisi = cands[0] || null;
      }
      affectations.push({
        id: uid("a"),
        classeId: classe.id,
        domaineId: domaine,
        enseignantId: choisi ? choisi.id : null,
        heures,
      });
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
    alertes.push({ type: "danger", texte: `مجال بدون معلم: ${nomDom(a.domaineId)} — ${c ? c.nom : ""}` });
  });

  enseignants.forEach((e) => {
    const h = charge[e.id] || 0;
    if (h > (e.nisab || 25)) alertes.push({ type: "danger", texte: `${e.nom}: تجاوز النصاب (${h}س / ${e.nisab}س)` });
    else if (h === 0) alertes.push({ type: "warn", texte: `${e.nom}: بدون إسناد` });
    else if (h < (e.nisab || 25) * 0.6) alertes.push({ type: "info", texte: `${e.nom}: نقص واضح في النصاب (${h}س / ${e.nisab}س)` });
  });

  affectations.forEach((a) => {
    const e = enseignants.find((x) => x.id === a.enseignantId);
    if (e && !e.domaines.includes(a.domaineId)) {
      const c = classes.find((x) => x.id === a.classeId);
      alertes.push({ type: "warn", texte: `${e.nom} أُسند له مجال خارج اختصاصه (${nomDom(a.domaineId)} — ${c?.nom || ""})` });
    }
  });

  classes.forEach((c) => {
    const need = besoins(c, grille);
    need.forEach((n) => {
      const total = affectations.filter((a) => a.classeId === c.id && a.domaineId === n.domaine).reduce((s, a) => s + Number(a.heures || 0), 0);
      if (total !== n.heures) alertes.push({ type: "warn", texte: `${c.nom}: ${nomDom(n.domaine)} ${total}س بدل ${n.heures}س` });
    });
  });

  return alertes;
}

/* ---------- 2) توليد جداول الأوقات ---------- */

export function genererEmplois(state) {
  const { classes, affectations, jours, seances } = state;
  const slots = creneauxEquilibres(jours, seances);
  const occupEns = {}; // "enseignantId|jour|seance" -> true
  const emplois = {}; // classeId -> { "jour|seance": {domaineId, enseignantId} }

  // وحدات ساعية لكل قسم
  const unites = {};
  classes.forEach((c) => {
    const list = [];
    affectations.filter((a) => a.classeId === c.id).forEach((a) => {
      for (let i = 0; i < Number(a.heures || 0); i++) list.push({ domaineId: a.domaineId, enseignantId: a.enseignantId });
    });
    // ترتيب: المواد الأساسية أولا (الأكثر ساعات) لتوضع صباحا
    const poids = {};
    list.forEach((u) => (poids[u.domaineId] = (poids[u.domaineId] || 0) + 1));
    list.sort((a, b) => (poids[b.domaineId] || 0) - (poids[a.domaineId] || 0));
    unites[c.id] = list;
    emplois[c.id] = {};
  });

  slots.forEach((slot) => {
    classes.forEach((c) => {
      const key = slot.jour + "|" + slot.seance;
      const pool = unites[c.id];
      if (!pool || pool.length === 0) return;
      // تجنب أكثر من حصتين متتاليتين لنفس المجال
      const dejaJour = Object.entries(emplois[c.id])
        .filter(([k]) => k.startsWith(slot.jour + "|"))
        .map(([, v]) => v.domaineId);
      const dernier = dejaJour[dejaJour.length - 1];

      let idx = pool.findIndex((u) => {
        if (!u.enseignantId) return false;
        if (occupEns[u.enseignantId + "|" + key]) return false;
        const nb = dejaJour.filter((d) => d === u.domaineId).length;
        if (nb >= 3) return false;
        if (u.domaineId === dernier && nb >= 2) return false;
        return true;
      });
      // محاولة ثانية بشروط أخف
      if (idx === -1) idx = pool.findIndex((u) => u.enseignantId && !occupEns[u.enseignantId + "|" + key]);
      if (idx === -1) return;

      const u = pool.splice(idx, 1)[0];
      emplois[c.id][key] = { domaineId: u.domaineId, enseignantId: u.enseignantId };
      occupEns[u.enseignantId + "|" + key] = true;
    });
  });

  const restes = Object.entries(unites)
    .filter(([, v]) => v.length > 0)
    .map(([cid, v]) => ({ classeId: cid, nb: v.length }));

  return { emplois, restes };
}

export function emploiEnseignant(emplois, enseignantId, classes) {
  const out = {};
  Object.entries(emplois || {}).forEach(([classeId, grille]) => {
    Object.entries(grille).forEach(([key, v]) => {
      if (v.enseignantId === enseignantId) {
        out[key] = { domaineId: v.domaineId, classeId, classeNom: classes.find((c) => c.id === classeId)?.nom };
      }
    });
  });
  return out;
}

/* ---------- 3) التعويض الذكي عند غياب معلم ---------- */

export function propositionsRemplacement(state, enseignantId, jourId) {
  const { emplois, enseignants, classes, jours, seances } = state;
  const slots = creneaux(jours, seances).filter((s) => s.jour === jourId);
  const mine = emploiEnseignant(emplois, enseignantId, classes);
  const res = [];
  slots.forEach((slot) => {
    const key = slot.jour + "|" + slot.seance;
    const cours = mine[key];
    if (!cours) return;
    const occupes = new Set();
    Object.values(emplois || {}).forEach((g) => {
      const v = g[key];
      if (v) occupes.add(v.enseignantId);
    });
    const dispo = enseignants
      .filter((e) => e.id !== enseignantId && !occupes.has(e.id))
      .sort((a, b) => (b.domaines.includes(cours.domaineId) ? 1 : 0) - (a.domaines.includes(cours.domaineId) ? 1 : 0));
    res.push({ slot, cours, propositions: dispo.slice(0, 4) });
  });
  return res;
}

/* ---------- 4) مؤشرات لوحة القيادة ---------- */

export function indicateurs(state) {
  const { classes, enseignants, affectations, emplois } = state;
  const charge = chargeParEnseignant(affectations);
  const totalH = Object.values(charge).reduce((a, b) => a + b, 0);
  const capacite = enseignants.reduce((s, e) => s + (e.nisab || 25), 0);
  const placees = Object.values(emplois || {}).reduce((s, g) => s + Object.keys(g).length, 0);
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
