import { MeshoptSimplifier as y } from "https://cdn.jsdelivr.net/npm/meshoptimizer@0.23.0/+esm";
import { BufferAttribute as h } from "https://cdn.jsdelivr.net/npm/three/build/three.module.js";
async function A(n, e, t) {
  await y.ready;
  const r = [];
  t.lockBorder && r.push("LockBorder"), t.sparse && r.push("Sparse"), t.errorAbsolute && r.push("ErrorAbsolute"), t.prune && r.push("Prune");
  const o = t.error ?? 1, s = 3 * Math.floor(t.ratio * (n.length / 3)), i = y.simplify(n, e, 3, s, o, r), c = i[0];
  if (c.length === n.length && console.error("Simplify: simplification failed"), t.logAppearanceError) {
    const p = i[1];
    console.log(`Simplify: appearance error: ${p}`);
  }
  const a = e.length / 3;
  return t.optimizeMemory && a <= 65535 && (i[0] = a <= 255 ? new Uint8Array(c.length) : new Uint16Array(c.length), i[0].set(c)), i;
}
async function l(n, e) {
  if (!n.index) throw new Error("simplifyGeometry: non-indexed geometries are not currently supported.");
  if (n.groups.length > 0) throw new Error("simplifyGeometry: geometry groups are not currently supported.");
  const t = n.clone(), r = n.index.array, o = n.attributes.position.array, [s] = await A(r, o, e);
  return t.index = new h(s, 1), t;
}
async function G(n, e) {
  const t = new Array(n.length);
  for (let r = 0; r < n.length; r++) {
    const o = Array.isArray(e) ? e[r] : e;
    t[r] = await l(n[r], o);
  }
  return t;
}
async function f(n, e) {
  return l(n, { ratio: 0, error: e });
}
async function E(n, e) {
  const t = new Array(n.length);
  for (let r = 0; r < n.length; r++) {
    const o = Array.isArray(e) ? e[r] : e;
    t[r] = await f(n[r], o);
  }
  return t;
}
const B = [0.01, 0.02, 0.05, 0.1], u = [7e-3, 0.015, 0.04, 0.08], x = [4e-3, 0.01, 0.035, 0.07];
async function m(n, e, t = u) {
  const r = [n];
  for (let o = 0; o < e; o++)
    r.push(await f(n, t[o]));
  return r;
}
async function D(n, e, t = u) {
  const r = [];
  for (let o = 0; o < n.length; o++) {
    const s = Array.isArray(t[o]) ? t[o] : t, i = Array.isArray(e) ? e[o] : e;
    r.push(await m(n[o], i, s));
  }
  return r;
}
async function w(n, e) {
  const t = [n];
  for (const r of e)
    t.push(await l(n, r));
  return t;
}
async function O(n, e) {
  const t = [];
  for (let r = 0; r < n.length; r++) {
    const o = Array.isArray(e[r]) ? e[r] : e;
    t.push(await w(n[r], o));
  }
  return t;
}
export {
  u as balancedRangeLOD,
  B as performanceRangeLOD,
  x as qualityRangeLOD,
  A as simplify,
  G as simplifyGeometries,
  E as simplifyGeometriesByError,
  D as simplifyGeometriesByErrorLOD,
  O as simplifyGeometriesLOD,
  l as simplifyGeometry,
  f as simplifyGeometryByError,
  m as simplifyGeometryByErrorLOD,
  w as simplifyGeometryLOD
};
//# sourceMappingURL=index.js.map
