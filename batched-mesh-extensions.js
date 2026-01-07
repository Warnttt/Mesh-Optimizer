import { BVH as et, HybridBuilder as nt, WebGLCoordinateSystem as st, WebGPUCoordinateSystem as ot, vec3ToArray as G, box3ToArray as W } from "https://cdn.jsdelivr.net/npm/bvh.js@0.0.13/build/index.js";
import { Box3 as K, Matrix4 as D, FloatType as it, UnsignedIntType as rt, IntType as at, DataTexture as ct, WebGLUtils as ht, ColorManagement as E, NoColorSpace as V, RGBAFormat as lt, RGBAIntegerFormat as ut, RGFormat as ft, RGIntegerFormat as mt, RedFormat as dt, RedIntegerFormat as gt, Frustum as pt, Vector3 as T, Sphere as X, Mesh as xt, Ray as yt, BatchedMesh as d } from "https://cdn.jsdelivr.net/npm/three/build/three.module.js";
import { radixSort as _t } from "https://cdn.jsdelivr.net/npm/three/build/three.module.js/addons/utils/SortUtils.js";
class It {
  /**
   * @param target The target `BatchedMesh`.
   * @param margin The margin applied for bounding box calculations (default is 0).
   * @param accurateCulling Flag to enable accurate frustum culling without considering margin (default is true).
   */
  constructor(t, e, n = 0, s = !0) {
    this.nodesMap = /* @__PURE__ */ new Map(), this._origin = new Float32Array(3), this._dir = new Float32Array(3), this._cameraPos = new Float32Array(3), this._boxArray = new Float32Array(6), this.target = t, this.accurateCulling = s, this._margin = n, this.bvh = new et(new nt(), e === 2e3 ? st : ot);
  }
  /**
   * Builds the BVH from the target mesh's instances using a top-down construction method.
   * This approach is more efficient and accurate compared to incremental methods, which add one instance at a time.
   */
  create() {
    const t = this.target.instanceCount, e = this.target._instanceInfo.length, n = this.target._instanceInfo, s = new Array(t), o = new Uint32Array(t);
    let r = 0;
    this.clear();
    for (let a = 0; a < e; a++)
      n[a].active && (s[r] = this.getBox(a, new Float32Array(6)), o[r] = a, r++);
    this.bvh.createFromArray(o, s, (a) => {
      this.nodesMap.set(a.object, a);
    }, this._margin);
  }
  /**
   * Inserts an instance into the BVH.
   * @param id The id of the instance to insert.
   */
  insert(t) {
    const e = this.bvh.insert(t, this.getBox(t, new Float32Array(6)), this._margin);
    this.nodesMap.set(t, e);
  }
  /**
   * Inserts a range of instances into the BVH.
   * @param ids An array of ids to insert.
   */
  insertRange(t) {
    const e = t.length, n = new Array(e);
    for (let s = 0; s < e; s++)
      n[s] = this.getBox(t[s], new Float32Array(6));
    this.bvh.insertRange(t, n, this._margin, (s) => {
      this.nodesMap.set(s.object, s);
    });
  }
  /**
   * Moves an instance within the BVH.
   * @param id The id of the instance to move.
   */
  move(t) {
    const e = this.nodesMap.get(t);
    e && (this.getBox(t, e.box), this.bvh.move(e, this._margin));
  }
  /**
   * Deletes an instance from the BVH.
   * @param id The id of the instance to delete.
   */
  delete(t) {
    const e = this.nodesMap.get(t);
    e && (this.bvh.delete(e), this.nodesMap.delete(t));
  }
  /**
   * Clears the BVH.
   */
  clear() {
    this.bvh.clear(), this.nodesMap.clear();
  }
  /**
   * Performs frustum culling to determine which instances are visible based on the provided projection matrix.
   * @param projScreenMatrix The projection screen matrix for frustum culling.
   * @param onFrustumIntersection Callback function invoked when an instance intersects the frustum.
   */
  frustumCulling(t, e) {
    this._margin > 0 && this.accurateCulling ? this.bvh.frustumCulling(t.elements, (n, s, o) => {
      s.isIntersectedMargin(n.box, o, this._margin) && e(n);
    }) : this.bvh.frustumCulling(t.elements, e);
  }
  /**
   * Performs raycasting to check if a ray intersects any instances.
   * @param raycaster The raycaster used for raycasting.
   * @param onIntersection Callback function invoked when a ray intersects an instance.
   */
  raycast(t, e) {
    const n = t.ray, s = this._origin, o = this._dir;
    G(n.origin, s), G(n.direction, o), this.bvh.rayIntersections(o, s, e, t.near, t.far);
  }
  /**
   * Checks if a given box intersects with any instance bounding box.
   * @param target The target bounding box.
   * @param onIntersection Callback function invoked when an intersection occurs.
   * @returns `True` if there is an intersection, otherwise `false`.
   */
  intersectBox(t, e) {
    const n = this._boxArray;
    return W(t, n), this.bvh.intersectsBox(n, e);
  }
  getBox(t, e) {
    const n = this.target, s = n._instanceInfo[t].geometryIndex;
    return n.getBoundingBoxAt(s, j).applyMatrix4(n.getMatrixAt(t, wt)), W(j, e), e;
  }
}
const j = new K(), wt = new D();
class St {
  constructor() {
    this.array = [], this.pool = [];
  }
  push(t, e, n, s) {
    const o = this.pool, r = this.array, a = r.length;
    a >= o.length && o.push({ start: null, count: null, z: null, zSort: null, index: null });
    const c = o[a];
    c.index = t, c.start = n, c.count = s, c.z = e, r.push(c);
  }
  reset() {
    this.array.length = 0;
  }
}
function Z(i, t) {
  return Math.max(t, Math.ceil(Math.sqrt(i / t)) * t);
}
function bt(i, t, e, n) {
  t === 3 && (console.warn('"channels" cannot be 3. Set to 4. More info: https://github.com/mrdoob/three.js/pull/23228'), t = 4);
  const s = Z(n, e), o = new i(s * s * t), r = i.name.includes("Float"), a = i.name.includes("Uint"), c = r ? it : a ? rt : at;
  let f;
  switch (t) {
    case 1:
      f = r ? dt : gt;
      break;
    case 2:
      f = r ? ft : mt;
      break;
    case 4:
      f = r ? lt : ut;
      break;
  }
  return { array: o, size: s, type: c, format: f };
}
class vt extends ct {
  /**
   * @param arrayType The constructor for the TypedArray.
   * @param channels The number of channels in the texture.
   * @param pixelsPerInstance The number of pixels required for each instance.
   * @param capacity The total number of instances.
   * @param uniformMap Optional map for handling uniform values.
   * @param fetchInFragmentShader Optional flag that determines if uniform values should be fetched in the fragment shader instead of the vertex shader.
   */
  constructor(t, e, n, s, o, r) {
    e === 3 && (e = 4);
    const { array: a, format: c, size: f, type: h } = bt(t, e, n, s);
    super(a, f, f, c, h), this.partialUpdate = !0, this.maxUpdateCalls = 1 / 0, this._utils = null, this._needsUpdate = !1, this._lastWidth = null, this._data = a, this._channels = e, this._pixelsPerInstance = n, this._stride = n * e, this._rowToUpdate = new Array(f), this._uniformMap = o, this._fetchUniformsInFragmentShader = r, this.needsUpdate = !0;
  }
  /**
   * Resizes the texture to accommodate a new number of instances.
   * @param count The new total number of instances.
   */
  resize(t) {
    const e = Z(t, this._pixelsPerInstance);
    if (e === this.image.width) return;
    const n = this._data, s = this._channels;
    this._rowToUpdate.length = e;
    const o = n.constructor, r = new o(e * e * s), a = Math.min(n.length, r.length);
    r.set(new o(n.buffer, 0, a)), this.dispose(), this.image = { data: r, height: e, width: e }, this._data = r;
  }
  /**
   * Marks a row of the texture for update during the next render cycle.
   * This helps in optimizing texture updates by only modifying the rows that have changed.
   * @param index The index of the instance to update.
   */
  enqueueUpdate(t) {
    if (this._needsUpdate = !0, !this.partialUpdate) return;
    const e = this.image.width / this._pixelsPerInstance, n = Math.floor(t / e);
    this._rowToUpdate[n] = !0;
  }
  /**
   * Updates the texture data based on the rows that need updating.
   * This method is optimized to only update the rows that have changed, improving performance.
   * @param renderer The WebGLRenderer used for rendering.
   */
  update(t) {
    const e = t.properties.get(this), n = this.version > 0 && e.__version !== this.version, s = this._lastWidth !== null && this._lastWidth !== this.image.width;
    if (!this._needsUpdate || !e.__webglTexture || n || s) {
      this._lastWidth = this.image.width, this._needsUpdate = !1;
      return;
    }
    if (this._needsUpdate = !1, !this.partialUpdate) {
      this.needsUpdate = !0;
      return;
    }
    const o = this.getUpdateRowsInfo();
    o.length !== 0 && (o.length > this.maxUpdateCalls ? this.needsUpdate = !0 : this.updateRows(e, t, o), this._rowToUpdate.fill(!1));
  }
  // TODO reuse same objects to prevent memory leak
  getUpdateRowsInfo() {
    const t = this._rowToUpdate, e = [];
    for (let n = 0, s = t.length; n < s; n++)
      if (t[n]) {
        const o = n;
        for (; n < s && t[n]; n++)
          ;
        e.push({ row: o, count: n - o });
      }
    return e;
  }
  updateRows(t, e, n) {
    const s = e.state, o = e.getContext();
    this._utils ?? (this._utils = new ht(o, e.extensions, e.capabilities));
    const r = this._utils.convert(this.format), a = this._utils.convert(this.type), { data: c, width: f } = this.image, h = this._channels;
    s.bindTexture(o.TEXTURE_2D, t.__webglTexture);
    const u = E.getPrimaries(E.workingColorSpace), l = this.colorSpace === V ? null : E.getPrimaries(this.colorSpace), m = this.colorSpace === V || u === l ? o.NONE : o.BROWSER_DEFAULT_WEBGL;
    o.pixelStorei(o.UNPACK_FLIP_Y_WEBGL, this.flipY), o.pixelStorei(o.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.premultiplyAlpha), o.pixelStorei(o.UNPACK_ALIGNMENT, this.unpackAlignment), o.pixelStorei(o.UNPACK_COLORSPACE_CONVERSION_WEBGL, m);
    for (const { count: g, row: p } of n)
      o.texSubImage2D(o.TEXTURE_2D, 0, 0, p, f, g, r, a, c, p * f * h);
    this.onUpdate && this.onUpdate(this);
  }
  /**
   * Sets a uniform value at the specified instance ID in the texture.
   * @param id The instance ID to set the uniform for.
   * @param name The name of the uniform.
   * @param value The value to set for the uniform.
   */
  setUniformAt(t, e, n) {
    const { offset: s, size: o } = this._uniformMap.get(e), r = this._stride;
    o === 1 ? this._data[t * r + s] = n : n.toArray(this._data, t * r + s);
  }
  /**
   * Retrieves a uniform value at the specified instance ID from the texture.
   * @param id The instance ID to retrieve the uniform from.
   * @param name The name of the uniform.
   * @param target Optional target object to store the uniform value.
   * @returns The uniform value for the specified instance.
   */
  getUniformAt(t, e, n) {
    const { offset: s, size: o } = this._uniformMap.get(e), r = this._stride;
    return o === 1 ? this._data[t * r + s] : n.fromArray(this._data, t * r + s);
  }
  /**
   * Generates the GLSL code for accessing the uniform data stored in the texture.
   * @param textureName The name of the texture in the GLSL shader.
   * @param indexName The name of the index in the GLSL shader.
   * @param indexType The type of the index in the GLSL shader.
   * @returns An object containing the GLSL code for the vertex and fragment shaders.
   */
  getUniformsGLSL(t, e, n) {
    const s = this.getUniformsVertexGLSL(t, e, n), o = this.getUniformsFragmentGLSL(t, e, n);
    return { vertex: s, fragment: o };
  }
  getUniformsVertexGLSL(t, e, n) {
    if (this._fetchUniformsInFragmentShader)
      return `
        flat varying ${n} ez_v${e}; 
        void main() {
          ez_v${e} = ${e};`;
    const s = this.texelsFetchGLSL(t, e), o = this.getFromTexelsGLSL(), { assignVarying: r, declareVarying: a } = this.getVarying();
    return `
      uniform highp sampler2D ${t};  
      ${a}
      void main() {
        ${s}
        ${o}
        ${r}`;
  }
  getUniformsFragmentGLSL(t, e, n) {
    if (!this._fetchUniformsInFragmentShader) {
      const { declareVarying: r, getVarying: a } = this.getVarying();
      return `
      ${r}
      void main() {
        ${a}`;
    }
    const s = this.texelsFetchGLSL(t, `ez_v${e}`), o = this.getFromTexelsGLSL();
    return `
      uniform highp sampler2D ${t};  
      flat varying ${n} ez_v${e};
      void main() {
        ${s}
        ${o}`;
  }
  texelsFetchGLSL(t, e) {
    const n = this._pixelsPerInstance;
    let s = `
      int size = textureSize(${t}, 0).x;
      int j = int(${e}) * ${n};
      int x = j % size;
      int y = j / size;
    `;
    for (let o = 0; o < n; o++)
      s += `vec4 ez_texel${o} = texelFetch(${t}, ivec2(x + ${o}, y), 0);
`;
    return s;
  }
  getFromTexelsGLSL() {
    const t = this._uniformMap;
    let e = "";
    for (const [n, { type: s, offset: o, size: r }] of t) {
      const a = Math.floor(o / this._channels);
      if (s === "mat3")
        e += `mat3 ${n} = mat3(ez_texel${a}.rgb, vec3(ez_texel${a}.a, ez_texel${a + 1}.rg), vec3(ez_texel${a + 1}.ba, ez_texel${a + 2}.r));
`;
      else if (s === "mat4")
        e += `mat4 ${n} = mat4(ez_texel${a}, ez_texel${a + 1}, ez_texel${a + 2}, ez_texel${a + 3});
`;
      else {
        const c = this.getUniformComponents(o, r);
        e += `${s} ${n} = ez_texel${a}.${c};
`;
      }
    }
    return e;
  }
  getVarying() {
    const t = this._uniformMap;
    let e = "", n = "", s = "";
    for (const [o, { type: r }] of t)
      e += `flat varying ${r} ez_v${o};
`, n += `ez_v${o} = ${o};
`, s += `${r} ${o} = ez_v${o};
`;
    return { declareVarying: e, assignVarying: n, getVarying: s };
  }
  getUniformComponents(t, e) {
    const n = t % this._channels;
    let s = "";
    for (let o = 0; o < e; o++)
      s += Ct[n + o];
    return s;
  }
  copy(t) {
    return super.copy(t), this.partialUpdate = t.partialUpdate, this.maxUpdateCalls = t.maxUpdateCalls, this._channels = t._channels, this._pixelsPerInstance = t._pixelsPerInstance, this._stride = t._stride, this._rowToUpdate = t._rowToUpdate, this._uniformMap = t._uniformMap, this._fetchUniformsInFragmentShader = t._fetchUniformsInFragmentShader, this;
  }
}
const Ct = ["r", "g", "b", "a"];
function Ut(i, t = {}) {
  this.bvh = new It(this, i, t.margin, t.accurateCulling), this.bvh.create();
}
function ee(i) {
  const t = {
    get: (e) => e.zSort,
    aux: new Array(i.maxInstanceCount),
    reversed: null
  };
  return function(n) {
    t.reversed = i.material.transparent, i.maxInstanceCount > t.aux.length && (t.aux.length = i.maxInstanceCount);
    let s = 1 / 0, o = -1 / 0;
    for (const { z: c } of n)
      c > o && (o = c), c < s && (s = c);
    const r = o - s, a = (2 ** 32 - 1) / r;
    for (const c of n)
      c.zSort = (c.z - s) * a;
    _t(n, t);
  };
}
function At(i, t) {
  return i.z - t.z;
}
function Tt(i, t) {
  return t.z - i.z;
}
const q = new pt(), b = new St(), R = new D(), F = new D(), z = new T(), B = new T(), O = new T(), Mt = new T(), M = new X();
function Lt(i, t, e, n, s, o) {
  this.frustumCulling(e);
}
function Ft(i, t = i) {
  if (!this._visibilityChanged && !this.perObjectFrustumCulled && !this.sortObjects)
    return;
  this._indirectTexture.needsUpdate = !0, this._visibilityChanged = !1;
  const e = this.sortObjects, n = this.perObjectFrustumCulled;
  if (!n && !e) {
    this.updateIndexArray();
    return;
  }
  if (F.copy(this.matrixWorld).invert(), B.setFromMatrixPosition(i.matrixWorld).applyMatrix4(F), O.setFromMatrixPosition(t.matrixWorld).applyMatrix4(F), z.set(0, 0, -1).transformDirection(i.matrixWorld).transformDirection(F), n ? (R.multiplyMatrices(i.projectionMatrix, i.matrixWorldInverse).multiply(this.matrixWorld), this.bvh ? this.BVHCulling(i, t) : this.linearCulling(i, t)) : this.updateRenderList(), e) {
    const s = this.geometry.getIndex(), o = s === null ? 1 : s.array.BYTES_PER_ELEMENT, r = this._multiDrawStarts, a = this._multiDrawCounts, c = this._indirectTexture.image.data, f = this.customSort;
    f === null ? b.array.sort(this.material.transparent ? Tt : At) : f(b.array);
    const h = b.array, u = h.length;
    for (let l = 0; l < u; l++) {
      const m = h[l];
      r[l] = m.start * o, a[l] = m.count, c[l] = m.index;
    }
    b.reset();
  }
}
function Dt() {
  if (!this._visibilityChanged) return;
  const i = this.geometry.getIndex(), t = i === null ? 1 : i.array.BYTES_PER_ELEMENT, e = this._instanceInfo, n = this._geometryInfo, s = this._multiDrawStarts, o = this._multiDrawCounts, r = this._indirectTexture.image.data;
  let a = 0;
  for (let c = 0, f = e.length; c < f; c++) {
    const h = e[c];
    if (h.visible && h.active) {
      const u = h.geometryIndex, l = n[u];
      s[a] = l.start * t, o[a] = l.count, r[a] = c, a++;
    }
  }
  this._multiDrawCount = a;
}
function zt() {
  const i = this._instanceInfo, t = this._geometryInfo;
  for (let e = 0, n = i.length; e < n; e++) {
    const s = i[e];
    if (s.visible && s.active) {
      const o = s.geometryIndex, r = t[o], a = this.getPositionAt(e).sub(B).dot(z);
      b.push(e, a, r.start, r.count);
    }
  }
  this._multiDrawCount = b.array.length;
}
function Bt(i, t) {
  const e = this.geometry.getIndex(), n = e === null ? 1 : e.array.BYTES_PER_ELEMENT, s = this._instanceInfo, o = this._geometryInfo, r = this.sortObjects, a = this._multiDrawStarts, c = this._multiDrawCounts, f = this._indirectTexture.image.data, h = this.onFrustumEnter;
  let u = 0;
  this.bvh.frustumCulling(R, (l) => {
    const m = l.object, g = s[m];
    if (!g.visible) return;
    const p = g.geometryIndex, x = o[p], y = x.LOD;
    let _, I;
    if (y) {
      const v = this.getPositionAt(m).distanceToSquared(O), C = this.getLODIndex(y, v);
      if (h && !h(m, i, t, C)) return;
      _ = y[C].start, I = y[C].count;
    } else {
      if (h && !h(m, i)) return;
      _ = x.start, I = x.count;
    }
    if (r) {
      const v = this.getPositionAt(m).sub(B).dot(z);
      b.push(m, v, _, I);
    } else
      a[u] = _ * n, c[u] = I, f[u] = m, u++;
  }), this._multiDrawCount = r ? b.array.length : u;
}
function Pt(i, t) {
  const e = this.geometry.getIndex(), n = e === null ? 1 : e.array.BYTES_PER_ELEMENT, s = this._instanceInfo, o = this._geometryInfo, r = this.sortObjects, a = this._multiDrawStarts, c = this._multiDrawCounts, f = this._indirectTexture.image.data, h = this.onFrustumEnter;
  let u = 0;
  q.setFromProjectionMatrix(R);
  for (let l = 0, m = s.length; l < m; l++) {
    const g = s[l];
    if (!g.visible || !g.active) continue;
    const p = g.geometryIndex, x = o[p], y = x.LOD;
    let _, I;
    const v = x.boundingSphere, C = v.radius, U = v.center;
    if (U.x === 0 && U.y === 0 && U.z === 0) {
      const S = this.getPositionAndMaxScaleOnAxisAt(l, M.center);
      M.radius = C * S;
    } else
      this.applyMatrixAtToSphere(l, M, U, C);
    if (q.intersectsSphere(M)) {
      if (y) {
        const S = M.center.distanceToSquared(O), A = this.getLODIndex(y, S);
        if (h && !h(l, i, t, A)) continue;
        _ = y[A].start, I = y[A].count;
      } else {
        if (h && !h(l, i)) continue;
        _ = x.start, I = x.count;
      }
      if (r) {
        const S = Mt.subVectors(M.center, B).dot(z);
        b.push(l, S, _, I);
      } else
        a[u] = _ * n, c[u] = I, f[u] = l, u++;
    }
  }
  this._multiDrawCount = r ? b.array.length : u;
}
const Et = new T();
function $t(i, t = Et) {
  const e = i * 16, n = this._matricesTexture.image.data;
  return t.x = n[e + 12], t.y = n[e + 13], t.z = n[e + 14], t;
}
function Rt(i, t) {
  const e = i * 16, n = this._matricesTexture.image.data, s = n[e + 0], o = n[e + 1], r = n[e + 2], a = s * s + o * o + r * r, c = n[e + 4], f = n[e + 5], h = n[e + 6], u = c * c + f * f + h * h, l = n[e + 8], m = n[e + 9], g = n[e + 10], p = l * l + m * m + g * g;
  return t.x = n[e + 12], t.y = n[e + 13], t.z = n[e + 14], Math.sqrt(Math.max(a, u, p));
}
function Ot(i, t, e, n) {
  const s = i * 16, o = this._matricesTexture.image.data, r = o[s + 0], a = o[s + 1], c = o[s + 2], f = o[s + 3], h = o[s + 4], u = o[s + 5], l = o[s + 6], m = o[s + 7], g = o[s + 8], p = o[s + 9], x = o[s + 10], y = o[s + 11], _ = o[s + 12], I = o[s + 13], v = o[s + 14], C = o[s + 15], U = t.center, L = e.x, S = e.y, A = e.z, P = 1 / (f * L + m * S + y * A + C);
  U.x = (r * L + h * S + g * A + _) * P, U.y = (a * L + u * S + p * A + I) * P, U.z = (c * L + l * S + x * A + v) * P;
  const J = r * r + a * a + c * c, Q = h * h + u * u + l * l, tt = g * g + p * p + x * x;
  t.radius = n * Math.sqrt(Math.max(J, Q, tt));
}
function Gt(i, t, e, n = 0) {
  const s = this._geometryInfo[i];
  e = e ** 2, s.LOD ?? (s.LOD = [{ start: s.start, count: s.count, distance: 0, hysteresis: 0 }]);
  const o = s.LOD, r = o[o.length - 1], a = r.start + r.count, c = t.index.count;
  if (a - s.start + c > s.reservedIndexCount)
    throw new Error("BatchedMesh LOD: Reserved space request exceeds the maximum buffer size.");
  o.push({ start: a, count: c, distance: e, hysteresis: n });
  const f = t.getIndex().array, h = this.geometry.getIndex(), u = h.array, l = s.vertexStart;
  for (let m = 0; m < c; m++)
    u[a + m] = f[m] + l;
  h.needsUpdate = !0;
}
function Wt(i, t) {
  for (let e = i.length - 1; e > 0; e--) {
    const n = i[e], s = n.distance - n.distance * n.hysteresis;
    if (t >= s) return e;
  }
  return 0;
}
const $ = [], w = new xt(), Vt = new yt(), k = new T(), H = new T(), Y = new D();
function jt(i, t) {
  var r, a;
  if (!this.material || this.instanceCount === 0) return;
  w.geometry = this.geometry, w.material = this.material, (r = w.geometry).boundingBox ?? (r.boundingBox = new K()), (a = w.geometry).boundingSphere ?? (a.boundingSphere = new X());
  const e = i.ray, n = i.near, s = i.far;
  Y.copy(this.matrixWorld).invert(), H.setFromMatrixScale(this.matrixWorld), k.copy(i.ray.direction).multiply(H);
  const o = k.length();
  if (i.ray = Vt.copy(i.ray).applyMatrix4(Y), i.near /= o, i.far /= o, this.bvh)
    this.bvh.raycast(i, (c) => this.checkInstanceIntersection(i, c, t));
  else if (this.boundingSphere === null && this.computeBoundingSphere(), i.ray.intersectsSphere(this.boundingSphere))
    for (let c = 0, f = this._instanceInfo.length; c < f; c++)
      this.checkInstanceIntersection(i, c, t);
  i.ray = e, i.near = n, i.far = s;
}
function qt(i, t, e) {
  const n = this._instanceInfo[t];
  if (!n.active || !n.visible) return;
  const s = n.geometryIndex, o = this._geometryInfo[s];
  this.getMatrixAt(t, w.matrixWorld), w.geometry.boundsTree = this.boundsTrees ? this.boundsTrees[s] : void 0, w.geometry.boundsTree || (this.getBoundingBoxAt(s, w.geometry.boundingBox), this.getBoundingSphereAt(s, w.geometry.boundingSphere), w.geometry.setDrawRange(o.start, o.count)), w.raycast(i, $);
  for (const r of $)
    r.batchId = t, r.object = this, e.push(r);
  $.length = 0;
}
function kt(i) {
  const t = i.material, e = t.onBeforeCompile.bind(t);
  t.onBeforeCompile = (n, s) => {
    if (i.uniformsTexture) {
      n.uniforms.uniformsTexture = { value: i.uniformsTexture };
      const { vertex: o, fragment: r } = i.uniformsTexture.getUniformsGLSL("uniformsTexture", "batchIndex", "float");
      n.vertexShader = n.vertexShader.replace("void main() {", o), n.fragmentShader = n.fragmentShader.replace("void main() {", r), n.vertexShader = n.vertexShader.replace("void main() {", "void main() { float batchIndex = getIndirectIndex( gl_DrawID );");
    }
    e(n, s);
  };
}
function Ht(i, t, e) {
  if (!this.uniformsTexture)
    throw new Error(`Before get/set uniform, it's necessary to use "initUniformsPerInstance".`);
  return this.uniformsTexture.getUniformAt(i, t, e);
}
function Yt(i, t, e) {
  if (!this.uniformsTexture)
    throw new Error(`Before get/set uniform, it's necessary to use "initUniformsPerInstance".`);
  this.uniformsTexture.setUniformAt(i, t, e), this.uniformsTexture.enqueueUpdate(i);
}
function Nt(i) {
  if (this.uniformsTexture) throw new Error('"initUniformsPerInstance" must be called only once.');
  const { channels: t, pixelsPerInstance: e, uniformMap: n, fetchInFragmentShader: s } = Kt(i);
  this.uniformsTexture = new vt(Float32Array, t, e, this.maxInstanceCount, n, s), kt(this);
}
function Kt(i) {
  let t = 0;
  const e = /* @__PURE__ */ new Map(), n = [], s = i.vertex ?? {}, o = i.fragment ?? {};
  let r = !0;
  for (const h in s) {
    const u = s[h], l = N(u);
    t += l, n.push({ name: h, type: u, size: l }), r = !1;
  }
  for (const h in o)
    if (!s[h]) {
      const u = o[h], l = N(u);
      t += l, n.push({ name: h, type: u, size: l });
    }
  n.sort((h, u) => u.size - h.size);
  const a = [];
  for (const { name: h, size: u, type: l } of n) {
    const m = Xt(u, a);
    e.set(h, { offset: m, size: u, type: l });
  }
  const c = Math.ceil(t / 4);
  return { channels: Math.min(t, 4), pixelsPerInstance: c, uniformMap: e, fetchInFragmentShader: r };
}
function Xt(i, t) {
  if (i < 4) {
    for (let n = 0; n < t.length; n++)
      if (t[n] + i <= 4) {
        const s = n * 4 + t[n];
        return t[n] += i, s;
      }
  }
  const e = t.length * 4;
  for (; i > 0; i -= 4)
    t.push(i);
  return e;
}
function N(i) {
  switch (i) {
    case "float":
      return 1;
    case "vec2":
      return 2;
    case "vec3":
      return 3;
    case "vec4":
      return 4;
    case "mat3":
      return 9;
    case "mat4":
      return 16;
    default:
      throw new Error(`Invalid uniform type: ${i}`);
  }
}
function Zt() {
  d.prototype.computeBVH = Ut, d.prototype.onBeforeRender = Lt, d.prototype.frustumCulling = Ft, d.prototype.updateIndexArray = Dt, d.prototype.updateRenderList = zt, d.prototype.BVHCulling = Bt, d.prototype.linearCulling = Pt, d.prototype.getPositionAt = $t, d.prototype.getPositionAndMaxScaleOnAxisAt = Rt, d.prototype.applyMatrixAtToSphere = Ot, d.prototype.addGeometryLOD = Gt, d.prototype.getLODIndex = Wt, d.prototype.raycast = jt, d.prototype.checkInstanceIntersection = qt;
}
function ne() {
  Zt(), d.prototype.getUniformAt = Ht, d.prototype.setUniformAt = Yt, d.prototype.initUniformsPerInstance = Nt;
}
function se(i) {
  let t = 0, e = 0;
  for (const n of i)
    t += n.attributes.position.count, e += n.index.count;
  return { vertexCount: t, indexCount: e };
}
function oe(i) {
  const t = [];
  let e = 0, n = 0;
  for (const s of i) {
    let o = 0;
    for (const r of s) {
      const a = r.index.count;
      n += a, o += a, e += r.attributes.position.count;
    }
    t.push(o);
  }
  return { vertexCount: e, indexCount: n, LODIndexCount: t };
}
export {
  Bt as BVHCulling,
  It as BatchedMeshBVH,
  St as MultiDrawRenderList,
  vt as SquareDataTexture,
  Gt as addGeometryLOD,
  Ot as applyMatrixAtToSphere,
  qt as checkInstanceIntersection,
  Ut as computeBVH,
  ee as createRadixSort,
  ne as extendBatchedMeshPrototype,
  Ft as frustumCulling,
  se as getBatchedMeshCount,
  oe as getBatchedMeshLODCount,
  Wt as getLODIndex,
  Rt as getPositionAndMaxScaleOnAxisAt,
  $t as getPositionAt,
  bt as getSquareTextureInfo,
  Z as getSquareTextureSize,
  Ht as getUniformAt,
  Xt as getUniformOffset,
  Kt as getUniformSchemaResult,
  N as getUniformSize,
  Nt as initUniformsPerInstance,
  Pt as linearCulling,
  Lt as onBeforeRender,
  kt as patchBatchedMeshMaterial,
  jt as raycast,
  Yt as setUniformAt,
  At as sortOpaque,
  Tt as sortTransparent,
  Dt as updateIndexArray,
  zt as updateRenderList
};
//# sourceMappingURL=webgl.js.map
