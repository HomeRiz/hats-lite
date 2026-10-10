import { apply, isMap, isSet, rawGet, trunc, type AnyFn } from "./viewIntrinsics";

const setProto = Set.prototype;
const mapProto = Map.prototype;
const SET_HAS = setProto.has as AnyFn;
const SET_ADD = setProto.add as AnyFn;
const SET_DELETE = setProto.delete as AnyFn;
const SET_VALUES = setProto.values as AnyFn;
const SET_SIZE = Object.getOwnPropertyDescriptor(setProto, "size")?.get as AnyFn;
const MAP_SIZE = Object.getOwnPropertyDescriptor(mapProto, "size")?.get as AnyFn;
const MAP_KEYS = mapProto.keys as AnyFn;
const SET_NEXT = Object.getPrototypeOf(new Set().values()).next as AnyFn;
const MAP_NEXT = Object.getPrototypeOf(new Map().keys()).next as AnyFn;

export type AlgebraHooks = {
  unwrap(value: unknown): unknown;
  view<V>(value: V): V;
  ownerOf(arg: object): object | undefined;
};

type Step = { done: true } | { done: false; value: unknown };
type KeyIter = { step(): Step; close(): void };
type SetRecord = { size: number; has(value: unknown): boolean; open(): KeyIter };

export const SET_ALGEBRA_NAMES = [
  "union",
  "intersection",
  "difference",
  "symmetricDifference",
  "isSubsetOf",
  "isSupersetOf",
  "isDisjointFrom",
] as const;

function isObjectLike(value: unknown): value is object {
  return (typeof value === "object" && value !== null) || typeof value === "function";
}

function drainNative(iterator: unknown, next: AnyFn, unwrap: (value: unknown) => unknown): unknown[] {
  const out: unknown[] = [];
  for (;;) {
    const step = apply(next, iterator, []) as IteratorResult<unknown>;
    if (step.done) return out;
    out[out.length] = unwrap(step.value);
  }
}

function itemsOf(real: object): unknown[] {
  return drainNative(apply(SET_VALUES, real, []), SET_NEXT, (value) => value);
}

function fromKeys(size: number, keys: unknown[]): SetRecord {
  const raw = new Set<unknown>();
  for (let index = 0; index < keys.length; index += 1) apply(SET_ADD, raw, [keys[index]]);
  return {
    size,
    has: (value) => apply(SET_HAS, raw, [value]) as boolean,
    open() {
      let at = 0;
      return {
        step: () => (at < keys.length ? { done: false, value: keys[at++] } : { done: true }),
        close() {},
      };
    },
  };
}

function toSize(raw: unknown): number {
  const size = +(raw as number);
  if (size !== size) throw new TypeError("Set-like size is invalid");
  const whole = trunc(size);
  if (whole < 0) throw new RangeError("Set-like size is negative");
  return whole;
}

function recordOf(arg: unknown, hooks: AlgebraHooks): SetRecord {
  if (!isObjectLike(arg)) throw new TypeError("Set-like expected");
  const owned = hooks.ownerOf(arg);
  const source = owned ?? arg;
  if (typeof source === "object" && isSet(source)) {
    const keys = drainNative(apply(SET_VALUES, source, []), SET_NEXT, hooks.unwrap);
    return fromKeys(apply(SET_SIZE, source, []) as number, keys);
  }
  if (typeof source === "object" && isMap(source)) {
    const keys = drainNative(apply(MAP_KEYS, source, []), MAP_NEXT, hooks.unwrap);
    return fromKeys(apply(MAP_SIZE, source, []) as number, keys);
  }
  const size = toSize(rawGet(source, "size", arg));
  const has = rawGet(source, "has", arg);
  if (typeof has !== "function") throw new TypeError("Set-like has must be a function");
  const keysFn = rawGet(source, "keys", arg);
  if (typeof keysFn !== "function") throw new TypeError("Set-like keys must be a function");
  return {
    size,
    has: (value) => Boolean(apply(has as AnyFn, source, [owned ? value : hooks.view(value)])),
    open() {
      const iterator = apply(keysFn as AnyFn, source, []);
      if (!isObjectLike(iterator)) throw new TypeError("Set-like keys must return an object");
      const next = rawGet(iterator, "next", iterator);
      if (typeof next !== "function") throw new TypeError("Set-like iterator next must be a function");
      return {
        step(): Step {
          const result = apply(next as AnyFn, iterator, []);
          if (!isObjectLike(result)) throw new TypeError("Set-like iterator result must be an object");
          if (Boolean(rawGet(result, "done", result))) return { done: true };
          return { done: false, value: hooks.unwrap(rawGet(result, "value", result)) };
        },
        close() {
          const back = rawGet(iterator, "return", iterator);
          if (typeof back === "function") apply(back as AnyFn, iterator, []);
        },
      };
    },
  };
}

function copyOf(items: unknown[]): Set<unknown> {
  const out = new Set<unknown>();
  for (let index = 0; index < items.length; index += 1) apply(SET_ADD, out, [items[index]]);
  return out;
}

function drain(other: SetRecord, visit: (value: unknown) => void): void {
  const iterator = other.open();
  for (;;) {
    const step = iterator.step();
    if (step.done) return;
    visit(step.value);
  }
}

function anyKey(other: SetRecord, test: (value: unknown) => boolean): boolean {
  const iterator = other.open();
  for (;;) {
    const step = iterator.step();
    if (step.done) return false;
    if (test(step.value)) {
      iterator.close();
      return true;
    }
  }
}

function anyItem(items: unknown[], test: (value: unknown) => boolean): boolean {
  for (let index = 0; index < items.length; index += 1) if (test(items[index])) return true;
  return false;
}

export function setAlgebra(
  prop: string,
  real: object,
  arg: unknown,
  hooks: AlgebraHooks,
): Set<unknown> | boolean {
  const other = recordOf(arg, hooks);
  const own = itemsOf(real);
  const smaller = own.length <= other.size;
  const inReal = (value: unknown) => apply(SET_HAS, real, [value]) as boolean;
  const out = copyOf(own);
  const add = (value: unknown) => {
    apply(SET_ADD, out, [value]);
  };
  const remove = (value: unknown) => {
    apply(SET_DELETE, out, [value]);
  };
  switch (prop) {
    case "union":
      drain(other, add);
      return out;
    case "intersection": {
      const result = new Set<unknown>();
      if (smaller) {
        for (let i = 0; i < own.length; i += 1) {
          if (other.has(own[i])) apply(SET_ADD, result, [own[i]]);
        }
      } else {
        drain(other, (value) => {
          if (inReal(value)) apply(SET_ADD, result, [value]);
        });
      }
      return result;
    }
    case "difference":
      if (smaller) {
        for (let i = 0; i < own.length; i += 1) if (other.has(own[i])) remove(own[i]);
      } else {
        drain(other, remove);
      }
      return out;
    case "symmetricDifference":
      drain(other, (value) => (inReal(value) ? remove(value) : add(value)));
      return out;
    case "isSubsetOf":
      return own.length <= other.size && !anyItem(own, (value) => !other.has(value));
    case "isSupersetOf":
      return own.length >= other.size && !anyKey(other, (value) => !inReal(value));
    default:
      return smaller ? !anyItem(own, other.has) : !anyKey(other, inReal);
  }
}
