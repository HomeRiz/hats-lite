type AnyFn = (...args: unknown[]) => unknown;

const views = new WeakMap<object, object>();
const viewSet = new WeakSet<object>();
const reals = new WeakMap<object, object>();

const ITERATOR_METHODS = new Set<PropertyKey>(["keys", "values", "entries", Symbol.iterator]);

function isPlain(value: unknown): value is object {
  if (typeof value !== "object" || value === null) return false;
  if (Array.isArray(value)) return true;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function rejectWrite(): never {
  throw new TypeError("Read-only");
}

function* viewedItems(items: Iterable<unknown>): Generator<unknown> {
  for (const item of items) yield readOnlyView(item);
}

function viewDescriptor(
  real: object,
  prop: PropertyKey,
  shadow: object,
): PropertyDescriptor | undefined {
  const desc = Reflect.getOwnPropertyDescriptor(real, prop);
  if (!desc) return undefined;
  if (Array.isArray(shadow) && prop === "length") {
    return { value: Reflect.get(real, prop, real), writable: true, enumerable: false, configurable: false };
  }
  if ("value" in desc) {
    return {
      value: readOnlyView(desc.value),
      writable: false,
      enumerable: desc.enumerable,
      configurable: true,
    };
  }
  const getter = desc.get;
  return {
    get: () => readOnlyView(getter ? getter.call(real) : undefined),
    set: undefined,
    enumerable: desc.enumerable,
    configurable: true,
  };
}

function readOnlyHandler(real: object): ProxyHandler<object> {
  return {
    get: (_shadow, prop) => readOnlyView(Reflect.get(real, prop, real)),
    has: (_shadow, prop) => Reflect.has(real, prop),
    ownKeys: () => Reflect.ownKeys(real),
    getOwnPropertyDescriptor: (shadow, prop) => viewDescriptor(real, prop, shadow),
    getPrototypeOf: () => Reflect.getPrototypeOf(real),
    set: () => false,
    defineProperty: () => false,
    deleteProperty: () => false,
    setPrototypeOf: () => false,
    preventExtensions: () => false,
  };
}

const READ_COMMON: PropertyKey[] = ["has", "keys", "values", "entries", "forEach", Symbol.iterator];
const MAP_READS = new Set<PropertyKey>([...READ_COMMON, "get"]);
const SET_READS = new Set<PropertyKey>([
  ...READ_COMMON,
  "union",
  "intersection",
  "difference",
  "symmetricDifference",
  "isSubsetOf",
  "isSupersetOf",
  "isDisjointFrom",
]);
const OBJECT_READS = new Set<PropertyKey>([
  "hasOwnProperty",
  "isPrototypeOf",
  "propertyIsEnumerable",
  "toString",
  "toLocaleString",
  "valueOf",
]);
const SET_ALGEBRA = new Set<PropertyKey>([
  "union",
  "intersection",
  "difference",
  "symmetricDifference",
  "isSubsetOf",
  "isSupersetOf",
  "isDisjointFrom",
]);

function unwrap(value: unknown): unknown {
  if (typeof value !== "object" || value === null) return value;
  return reals.get(value) ?? value;
}

function collectionView<C extends Map<unknown, unknown> | Set<unknown>>(
  real: C,
  shadow: C,
  reads: Set<PropertyKey>,
): C {
  const base = readOnlyHandler(real);
  const view = new Proxy(shadow as object, {
    ...base,
    get(_shadow, prop) {
      if (prop === "constructor" || prop === Symbol.species) return Reflect.get(real, prop, real);
      const member = Reflect.get(real, prop, real);
      if (typeof member !== "function") return readOnlyView(member);
      const method = member as AnyFn;
      if (!reads.has(prop)) {
        if (OBJECT_READS.has(prop) && member === (Object.prototype as Record<PropertyKey, unknown>)[prop]) {
          if (prop === "valueOf") return () => view;
          return (...args: unknown[]) => method.apply(real, args);
        }
        return rejectWrite;
      }
      if (prop === "get") {
        return (key: unknown) => readOnlyView(method.call(real, unwrap(key)));
      }
      if (prop === "has") return (key: unknown) => method.call(real, unwrap(key));
      if (ITERATOR_METHODS.has(prop)) {
        return () => viewedItems(method.call(real) as Iterable<unknown>);
      }
      if (prop === "forEach") {
        return (callback: AnyFn, thisArg?: unknown) =>
          method.call(real, (v: unknown, k: unknown) =>
            callback.call(thisArg, readOnlyView(v), readOnlyView(k), view),
          );
      }
      if (SET_ALGEBRA.has(prop)) {
        return (other: unknown) => {
          const known = typeof other === "object" && other !== null ? reals.get(other) : undefined;
          const source =
            known ?? new Set(Set.prototype.values.call(other as Set<unknown>) as Iterable<unknown>);
          return readOnlyView(method.call(real, source));
        };
      }
      return rejectWrite;
    },
  }) as C;
  return view;
}

function register<V extends object>(real: object, view: V): V {
  views.set(real, view);
  viewSet.add(view);
  reals.set(view, real);
  return view;
}

export function readOnlyView<V>(value: V): V {
  if (value instanceof Date) return new Date(value.getTime()) as V;
  if (typeof value !== "object" || value === null) return value;
  if (viewSet.has(value)) return value;
  const cached = views.get(value);
  if (cached) return cached as V;
  if (value instanceof Map) {
    return register(value, collectionView(value, new Map(), MAP_READS)) as V;
  }
  if (value instanceof Set) {
    return register(value, collectionView(value, new Set(), SET_READS)) as V;
  }
  if (!isPlain(value)) return value;
  const shadow = Array.isArray(value) ? [] : {};
  return register(value, new Proxy(shadow, readOnlyHandler(value))) as V;
}
