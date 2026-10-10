import {
  apply,
  dateTime,
  freeze,
  hasOwn,
  isArray,
  isDate,
  isMap,
  isPromise,
  isSet,
  ownDescriptor,
  ownKeys,
  protoOf,
  rawGet,
  reflectHas,
  setProto as setPrototypeOf,
  weakAdd,
  weakGet,
  weakSet,
  weakSetHas,
  type AnyFn,
} from "./viewIntrinsics";
import { SET_ALGEBRA_NAMES, setAlgebra } from "./viewSetAlgebra";

const views = new WeakMap<object, object>();
const viewSet = new WeakSet<object>();
const reals = new WeakMap<object, object>();
const throwers = new WeakMap<object, AnyFn>();

const mapProto = Map.prototype;
const setProto = Set.prototype;
const MAP_FNS = new Map<PropertyKey, AnyFn>([
  ["has", mapProto.has as AnyFn],
  ["get", mapProto.get as AnyFn],
  ["keys", mapProto.keys as AnyFn],
  ["values", mapProto.values as AnyFn],
  ["entries", mapProto.entries as AnyFn],
  ["forEach", mapProto.forEach as AnyFn],
  [Symbol.iterator, mapProto[Symbol.iterator] as AnyFn],
]);
const SET_FNS = new Map<PropertyKey, AnyFn>([
  ["has", setProto.has as AnyFn],
  ["keys", setProto.keys as AnyFn],
  ["values", setProto.values as AnyFn],
  ["entries", setProto.entries as AnyFn],
  ["forEach", setProto.forEach as AnyFn],
  [Symbol.iterator, setProto[Symbol.iterator] as AnyFn],
]);
const MAP_SIZE = Object.getOwnPropertyDescriptor(mapProto, "size")?.get as AnyFn;
const SET_SIZE = Object.getOwnPropertyDescriptor(setProto, "size")?.get as AnyFn;
const MAP_NEXT = Object.getPrototypeOf(new Map().entries()).next as AnyFn;
const SET_NEXT = Object.getPrototypeOf(new Set().values()).next as AnyFn;
const THEN = Promise.prototype.then as AnyFn;
const OBJECT_FNS = new Map<PropertyKey, AnyFn>();
const BUILTIN_FNS = new WeakSet<object>();
const ARRAY_NATIVES = new Map<PropertyKey, AnyFn>();
const OBJECT_NATIVES = new Map<PropertyKey, AnyFn>();

function collect(proto: object, into: Map<PropertyKey, AnyFn>): void {
  for (const key of ownKeys(proto)) {
    if (key === "constructor") continue;
    const desc = ownDescriptor(proto, key);
    if (desc && typeof desc.value === "function") {
      BUILTIN_FNS.add(desc.value as object);
      into.set(key, desc.value as AnyFn);
    }
  }
}
collect(Object.prototype, OBJECT_NATIVES);
collect(Array.prototype, ARRAY_NATIVES);

function currentValue(proto: object, prop: PropertyKey): unknown {
  const desc = ownDescriptor(proto, prop);
  return desc && hasOwn(desc, "value") ? desc.value : undefined;
}

function canonical(value: unknown, prop: PropertyKey, arrayLike: boolean): AnyFn | undefined {
  if (arrayLike) {
    const native = ARRAY_NATIVES.get(prop);
    if (native !== undefined && currentValue(Array.prototype, prop) === value) return native;
  }
  const native = OBJECT_NATIVES.get(prop);
  if (native !== undefined && currentValue(Object.prototype, prop) === value) return native;
  return undefined;
}
for (const name of [
  "hasOwnProperty",
  "isPrototypeOf",
  "propertyIsEnumerable",
  "toString",
  "toLocaleString",
  "valueOf",
]) {
  OBJECT_FNS.set(name, (Object.prototype as unknown as Record<string, AnyFn>)[name]);
}

const STAND_IN: object = freeze(Object.create(null) as object);
const PURE_BASE = new Set<PropertyKey>(["toString", "toJSON", "toLocaleString", "valueOf"]);
const PURE_EXTRA = new Set<PropertyKey>(["get", "getAll", "has", "toISOString"]);

function isPlain(value: unknown): value is object {
  if (typeof value !== "object" || value === null) return false;
  if (isArray(value)) return true;
  const proto = protoOf(value);
  return proto === Object.prototype || proto === null;
}

function rejectWrite(): never {
  throw new TypeError("Read-only");
}

function thrower(fn: AnyFn): AnyFn {
  const cached = weakGet(throwers, fn);
  if (cached) return cached;
  const wrapped = function readOnlyCall(): never {
    throw new TypeError("Read-only view: functions on this value cannot be called");
  } as AnyFn;
  setPrototypeOf(wrapped, null);
  weakSet(throwers, fn, wrapped);
  return wrapped;
}

function unwrap(value: unknown): unknown {
  if (typeof value !== "object" || value === null) return value;
  return weakGet(reals, value) ?? value;
}

function pure(fn: AnyFn, real: object): AnyFn {
  return (...args: unknown[]) => {
    const raw: unknown[] = [];
    for (let index = 0; index < args.length; index += 1) raw[index] = unwrap(args[index]);
    return readOnlyView(apply(fn, real, raw));
  };
}

function member(real: object, prop: PropertyKey, plain: boolean, view: unknown): unknown {
  const value = rawGet(real, prop, view);
  if (typeof value !== "function") return readOnlyView(value);
  if (weakSetHas(BUILTIN_FNS, value as object)) return value;
  const native = canonical(value, prop, isArray(real));
  if (native !== undefined) return native;
  if (PURE_BASE.has(prop) || (!plain && PURE_EXTRA.has(prop))) return pure(value as AnyFn, real);
  return thrower(value as AnyFn);
}

function* viewedIterator(iterator: object, next: AnyFn): Generator<unknown> {
  for (;;) {
    const step = apply(next, iterator, []) as IteratorResult<unknown>;
    if (step.done) return;
    yield readOnlyView(step.value);
  }
}

function viewDescriptor(
  real: object,
  prop: PropertyKey,
  shadow: object,
): PropertyDescriptor | undefined {
  const desc = ownDescriptor(real, prop);
  if (!desc) return undefined;
  if (isArray(shadow) && prop === "length") {
    return { value: rawGet(real, prop, undefined), writable: true, enumerable: false, configurable: false };
  }
  if (hasOwn(desc, "value")) {
    return {
      value: readOnlyView(desc.value),
      writable: false,
      enumerable: desc.enumerable,
      configurable: true,
    };
  }
  return {
    get: () => readOnlyView(rawGet(real, prop, weakGet(views, real))),
    set: undefined,
    enumerable: desc.enumerable,
    configurable: true,
  };
}

function baseHandler(real: object): ProxyHandler<object> {
  return {
    has: (_shadow, prop) => reflectHas(real, prop),
    ownKeys: () => ownKeys(real),
    getOwnPropertyDescriptor: (shadow, prop) => viewDescriptor(real, prop, shadow),
    getPrototypeOf: () => protoOf(real),
    set: () => false,
    defineProperty: () => false,
    deleteProperty: () => false,
    setPrototypeOf: () => false,
    preventExtensions: () => false,
  };
}

function plainHandler(real: object): ProxyHandler<object> {
  return {
    ...baseHandler(real),
    get: (_shadow, prop, receiver) => member(real, prop, true, receiver),
  };
}

function opaqueHandler(real: object): ProxyHandler<object> {
  const promise = isPromise(real);
  const settle = (onFulfilled: unknown, onRejected: unknown) =>
    apply(THEN, real, [
      (value: unknown) =>
        typeof onFulfilled === "function"
          ? (onFulfilled as AnyFn)(readOnlyView(value))
          : readOnlyView(value),
      (reason: unknown) => {
        if (typeof onRejected === "function") return (onRejected as AnyFn)(readOnlyView(reason));
        throw readOnlyView(reason);
      },
    ]);
  return {
    ...baseHandler(real),
    getPrototypeOf: () => STAND_IN,
    get(_shadow, prop, receiver) {
      if (prop === "constructor" || prop === "__proto__") return STAND_IN;
      if (promise && prop === "then") return settle;
      if (promise && prop === "catch") return (onRejected: unknown) => settle(undefined, onRejected);
      if (promise && prop === "finally") {
        return (done: unknown) =>
          settle(
            (value: unknown) => {
              if (typeof done === "function") (done as AnyFn)();
              return value;
            },
            (reason: unknown) => {
              if (typeof done === "function") (done as AnyFn)();
              throw reason;
            },
          );
      }
      return member(real, prop, false, receiver);
    },
  };
}

const MAP_READS = new Set<PropertyKey>([...MAP_FNS.keys()]);
const SET_READS = new Set<PropertyKey>([...SET_FNS.keys(), ...SET_ALGEBRA_NAMES]);
const SET_ALGEBRA = new Set<PropertyKey>(SET_ALGEBRA_NAMES);
const ITERATOR_METHODS = new Set<PropertyKey>(["keys", "values", "entries", Symbol.iterator]);

const ALGEBRA_HOOKS = {
  unwrap,
  view: <V>(value: V): V => readOnlyView(value),
  ownerOf: (arg: object) => weakGet(reals, arg),
};

function collectionView<C extends Map<unknown, unknown> | Set<unknown>>(
  real: C,
  shadow: C,
  isSetView: boolean,
): C {
  const reads = isSetView ? SET_READS : MAP_READS;
  const fns = isSetView ? SET_FNS : MAP_FNS;
  const sizeGetter = isSetView ? SET_SIZE : MAP_SIZE;
  const next = isSetView ? SET_NEXT : MAP_NEXT;
  const view = new Proxy(shadow as object, {
    ...baseHandler(real),
    get(_shadow, prop) {
      if (prop === "constructor" || prop === Symbol.species) return rawGet(real, prop, view);
      if (prop === "size") return apply(sizeGetter, real, []);
      if (reads.has(prop)) {
        if (SET_ALGEBRA.has(prop)) {
          return (other: unknown) => {
            const out = setAlgebra(prop as string, real, other, ALGEBRA_HOOKS);
            return typeof out === "boolean" ? out : readOnlyView(out);
          };
        }
        const method = fns.get(prop) as AnyFn;
        if (prop === "get") return (key: unknown) => readOnlyView(apply(method, real, [unwrap(key)]));
        if (prop === "has") return (key: unknown) => apply(method, real, [unwrap(key)]);
        if (ITERATOR_METHODS.has(prop)) {
          return () => viewedIterator(apply(method, real, []) as object, next);
        }
        return (callback: AnyFn, thisArg?: unknown) =>
          apply(method, real, [
            (v: unknown, k: unknown) =>
              apply(callback, thisArg, [readOnlyView(v), readOnlyView(k), view]),
          ]);
      }
      const value = rawGet(real, prop, view);
      if (typeof value !== "function") return readOnlyView(value);
      const known = OBJECT_FNS.get(prop);
      if (known !== undefined && (known === value || canonical(value, prop, false) === known)) {
        if (prop === "valueOf") return () => view;
        return (...args: unknown[]) => apply(known, real, args);
      }
      return rejectWrite;
    },
  }) as C;
  return view;
}

function register<V extends object>(real: object, view: V): V {
  weakSet(views, real, view);
  weakAdd(viewSet, view);
  weakSet(reals, view, real);
  return view;
}

export function readOnlyView<V>(value: V): V {
  if (typeof value === "function") return thrower(value as AnyFn) as V;
  if (typeof value !== "object" || value === null) return value;
  if (weakSetHas(viewSet, value)) return value;
  const cached = weakGet(views, value);
  if (cached) return cached as V;
  if (isDate(value)) return new Date(dateTime(value)) as V;
  if (isMap(value)) return register(value, collectionView(value as unknown as Map<unknown, unknown>, new Map(), false)) as V;
  if (isSet(value)) return register(value, collectionView(value as unknown as Set<unknown>, new Set(), true)) as V;
  if (!isPlain(value)) return register(value, new Proxy({}, opaqueHandler(value))) as V;
  const shadow = isArray(value) ? [] : {};
  return register(value, new Proxy(shadow, plainHandler(value))) as V;
}
