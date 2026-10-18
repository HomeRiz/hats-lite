export interface HassConnection {
  sendMessagePromise(msg: Record<string, unknown>): Promise<unknown>;
  subscribeMessage(
    callback: (event: never) => void,
    msg: Record<string, unknown>,
  ): Promise<() => unknown>;
  addEventListener?(type: string, listener: () => void): void;
  removeEventListener?(type: string, listener: () => void): void;
}

export interface Hass {
  connection: HassConnection;
}

export function callWS<T>(hass: Hass, msg: Record<string, unknown>): Promise<T> {
  return hass.connection.sendMessagePromise(msg) as Promise<T>;
}

export function subscribe<T>(
  hass: Hass,
  msg: Record<string, unknown>,
  cb: (event: T) => void,
): Promise<() => unknown> {
  return hass.connection.subscribeMessage(cb as (event: never) => void, msg);
}
