export type AnyFn = (...args: unknown[]) => unknown;

export const apply = Reflect.apply;
export const reflectHas = Reflect.has;
export const ownKeys = Reflect.ownKeys;
export const ownDescriptor = Reflect.getOwnPropertyDescriptor;
export const protoOf = Reflect.getPrototypeOf;
export const setProto = Object.setPrototypeOf;
export const freeze = Object.freeze;
export const defineOwn = Reflect.defineProperty;
export const isArray = Array.isArray;
export const trunc = Math.trunc;

const WM_GET = WeakMap.prototype.get as AnyFn;
const WM_SET = WeakMap.prototype.set as AnyFn;
const WM_HAS = WeakMap.prototype.has as AnyFn;
const WS_HAS = WeakSet.prototype.has as AnyFn;
const WS_ADD = WeakSet.prototype.add as AnyFn;
const HAS_OWN = Object.prototype.hasOwnProperty as AnyFn;
const IS_ENUMERABLE = Object.prototype.propertyIsEnumerable as AnyFn;
const FN_BIND = Function.prototype.bind as AnyFn;
const MAP_SIZE = Object.getOwnPropertyDescriptor(Map.prototype, "size")?.get as AnyFn;
const SET_SIZE = Object.getOwnPropertyDescriptor(Set.prototype, "size")?.get as AnyFn;
const DATE_TIME = Date.prototype.getTime as AnyFn;
const TO_STRING = Object.prototype.toString as AnyFn;

export function weakGet<V>(map: WeakMap<object, V>, key: object): V | undefined {
  return apply(WM_GET, map, [key]) as V | undefined;
}

export function weakSet<V>(map: WeakMap<object, V>, key: object, value: V): void {
  apply(WM_SET, map, [key, value]);
}

export function weakMapHas(map: WeakMap<object, unknown>, key: object): boolean {
  return apply(WM_HAS, map, [key]) as boolean;
}

export function weakSetHas(set: WeakSet<object>, key: object): boolean {
  return apply(WS_HAS, set, [key]) as boolean;
}

export function weakAdd(set: WeakSet<object>, key: object): void {
  apply(WS_ADD, set, [key]);
}

export function hasOwn(target: object, key: PropertyKey): boolean {
  return apply(HAS_OWN, target, [key]) as boolean;
}

export function isEnumerable(target: object, key: PropertyKey): boolean {
  return apply(IS_ENUMERABLE, target, [key]) as boolean;
}

export function bindTo(fn: AnyFn, target: object): AnyFn {
  return apply(FN_BIND, fn, [target]) as AnyFn;
}

function brand(fn: AnyFn, value: object): boolean {
  try {
    apply(fn, value, []);
    return true;
  } catch {
    return false;
  }
}

function tagOf(value: object): string {
  try {
    return apply(TO_STRING, value, []) as string;
  } catch {
    return "";
  }
}

export function isMap(value: object): boolean {
  return tagOf(value) === "[object Map]" && brand(MAP_SIZE, value);
}

export function isSet(value: object): boolean {
  return tagOf(value) === "[object Set]" && brand(SET_SIZE, value);
}

export function isDate(value: object): boolean {
  return tagOf(value) === "[object Date]" && brand(DATE_TIME, value);
}

export function dateTime(value: object): number {
  return apply(DATE_TIME, value, []) as number;
}

export function isPromise(value: object): boolean {
  try {
    return apply(TO_STRING, value, []) === "[object Promise]";
  } catch {
    return false;
  }
}

const builtinProtos = new WeakSet<object>();
const nativeAccessors = new WeakSet<object>();

function trustProto(proto: unknown): void {
  if (typeof proto !== "object" || proto === null) return;
  weakAdd(builtinProtos, proto);
  for (const key of ownKeys(proto)) {
    const desc = ownDescriptor(proto, key);
    if (!desc) continue;
    if (typeof desc.get === "function") weakAdd(nativeAccessors, desc.get);
  }
}

for (const ctor of [
  Object,
  Function,
  Array,
  Map,
  Set,
  WeakMap,
  WeakSet,
  Date,
  Promise,
  RegExp,
  Error,
  String,
  Number,
  Boolean,
  Symbol,
  ArrayBuffer,
  DataView,
]) {
  trustProto(ctor.prototype);
}
for (const name of ["URL", "URLSearchParams", "Headers", "Request", "Response", "Blob", "EventTarget"]) {
  const ctor = (globalThis as Record<string, unknown>)[name] as { prototype?: unknown } | undefined;
  if (typeof ctor === "function") trustProto(ctor.prototype);
}

export function rawGet(real: object, prop: PropertyKey, view: unknown): unknown {
  let holder: object | null = real;
  while (holder !== null) {
    const desc = ownDescriptor(holder, prop);
    if (desc) {
      if (hasOwn(desc, "value")) return desc.value;
      const getter = desc.get;
      if (typeof getter !== "function") return undefined;
      const shared = weakSetHas(builtinProtos, holder) && !weakSetHas(nativeAccessors, getter);
      return apply(getter as AnyFn, shared ? view : real, []);
    }
    holder = protoOf(holder);
  }
  return undefined;
}
